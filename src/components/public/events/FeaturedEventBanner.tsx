import React from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { EventItem } from "@/lib/types/events";

export interface FeaturedEventBannerProps {
  event: EventItem;
  className?: string;
}

/**
 * Featured event panel — Figma node 91:16914 in frame 91:16532.
 *
 * 503x669 on espresso with a 24px radius, clipped: a 397-tall cover across the
 * top, then a 32px padded block reading from the inline start — the eyebrow in
 * Cairo Bold 9.92/14.88 primary-500 with 1.3888 of tracking, the title in Cairo
 * Bold 20/27 secondary-200 twelve px down, the performer in Cairo 13.6/20.4
 * secondary-300 eight px under that, the date and place in Cairo 13.12/19.68
 * secondary-200, then a 341x44 primary-500 button centred in the panel.
 *
 * The block comes to 646.3 of the 669, so the panel keeps 22.7px of bare espresso
 * under the button; that is the frame, not a rounding error.
 *
 * The arabesque mark (16.67% x 12.68% of the panel, top corner) sits in the
 * background layer underneath the cover and is drawn over completely. It is kept
 * so the panel still reads as designed if the photograph is ever missing.
 *
 * The design draws no description, no city chip, no calendar glyph and no second
 * link, and its button label carries the frame's spelling of أحجز.
 */
export function FeaturedEventBanner({ event, className = "" }: FeaturedEventBannerProps) {
  const t = useTranslations("events");
  const locale = useLocale();

  // Formatted in UTC against the stored instant, as in EventCard.
  const dateLocale = locale === "ar" ? "ar-EG" : "en-GB";
  const formattedDate = new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(event.event_date));
  const dateLocationString = `${formattedDate} · ${event.city}`;

  const cover = event.cover_image_url?.trim() || event.image_url;
  const bookingHref = `/booking?event_id=${event.id}`;
  const actionHref = event.ticket_url?.trim() || bookingHref;
  const isExternalTicket = Boolean(event.ticket_url?.trim());

  return (
    <article
      data-testid="featured-event-banner"
      className={`relative isolate flex w-full flex-col overflow-hidden rounded-card bg-brand-espresso text-start lg:h-[669px] lg:w-[503px] ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 -z-10 h-[12.68%] w-[16.67%] bg-[url('/assets/branding/band-mark.png')] bg-cover bg-no-repeat"
      />

      <div className="relative aspect-[503/397] w-full shrink-0 overflow-hidden lg:aspect-auto lg:h-[397px]">
        <Image
          src={cover}
          alt={event.title}
          fill
          priority
          quality={90}
          sizes="(min-width: 1024px) 503px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col items-start p-8">
        <p className="text-[9.92px] font-bold uppercase leading-[14.88px] tracking-[1.3888px] text-primary-500">
          {t("featuredBadge")}
        </p>

        <h2 className="h-[39px] max-w-[296px] pt-3 text-[20px] font-bold leading-[27px] text-secondary-200">
          {event.title}
        </h2>

        <p className="h-[29px] max-w-[296px] pt-2 text-[13.6px] leading-[20.4px] text-secondary-300">
          {event.performer_name}
        </p>

        <p className="h-[56.8px] max-w-[296px] pb-8 pt-[4.8px] text-[13.12px] leading-[19.68px] text-secondary-200">
          {dateLocationString}
        </p>

        <div className="relative h-[45.594px] w-full">
          <Link
            href={actionHref}
            target={isExternalTicket ? "_blank" : undefined}
            rel={isExternalTicket ? "noopener noreferrer" : undefined}
            className="absolute left-1/2 top-[0.2px] flex h-11 w-full max-w-[341px] -translate-x-1/2 items-center justify-center rounded-[16px] bg-primary-500 text-[16px] font-bold leading-[24px] text-primary-50 transition-colors hover:bg-brand-primary-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-tint"
          >
            {isExternalTicket ? t("bookTicket") : t("bookNow")}
          </Link>
        </div>
      </div>
    </article>
  );
}
