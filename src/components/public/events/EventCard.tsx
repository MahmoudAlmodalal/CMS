import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CATEGORY_MAP, type EventItem } from "@/lib/types/events";
import { SafeImage } from "@/components/ui/SafeImage";

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
 *
 * The 390 frame (144:19913) draws the same three blocks as a real row, 370.33x150.33
 * on 8.667 of padding with 19 between them, each vertically centred: the 93x105
 * thumbnail at the inline start, the 144x120 text block, then the 78x149 date block
 * at the inline end. That is the desktop order, so the row is reversed on mobile —
 * the source order puts the date first, which RTL would otherwise draw on the right.
 * The thumbnail is 93 wide there against 140 on desktop and the date chip 54 against
 * 70, both of which the frame states outright.
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
    month: locale === "ar" ? "long" : "short",
    timeZone: "UTC",
  }).format(eventDate);

  const categoryLabel = CATEGORY_MAP[event.category] || event.category;
  const performerCityString = `${event.performer_name} · ${event.city}`;

  // External ticket vendors win when the CMS carries a ticket_url; otherwise the
  // card deep-links into the booking context.
  const ticketUrl = event.ticket_url?.trim();
  const bookingHref = ticketUrl?.includes("andalusia.art/booking")
    ? `/booking?event_id=${event.id}`
    : ticketUrl || `/booking?event_id=${event.id}`;

  return (
    <article
      data-testid={`event-card-${event.slug}`}
      className={`relative flex h-auto w-full flex-col gap-4 overflow-hidden rounded-[16px] border-[0.667px] border-brand-espresso/10 bg-white p-4 lg:block lg:h-[150.135px] lg:p-0 ${className}`}
    >
      {/* Date block 91:16805 */}
      {/* 78x149 on the 390 frame: the 54-wide chip is wider than the 38 its padded
          box leaves, so it overhangs symmetrically — which is 12 of side padding. */}
      <div className="order-3 flex h-auto w-full shrink-0 flex-row items-center justify-between lg:absolute lg:end-0 lg:top-0 lg:h-[148.802px] lg:w-[110px] lg:flex-col lg:items-start lg:p-5">
        <div className="w-auto pb-0 lg:w-full lg:pb-3">
          <div className="w-[54px] rounded-[8px] bg-brand-espresso px-2 py-3 lg:w-auto lg:min-w-[70px] lg:px-4">
            <p className="text-center font-mono tabular-nums text-[24px] font-black leading-[24px] text-[#e9ebf8]">
              {dayArabic}
            </p>
            <p className="truncate whitespace-nowrap pt-[2px] text-center text-[9.6px] font-semibold uppercase leading-[14.4px] text-brand-surface/50">
              {monthArabic}
            </p>
          </div>
        </div>

        <div className="flex w-auto justify-center lg:w-full">
          <Link
            href={bookingHref}
            className="inline-flex max-w-full items-center justify-center whitespace-nowrap rounded-[6px] bg-primary-500 px-2 py-[7.2px] text-center text-[12px] font-bold leading-[18px] text-white transition-colors hover:bg-brand-primary-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary lg:px-[14.4px]"
          >
            {t("book")}
          </Link>
        </div>
      </div>

      {/* Text block 91:16797 */}
      <div className="order-2 flex h-auto w-full min-w-0 shrink-0 flex-col items-start text-start lg:absolute lg:end-[110.33px] lg:top-[14.33px] lg:h-[120px] lg:w-[418px] lg:flex-none lg:p-5 lg:pt-5">
        {/* The eyebrow is a bare 64x20 line on the 390 frame, not the 32.313 row the
            1440 one leaves above the title. */}
        <div className="relative h-5 w-full lg:h-[32.313px]">
          <span className="absolute start-0 top-[4.27px] flex h-[20.042px] max-w-full items-center justify-center truncate rounded-[2px] border-[0.667px] border-primary-500/25 bg-primary-100/20 px-1 text-[9.28px] font-bold uppercase leading-[13.92px] tracking-[0.928px] text-primary-500">
            {categoryLabel}
          </span>
        </div>

        <h3 className="line-clamp-2 w-full break-words text-[16px] font-bold leading-[24px] text-brand-espresso lg:w-auto lg:overflow-visible lg:whitespace-nowrap">
          {event.title}
        </h3>

        <p className="w-full truncate pt-1 text-[13px] leading-[19.5px] text-brand-espresso/50 lg:h-[24px] lg:w-[200px] lg:overflow-visible lg:whitespace-nowrap">
          {performerCityString}
        </p>
      </div>

      {/* Thumbnail 91:16815 */}
      <div className="relative order-1 h-[180px] w-full shrink-0 overflow-hidden rounded-[8px] bg-brand-surface/40 lg:absolute lg:start-[21px] lg:top-[24.33px] lg:h-[105px] lg:w-[140px]">
        <SafeImage
          src={event.image_url}
          alt={event.title}
          fill
          sizes="(max-width: 1023px) 93px, 140px"
          priority={priority}
          fallbackTestId="event-card-fallback-image"
          fallbackText={event.title}
          className="object-cover"
        />
      </div>
    </article>
  );
}
