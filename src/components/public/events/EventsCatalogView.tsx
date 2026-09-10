"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EventItem, CategoryFilterId } from "@/lib/types/events";
import { EventsFilterTabs } from "./EventsFilterTabs";
import { FeaturedEventBanner } from "./FeaturedEventBanner";
import { EventCard } from "./EventCard";

export interface EventsCatalogViewProps {
  initialEvents: EventItem[];
  featuredEvent: EventItem | null;
  initialCategory?: CategoryFilterId;
}

/**
 * Client catalog coordinator for /events
 * Provides instant category filtering, URL synchronization, responsive grid, and empty state.
 */
export function EventsCatalogView({
  initialEvents,
  featuredEvent,
  initialCategory = "all",
}: EventsCatalogViewProps) {
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
      const newPath = newQuery ? `/events?${newQuery}` : "/events";
      router.replace(newPath, { scroll: false });
    });
  };

  // Filter events based on active category
  const filteredEvents =
    selectedCategory === "all"
      ? initialEvents
      : initialEvents.filter((item) => item.category === selectedCategory);

  // Show featured banner when "all" is active or if featured event matches selected category
  const shouldShowFeatured =
    featuredEvent &&
    (selectedCategory === "all" || featuredEvent.category === selectedCategory);

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* 1. Featured Event Hero Banner */}
      {shouldShowFeatured && (
        <section aria-label="الفعالية الأبرز">
          <FeaturedEventBanner event={featuredEvent} />
        </section>
      )}

      {/* 2. Filter Tabs Section */}
      <section aria-label="تصنيفات الفعاليات" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-brand-espresso/10 pb-4">
          <EventsFilterTabs
            activeCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />

          <span className="text-xs text-gradscale-400 font-medium self-end sm:self-auto">
            {filteredEvents.length > 0
              ? `عرض ${filteredEvents.length} فعالية`
              : "لا توجد فعاليات"}
          </span>
        </div>

        {/* 3. Events Cards Grid */}
        {filteredEvents.length > 0 ? (
          <div
            id="events-catalog-grid"
            role="region"
            aria-label="قائمة الفعاليات"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pt-2"
          >
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          /* 4. Empty State */
          <div className="text-center py-16 px-4 rounded-card bg-white border border-dashed border-brand-espresso/20 space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center mx-auto text-xl font-bold">
              ♪
            </div>
            <div className="space-y-1.5">
              <h3 className="font-calligraphic text-xl font-bold text-brand-espresso">
                لا توجد فعاليات مجدولة حالياً
              </h3>
              <p className="text-xs sm:text-sm text-gradscale-400 leading-relaxed">
                لم يتم نشر عروض في هذا التصنيف في الوقت الحالي. يمكنك استعراض كافة الفعاليات أو العودة قريباً.
              </p>
            </div>
            {selectedCategory !== "all" && (
              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-button bg-primary-50 text-primary-500 font-bold text-xs hover:bg-primary-100 transition-colors cursor-pointer"
              >
                عرض كافة الفعاليات
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
