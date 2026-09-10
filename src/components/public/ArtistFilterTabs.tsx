"use client";

import { ARTIST_CATEGORIES, type ArtistCategoryId } from "@/lib/types/artists";

export interface ArtistFilterTabsProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  counts?: Record<string, number>;
  className?: string;
}

/**
 * ArtistFilterTabs Component
 * Mapped to Figma Frame Container (Node 91:17844 / 91:18144 / 91:18145):
 * - Confirmed 6 categories: "الكل", "غناء", "عود وموسيقى", "إيقاع", "معاصر", "تراث"
 * - Keyboard accessible tablist with ARIA attributes
 * - RTL-first horizontal scrolling for mobile
 */
export function ArtistFilterTabs({
  activeCategory,
  onSelectCategory,
  counts,
  className = "",
}: ArtistFilterTabsProps) {
  return (
    <nav
      aria-label="تصنيفات الفنانين"
      className={`w-full flex justify-center ${className}`}
    >
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex items-center gap-2 overflow-x-auto max-w-full py-2 px-1 scrollbar-none scroll-smooth"
      >
        {ARTIST_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = counts ? counts[cat.id] : undefined;

          return (
            <button
              key={cat.id}
              role="tab"
              type="button"
              id={`tab-${cat.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-brand-primary text-white shadow-subtle border border-brand-primary font-bold"
                  : "bg-white text-brand-espresso border border-brand-espresso-subtle hover:border-brand-primary/40 hover:bg-brand-surface/30"
              }`}
            >
              <span>{cat.label}</span>
              {typeof count === "number" && (
                <span
                  className={`ms-2 text-xs px-1.5 py-0.5 rounded-full transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-brand-espresso-subtle/40 text-brand-espresso/70"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
