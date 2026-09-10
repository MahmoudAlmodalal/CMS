import React from "react";
import Image from "next/image";
import Link from "next/link";
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
 * Verified against Figma Frame 28 (Node 87:14466, 1439x678):
 * - Split banner: 509x678 image (radius 0 16 16 0) + 939x678 list panel
 * - Heading (87:14481): Qahwa Arabic 48px/40, #2B1D14
 * - Rows (87:14484 / 14499 / 14514): WHITE cards, radius 16, height 110.65, 8px gap
 *   * Date badge 72x53.98 r=8 #C54716 — day Cairo Black 22.4px, month Cairo SemiBold
 *     8px / 0.06em / uppercase
 *   * Title Cairo Bold 16.8px black, location Cairo Regular 12.48px black
 *   * Type badge: OUTLINED, 0.667px rgba(198,72,23,.4), radius 4, Cairo Bold 9.28px,
 *     0.1em tracking, uppercase
 *   * Trailing affordance is a bare ← glyph (Cairo Regular 19.2px #C54716)
 * - Decorative texture bands (87:14470 / 87:14471): 18px, opacity .35
 * - Bottom CTA (87:14532): h=48, radius 16, Cairo Bold 14.4px
 *
 * Ticket links stay on /booking?event_id=... — the project forbids /events/[slug].
 */
export function HomeEvents({ events }: HomeEventsProps) {
  if (!events || events.length === 0) {
    return null;
  }

  const featuredImage = events[0]?.image_url || "/assets/events/default-event.png";

  return (
    <section className="min-h-[678px] lg:h-[678px] bg-[#F9F7F0] overflow-hidden flex flex-col justify-center">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-stretch lg:h-[678px]">
        {/* Left Visual Banner (Figma Node 87:14467 — 509x678, radius 0 16 16 0) */}
        <div className="relative w-full lg:w-[509px] h-64 sm:h-80 lg:h-full shrink-0 overflow-hidden bg-brand-espresso rounded-e-[16px]">
          <Image
            src={featuredImage}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 1024px) 100vw, 509px"
            className="object-cover"
          />
        </div>

        {/* Right Event List Panel (Figma Node 87:14468 — 939x678) */}
        <div className="relative flex-1 lg:max-w-[939px] flex flex-col justify-center p-6 sm:p-10 lg:p-14 lg:h-full text-start">
          {/* Decorative texture bands (Figma Nodes 87:14470 / 87:14471) */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[18px] opacity-35 bg-repeat-x bg-[length:60px_18px] bg-[url('/assets/branding/arabesque-texture.png')]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[18px] opacity-35 bg-repeat-x bg-[length:60px_18px] bg-[url('/assets/branding/arabesque-texture.png')]"
            aria-hidden="true"
          />

          {/* Section Header (Figma 87:14481 — Qahwa 48px/40) */}
          <h2 className="font-calligraphic text-3xl sm:text-4xl lg:text-[48px] font-bold text-brand-espresso leading-[0.834] pb-12">
            نلتقي في المكان. في اللحظة
          </h2>

          {/* Event Rows (Figma Nodes 87:14484, 87:14499, 87:14514 — 8px gap) */}
          <div className="flex flex-col gap-2">
            {events.slice(0, 3).map((event) => {
              const eventDate = new Date(event.event_date);
              const day = toArabicDigits(eventDate.getDate());
              const month = new Intl.DateTimeFormat("ar-EG", { month: "long" }).format(eventDate);
              const categoryLabel = CATEGORY_MAP[event.category] || event.category;

              return (
                <Link
                  key={event.id}
                  href={`/booking?event_id=${event.id}`}
                  className="group flex items-center gap-4 sm:gap-6 bg-white rounded-[16px] px-4 sm:px-7 h-[110.65px] transition-shadow duration-200 hover:shadow-card focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
                  aria-label={`احجز تذكرة ${event.title}`}
                >
                  {/* Date Badge (Figma 87:14485 — 72x53.98, radius 8) */}
                  <div className="w-[72px] h-[54px] rounded-lg bg-brand-primary text-primary-50 flex flex-col items-center justify-center shrink-0">
                    <span className="font-sans font-black text-[22.4px] leading-none">
                      {day}
                    </span>
                    <span className="font-sans font-semibold text-[8px] tracking-[0.06em] uppercase leading-[1.5] pt-0.5">
                      {month}
                    </span>
                  </div>

                  {/* Title & Location (Figma 87:14490) */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-sans text-[16.8px] font-bold leading-[1.5] text-black truncate">
                      {event.title}
                    </h3>
                    <p className="font-sans text-[12.48px] font-normal leading-[1.5] text-black truncate pt-0.5">
                      {event.location || event.city}
                    </p>
                  </div>

                  {/* Type badge — outlined (Figma 87:14496 — radius 4) */}
                  <span className="hidden sm:inline-flex items-center shrink-0 px-2.5 py-[3px] rounded-[4px] border-[0.667px] border-[rgba(198,72,23,0.4)] font-sans text-[9.28px] font-bold tracking-[0.1em] uppercase text-brand-primary">
                    {categoryLabel}
                  </span>

                  {/* Trailing glyph (Figma 87:14498 — Cairo Regular 19.2px) */}
                  <span
                    className="shrink-0 font-sans text-[19.2px] font-normal leading-[1.5] text-brand-primary transition-transform group-hover:-translate-x-1"
                    aria-hidden="true"
                  >
                    ←
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Section Bottom CTA (Figma Node 87:14532 — h=48, radius 16) */}
          <div className="pt-10">
            <Link
              href="/events"
              className="inline-flex items-center justify-center h-12 px-[26px] rounded-[16px] bg-brand-primary text-primary-50 font-sans font-bold text-[14.4px] hover:bg-brand-primary-hover active:bg-brand-primary-pressed transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              عرض كل الفعاليات
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
