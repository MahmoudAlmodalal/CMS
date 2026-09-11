import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { toArabicDigits } from "@/lib/formatters";
import { CATEGORY_MAP, type EventItem } from "@/lib/types/events";

export interface EventCardProps {
  event: EventItem;
}

/**
 * Event Card Component
 * Derived directly from Figma Node 91:16532 / Nodes:
 * - 91:16800 (Category Badge: "حفلات", "أمسيات", "مهرجانات", "ورش")
 * - 91:16802 (Event Title)
 * - 91:16804 (Performer & City String)
 * - 91:16809 (Date Day Number: DM Mono digits)
 * - 91:16811 (Date Month Name: Cairo Arabic month)
 * - 91:16814 (Action Button: "احجز" -> /booking?event_id=[id])
 */
export function EventCard({ event }: EventCardProps) {
  const t = useTranslations("events");
  const locale = useLocale();
  const eventDate = new Date(event.event_date);
  const dayNumber = eventDate.getDate();
  const dayArabic = locale === "ar" ? toArabicDigits(dayNumber) : String(dayNumber);
  const monthArabic = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    month: "long",
  }).format(eventDate);

  const categoryLabel = CATEGORY_MAP[event.category] || event.category;
  const performerCityString = `${event.performer_name} · ${event.city}`;

  const bookingHref = `/booking?event_id=${event.id}`;
  const actionHref = event.ticket_url?.trim() || bookingHref;
  const isExternalTicket = Boolean(event.ticket_url?.trim());

  return (
    <article className="group flex flex-col h-full rounded-card bg-white border border-brand-espresso-subtle shadow-card overflow-hidden hover:border-primary-500/50 hover:shadow-card-hover transition-all duration-200">
      {/* 1. Event Poster Photo & Badges */}
      <div className="relative aspect-[16/10] w-full bg-secondary-200 overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary-300 text-brand-espresso/30 font-bold">
            {t("posterFallback")}
          </div>
        )}

        {/* Category Badge — Top Start */}
        <div className="absolute top-3.5 start-3.5 z-10">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-badge text-xs font-bold bg-white/95 text-brand-espresso shadow-xs backdrop-blur-xs border border-brand-espresso/5">
            {categoryLabel}
          </span>
        </div>

        {/* Date Box — Top End */}
        <div className="absolute top-3.5 end-3.5 z-10 flex flex-col items-center justify-center min-w-[48px] px-2 py-1.5 rounded-badge bg-white/95 text-brand-espresso shadow-xs backdrop-blur-xs border border-brand-espresso/5">
          <span className="font-mono text-lg font-bold leading-none text-primary-500">
            {dayArabic}
          </span>
          <span className="font-sans text-[11px] font-bold text-brand-espresso/80 mt-0.5 leading-none">
            {monthArabic}
          </span>
        </div>
      </div>

      {/* 2. Content Details */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between text-start space-y-4">
        <div className="space-y-2">
          {/* Performer & City String */}
          <p className="text-xs sm:text-sm font-semibold text-primary-500 tracking-wide">
            {performerCityString}
          </p>

          {/* Event Title */}
          <h3 className="font-sans text-lg sm:text-xl font-bold text-brand-espresso group-hover:text-primary-500 transition-colors leading-snug line-clamp-2">
            {event.title}
          </h3>

          {/* Location & Venue */}
          <p className="text-xs text-gradscale-400 font-medium line-clamp-1">
            {event.location}
          </p>
        </div>

        {/* 3. Action Button */}
        <div className="pt-2 border-t border-brand-espresso/5 flex items-center justify-between gap-3">
          <Link
            href={actionHref}
            target={isExternalTicket ? "_blank" : undefined}
            rel={isExternalTicket ? "noopener noreferrer" : undefined}
            className="inline-flex items-center justify-center w-full h-[42px] px-4 rounded-button bg-primary-500 text-white font-bold text-sm shadow-xs hover:bg-primary-400 active:bg-primary-600 transition-colors active:scale-[0.98]"
          >
            {isExternalTicket ? t("bookTicket") : t("book")}
          </Link>
        </div>
      </div>
    </article>
  );
}
