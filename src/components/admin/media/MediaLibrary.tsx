"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BUCKET_FOLDERS, type StorageBucket } from "@/lib/storage";
import type { StorageFile } from "@/lib/types/admin-media";
import { MediaBucketTabs } from "./MediaBucketTabs";
import { Dropdown } from "@/components/ui/Dropdown";
import { MediaFileGrid } from "./MediaFileGrid";
import { MediaUploadZone } from "./MediaUploadZone";
import { listFolderMedia } from "./listFolderMedia";

export function MediaLibrary() {
  const [bucket, setBucket] = useState<StorageBucket>("site");
  const [folder, setFolder] = useState<string>(BUCKET_FOLDERS.site[0]);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBucketChange = (newBucket: StorageBucket) => {
    setBucket(newBucket);
    setFolder(BUCKET_FOLDERS[newBucket][0]);
  };

  const reload = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    listFolderMedia(bucket, folder)
      .then((res) => {
        if (!ignore) {
          setFiles(res.files);
          setError(res.error);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "فشل تحميل الملفات");
          setFiles([]);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [bucket, folder, refreshKey]);

  return (
    <div className="space-y-6" dir="rtl">
      <MediaBucketTabs activeBucket={bucket} onBucketChange={handleBucketChange} />

      <div className="flex items-center gap-3">
        <label htmlFor="media-folder-select" className="text-sm font-medium text-gray-700">
          المجلد:
        </label>
        <Dropdown<string>
          id="media-folder-select"
          ariaLabel="المجلد"
          value={folder}
          onChange={(next) => setFolder(next)}
          options={BUCKET_FOLDERS[bucket].map((f) => ({ value: f, label: f }))}
          size="sm"
          className="w-auto min-w-40"
        />
      </div>

      {loading && (
        <div className="py-8 text-center text-sm text-gray-500">
          جارٍ تحميل الملفات…
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="my-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{error}</span>
          {/* A failed listing is recoverable far more often than not, so the
              panel offers the retry rather than asking for a page reload. */}
          <button
            type="button"
            onClick={reload}
            className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 font-bold text-red-700 transition-colors hover:bg-red-100"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      <div
        role="tabpanel"
        id={`bucket-panel-${bucket}`}
        aria-labelledby={`bucket-tab-${bucket}`}
      >
        {!loading && !error && (
          <MediaFileGrid
            files={files}
            onDeleted={(deletedPath) => {
              setFiles((prev) => prev.filter((f) => f.path !== deletedPath));
            }}
          />
        )}
      </div>

      <MediaUploadZone bucket={bucket} folder={folder} onUploaded={reload} />
    </div>
  );
}
