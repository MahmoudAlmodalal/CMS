"use client";

import { useRef, useState } from "react";
import { uploadMediaAction } from "@/actions/storage";
import { VIDEO_MAX_BYTES, BUCKET_ALLOWED_MIMES, type StorageBucket } from "@/lib/storage";
import { Input } from "@/components/ui/Input";

export interface VideoUploadFieldProps {
  id: string;
  bucket?: StorageBucket;
  folder?: string;
  value: string;
  onChange: (url: string) => void;
  entityId?: string;
  label?: string;
  disabled?: boolean;
  help?: string;
}

function humanBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

const DEFAULT_VIDEO_MIMES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
] as const;

/**
 * Video upload field: file picker -> Supabase Storage upload -> public URL.
 * Keeps a manual URL input as fallback (paste external URL).
 * Mirrors AudioUploadField & ImageUploadField patterns.
 */
export function VideoUploadField({
  id,
  bucket = "site",
  folder = "hero",
  value,
  onChange,
  entityId = "site-settings",
  disabled = false,
}: VideoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bucketMimes = BUCKET_ALLOWED_MIMES[bucket]?.filter((m) => m.startsWith("video/")) ?? [];
  const allowedMimes = bucketMimes.length > 0 ? bucketMimes : DEFAULT_VIDEO_MIMES;
  const maxBytes = VIDEO_MAX_BYTES;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);

    const mime = (file.type || "").trim().toLowerCase();
    if (!(allowedMimes as readonly string[]).includes(mime)) {
      setError(`نوع الملف غير مدعوم. الأنواع المسموحة: MP4, WebM, OGG, QuickTime (${allowedMimes.join(", ")})`);
      return;
    }
    if (file.size === 0) {
      setError("الملف فارغ");
      return;
    }
    if (file.size > maxBytes) {
      setError(`حجم الملف (${humanBytes(file.size)}) يتجاوز الحد المسموح (${humanBytes(maxBytes)})`);
      return;
    }

    setUploading(true);
    try {
      const safeEntity = entityId && entityId.trim() ? entityId.trim() : "site-settings";
      const result = await uploadMediaAction({
        bucket,
        folder,
        entityId: safeEntity,
        label: file.name,
        file,
      });
      if (!result.ok || !result.data) {
        setError(result.error ?? "فشل رفع الفيديو");
        return;
      }
      onChange(result.data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل رفع الفيديو");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-xl border border-brand-espresso-subtle bg-black">
            <video
              controls
              src={value}
              className="max-h-56 w-full object-contain"
              preload="metadata"
            >
              متصفحك لا يدعم تشغيل الفيديو.
            </video>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 flex-1 truncate text-xs text-gradscale-400" dir="ltr">
              {value}
            </p>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={disabled || uploading}
              className="shrink-0 text-xs font-bold text-alert-error hover:underline disabled:opacity-50"
            >
              إزالة الفيديو
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={inputRef}
          type="file"
          accept={allowedMimes.join(",")}
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="inline-flex h-[48px] items-center justify-center gap-2 rounded-button border border-brand-espresso-subtle bg-white px-4 text-sm font-bold text-brand-espresso transition-colors hover:border-brand-primary hover:text-brand-primary disabled:opacity-50"
        >
          {uploading ? "جارٍ رفع الفيديو..." : value ? "رفع فيديو جديد" : "اختر فيديو للرفع"}
        </button>
      </div>

      <div>
        <label htmlFor={`${id}-url`} className="mb-1 block text-xs font-bold text-gradscale-400">
          أو الصق رابط فيديو مباشر
        </label>
        <Input
          id={`${id}-url`}
          type="url"
          dir="ltr"
          placeholder="https://.../video.mp4"
          value={value}
          onChange={(e) => {
            setError(null);
            onChange(e.target.value);
          }}
          disabled={disabled || uploading}
        />
      </div>

      {error ? (
        <p role="alert" className="text-xs font-medium text-alert-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
