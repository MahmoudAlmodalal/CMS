/**
 * Task 50 — Media Manager Server Actions.
 *
 * Server Actions for the admin media manager: upload, delete, and list
 * files in the 7 approved Supabase storage buckets.
 *
 * Authorization: every action requires an active admin session.
 * Writes: always use createAdminClient() (service-role bypasses RLS).
 * Validation: validateUploadFile() from @/lib/storage enforces MIME,
 *   extension, size, and content-sniffing rules before any upload.
 */
"use server";

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/auth-guard";
import {
  validateUploadFile,
  resolveMediaUrl,
  STORAGE_BUCKETS,
  type StorageBucket,
} from "@/lib/storage";
import { listBucketFiles, deleteStorageFile } from "@/lib/dal/admin-media";
import type { MediaUploadResult, StorageFile } from "@/lib/types/admin-media";

/**
 * Uploads a file to a storage bucket after full validation.
 *
 * Validation pipeline (via validateUploadFile):
 *  1. Bucket allowlist check
 *  2. MIME allowlist check
 *  3. Extension / MIME consistency
 *  4. File size against per-bucket byte limit
 *  5. Content sniffing (spoof defense)
 *  6. SVG safety scan (if applicable)
 *  7. Image dimension guardrails (if applicable)
 */
export async function uploadMediaAction(formData: FormData): Promise<MediaUploadResult> {
  try {
    await requireAdminSession();

    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as string | null;

    if (!file || !(file instanceof File)) {
      return { success: false, error: "لم يتم تحديد ملف للرفع" };
    }
    if (!bucket || !(STORAGE_BUCKETS as readonly string[]).includes(bucket)) {
      return { success: false, error: `حاوية التخزين "${bucket}" غير مسموح بها` };
    }

    const mime = (file.type || "").trim().toLowerCase();
    const bytes = new Uint8Array(await file.arrayBuffer());

    const validation = validateUploadFile({
      bucket,
      entityId: "media-manager",
      label: file.name,
      mime,
      size: file.size,
      bytes,
    });

    if (!validation.ok) {
      return { success: false, error: validation.errors.join(" | ") };
    }

    // Build a simple path: <timestamp>_<sanitized-name>
    const ts = Math.floor(Date.now() / 1000);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `uploads/${ts}_${safeName}`;

    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage.from(bucket as StorageBucket).upload(path, file, {
      contentType: mime,
      upsert: false,
    });

    if (uploadError) {
      return { success: false, error: `فشل الرفع: ${uploadError.message}` };
    }

    const publicUrl = resolveMediaUrl(bucket as StorageBucket, path);

    return { success: true, path, publicUrl: publicUrl ?? undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل عملية الرفع";
    if (message === "UNAUTHORIZED_ADMIN_ACTION") {
      return { success: false, error: "غير مصرح: مطلوب جلسة مسؤول" };
    }
    return { success: false, error: message };
  }
}

/**
 * Deletes a file from a storage bucket.
 * Requires an active admin session.
 */
export async function deleteMediaAction(
  bucket: string,
  filePath: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminSession();

    if (!(STORAGE_BUCKETS as readonly string[]).includes(bucket)) {
      return { success: false, error: `حاوية التخزين "${bucket}" غير مسموح بها` };
    }

    if (!filePath || filePath.includes("..")) {
      return { success: false, error: "مسار الملف غير صالح" };
    }

    await deleteStorageFile(bucket as StorageBucket, filePath);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل حذف الملف";
    if (message === "UNAUTHORIZED_ADMIN_ACTION") {
      return { success: false, error: "غير مصرح: مطلوب جلسة مسؤول" };
    }
    return { success: false, error: message };
  }
}

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

    const files = await listBucketFiles(bucket as StorageBucket, folder);
    return { success: true, files };
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل تحميل الملفات";
    if (message === "UNAUTHORIZED_ADMIN_ACTION") {
      return { success: false, error: "غير مصرح: مطلوب جلسة مسؤول" };
    }
    return { success: false, error: message };
  }
}
