"use client";

import React, { useRef, useState, useCallback } from "react";
import { uploadMediaAction } from "@/actions/storage";
import { BUCKET_ALLOWED_MIMES, BUCKET_BYTE_LIMITS, type StorageBucket } from "@/lib/storage";

interface MediaUploadZoneProps {
  bucket: StorageBucket;
  onUploaded?: (path: string, publicUrl: string, mime: string, sizeBytes: number) => void;
}

/** Formats bytes to a human-readable MB/KB string for the UI. */
function humanBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} ميجابايت`;
  return `${Math.round(bytes / 1024)} كيلوبايت`;
}

const BUCKET_LABELS: Record<StorageBucket, string> = {
  site: "الموقع",
  artists: "الفنانون",
  releases: "الإصدارات",
  events: "الفعاليات",
  academy: "الأكاديمية",
  articles: "المقالات",
  audio: "الملفات الصوتية",
};

/**
 * Drag-and-drop + click-to-upload zone.
 * Displays bucket-specific MIME type allowlist and file size limit (imported
 * from @/lib/storage — never re-declared here).
 * Validates files client-side before submitting, then calls uploadMediaAction.
 */
export function MediaUploadZone({ bucket, onUploaded }: MediaUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const allowedMimes = BUCKET_ALLOWED_MIMES[bucket];
  const maxBytes = BUCKET_BYTE_LIMITS[bucket];

  const validateClientSide = useCallback(
    (file: File): string | null => {
      const mime = file.type.trim().toLowerCase();
      if (!(allowedMimes as readonly string[]).includes(mime)) {
        return `نوع الملف "${mime}" غير مسموح به في هذه الحاوية. الأنواع المسموحة: ${allowedMimes.join(", ")}`;
      }
      if (file.size > maxBytes) {
        return `حجم الملف (${humanBytes(file.size)}) يتجاوز الحد المسموح (${humanBytes(maxBytes)})`;
      }
      if (file.size === 0) {
        return "الملف فارغ";
      }
      return null;
    },
    [allowedMimes, maxBytes],
  );

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setSuccess(null);

      const clientError = validateClientSide(file);
      if (clientError) {
        setError(clientError);
        return;
      }

      setUploading(true);
      setProgress(`جارٍ رفع "${file.name}"…`);

      try {
        // ponytail: entityId is generic here (no owning record) — the media
        // manager stores general library assets, not entity-scoped ones.
        const result = await uploadMediaAction({
          bucket,
          entityId: "media-library",
          label: file.name,
          file,
        });

        if (!result.ok || !result.data) {
          setError(result.error ?? "فشل رفع الملف");
        } else {
          setSuccess(`تم رفع "${file.name}" بنجاح`);
          onUploaded?.(result.data.path, result.data.publicUrl, result.data.mime, result.data.sizeBytes);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "فشل رفع الملف");
      } finally {
        setUploading(false);
        setProgress(null);
      }
    },
    [bucket, validateClientSide, onUploaded],
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      // Upload only the first file for now
      uploadFile(fileList[0]);
    },
    [uploadFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset so the same file can be re-uploaded after a fix
    e.target.value = "";
  };

  return (
    <div className="mt-6" dir="rtl">
      <div
        role="button"
        tabIndex={0}
        aria-label="منطقة رفع الملفات"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={[
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-amber-500 bg-amber-50"
            : "border-gray-300 hover:border-amber-400 hover:bg-gray-50",
          uploading ? "opacity-60 pointer-events-none" : "",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={allowedMimes.join(",")}
          onChange={handleInputChange}
          disabled={uploading}
          aria-hidden="true"
        />

        {/* Cloud icon */}
        <div className="flex justify-center mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-10 h-10 text-gray-400"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.346 11.09"
            />
          </svg>
        </div>

        {uploading ? (
          <p className="text-sm text-amber-700">{progress}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">
              اسحب ملفاً هنا أو{" "}
              <span className="text-amber-600 underline">انقر للاختيار</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              حاوية: <strong>{BUCKET_LABELS[bucket]}</strong>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              الأنواع المقبولة: {allowedMimes.join(" ، ")}
            </p>
            <p className="text-xs text-gray-400">
              الحد الأقصى: {humanBytes(maxBytes)}
            </p>
          </>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}
    </div>
  );
}
