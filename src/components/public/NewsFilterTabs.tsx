"use client";

import React from "react";
import { ARTICLE_CATEGORIES } from "@/lib/articles";

export interface NewsFilterTabsProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  counts?: Record<string, number>;
  className?: string;
}

/**
 * NewsFilterTabs Component
 * Category filtering pills for the cultural articles index.
 * Matches Figma Component 1 design token styling and ARIA tablist standards.
 */
export function NewsFilterTabs({
  activeCategory,
  onSelectCategory,
  counts,
  className = "",
}: NewsFilterTabsProps) {
  return (
    <nav
      aria-label="تصنيفات الأخبار والمقالات"
      className={`w-full flex justify-start sm:justify-center overflow-x-auto py-2 ${className}`}
    >
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex items-center gap-2 max-w-full px-1 scrollbar-none scroll-smooth"
      >
        {ARTICLE_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = counts ? counts[cat.id] : undefined;

          return (
            <button
              key={cat.id}
              role="tab"
              type="button"
              id={`news-tab-${cat.id}`}
              aria-selected={isActive}
              aria-controls="news-grid-panel"
              onClick={() => onSelectCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-brand-primary text-white shadow-subtle border border-brand-primary"
                  : "bg-white text-brand-espresso border border-brand-espresso/15 hover:border-brand-primary/40 hover:bg-brand-surface/30"
              }`}
            >
              <span>{cat.label}</span>
              {typeof count === "number" && (
                <span
                  className={`ms-2 text-xs px-1.5 py-0.5 rounded-full transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-brand-espresso/10 text-brand-espresso/70"
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
