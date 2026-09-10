/**
 * Task 29 — Storage Server Actions (STORAGE_ARCHITECTURE.md §§5–6).
 *
 * Admin-gated upload / version-addressed replacement / reference-guarded
 * deletion / orphan discovery + cleanup for the 7 approved buckets.
 *
 * Authorization is self-contained: the caller's session is read through the
 * cookie-aware (RLS-enforcing) client and must carry the canonical
 * `app_metadata.role === 'admin'` claim (Task 24); only then does the
 * service-role client perform the privileged storage/DB writes. This keeps
 * Task 29 independent of the Task 27/28 auth UI work.
 */
"use server";

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MEDIA_REFERENCES,
  ORPHAN_GRACE_HOURS,
  buildStoragePath,
  computeOrphans,
  extractStoragePath,
  findMediaReference,
  isAdminClaim,
  resolveMediaUrl,
  validateUploadFile,
  type StorageBucket,
  type StorageObjectInfo,
} from "@/lib/storage";

export interface StorageResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** Canonical admin gate: session user must carry app_metadata.role === 'admin'. */
async function requireStorageAdmin(): Promise<string> {
  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
  } catch {
    throw new Error("Storage is not configured.");
  }
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !isAdminClaim(data.user.app_metadata)) {
    throw new Error("Unauthorized: admin session required.");
  }
  return data.user.id;
}

async function fileToBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

export interface UploadMediaInput {
  bucket: StorageBucket;
  folder?: string;
  entityId: string;
  /** Human label (e.g. artwork title); sanitized into the path slug. */
  label: string;
  file: File;
}

export interface UploadedMedia {
  bucket: StorageBucket;
  path: string;
  publicUrl: string;
  mime: string;
  sizeBytes: number;
}

/**
 * Validated admin upload. Never overwrites (`upsert: false`); every upload
 * mints a fresh timestamped key so CDN caches stay immutable (§5.2).
 */
