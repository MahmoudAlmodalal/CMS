import { z } from "zod";
import {
  STORAGE_BUCKETS,
  type StorageBucket,
  safeUrlSchema,
  positiveInt,
} from "./primitives.ts";

// ============================================================================
// Storage Limits & MIME Policy (STORAGE_ARCHITECTURE.md & Task 20A)
// ============================================================================

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const AUDIO_MAX_BYTES = 30 * 1024 * 1024; // 30 MB (31,457,280 bytes)

export const BUCKET_BYTE_LIMITS: Record<StorageBucket, number> = {
  site: IMAGE_MAX_BYTES,
  artists: IMAGE_MAX_BYTES,
  releases: IMAGE_MAX_BYTES,
  events: IMAGE_MAX_BYTES,
  academy: IMAGE_MAX_BYTES,
  articles: IMAGE_MAX_BYTES,
  audio: AUDIO_MAX_BYTES,
};

export const BUCKET_ALLOWED_MIMES: Record<StorageBucket, readonly string[]> = {
  site: ["image/webp", "image/jpeg", "image/png", "image/svg+xml"],
  artists: ["image/webp", "image/jpeg", "image/png"],
  releases: ["image/webp", "image/jpeg", "image/png"],
  events: ["image/webp", "image/jpeg"],
  academy: ["image/webp", "image/jpeg", "image/png"],
  articles: ["image/webp", "image/jpeg", "image/png"],
  audio: ["audio/mpeg", "audio/ogg", "audio/wav", "audio/mp4"],
};

export const MIME_EXTENSIONS: Record<string, readonly string[]> = {
  "image/webp": [".webp"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/svg+xml": [".svg"],
  "audio/mpeg": [".mp3"],
  "audio/ogg": [".ogg"],
  "audio/wav": [".wav"],
  "audio/mp4": [".m4a", ".mp4"],
};

/**
 * Validates whether a filename has an extension compatible with the declared MIME type.
 * Blocks spoofed extensions like malicious.exe or file.mp3 uploaded with image MIME.
 */
export function isExtensionMatchingMime(filename: string, mimeType: string): boolean {
  const allowedExts = MIME_EXTENSIONS[mimeType];
  if (!allowedExts) return false;
  const lower = filename.toLowerCase();
  return allowedExts.some((ext) => lower.endsWith(ext));
}

// ============================================================================
// File Upload Request / Storage Metadata Schema
// ============================================================================

export const fileUploadMetadataSchema = z
  .object({
    bucket: z.enum(STORAGE_BUCKETS, {
      message: "مستودع التخزين غير مصرح به",
    }),
    fileName: z
      .string({ message: "اسم الملف مطلوب" })
      .transform((val) => val.trim())
      .refine((val) => val.length > 0, { message: "اسم الملف لا يمكن أن يكون فارغاً" })
      .refine((val) => val.length <= 255, { message: "اسم الملف يتجاوز 255 حرفاً" })
      .refine((val) => !val.includes("..") && !val.startsWith("/"), {
        message: "اسم الملف يحتوي على مسارات غير آمنة",
      }),
    mimeType: z
      .string({ message: "نوع الملف (MIME) مطلوب" })
      .transform((val) => val.trim().toLowerCase()),
    fileSizeBytes: positiveInt(AUDIO_MAX_BYTES),
  })
  .strict()
  .superRefine((data, ctx) => {
    const allowedMimes = BUCKET_ALLOWED_MIMES[data.bucket];
    if (!allowedMimes.includes(data.mimeType)) {
      ctx.addIssue({
        code: "custom",
        path: ["mimeType"],
        message: `نوع الملف (${data.mimeType}) غير مسموح به في مستودع "${data.bucket}"`,
      });
    }

    const maxBytes = BUCKET_BYTE_LIMITS[data.bucket];
    if (data.fileSizeBytes > maxBytes) {
      const maxMb = maxBytes / (1024 * 1024);
      ctx.addIssue({
        code: "custom",
        path: ["fileSizeBytes"],
        message: `حجم الملف يتجاوز الحد الأقصى المسموح (${maxMb} ميغابايت) لمستودع "${data.bucket}"`,
      });
    }

    if (!isExtensionMatchingMime(data.fileName, data.mimeType)) {
      ctx.addIssue({
        code: "custom",
        path: ["fileName"],
        message: `امتداد الملف لا يتطابق مع نوع المحتوى المصرح به (${data.mimeType})`,
      });
    }
  });

export type FileUploadMetadata = z.infer<typeof fileUploadMetadataSchema>;

// ============================================================================
// Media Track & Release Metadata Schemas
// ============================================================================

export const trackMediaSchema = z
  .object({
    audio_file_url: safeUrlSchema(500),
    duration_seconds: positiveInt(7200),
  })
  .strict();

export const releaseMediaSchema = z
  .object({
    track_count: positiveInt(100),
    release_year: z
      .number({ message: "سنة الإصدار يجب أن تكون رقماً صحيحاً" })
      .int({ message: "سنة الإصدار يجب أن تكون رقماً صحيحاً" })
      .min(1900, { message: "سنة الإصدار يجب أن تكون 1900 أو أحدث" })
      .max(2100, { message: "سنة الإصدار غير صالحة" }),
    cover_image_url: safeUrlSchema(500),
  })
  .strict();
