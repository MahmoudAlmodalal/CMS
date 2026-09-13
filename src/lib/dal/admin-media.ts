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

/**
 * Lists files in a storage bucket, optionally scoped to a folder prefix.
 * Uses the read-only server client (RLS-enforced).
 */
export async function listBucketFiles(
  bucket: StorageBucket,
  folder?: string,
  depth = 0,
): Promise<StorageFile[]> {
  const supabase = await createClient();
  const prefix = folder ? `${folder}/` : "";

  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 500,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    console.error(`DAL Error [listBucketFiles(${bucket}/${prefix})]:`, error.message);
    return [];
  }

  if (!data) return [];

  const base = storageBaseUrl();

  const files: StorageFile[] = [];
  for (const item of data) {
    if (item.name === ".emptyFolderPlaceholder") continue;
    const filePath = folder ? `${folder}/${item.name}` : item.name;
    // Storage lists one level; folders come back without an id. Uploads live at
    // <folder>/<entity>/<file>, so descend (bounded) to reach the actual files.
    if (!item.id) {
      if (depth < 3) files.push(...(await listBucketFiles(bucket, filePath, depth + 1)));
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
  return files;
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
