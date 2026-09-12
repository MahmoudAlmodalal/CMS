import React from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CATEGORY_MAP, type EventItem } from "@/lib/types/events";

export interface EventCardProps {
  event: EventItem;
  priority?: boolean;
  className?: string;
}

/**
 * Event row — Figma node 91:16794 in frame 91:16532.
 *
 * A 713x150.135 white row with a 16px radius and a 0.667px 10% espresso hairline,
 * clipped, holding three absolutely placed blocks:
 *
 * - The date block at the inline end (the left of the Arabic artboard), 110 wide
 *   and 20px padded: an espresso chip with an 8px radius carrying the day in Cairo
 *   Black 24/24 over the month in Cairo SemiBold 9.6/14.4 at half brand-surface,
 *   then the booking link 12px under it on primary-500 with a 6px radius.
 * - The text block 110.33 further in, 418x120 and 20px padded, reading from the
 *   inline start: the category pill, the title in Cairo Bold 16/24, then the
 *   performer and place in Cairo 13/19.5 at half espresso.
 * - The 140x105 thumbnail 21px in from the inline start.
 *
 * Two deviations, both stated rather than chased: the pill is drawn 0.95px inside
 * the text block's content edge and is flush here so it mirrors for the English
 * artboard, and its label is centred rather than held at the frame's left-8.79,
 * which moves it 0.66px down.
 *
 * Node 91:16795 — a second 140x105 box at left-350 — carries no fill in the frame
 * and draws nothing, so it is not reproduced.
 *
 * The design draws no scrim, no hover growth, no venue line and no second link.
 * Below lg the three blocks fall back to a plain flex row, which the 390 frame
 * will replace in its own pass.
 */
export function EventCard({ event, priority = false, className = "" }: EventCardProps) {
  const t = useTranslations("events");
  const locale = useLocale();

  // Formatted in UTC against the stored instant so the day cannot slide by a
  // timezone between build and render.
  const dateLocale = locale === "ar" ? "ar-EG" : "en-GB";
  const eventDate = new Date(event.event_date);
  const dayArabic = new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    timeZone: "UTC",
  }).format(eventDate);
  const monthArabic = new Intl.DateTimeFormat(dateLocale, {
    month: "long",
    timeZone: "UTC",
  }).format(eventDate);

  const categoryLabel = CATEGORY_MAP[event.category] || event.category;
  const performerCityString = `${event.performer_name} · ${event.city}`;

  const bookingHref = `/booking?event_id=${event.id}`;
  const actionHref = event.ticket_url?.trim() || bookingHref;
  const isExternalTicket = Boolean(event.ticket_url?.trim());

  return (
    <article
      data-testid={`event-card-${event.slug}`}
      className={`relative flex w-full items-center gap-4 overflow-hidden rounded-[16px] border-[0.667px] border-brand-espresso/10 bg-white p-4 lg:block lg:h-[150.135px] lg:p-0 ${className}`}
    >
      {/* Date block 91:16805 */}
      <div className="flex shrink-0 flex-col items-start lg:absolute lg:end-0 lg:top-0 lg:h-[148.802px] lg:w-[110px] lg:p-5">
        <div className="w-full pb-3">
          <div className="min-w-[70px] rounded-[8px] bg-brand-espresso px-4 py-3">
            <p className="text-center text-[24px] font-black leading-[24px] text-[#e9ebf8]">
              {dayArabic}
            </p>
            <p className="pt-[2px] text-center text-[9.6px] font-semibold uppercase leading-[14.4px] text-brand-surface/50">
              {monthArabic}
            </p>
          </div>
        </div>

        <div className="flex w-full justify-center">
          <Link
            href={actionHref}
            target={isExternalTicket ? "_blank" : undefined}
            rel={isExternalTicket ? "noopener noreferrer" : undefined}
            className="rounded-[6px] bg-primary-500 px-[14.4px] py-[7.2px] text-center text-[12px] font-bold leading-[18px] text-white transition-colors hover:bg-brand-primary-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            {isExternalTicket ? t("bookTicket") : t("book")}
          </Link>
        </div>
      </div>

      {/* Text block 91:16797 */}
      <div className="flex min-w-0 flex-1 flex-col items-start text-start lg:absolute lg:end-[110.33px] lg:top-[14.33px] lg:h-[120px] lg:w-[418px] lg:flex-none lg:p-5">
        <div className="relative h-[32.313px] w-full">
          <span className="absolute start-0 top-[4.27px] flex h-[20.042px] w-[44.948px] items-center justify-center rounded-[2px] border-[0.667px] border-primary-500/25 bg-primary-100/20 text-[9.28px] font-bold uppercase leading-[13.92px] tracking-[0.928px] text-primary-500">
            {categoryLabel}
          </span>
        </div>

        <h3 className="w-full truncate text-[16px] font-bold leading-[24px] text-brand-espresso lg:w-auto lg:overflow-visible lg:whitespace-nowrap">
          {event.title}
        </h3>

        <p className="w-full truncate pt-1 text-[13px] leading-[19.5px] text-brand-espresso/50 lg:h-[24px] lg:w-[200px] lg:overflow-visible lg:whitespace-nowrap">
          {performerCityString}
        </p>
      </div>

      {/* Thumbnail 91:16815 */}
      <div className="relative h-[72px] w-[96px] shrink-0 overflow-hidden bg-brand-surface/40 sm:h-[105px] sm:w-[140px] lg:absolute lg:start-[21px] lg:top-[24.33px]">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            sizes="140px"
            priority={priority}
            quality={90}
            className="object-cover"
          />
        ) : (
          /* Missing-asset fallback: the band mark on the card's own surface, so an
             event without a photograph never renders a broken image. */
          <div
            data-testid="event-card-fallback-image"
            className="flex h-full w-full items-center justify-center bg-brand-surface/60 text-lg font-bold text-brand-primary"
          >
            ♪
          </div>
        )}
      </div>
    </article>
  );
}
