/**
 * Media Manager Server Action.
 *
 * Lists files in the approved Supabase storage buckets for the admin media
 * manager. Upload and delete live in @/actions/storage, which is what the
 * media components import; the copies that used to sit here were unreachable
 * duplicates with a different signature and a different guard.
 *
 * Authorization: requires an active admin session.
 */
"use server";

import "server-only";
import { requireAdminSession } from "@/lib/auth-guard";
import { STORAGE_BUCKETS, type StorageBucket } from "@/lib/storage";
import { listBucketFiles } from "@/lib/dal/admin-media";
import type { StorageFile } from "@/lib/types/admin-media";

/**
 * Lists files in a storage bucket.
 * Requires an active admin session.
 */
export async function listMediaAction(
  bucket: string,
  folder?: string,
): Promise<{ success: boolean; files?: StorageFile[]; error?: string }> {
  try {
    await requireAdminSession();

    if (!(STORAGE_BUCKETS as readonly string[]).includes(bucket)) {
      return { success: false, error: `حاوية التخزين "${bucket}" غير مسموح بها` };
    }

    const { files, error } = await listBucketFiles(bucket as StorageBucket, folder);
    // A storage error is reported even when some files came back, so a partly
    // broken bucket is visible instead of silently looking half-empty.
    if (error) return { success: false, files, error: `تعذر قراءة التخزين: ${error}` };
    return { success: true, files };
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل تحميل الملفات";
    if (message === "UNAUTHORIZED_ADMIN_ACTION") {
      return { success: false, error: "غير مصرح: مطلوب جلسة مسؤول" };
    }
    return { success: false, error: message };
  }
}
