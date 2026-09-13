"use client";

import { useRef, useState } from "react";
import { uploadMediaAction } from "@/actions/storage";
import { AUDIO_MAX_BYTES, BUCKET_ALLOWED_MIMES, BUCKET_BYTE_LIMITS } from "@/lib/storage";
import { Input } from "@/components/ui/Input";

interface AudioUploadFieldProps {
  id: string;
  folder?: string;
  value: string;
  onChange: (url: string) => void;
  entityId?: string;
  disabled?: boolean;
}

function humanBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

const AUDIO_BUCKET = "audio" as const;

/**
 * Audio upload field: file picker -> Supabase Storage (audio/tracks) -> public URL.
 * Keeps a manual URL input as fallback (paste external URL).
 * Mirrors ImageUploadField pattern.
 */
export function AudioUploadField({
  id,
  folder = "tracks",
  value,
  onChange,
  entityId = "new-track",
  disabled = false,
}: AudioUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowedMimes = BUCKET_ALLOWED_MIMES[AUDIO_BUCKET];
  const maxBytes = BUCKET_BYTE_LIMITS[AUDIO_BUCKET];

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
      const safeEntity = entityId && entityId.trim() ? entityId.trim() : "new-track";
      const result = await uploadMediaAction({
        bucket: AUDIO_BUCKET,
        folder,
        entityId: safeEntity,
        label: file.name,
        file,
      });
      if (!result.ok || !result.data) {
        setError(result.error ?? "فشل رفع الملف الصوتي");
        return;
      }
      onChange(result.data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل رفع الملف الصوتي");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="space-y-2">
          <audio controls src={value} className="w-full" preload="metadata" />
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
              إزالة الملف
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
          {uploading ? "جارٍ الرفع..." : value ? "رفع ملف صوتي جديد" : "اختر ملفاً صوتياً للرفع"}
        </button>
      </div>

      <div>
        <label htmlFor={`${id}-url`} className="mb-1 block text-xs font-bold text-gradscale-400">
          أو الصق رابط ملف صوتي مباشر
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
