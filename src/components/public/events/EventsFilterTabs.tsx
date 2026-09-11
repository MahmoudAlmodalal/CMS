"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { CATEGORY_TABS, type CategoryFilterId } from "@/lib/types/events";

export interface EventsFilterTabsProps {
  activeCategory: CategoryFilterId;
  onSelectCategory: (category: CategoryFilterId) => void;
  className?: string;
}

/**
 * Events Filter Tabs Component
 * Derived directly from Figma Node 91:16532 / Nodes:
 * - 186:1781 ("الكل")
 * - 186:1778 ("حفلات")
 * - 186:1775 ("مهرجانات")
 * - 186:1772 ("أمسيات")
 * - 186:1769 ("ورش")
 */
export function EventsFilterTabs({
  activeCategory,
  onSelectCategory,
  className,
}: EventsFilterTabsProps) {
  const t = useTranslations("events");
  return (
    <div
      role="tablist"
      aria-label={t("filterTabs")}
      className={cn(
        "flex items-center gap-2.5 overflow-x-auto py-2 scrollbar-none no-scrollbar",
        className
      )}
    >
      {CATEGORY_TABS.map((tab) => {
        const isActive = activeCategory === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls="events-catalog-grid"
            onClick={() => onSelectCategory(tab.id)}
            className={cn(
              "inline-flex items-center justify-center h-[38px] px-5 text-sm font-bold font-sans rounded-badge select-none transition-all duration-150 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
              isActive
                ? "bg-primary-500 text-white shadow-subtle scale-100"
                : "bg-primary-50 text-gradscale-900 border border-primary-100 hover:bg-primary-100/80 active:scale-95"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
