import React from "react";
import Link from "next/link";
import { ArrowEndIcon } from "@/components/ui/Icons";
import { toArabicDigits } from "@/lib/formatters";
import type { Event } from "@/lib/dal/events";

interface HomeEventsProps {
  events: Event[];
}

const CATEGORY_MAP: Record<string, string> = {
  concert: "حفل",
  festival: "مهرجان",
  evening: "أمسية",
  workshop: "ورشة",
};

/**
 * Verified against Figma Frame 28 (Node 87:14466):
 * - Canvas Dimensions: Fixed 1439x678px desktop height (min-h-[678px] lg:h-[678px])
 * - Asymmetric 2-Column Split:
 *   * Left Visual Banner (87:14467): 509x678px atmospheric image container
 *   * Right Event List Container (87:14468): 939x678px list container
 * - Section Heading (87:14481): Qahwa Arabic Bold 48px "نلتقي في المكان. في اللحظة"
 * - Clean layout: Strictly NO invented badge ("الفعاليات الحية") and NO invented subtitle
 * - Event Row Items (87:14484):
 *   * Date Badge: 72x54px #C54716 fill with day (Cairo Black) & month (Cairo SemiBold)
 *   * Event Title & Location
 *   * Event Type Badge
 *   * Strict Deep-Link Ticket CTA: links exclusively to /booking?event_id=... (ZERO /events/[slug])
 * - Bottom CTA (87:14532): "عرض كل الفعاليات" -> /events
 */
export function HomeEvents({ events }: HomeEventsProps) {
  if (!events || events.length === 0) {
    return null;
  }

  const featuredImage = events[0]?.image_url || "/assets/events/default-event.webp";

  return (
    <section className="min-h-[678px] lg:h-[678px] bg-[#F7F4EE] border-t border-brand-espresso/5 overflow-hidden flex flex-col justify-center">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch lg:h-[678px]">
        {/* Left Visual Banner (Figma Node 87:14467 — 509x678px) */}
        <div className="relative w-full lg:w-[509px] h-64 sm:h-80 lg:h-full shrink-0 overflow-hidden bg-brand-espresso">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url(${featuredImage})`,
            }}
            aria-label="الفعاليات الحية"
            role="img"
          />
          {/* Dark gradient & atmospheric tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso via-brand-espresso/50 to-transparent opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-espresso/70 via-transparent to-brand-espresso/30" />

          {/* Atmospheric brand badge in corner */}
          <div className="absolute bottom-8 start-8 z-10 hidden sm:block">
            <span className="font-calligraphic text-2xl text-brand-tint/90 block">
              فرقة أندلسيا
            </span>
            <span className="text-xs text-brand-tint/70 font-sans">
              حفلات · مهرجانات · أمسيات
            </span>
          </div>
        </div>

        {/* Right Event List Container (Figma Node 87:14468 — 939x678px) */}
        <div className="flex-1 lg:max-w-[939px] flex flex-col justify-between p-6 sm:p-10 lg:p-14 lg:h-full bg-[#F7F4EE] text-start">
          {/* Section Header (Figma 87:14481 — Qahwa 48px, strictly NO pill badge/subtitle) */}
          <div className="pb-6">
            <h2 className="font-calligraphic text-3xl sm:text-4xl lg:text-[48px] font-bold text-brand-espresso leading-[1.2]">
              نلتقي في المكان. في اللحظة
            </h2>
          </div>

          {/* Events List Rows (Figma Nodes 87:14484, 87:14499, 87:14514) */}
          <div className="flex flex-col divide-y divide-brand-espresso/10 flex-1 justify-center">
            {events.slice(0, 3).map((event) => {
              const eventDate = new Date(event.event_date);
              const day = toArabicDigits(eventDate.getDate());
              const month = new Intl.DateTimeFormat("ar-EG", { month: "long" }).format(eventDate);
              const categoryLabel = CATEGORY_MAP[event.category] || event.category;
              const bookingHref = `/booking?event_id=${event.id}`;

              return (
                <div
                  key={event.id}
                  className="py-4 sm:py-5 flex items-center justify-between gap-4 group hover:bg-black/[0.02] -mx-3 px-3 rounded-2xl transition-colors"
                >
                  {/* Start Group: Date Badge + Title/Location */}
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    {/* Date Badge: 72x54px #C54716 fill */}
                    <div className="w-[72px] h-[54px] rounded-xl bg-brand-primary text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                      <span className="font-sans font-black text-lg sm:text-xl leading-none">
                        {day}
                      </span>
                      <span className="font-sans font-semibold text-[10px] sm:text-xs text-white/90 pt-0.5 leading-none">
                        {month}
                      </span>
                    </div>

                    {/* Event Metadata */}
                    <div className="min-w-0 space-y-1">
                      <h3 className="font-sans text-base sm:text-lg font-bold text-brand-espresso group-hover:text-brand-primary transition-colors truncate">
                        {event.title}
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-brand-espresso/70 truncate">
                        {event.location || event.city}
                      </p>
                    </div>
                  </div>

                  {/* End Group: Category Badge + Strict Booking CTA */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                      {categoryLabel}
                    </span>

                    {/* Ticket CTA strictly links to /booking?event_id=... (ZERO /events/[slug]) */}
                    <Link
                      href={bookingHref}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-brand-espresso/15 text-brand-espresso text-xs sm:text-sm font-bold shadow-xs hover:bg-brand-primary hover:text-white hover:border-brand-primary active:scale-95 transition-all group-hover:border-brand-primary/40"
                      aria-label={`احجز تذكرة ${event.title}`}
                    >
                      <span>احجز</span>
                      <span className="transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1">
                        <ArrowEndIcon size={14} />
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section Bottom CTA (Figma Node 87:14532 — 172x48px, fill #C54716) */}
          <div className="pt-6 border-t border-brand-espresso/10">
            <Link
              href="/events"
              className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-brand-primary text-white font-bold text-sm shadow-sm hover:bg-brand-primary-hover active:bg-brand-primary-pressed transition-all"
            >
              <span>عرض كل الفعاليات</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
