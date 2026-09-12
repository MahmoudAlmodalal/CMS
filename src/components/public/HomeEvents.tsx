import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Event } from "@/lib/dal/events";

interface HomeEventsProps {
  events: Event[];
}

/** Event type -> key under the `categories` message namespace (short badge wording). */
const CATEGORY_KEY_MAP: Record<string, string> = {
  concert: "eventShortConcert",
  festival: "eventShortFestival",
  evening: "eventShortEvening",
  workshop: "eventShortWorkshop",
};

/**
 * نلتقي في المكان. في اللحظة — Figma frame 87:14466 (1439x678 at y=3550).
 *
 * A split band on brand-cream. The photograph is 509 wide and hangs 4px off the
 * artboard's inline end, rounded 16px on its inner edge only; the 939px panel
 * takes the rest and hangs 4px off the inline start, clipping its own overflow.
 * Inside the panel, an ornament at 7% fills the far corner at 60x60 with an 18px
 * strip at 35% over it; the frame draws the strip's twin at y=711, below the
 * band, where the clip swallows it.
 *
 * The content column (87:14472) is 875.333 wide, 31.67 in from the panel's inline
 * start and 96 down. The H2 is Qahwa Arabic 48/40 espresso in a 55.6px box padded
 * 13.6 at the top. 48px under it, three 110.646px white 16px-rounded rows 8px
 * apart, each drawn at absolute offsets rather than in flow:
 *
 *   date badge   30px from the inline end,   72 x 53.979 on primary-500, r8
 *   title block  142.33 from the inline start, 629 wide, 31.4 down
 *   type pill    68.33 from the inline start, 44.17 down, r4 on a 0.667px hairline
 *   ← glyph      11.33 from the inline start, 41.4 down
 *
 * and the CTA 24.45px under the last row: 48px tall, 16px-rounded, at the column's
 * inline end.
 *
 * DEVIATION: the frame's own date badges are placeholder noise — row 1 draws the
 * word "تين" where a number belongs and row 2 draws Latin "20" while row 3 draws
 * Arabic-Indic "٥". The rows render each event's real date in Arabic-Indic digits
 * throughout. Row 2's event is also drawn as 20 مارس here and 28 مارس on the
 * الفعاليات frame (91:16532); the catalogue's date is the one kept.
 *
 * Ticket links stay on /booking?event_id=... — the project forbids /events/[slug].
 */
