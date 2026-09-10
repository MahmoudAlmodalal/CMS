"use client";

import React from "react";
import { STORAGE_BUCKETS, type StorageBucket } from "@/lib/storage";

const BUCKET_LABELS: Record<StorageBucket, string> = {
  site: "الموقع",
  artists: "الفنانون",
  releases: "الإصدارات",
  events: "الفعاليات",
  academy: "الأكاديمية",
  articles: "المقالات",
  audio: "الملفات الصوتية",
};

const BUCKETS: { id: StorageBucket; label: string }[] = STORAGE_BUCKETS.map((id) => ({
  id,
  label: BUCKET_LABELS[id],
}));

interface MediaBucketTabsProps {
  activeBucket: StorageBucket;
  onBucketChange: (bucket: StorageBucket) => void;
}

/**
 * Tab bar showing all approved storage buckets (from @/lib/storage). Switching
 * tabs triggers onBucketChange so the parent can show the corresponding files.
 */
export function MediaBucketTabs({ activeBucket, onBucketChange }: MediaBucketTabsProps) {
  return (
    <nav
      role="tablist"
      aria-label="حاويات التخزين"
      className="flex flex-wrap gap-1 border-b border-gray-200 mb-6"
      dir="rtl"
    >
      {BUCKETS.map((bucket) => {
        const isActive = activeBucket === bucket.id;
        return (
          <button
            key={bucket.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`bucket-panel-${bucket.id}`}
            id={`bucket-tab-${bucket.id}`}
            type="button"
            onClick={() => onBucketChange(bucket.id)}
            className={[
              "px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors cursor-pointer",
              isActive
                ? "border-amber-600 text-amber-700 bg-amber-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50",
            ].join(" ")}
          >
            {bucket.label}
          </button>
        );
      })}
    </nav>
  );
}

export { BUCKETS, BUCKET_LABELS };