export async function uploadMediaAction(
  input: UploadMediaInput,
): Promise<StorageResult<UploadedMedia>> {
  try {
    await requireStorageAdmin();
    const mime = (input.file.type || "").trim().toLowerCase();
    const bytes = await fileToBytes(input.file);
    const check = validateUploadFile({
      bucket: input.bucket,
      folder: input.folder,
      entityId: input.entityId,
      label: input.label,
      mime,
      size: input.file.size,
      bytes,
    });
    if (!check.ok) return { ok: false, error: check.errors.join(" ") };
    const path = buildStoragePath({
      bucket: input.bucket,
      folder: input.folder,
      entityId: input.entityId,
      label: input.label,
      mime,
    });
    const admin = createAdminClient();
    const { error } = await admin.storage.from(input.bucket).upload(path, bytes, {
      contentType: mime,
      upsert: false,
      cacheControl: input.bucket === "audio" ? "604800" : "31536000", // §9.1
    });
    if (error) return { ok: false, error: `Upload failed: ${error.message}` };
    const publicUrl = resolveMediaUrl(input.bucket, path);
    if (!publicUrl) return { ok: false, error: "Could not resolve public URL." };
    return {
      ok: true,
      data: { bucket: input.bucket, path, publicUrl, mime, sizeBytes: input.file.size },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed." };
  }
}

export interface ReplaceMediaInput extends UploadMediaInput {
  /** Previously stored path (within the same bucket) to purge after swap. */
  previousPath: string | null;
  /**
   * Optional DB pointer to swing to the new asset. Restricted to approved
   * (table, column) pairs — arbitrary table writes are rejected.
   */
  ref?: { table: string; id: string; column: string };
}

export interface ReplacedMedia extends UploadedMedia {
  previousDeleted: boolean;
}

/**
 * 3-step version-addressed replacement (§5.2): upload new key → swing the
 * approved DB pointer → purge the old key (best-effort, reported).
 */
export async function replaceMediaAction(
  input: ReplaceMediaInput,
): Promise<StorageResult<ReplacedMedia>> {
  try {
    await requireStorageAdmin();
    if (input.ref && !findMediaReference(input.ref.table, input.ref.column)) {
      return {
        ok: false,
        error: `Reference ${input.ref.table}.${input.ref.column} is not an approved media column.`,
      };
    }
    const uploaded = await uploadMediaAction(input);
    if (!uploaded.ok || !uploaded.data) return uploaded as StorageResult<ReplacedMedia>;
    const admin = createAdminClient();
    if (input.ref) {
      const { error } = await admin
        .from(input.ref.table as never)
        .update({ [input.ref.column]: uploaded.data.publicUrl } as never)
        .eq("id" as never, input.ref.id as never);
      if (error) {
        // New asset is live in storage but unreferenced; cleanup treats it as
        // an orphan after the grace period. Report honestly, don't roll back.
        return { ok: false, error: `Uploaded but DB update failed: ${error.message}` };
      }
    }
    let previousDeleted = false;
    if (input.previousPath && input.previousPath !== uploaded.data.path) {
      const { error } = await admin.storage.from(input.bucket).remove([input.previousPath]);
      previousDeleted = !error;
    }
    return { ok: true, data: { ...uploaded.data, previousDeleted } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Replacement failed." };
  }
}

export interface DeleteMediaInput {
  bucket: StorageBucket;
  path: string;
  /**
   * Refuse deletion while any approved column still references the asset.
   * `force: true` overrides (admin override; prefer replace/delete flows).
   */
  force?: boolean;
}

/**
 * Reference-guarded deletion: a still-referenced file is protected unless
 * `force` is set (§6.2, Task 50 relies on this for the media manager).
 */
export async function deleteMediaAction(
  input: DeleteMediaInput,
): Promise<StorageResult<{ deleted: boolean }>> {
  try {
    await requireStorageAdmin();
    const admin = createAdminClient();
    if (!input.force) {
      const refs = await findReferencingRows(admin, input.bucket, input.path);
      if (refs.length > 0) {
        return {
          ok: false,
          error: `File is referenced by ${refs.join(", ")}; replace or detach it first.`,
        };
      }
    }
    const { error } = await admin.storage.from(input.bucket).remove([input.path]);
    if (error) return { ok: false, error: `Deletion failed: ${error.message}` };
    return { ok: true, data: { deleted: true } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Deletion failed." };
  }
}

/** Tables/ids whose approved columns reference `bucket/path` (substring match). */
async function findReferencingRows(
  admin: ReturnType<typeof createAdminClient>,
  bucket: StorageBucket,
  path: string,
  // oxlint-disable-next-line no-explicit-any
): Promise<string[]> {
  const hits: string[] = [];
  for (const ref of MEDIA_REFERENCES.filter((r) => r.bucket === bucket)) {
    const { data, error } = await admin
      .from(ref.table as never)
      .select(`id, ${ref.column}` as never)
      .like(ref.column as never, `%${path}%` as never)
      .limit(5);
    if (error || !data) continue;
    for (const row of data as Array<Record<string, unknown>>) {
      hits.push(`${ref.table}:${String(row.id)}`);
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Orphan discovery + cleanup (§6.3). Discovery prefers the SQL view; the pure
// set-difference in `@/lib/storage` covers clients without view access.
// ---------------------------------------------------------------------------

export interface OrphanFile extends StorageObjectInfo {
  sizeMb: number;
}

async function collectStorageObjects(
  admin: ReturnType<typeof createAdminClient>,
): Promise<StorageObjectInfo[]> {
  // storage schema is outside the generated Database types.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin.schema("storage" as any);
  const { data, error } = await db
    .from("objects")
    .select("bucket_id, name, created_at, metadata")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .in("bucket_id", ["site", "artists", "releases", "events", "academy", "articles", "audio"] as any)
    .limit(10000);
  if (error || !data) throw new Error(`Storage listing failed: ${error?.message ?? "unknown"}`);
  return (data as Array<Record<string, unknown>>).map((o) => ({
    bucket: String(o.bucket_id),
    path: String(o.name),
    createdAtMs: new Date(String(o.created_at)).getTime(),
    sizeBytes: Number((o.metadata as Record<string, unknown> | null)?.size ?? 0),
  }));
}

async function collectReferencedPaths(
  admin: ReturnType<typeof createAdminClient>,
): Promise<Set<string>> {
  const paths = new Set<string>();
  for (const ref of MEDIA_REFERENCES) {
    const { data, error } = await admin
      .from(ref.table as never)
      .select(ref.column as never)
      .not(ref.column as never, "is", null)
      .limit(10000);
    if (error || !data) continue;
    for (const row of data as Array<Record<string, unknown>>) {
      const v = row[ref.column];
      if (typeof v !== "string" || !v) continue;
      const parsed = extractStoragePath(v);
      if (parsed && parsed.bucket === ref.bucket) paths.add(parsed.path);
      else paths.add(v); // relative path stored verbatim
    }
  }
  return paths;
}

export async function listOrphanFilesAction(
  graceHours: number = ORPHAN_GRACE_HOURS,
): Promise<StorageResult<OrphanFile[]>> {
  try {
    await requireStorageAdmin();
    const admin = createAdminClient();
    const [objects, referenced] = await Promise.all([
      collectStorageObjects(admin),
      collectReferencedPaths(admin),
    ]);
    const orphans = computeOrphans(objects, referenced, Date.now(), graceHours).map((o) => ({
      ...o,
      sizeMb: Math.round((o.sizeBytes / 1024 / 1024) * 100) / 100,
    }));
    return { ok: true, data: orphans };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Orphan scan failed." };
  }
}

export interface OrphanCleanup {
  dryRun: boolean;
  deleted: number;
  reclaimedBytes: number;
  paths: string[];
}

/**
 * Purge orphans past the grace period. Dry-run by default — the caller must
 * explicitly pass `dryRun: false` (Task 50 surfaces both modes).
 */
export async function cleanupOrphanFilesAction(
  opts: { graceHours?: number; dryRun?: boolean; limit?: number } = {},
): Promise<StorageResult<OrphanCleanup>> {
  try {
    await requireStorageAdmin();
    const { graceHours = ORPHAN_GRACE_HOURS, dryRun = true, limit = 200 } = opts;
    const listed = await listOrphanFilesAction(graceHours);
    if (!listed.ok || !listed.data) {
      return { ok: false, error: listed.error ?? "فشل في حصر الملفات المعزولة" };
    }
    const batch = listed.data.slice(0, Math.max(1, limit));
    if (dryRun) {
      return {
        ok: true,
        data: {
          dryRun: true,
          deleted: 0,
          reclaimedBytes: batch.reduce((n, o) => n + o.sizeBytes, 0),
          paths: batch.map((o) => `${o.bucket}/${o.path}`),
        },
      };
    }
    const admin = createAdminClient();
    const byBucket = new Map<string, string[]>();
    for (const o of batch) {
      const arr = byBucket.get(o.bucket) ?? [];
      arr.push(o.path);
      byBucket.set(o.bucket, arr);
    }
    let deleted = 0;
    const deletedPaths: string[] = [];
    for (const [bucket, paths] of byBucket) {
      const { error } = await admin.storage.from(bucket).remove(paths);
      if (!error) {
        deleted += paths.length;
        deletedPaths.push(...paths.map((p) => `${bucket}/${p}`));
      }
    }
    const reclaimedBytes = batch
      .filter((o) => deletedPaths.includes(`${o.bucket}/${o.path}`))
      .reduce((n, o) => n + o.sizeBytes, 0);
    return { ok: true, data: { dryRun: false, deleted, reclaimedBytes, paths: deletedPaths } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Orphan cleanup failed." };
  }
}
