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
 * Events filter bar — Figma node 91:16930 in frame 91:16532.
 *
 * A 415x53.12 secondary-50 pill with a 16px radius, 20px of side padding and 8px
 * top and bottom, holding five tabs 14px apart and centred. Each tab is a 4px
 * padded box around a 4px padded label in Cairo Bold 14.08/21.12: 62 wide and
 * gradscale-900 when idle, 75 wide on primary-500 with 80% white when active.
 *
 * The frame draws them left to right as ورش · أمسيات · مهرجانات · حفلات · الكل,
 * which read right to left on the Arabic artboard is CATEGORY_TABS in its own
 * order — unlike الفنانين, this row needs no reordering.
 *
 * The five widths plus four gaps come to 379 against 375 of content box, so the
 * row overflows its padding by 2px each side exactly as the frame does.
 *
 * Filtering, the tablist roles and the ?category= sync are behaviour the design
 * cannot express and are unchanged.
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
        // Component 8 on the 390 frame is 376x54 flush to the inline start, so it
        // scrolls rather than wrapping — wrapping made it 104 against that 54.
        "flex h-[54px] w-[376px] items-center justify-center gap-[14px] overflow-x-auto overscroll-x-contain rounded-badge bg-secondary-50 px-5 py-2 [scrollbar-width:none]",
        "lg:h-[53.12px] lg:w-[415px] lg:overflow-visible",
        "[&::-webkit-scrollbar]:hidden",
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
              "shrink-0 cursor-pointer rounded-badge py-1 text-center text-[14.08px] font-bold leading-[21.12px]",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary",
              isActive
                ? "w-[75px] bg-primary-500 text-white/80"
                : "w-[62px] text-gradscale-900"
            )}
          >
            <span className="block py-1">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
