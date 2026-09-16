"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ARTICLE_CATEGORIES, ARTICLE_CATEGORY_MESSAGE_KEYS } from "@/lib/articles";
import { ActivePill } from "./motion/ActivePill";

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
  const t = useTranslations("news");
  const c = useTranslations("categories");

  return (
    <nav
      aria-label={t("filterTabs")}
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
              // `isolate` is load-bearing: the pill sits at -z-10 and without a
              // stacking context here it would paint behind the tablist instead
              // of behind just this label.
              className={`relative isolate whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
                isActive
                  ? "text-white shadow-subtle border border-brand-primary"
                  : "bg-white text-brand-espresso border border-brand-espresso/15 hover:border-brand-primary/40 hover:bg-brand-surface/30"
              }`}
            >
              {/* One pill shared by the whole bar, so changing category slides it
                  across rather than blinking it from one label to the next. Its
                  own layoutId — a shared one would fly the pill between bars. */}
              {isActive ? (
                <ActivePill layoutId="news-filter-pill" className="rounded-full bg-brand-primary" />
              ) : null}
              <span>{c(ARTICLE_CATEGORY_MESSAGE_KEYS[cat.id])}</span>
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
