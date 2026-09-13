"use client";

import React, { useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MediaUploadZone } from "./MediaUploadZone";
import { listFolderMedia } from "./listFolderMedia";
import type { StorageBucket, StorageFile } from "@/lib/types/admin-media";

export interface MediaPickerFieldProps {
  id: string;
  value: string;
  onChange: (url: string) => void;
  bucket: StorageBucket;
  folder?: string;
  required?: boolean;
}

function isImageFile(file: StorageFile): boolean {
  if (file.mimeType) return file.mimeType.startsWith("image/");
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "avif", "svg"].includes(ext ?? "");
}

export function MediaPickerField({
  id,
  value,
  onChange,
  bucket,
  folder,
  required,
}: MediaPickerFieldProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<StorageFile[]>([]);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listFolderMedia(bucket, folder);
      if (res.error) {
        setError(res.error);
        setFiles([]);
      } else {
        setFiles(res.files);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحميل الملفات");
    } finally {
      setLoading(false);
    }
  }, [bucket, folder]);

  const openDialog = () => {
    dialogRef.current?.showModal();
    loadMedia();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  const imageFiles = files.filter(
    (file) => file.publicUrl !== null && isImageFile(file),
  );

  return (
    <div className="space-y-2 text-start">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <div className="flex-1 w-full">
          <Input
            id={id}
            type="url"
            dir="ltr"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openDialog}
            className="whitespace-nowrap cursor-pointer"
          >
            اختيار من المكتبة
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
            >
              مسح
            </Button>
          ) : null}
        </div>
      </div>

      {value ? (
        <div className="flex items-center gap-3 pt-1">
          <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="معاينة الصورة"
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>
      ) : null}

      <dialog
        ref={dialogRef}
        dir="rtl"
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            closeDialog();
          }
        }}
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-gray-200 backdrop:bg-black/50 backdrop:backdrop-blur-xs max-h-[85vh] overflow-y-auto m-auto"
      >
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
          <h3 className="text-base font-bold text-gray-900">
            اختيار صورة من المكتبة
          </h3>
          <button
            type="button"
            onClick={closeDialog}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg text-lg leading-none cursor-pointer"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {loading && (
          <div className="py-12 text-center text-sm text-gray-500">
            جارٍ تحميل الصور…
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="my-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {!loading && !error && imageFiles.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            لا توجد صور في هذا المجلد
          </div>
        )}

        {!loading && !error && imageFiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
            {imageFiles.map((file) => (
              <button
                key={file.path}
                type="button"
                onClick={() => {
                  if (file.publicUrl) {
                    onChange(file.publicUrl);
                    closeDialog();
                  }
                }}
                className="group relative aspect-square rounded-lg border border-gray-200 overflow-hidden hover:border-amber-500 hover:ring-2 hover:ring-amber-500/20 transition cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                title={file.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.publicUrl!}
                  alt={file.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[11px] text-white truncate text-center">
                    {file.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">
            رفع صورة جديدة
          </h4>
          <MediaUploadZone
            bucket={bucket}
            folder={folder}
            onUploaded={(_path, publicUrl) => {
              loadMedia();
              if (publicUrl) {
                onChange(publicUrl);
                closeDialog();
              }
            }}
          />
        </div>
      </dialog>
    </div>
  );
}
