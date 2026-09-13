"use client";

import React, { useRef, useState, useCallback } from "react";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { VideoUploadField } from "@/components/admin/media/VideoUploadField";
import { listMediaAction } from "@/actions/admin-media";
import { listFolderMedia } from "./listFolderMedia";
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
  bucket?: StorageBucket;
  folder?: string;
  required?: boolean;
  disabled?: boolean;
  mediaType?: "image" | "video" | "all";
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

function isVideoFile(file: StorageFile): boolean {
  if (file.mimeType) return file.mimeType.startsWith("video/");
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "ogg", "mov"].includes(ext ?? "");
}

function isMediaFile(file: StorageFile, mediaType: "image" | "video" | "all"): boolean {
  if (mediaType === "video") return isVideoFile(file);
  if (mediaType === "all") return isImageFile(file) || isVideoFile(file);
  return isImageFile(file);
}

function getFileUrl(file: StorageFile, currentBucket: StorageBucket): string {
  if (file.publicUrl) return file.publicUrl;
  return resolveMediaUrl(file.bucket ?? currentBucket, file.path) ?? file.path;
}

/**
 * Media picker field: composes ImageUploadField / VideoUploadField with an accessible media library
 * browser to pick existing media from Supabase storage buckets.
 */
export function MediaPickerField({
  id,
  label,
  value,
  onChange,
  bucket = DEFAULT_IMAGE_BUCKET,
  folder,
  required,
  disabled = false,
  mediaType = "image",
}: MediaPickerFieldProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<StorageBucket>(
    bucket && IMAGE_BUCKETS.includes(bucket) ? bucket : DEFAULT_IMAGE_BUCKET,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchFiles = useCallback(
    async (bucketToLoad: StorageBucket) => {
      setLoading(true);
      setError(null);
      try {
        const res = folder
          ? await listFolderMedia(bucketToLoad, folder)
          : await listMediaAction(bucketToLoad, undefined);

        if ("error" in res && res.error) {
          setError(res.error);
          setFiles([]);
        } else if ("files" in res && res.files) {
          setFiles(res.files);
        } else {
          setFiles([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "فشل تحميل الوسائط من التخزين");
      } finally {
        setLoading(false);
      }
    },
    [folder],
  );

  const openDialog = () => {
    if (disabled) return;
    setIsOpen(true);
    dialogRef.current?.showModal();
    if (!hasLoaded) {
      setHasLoaded(true);
      void fetchFiles(selectedBucket);
    }
  };

  const closeDialog = () => {
    dialogRef.current?.close();
    setIsOpen(false);
  };

  const handleBucketChange = (newBucket: StorageBucket) => {
    setSelectedBucket(newBucket);
    void fetchFiles(newBucket);
  };

  const mediaFiles = files.filter((f) => isMediaFile(f, mediaType));

  return (
    <div className="space-y-3" dir="rtl">
      {label ? (
        <label htmlFor={`${id}-url`} className="block text-xs font-bold text-gradscale-400">
          {label}
        </label>
      ) : null}

      {mediaType === "video" ? (
        <VideoUploadField
          id={id}
          bucket={bucket}
          folder={folder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          entityId="site-settings"
          label={label}
        />
      ) : (
        <ImageUploadField
          id={id}
          bucket={bucket}
          folder={folder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          entityId="site-settings"
          label={label}
        />
      )}

      <div>
        <button
          type="button"
          onClick={openDialog}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-controls={`${id}-media-dialog`}
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

      <dialog
        ref={dialogRef}
        id={`${id}-media-dialog`}
        dir="rtl"
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            closeDialog();
          }
        }}
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-brand-espresso-subtle backdrop:bg-black/50 backdrop:backdrop-blur-xs max-h-[85vh] overflow-y-auto m-auto"
      >
        <div className="flex items-center justify-between gap-3 border-b border-brand-espresso-subtle/50 pb-3 mb-4">
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
            onClick={closeDialog}
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
            <span>
              {mediaType === "video"
                ? "جارٍ تحميل مقاطع الفيديو..."
                : "جارٍ تحميل الصور..."}
            </span>
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
        ) : mediaFiles.length === 0 ? (
          <p className="py-8 text-center text-xs text-gradscale-400">
            {mediaType === "video"
              ? "لا توجد مقاطع فيديو متوفرة في هذه الحاوية"
              : "لا توجد صور متوفرة في هذه الحاوية"}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1 sm:grid-cols-4 md:grid-cols-6">
            {mediaFiles.map((file) => {
              const fileUrl = getFileUrl(file, selectedBucket);
              const isSelected = Boolean(fileUrl && fileUrl === value);
              return (
                <button
                  key={file.path}
                  type="button"
                  aria-label={file.name}
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (file.publicUrl) {
                      onChange(file.publicUrl);
                    } else if (fileUrl) {
                      onChange(fileUrl);
                    }
                    closeDialog();
                  }}
                  className={`group relative aspect-square overflow-hidden rounded-lg border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                    isSelected
                      ? "border-brand-primary ring-2 ring-brand-primary ring-offset-1"
                      : "border-brand-espresso-subtle hover:border-brand-primary/60 bg-white"
                  }`}
                >
                  {fileUrl ? (
                    isVideoFile(file) ? (
                      <div className="flex h-full w-full items-center justify-center bg-black text-white">
                        <svg className="h-6 w-6 text-brand-tint" fill="currentColor" viewBox="0 0 24 24">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element -- preview of media library file */
                      <img
                        src={fileUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    )
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
      </dialog>
    </div>
  );
}
