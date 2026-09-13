import { listMediaAction } from "@/actions/admin-media";
import { MEDIA_LIBRARY_ENTITY_ID } from "./MediaUploadZone";
import type { StorageBucket, StorageFile } from "@/lib/types/admin-media";

/**
 * Lists files in a bucket folder, querying both the folder root and its
 * nested `media-library` directory to support non-recursive Supabase storage listing.
 * Merges and de-duplicates by path, sorting newest first.
 */
export async function listFolderMedia(
  bucket: StorageBucket,
  folder?: string,
): Promise<{ files: StorageFile[]; error: string | null }> {
  try {
    if (!folder) {
      const res = await listMediaAction(bucket, undefined);
      if (!res.success) {
        return { files: [], error: res.error ?? "فشل تحميل الملفات" };
      }
      return { files: res.files ?? [], error: null };
    }

    const [resDirect, resLibrary] = await Promise.all([
      listMediaAction(bucket, folder),
      listMediaAction(bucket, `${folder}/${MEDIA_LIBRARY_ENTITY_ID}`),
    ]);

    if (!resDirect.success && !resLibrary.success) {
      return {
        files: [],
        error: resDirect.error ?? resLibrary.error ?? "فشل تحميل الملفات",
      };
    }

    const combinedFiles = [
      ...(resDirect.success && resDirect.files ? resDirect.files : []),
      ...(resLibrary.success && resLibrary.files ? resLibrary.files : []),
    ];

    const fileMap = new Map<string, StorageFile>();
    for (const file of combinedFiles) {
      fileMap.set(file.path, file);
    }
    const uniqueFiles = Array.from(fileMap.values());
    uniqueFiles.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });

    return { files: uniqueFiles, error: null };
  } catch (err) {
    return {
      files: [],
      error: err instanceof Error ? err.message : "فشل تحميل الملفات",
    };
  }
}
