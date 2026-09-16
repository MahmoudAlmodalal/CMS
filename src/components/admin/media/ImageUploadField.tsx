"use client";

import { useRef, useState } from "react";
import { uploadMediaAction } from "@/actions/storage";
import { BUCKET_ALLOWED_MIMES, BUCKET_BYTE_LIMITS, storageHintAr, type StorageBucket } from "@/lib/storage";
import { Input } from "@/components/ui/Input";
import { SafeImage } from "@/components/ui/SafeImage";

interface ImageUploadFieldProps {
  id: string;
  bucket: StorageBucket;
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

/**
 * Image upload field: file picker -> Supabase Storage upload -> public URL.
 * Keeps a manual URL input as fallback (paste external URL).
 */
export function ImageUploadField({
  id,
  bucket,
  folder,
  value,
  onChange,
  entityId = "new-artist",
  disabled = false,
  help,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowedMimes = BUCKET_ALLOWED_MIMES[bucket];
  const maxBytes = BUCKET_BYTE_LIMITS[bucket];

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);

    const mime = (file.type || "").trim().toLowerCase();
    if (!(allowedMimes as readonly string[]).includes(mime)) {
      setError(`نوع الملف غير مدعوم. الأنواع المسموحة: ${allowedMimes.join(", ")}`);
      return;
    }
    if (file.size === 0) {
      setError("الملف فارغ");
      return;
    }
    if (file.size > maxBytes) {
      setError(`حجم الملف (${humanBytes(file.size)}) يتجاوز الحد (${humanBytes(maxBytes)})`);
      return;
    }

    setUploading(true);
    try {
      const safeEntity = entityId && entityId.trim() ? entityId.trim() : "new-artist";
      const result = await uploadMediaAction({
        bucket,
        folder,
        entityId: safeEntity,
        label: file.name,
        file,
      });
      if (!result.ok || !result.data) {
        setError(result.error ?? "فشل رفع الصورة");
        return;
      }
      onChange(result.data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="flex items-center gap-3">
          <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-brand-espresso-subtle bg-brand-surface">
            <SafeImage src={value} alt="" fill sizes="64px" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-gradscale-400" dir="ltr">
              {value}
            </p>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={disabled || uploading}
              className="mt-1 text-xs font-bold text-alert-error hover:underline disabled:opacity-50"
            >
              إزالة الصورة
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
          {uploading ? "جارٍ الرفع..." : value ? "رفع صورة جديدة" : "اختر صورة للرفع"}
        </button>
      </div>

      {/* The editor had no way to know what size to prepare; every number here
          comes from the same maps validateUploadFile enforces. */}
      <p className="text-xs leading-relaxed text-gradscale-400">
        {help ?? storageHintAr(bucket, folder)}
      </p>

      <div>
        <label htmlFor={`${id}-url`} className="mb-1 block text-xs font-bold text-gradscale-400">
          أو الصق رابط صورة مباشرة
        </label>
        <Input
          id={`${id}-url`}
          type="url"
          dir="ltr"
          placeholder="https://..."
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
