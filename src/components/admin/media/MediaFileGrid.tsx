"use client";

import React, { useState } from "react";
import type { StorageFile } from "@/lib/types/admin-media";
import { deleteMediaAction } from "@/actions/admin-media";

interface MediaFileGridProps {
  files: StorageFile[];
  onDeleted?: (path: string) => void;
}

/** Converts bytes to a human-readable string (e.g. "2.4 MB"). */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 ب";
  if (bytes < 1024) return `${bytes} ب`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} ج.ب`;
}

function isAudioFile(file: StorageFile): boolean {
  if (file.mimeType) return file.mimeType.startsWith("audio/");
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ["mp3", "ogg", "wav", "m4a", "aac"].includes(ext ?? "");
}

function isImageFile(file: StorageFile): boolean {
  if (file.mimeType) return file.mimeType.startsWith("image/");
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "avif", "svg"].includes(ext ?? "");
}

function AudioIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-10 h-10 text-amber-500"
      aria-hidden="true"
    >
      <path d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.572v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V5.25a.75.75 0 01.544-.721l10.5-3a.75.75 0 01.658.122z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-10 h-10 text-gray-400"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z"
        clipRule="evenodd"
      />
      <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
    </svg>
  );
}

interface FileCardProps {
  file: StorageFile;
  onDeleted?: (path: string) => void;
}

function FileCard({ file, onDeleted }: FileCardProps) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyPath = async () => {
    try {
      const textToCopy = file.publicUrl ?? file.path;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("فشل نسخ المسار");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`هل أنت متأكد من حذف الملف "${file.name}"؟`)) return;
    setDeleting(true);
    setError(null);
    try {
      const result = await deleteMediaAction(file.bucket, file.path);
      if (!result.success) {
        setError(result.error ?? "فشل حذف الملف");
      } else {
        onDeleted?.(file.path);
      }
    } catch {
      setError("فشل حذف الملف");
    } finally {
      setDeleting(false);
    }
  };

  const isAudio = isAudioFile(file);
  const isImage = isImageFile(file);

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      dir="rtl"
    >
      {/* Preview / Icon area */}
      <div className="h-32 bg-gray-50 flex items-center justify-center relative">
        {isImage && file.publicUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.publicUrl}
            alt={file.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : isAudio ? (
          <AudioIcon />
        ) : (
          <FileIcon />
        )}
      </div>

      {/* File info */}
      <div className="p-3 space-y-1">
        <p className="text-sm font-medium text-gray-800 truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>

        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopyPath}
            title="نسخ المسار"
            className="flex-1 text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {copied ? "✓ تم النسخ" : "نسخ المسار"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            title="حذف الملف"
            className="px-2 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs"
          >
            {deleting ? "جارٍ الحذف…" : "حذف"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Responsive grid of file cards for the currently active storage bucket.
 * Each card shows a thumbnail (images), audio icon (audio), or generic file icon.
 * Supports copy-path and delete per-file.
 */
export function MediaFileGrid({ files, onDeleted }: MediaFileGridProps) {
  const [localFiles, setLocalFiles] = useState<StorageFile[]>(files);

  // Sync when parent refreshes
  React.useEffect(() => {
    setLocalFiles(files);
  }, [files]);

  const handleDeleted = (path: string) => {
    setLocalFiles((prev) => prev.filter((f) => f.path !== path));
    onDeleted?.(path);
  };

  if (localFiles.length === 0) {
    return (
      <div className="text-center py-16" dir="rtl">
        <p className="text-gray-400 text-sm">لا توجد ملفات</p>
        <p className="text-gray-300 text-xs mt-1">ارفع ملفاً باستخدام المنطقة أدناه</p>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="قائمة الملفات"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      dir="rtl"
    >
      {localFiles.map((file) => (
        <FileCard key={file.path} file={file} onDeleted={handleDeleted} />
      ))}
    </div>
  );
}
