import React from "react";

export default function ArtistsLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="جاري تحميل قائمة الفنانين">
      <div className="space-y-2">
        <div className="h-4 w-28 rounded bg-brand-surface/80" />
        <div className="h-8 w-48 rounded-lg bg-brand-surface" />
        <div className="h-4 w-80 max-w-full rounded bg-brand-surface/60" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => <div key={item} className="h-28 rounded-card border border-brand-espresso-subtle/60 bg-white" />)}
      </div>
      <div className="h-96 rounded-card border border-brand-espresso-subtle/60 bg-white" />
    </div>
  );
}
