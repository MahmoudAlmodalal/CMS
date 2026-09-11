import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { toArabicDigits } from "@/lib/formatters";
import type { EventItem } from "@/lib/types/events";
import { CalendarIcon } from "@/components/ui/Icons";

export interface FeaturedEventBannerProps {
  event: EventItem;
}

/**
 * Featured Event Banner Component
 * Derived directly from Figma Node 91:16532 / Nodes:
 * - 91:16919 (Kicker Badge: "الفعالية الأبرز")
 * - 91:16921 (Event Title)
 * - 91:16923 (Performer Attribution)
 * - 91:16925 (Date & Location String)
 * - 186:1747 (Action Button: "احجز الآن" -> /booking?event_id=[id])
 * - 186:880  (Cover Poster Photo)
 */
export function FeaturedEventBanner({ event }: FeaturedEventBannerProps) {
  const t = useTranslations("events");
  const locale = useLocale();
  const digits = (value: number) => (locale === "ar" ? toArabicDigits(value) : String(value));
  const eventDate = new Date(event.event_date);
  const day = digits(eventDate.getDate());
  const month = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    month: "long",
  }).format(eventDate);
  const year = digits(eventDate.getFullYear());
  const dateLocationString = `${day} ${month} ${year} · ${event.location || event.city}`;

  const bookingHref = `/booking?event_id=${event.id}`;
  const actionHref = event.ticket_url?.trim() || bookingHref;
  const isExternalTicket = Boolean(event.ticket_url?.trim());

  return (
    <article
      aria-label={t("featuredRegion")}
      className="relative overflow-hidden rounded-card bg-white border border-brand-espresso-subtle shadow-card transition-all hover:shadow-card-hover"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
        {/* Visual Poster Container */}
        <div className="relative lg:col-span-6 min-h-[260px] sm:min-h-[320px] lg:min-h-[380px] bg-secondary-200 overflow-hidden">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary-300 text-brand-espresso/40">
              <span className="font-calligraphic text-2xl font-bold">{t("posterFallback")}</span>
            </div>
          )}
          {/* Subtle vignette gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/40 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Content Details Container */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-start space-y-6">
          <div className="space-y-4">
            {/* Kicker Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-badge bg-primary-500 text-white text-xs font-bold shadow-subtle tracking-wide">
                <span>✦</span>
                <span>{t("featuredBadge")}</span>
              </span>
              <span className="text-xs font-bold text-brand-espresso/60">
                {event.city}
              </span>
            </div>

            {/* Event Title */}
            <h2 className="font-calligraphic text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-espresso leading-snug">
              {event.title}
            </h2>

            {/* Performer Attribution */}
            <div className="text-sm sm:text-base font-bold text-primary-500">
              {event.performer_name}
            </div>

            {/* Date & Location String */}
            <div className="flex items-center gap-2 text-sm sm:text-base text-brand-espresso/80 font-medium">
              <CalendarIcon size={18} className="text-primary-500 shrink-0" />
              <span>{dateLocationString}</span>
            </div>

            {/* Optional Description */}
            {event.description && (
              <p className="text-sm text-gradscale-400 line-clamp-3 leading-relaxed pt-1">
                {event.description}
              </p>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={actionHref}
              target={isExternalTicket ? "_blank" : undefined}
              rel={isExternalTicket ? "noopener noreferrer" : undefined}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-button bg-primary-500 text-white font-bold text-base shadow-subtle hover:bg-primary-400 active:bg-primary-600 transition-all active:scale-[0.98]"
            >
              {isExternalTicket ? t("bookTicket") : t("bookNow")}
            </Link>

            {isExternalTicket && (
              <Link
                href={bookingHref}
                className="inline-flex items-center justify-center px-5 py-3.5 rounded-button bg-primary-50 border border-primary-100 text-primary-500 font-bold text-sm hover:bg-primary-100 transition-all"
              >
                {t("privateRequest")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
