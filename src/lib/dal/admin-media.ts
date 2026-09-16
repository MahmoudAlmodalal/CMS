/**
 * Task 50 — Media Manager DAL (server-only).
 *
 * Data Access Layer for querying and managing Supabase storage buckets in the
 * admin media manager. All writes use the service-role admin client.
 */
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { storageBaseUrl } from "@/lib/storage";
import type { StorageBucket, StorageFile } from "@/lib/types/admin-media";

/** Uploads live at <folder>/<entityId>/<file>, so two levels below a folder
 *  prefix reaches every real object. A third level only costs round trips. */
const MAX_LIST_DEPTH = 2;

/**
 * Lists files in a storage bucket, optionally scoped to a folder prefix.
 * Uses the read-only server client (RLS-enforced).
 *
 * Errors are RETURNED, not swallowed. This used to `return []` on any storage
 * failure, so a misconfigured bucket, a bad key or an RLS change was
 * indistinguishable from an empty library and the panel simply said "no files".
 *
 * Each level fans out in parallel; a serial walk of a bucket with many entity
 * folders was slow enough on Vercel to hit the function timeout.
 */
export async function listBucketFiles(
  bucket: StorageBucket,
  folder?: string,
  depth = 0,
): Promise<{ files: StorageFile[]; error: string | null }> {
  const supabase = await createClient();
  const prefix = folder ? `${folder}/` : "";

  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 500,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    console.error(`DAL Error [listBucketFiles(${bucket}/${prefix})]:`, error.message);
    return { files: [], error: error.message };
  }

  if (!data) return { files: [], error: null };

  const base = storageBaseUrl();

  const files: StorageFile[] = [];
  const descend: Array<Promise<{ files: StorageFile[]; error: string | null }>> = [];

  for (const item of data) {
    if (item.name === ".emptyFolderPlaceholder") continue;
    const filePath = folder ? `${folder}/${item.name}` : item.name;
    // Storage lists one level; folders come back without an id. Uploads live at
    // <folder>/<entity>/<file>, so descend (bounded) to reach the actual files.
    if (!item.id) {
      if (depth < MAX_LIST_DEPTH) descend.push(listBucketFiles(bucket, filePath, depth + 1));
      continue;
    }
    const metadata = item.metadata as Record<string, unknown> | null;
    files.push({
      name: item.name,
      size: (metadata?.size as number) ?? 0,
      created_at: item.created_at ?? new Date().toISOString(),
      bucket,
      path: filePath,
      publicUrl: base ? `${base}/${bucket}/${filePath}` : null,
      mimeType: metadata?.mimetype as string | undefined,
    });
  }

  // One sub-listing failing must not lose the files that did come back, so the
  // first error is reported alongside whatever was listed successfully.
  let firstError: string | null = null;
  for (const result of await Promise.all(descend)) {
    files.push(...result.files);
    firstError ??= result.error;
  }

  return { files, error: firstError };
}

/**
 * Returns the public URL for a file in a bucket.
 * Returns null when the storage base URL is not configured.
 */
export function getFilePublicUrl(bucket: StorageBucket, filePath: string): string | null {
  const base = storageBaseUrl();
  if (!base) return null;
  return `${base}/${bucket}/${filePath.replace(/^\/+/, "")}`;
}

/**
 * Deletes a single file from storage via the service-role admin client.
 * Never silently swallows errors — throws on failure so actions can report properly.
 */
export async function deleteStorageFile(bucket: StorageBucket, filePath: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.storage.from(bucket).remove([filePath]);
  if (error) {
    throw new Error(`[media-dal] deleteStorageFile failed: ${error.message}`);
  }
}

/**
 * Returns orphan candidate files.
 * Full orphan computation is delegated to the DB view; this stub satisfies
 * the interface contract while the `storage_orphan_candidates` DB view is the
 * authoritative source. See: src/actions/storage.ts listOrphanFilesAction.
 * @see storage_orphan_candidates DB view
 */
export async function getOrphanCandidates(): Promise<StorageFile[]> {
  // see storage_orphan_candidates DB view
  return [];
}
