"use client";

import { useState, useCallback } from "react";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { listMediaAction } from "@/actions/admin-media";
import {
  STORAGE_BUCKETS,
  BUCKET_ALLOWED_MIMES,
  resolveMediaUrl,
  type StorageBucket,
} from "@/lib/storage";
import { BUCKET_LABELS } from "@/components/admin/media/MediaBucketTabs";
import type { StorageFile } from "@/lib/types/admin-media";

export interface MediaPickerFieldProps {
  id: string;
  label?: string;
  value: string;
  onChange: (url: string) => void;
  bucket?: StorageBucket; // default: the most appropriate general/site image bucket you find in STORAGE_BUCKETS
  disabled?: boolean;
}

/** Storage buckets whose allowed MIME list contains image formats. */
const IMAGE_BUCKETS: StorageBucket[] = STORAGE_BUCKETS.filter((b) =>
  BUCKET_ALLOWED_MIMES[b]?.some((mime) => mime.startsWith("image/")),
);

/** Default general/site image bucket. */
const DEFAULT_IMAGE_BUCKET: StorageBucket = "site";

function isImageFile(file: StorageFile): boolean {
  if (file.mimeType) return file.mimeType.startsWith("image/");
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "avif", "svg"].includes(ext ?? "");
}

function getFileUrl(file: StorageFile, currentBucket: StorageBucket): string {
  if (file.publicUrl) return file.publicUrl;
  return resolveMediaUrl(file.bucket ?? currentBucket, file.path) ?? file.path;
}

/**
 * Image picker field: composes ImageUploadField with an inline media library
 * browser to pick existing images from Supabase storage buckets.
 */
export function MediaPickerField(props: MediaPickerFieldProps) {
  const { id, label, value, onChange, bucket = DEFAULT_IMAGE_BUCKET, disabled = false } = props;

  const initialBucket: StorageBucket =
    bucket && IMAGE_BUCKETS.includes(bucket) ? bucket : DEFAULT_IMAGE_BUCKET;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<StorageBucket>(initialBucket);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchFiles = useCallback(async (bucketToLoad: StorageBucket) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listMediaAction(bucketToLoad);
      if (!res.success) {
        setError(res.error ?? "فشل تحميل ملفات الوسائط");
        setFiles([]);
      } else {
        setFiles(res.files ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحميل ملفات الوسائط");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTogglePanel = () => {
    if (disabled) return;
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && !hasLoaded) {
      setHasLoaded(true);
      void fetchFiles(selectedBucket);
    }
  };

  const handleBucketChange = (newBucket: StorageBucket) => {
    setSelectedBucket(newBucket);
    void fetchFiles(newBucket);
  };

  const imageFiles = files.filter(isImageFile);

  return (
    <div className="space-y-3" dir="rtl">
      {label ? (
        <label htmlFor={`${id}-url`} className="block text-xs font-bold text-gradscale-400">
          {label}
        </label>
      ) : null}

      <ImageUploadField
        id={id}
        bucket={bucket}
        value={value}
        onChange={onChange}
        disabled={disabled}
        entityId="site-settings"
        label={label}
      />

      <div>
        <button
          type="button"
          onClick={handleTogglePanel}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-controls={`${id}-media-panel`}
          className="inline-flex h-[40px] items-center justify-center gap-2 rounded-button border border-brand-espresso-subtle bg-white px-4 text-xs font-bold text-brand-espresso transition-colors hover:border-brand-primary hover:text-brand-primary disabled:opacity-50 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span>اختر من مكتبة الوسائط</span>
        </button>
      </div>

      {isOpen ? (
        <div
          id={`${id}-media-panel`}
          className="space-y-3 rounded-xl border border-brand-espresso-subtle bg-brand-surface p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3 border-b border-brand-espresso-subtle/50 pb-3">
            {IMAGE_BUCKETS.length > 1 ? (
              <div className="flex items-center gap-2">
                <label
                  htmlFor={`${id}-bucket-select`}
                  className="text-xs font-bold text-gradscale-400"
                >
                  حاوية التخزين:
                </label>
                <select
                  id={`${id}-bucket-select`}
                  value={selectedBucket}
                  onChange={(e) => handleBucketChange(e.target.value as StorageBucket)}
                  disabled={loading || disabled}
                  className="rounded-lg border border-brand-espresso-subtle bg-white px-2.5 py-1 text-xs font-medium text-brand-espresso focus:border-brand-primary focus:outline-none cursor-pointer"
                >
                  {IMAGE_BUCKETS.map((b) => (
                    <option key={b} value={b}>
                      {BUCKET_LABELS[b] ?? b}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="ms-auto text-xs font-bold text-gradscale-400 hover:text-brand-espresso cursor-pointer"
              aria-label="إغلاق لوحة اختيار الوسائط"
            >
              إغلاق
            </button>
          </div>

          {loading ? (
            <div
              className="flex items-center justify-center py-8 text-xs text-gradscale-400"
              aria-busy="true"
            >
              <svg
                className="me-2 h-4 w-4 animate-spin text-brand-primary"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>جارٍ تحميل الصور...</span>
            </div>
          ) : error ? (
            <div
              role="alert"
              className="flex items-center justify-between rounded-lg border border-alert-error/20 bg-alert-error/10 p-3 text-xs font-medium text-alert-error"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={() => void fetchFiles(selectedBucket)}
                className="ms-2 font-bold underline hover:opacity-80 cursor-pointer"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : imageFiles.length === 0 ? (
            <p className="py-8 text-center text-xs text-gradscale-400">
              لا توجد صور متوفرة في هذه الحاوية
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1 sm:grid-cols-4 md:grid-cols-6">
              {imageFiles.map((file) => {
                const fileUrl = getFileUrl(file, selectedBucket);
                const isSelected = Boolean(fileUrl && fileUrl === value);
                return (
                  <button
                    key={file.path}
                    type="button"
                    aria-label={file.name}
                    aria-pressed={isSelected}
                    onClick={() => {
                      if (fileUrl) {
                        onChange(fileUrl);
                      }
                      setIsOpen(false);
                    }}
                    className={`group relative aspect-square overflow-hidden rounded-lg border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                      isSelected
                        ? "border-brand-primary ring-2 ring-brand-primary ring-offset-1"
                        : "border-brand-espresso-subtle hover:border-brand-primary/60 bg-white"
                    }`}
                  >
                    {fileUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element -- preview of media library file */
                      <img
                        src={fileUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : null}
                    {isSelected ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-brand-primary/25">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white shadow">
                          ✓
                        </span>
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
