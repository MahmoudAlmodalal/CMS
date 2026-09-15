"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import type { EventItem, CategoryFilterId } from "@/lib/types/events";
import { EventsFilterTabs } from "./EventsFilterTabs";
import { FeaturedEventBanner } from "./FeaturedEventBanner";
import { EventCard } from "./EventCard";

export interface EventsCatalogViewProps {
  initialEvents: EventItem[];
  featuredEvent: EventItem | null;
  initialCategory?: CategoryFilterId;
  allLabel?: string | null;
}

/**
 * الفعاليات catalogue — the filter bar of node 91:16930 over the two columns of
 * 91:16914 and 91:16793 in frame 91:16532.
 *
 * The bar is 55px in from the artboard's inline start and the two columns sit in a
 * 1262-wide band 78px in, the list against the inline start and the featured panel
 * against the inline end. The list opens 13px below the panel and its rows are
 * 16px apart — a 166.135 pitch on a 150.135 row.
 *
 * The design draws no result count, no section headings and no card around either
 * column. Filtering, the ?category= sync, the tablist and the empty state are
 * behaviour the design cannot express and are kept as they were.
 */
export function EventsCatalogView({
  initialEvents,
  featuredEvent,
  initialCategory = "all",
  allLabel,
}: EventsCatalogViewProps) {
  const t = useTranslations("events");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const urlCategory = (searchParams.get("category") as CategoryFilterId) || initialCategory;
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterId>(urlCategory);

  const handleCategoryChange = (category: CategoryFilterId) => {
    setSelectedCategory(category);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (category === "all") {
        params.delete("category");
      } else {
        params.set("category", category);
      }
      const newQuery = params.toString();
      router.replace(newQuery ? `/events?${newQuery}` : "/events", { scroll: false });
    });
  };

  const filteredEvents =
    selectedCategory === "all"
      ? initialEvents
      : initialEvents.filter((item) => item.category === selectedCategory);

  const shouldShowFeatured =
    featuredEvent &&
    (selectedCategory === "all" || featuredEvent.category === selectedCategory);

  return (
    <div className="flex w-full flex-col">
      {/* 1. Filter bar 91:16930 */}
      <EventsFilterTabs
        activeCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
        // Offset only: the tablist sets its own 415px width at lg, and a width here
        // would merge in after it and stretch the bar across the page.
        className="lg:mx-auto hd:mx-0 hd:ms-[55px]"
        allLabel={allLabel}
      />

      {/* 2. The list and the featured panel, side by side.
          The 390 frame stacks them and puts 38 between every section on the page —
          band to filter bar, filter bar to list, list to featured panel. */}
      <div className="mt-[38px] flex flex-col gap-[38px] lg:mx-auto lg:mt-6 lg:w-full lg:max-w-[1262px] lg:flex-row lg:justify-between lg:gap-6 hd:mx-0 hd:ms-[78px] hd:gap-0">
        {filteredEvents.length > 0 ? (
          <div
            id="events-catalog-grid"
            role="region"
            aria-label={t("listRegion")}
            // Frame 39 on the 390 frame is 390.33 wide and 10px padded, holding its
            // rows at x=10 with 10 between them.
            className="motion-stagger flex w-full max-w-[600px] flex-col gap-6 px-4 lg:mt-[13px] lg:w-[713px] lg:max-w-none lg:gap-4 lg:p-0"
          >
            {filteredEvents.map((event, index) => (
              <EventCard key={event.id} event={event} style={{ "--stagger-delay": `${Math.min(index * 80, 400)}ms` } as React.CSSProperties} />
            ))}
          </div>
        ) : (
          /* Empty state — a filter result the design never draws. */
          <div
            id="events-catalog-grid"
            role="region"
            aria-label={t("listRegion")}
            className="flex flex-col items-center gap-4 rounded-[16px] border border-dashed border-brand-espresso/20 bg-white px-4 py-16 text-center lg:mt-[13px] lg:w-[713px]"
          >
            <span aria-hidden="true" className="text-xl font-bold text-primary-500">
              ♪
            </span>
            <h2 className="font-display text-xl font-bold text-brand-espresso">
              {t("emptyTitle")}
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-brand-espresso/60">
              {t("emptyBody")}
            </p>
            {selectedCategory !== "all" && (
              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                className="cursor-pointer rounded-badge bg-primary-50 px-6 py-2.5 text-xs font-bold text-primary-500 transition-colors hover:bg-primary-100"
              >
                {t("showAll")}
              </button>
            )}
          </div>
        )}

        {shouldShowFeatured && (
          // 144:19982 reserves a 349x586 box at x=21 for this panel and draws nothing
          // inside it — the 390 frame never laid the banner out, it only left the
          // slot. So the slot is reproduced and the existing banner fills it.
          <section
            aria-label={t("featuredRegion")}
            className="mx-auto h-auto w-[calc(100%-32px)] max-w-[349px] lg:mx-0 lg:h-auto lg:w-[503px] lg:max-w-none"
          >
            <FeaturedEventBanner event={featuredEvent} />
          </section>
        )}
      </div>
    </div>
  );
}
