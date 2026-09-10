import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="جاري تحميل المحتوى">
      {/* Page Title Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-brand-surface/80 rounded-lg" />
        <div className="h-4 w-72 bg-brand-surface/60 rounded" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-brand-espresso-subtle/60 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-brand-surface/80 rounded" />
              <div className="w-8 h-8 rounded-lg bg-brand-surface/60" />
            </div>
            <div className="h-8 w-16 bg-brand-surface rounded-lg" />
            <div className="h-3 w-28 bg-brand-surface/50 rounded" />
          </div>
        ))}
      </div>

      {/* Content Table / Card Skeleton */}
      <div className="rounded-2xl bg-white border border-brand-espresso-subtle/60 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-brand-espresso-subtle/40 pb-4">
          <div className="h-5 w-36 bg-brand-surface/80 rounded" />
          <div className="h-8 w-24 bg-brand-surface/60 rounded-lg" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-brand-espresso-subtle/20 last:border-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-surface/80" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-brand-surface rounded" />
                  <div className="h-3 w-20 bg-brand-surface/50 rounded" />
                </div>
              </div>
              <div className="h-6 w-16 bg-brand-surface/60 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