export function HomeEvents({ events }: HomeEventsProps) {
  const t = useTranslations("home");
  const ev = useTranslations("event");
  const c = useTranslations("categories");

  if (!events || events.length === 0) {
    return null;
  }

  const featuredImage = events[0]?.image_url || "/assets/events/default-event.png";
  const day = new Intl.DateTimeFormat("ar-EG", { day: "numeric", timeZone: "UTC" });
  const month = new Intl.DateTimeFormat("ar-EG", { month: "long", timeZone: "UTC" });

  return (
    <section className="relative w-full overflow-hidden bg-brand-cream py-10 lg:h-[678px] lg:py-0">
      {/* Panel 87:14468 — 939 wide, hanging 4px off the inline start. */}
      <div className="relative mx-auto w-full max-w-[939px] overflow-hidden px-5 sm:px-8 lg:absolute lg:start-[-4px] lg:top-0 lg:mx-0 lg:h-[678px] lg:w-[939px] lg:max-w-none lg:px-0">
        {/* Ornaments 87:14469 / 87:14470, both in the panel's far corner. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute end-0 top-0 hidden size-[60px] bg-[url('/assets/branding/band-mark.png')] bg-contain bg-no-repeat opacity-[0.07] lg:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute end-0 top-0 hidden h-[18px] w-[60px] bg-[url('/assets/branding/arabesque-texture.png')] bg-contain bg-no-repeat opacity-35 lg:block"
        />

        {/* Content column 87:14472 */}
        <div className="relative w-full text-start lg:absolute lg:start-[31.67px] lg:top-[96px] lg:w-[875.333px]">
          {/* Heading 87:14480 */}
          <h2 className="pt-[13.6px] font-display text-[32px] leading-tight text-brand-espresso sm:text-[40px] lg:h-[55.6px] lg:text-[48px] lg:leading-[40px]">
            {t("eventsHeading")}
          </h2>

          {/* Rows 87:14483 */}
          <div className="flex flex-col gap-[8px] pt-8 lg:pt-[48px]">
            {events.slice(0, 3).map((event) => {
              const eventDate = new Date(event.event_date);
              const categoryKey = CATEGORY_KEY_MAP[event.category];
              const categoryLabel = categoryKey ? c(categoryKey) : event.category;

              return (
                <Link
                  key={event.id}
                  href={`/booking?event_id=${event.id}`}
                  aria-label={ev("bookTicket", { title: event.title })}
                  className="group relative flex items-center gap-4 rounded-[16px] bg-white p-4 transition-shadow duration-200 hover:shadow-card focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary lg:block lg:h-[110.646px] lg:p-0"
                >
                  {/* Date badge 87:14485 */}
                  <span className="flex h-[53.979px] w-[72px] shrink-0 flex-col rounded-[8px] bg-primary-500 px-[6.4px] py-[8.8px] lg:absolute lg:end-[30px] lg:top-[28.4px]">
                    <span className="block w-full text-center text-[22.4px] font-black leading-[22.4px] text-primary-50">
                      {day.format(eventDate)}
                    </span>
                    <span className="block h-[14px] w-full pt-[2px] text-center text-[8px] font-semibold uppercase leading-[12px] tracking-[0.48px] text-primary-50">
                      {month.format(eventDate)}
                    </span>
                  </span>

                  {/* Title and place 87:14490 */}
                  <span className="block min-w-0 flex-1 lg:absolute lg:start-[142.33px] lg:top-[31.4px] lg:h-[47px] lg:w-[629px]">
                    <span className="block truncate text-[16.8px] font-bold leading-[25.2px] text-black">
                      {event.title}
                    </span>
                    <span className="block truncate pt-[3.2px] text-[12.48px] leading-[18.72px] text-black">
                      {event.city || event.location}
                    </span>
                  </span>

                  {/* Type pill 87:14496 */}
                  <span className="hidden shrink-0 rounded-[4px] border-[0.667px] border-[rgba(198,72,23,0.4)] px-[9.6px] py-[3.2px] text-[9.28px] font-bold uppercase leading-[13.92px] tracking-[0.928px] text-primary-500 sm:inline-block lg:absolute lg:start-[68.33px] lg:top-[44.17px]">
                    {categoryLabel}
                  </span>

                  {/* Trailing glyph 87:14498 */}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-[19.2px] leading-[28.8px] text-primary-500 transition-transform group-hover:-translate-x-1 lg:absolute lg:start-[11.33px] lg:top-[41.4px]"
                  >
                    ←
                  </span>
                </Link>
              );
            })}
          </div>

          {/* CTA 87:14532 */}
          <div className="flex justify-end pt-8 lg:pt-[24.45px]">
            <Link
              href="/events"
              className="inline-flex h-[48px] items-center rounded-[16px] bg-primary-500 px-[26.4px] text-[14.4px] font-bold leading-[21.6px] text-primary-50 transition-colors hover:bg-brand-primary-hover active:bg-brand-primary-pressed focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              {t("eventsCta")}
            </Link>
          </div>
        </div>
      </div>

      {/* Photograph 87:14467 — 509 wide, hanging 4px off the inline end. */}
      <div className="relative mt-8 h-64 w-full overflow-hidden rounded-s-[16px] bg-brand-espresso sm:h-80 lg:absolute lg:end-[-4px] lg:top-0 lg:mt-0 lg:h-[678px] lg:w-[509px]">
        <Image
          src={featuredImage}
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 1023px) 100vw, 509px"
          quality={90}
          className="object-cover"
        />
      </div>
    </section>
  );
}
