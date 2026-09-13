import React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Release } from "@/lib/releases";

interface ArtistDiscographyProps {
  releases: Release[];
}

/** The frame draws Arabic-Indic digits; "ar" alone resolves to Latin ones. */
function digits(locale: string) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-GB", { useGrouping: false });
}

/**
 * مسيرتها الفنية — Figma section 134:4682 (nodes 134:4683 to 134:4744).
 *
 * A full-bleed gradscale-900 band, 96px of air either side. The H2 is centred in
 * Qahwa Arabic 48/40 brand-tint inside a 52px box padded 12px at the top. 1200px
 * container, padded 32px, so its content runs 152..1288.
 *
 * The filter row (134:4687) hugs the inline start — the physical right — as three
 * 8px-apart pills: the active one 36px tall in primary-500 with Cairo Bold 14/20
 * white, the idle ones 37.667px tall on 8% white behind a 0.833px 15% white
 * hairline with Cairo Medium 14/20 at 70% brand-tint. Drawn right to left the
 * order is ألبومات, حفلات, أغاني, which is the DOM order in Arabic.
 *
 * DEVIATION: the row is drawn in one state only — ألبومات active over every
 * release, live one included — and the schema has no per-artist reader for songs
 * or concerts, so the pills render as the category indicator the frame draws
 * rather than as filters whose behaviour the design never specifies.
 *
 * 40px under it, a 1136.016px grid of four 269.004px cards 20px apart. Each card
 * is a 268.997px 14px-rounded plate on #2a1d13 carrying the cover and, 12px down
 * from its inline-start corner, a primary-500 pill in Cairo Bold 8/12 tracked
 * 0.8. Under the plate the title sits in a 36px box padded 16px at the top in
 * Cairo Bold 16/20 #f0ebe1, then a 21px row holding the year in DM Mono 11/16.5
 * primary-500 at the inline start and the track count in Cairo 10/15 at 40%
 * brand-tint at the end.
 *
 * DEVIATION: the frame's possessive — مسيرتها, "her career" — is the one drawn
 * for سارة الصوت. Inflecting it would need a gender column the schema does not
 * have, so the drawn string stands.
 */
const CAREER_FILTERS = [
  { id: "albums", active: true },
  { id: "concerts", active: false },
  { id: "songs", active: false },
] as const;

export function ArtistDiscography({ releases }: ArtistDiscographyProps) {
  const t = useTranslations("artist");
  const locale = useLocale();
  const number = digits(locale);

  if (releases.length === 0) return null;

  // The 390 frame's `Section` (141:16468) runs on the same 96 of padding as the 1440
  // one: 96 + 52 heading + 24 + 37.67 tabs + 40 + 325.49 albums + 96 is the 671.16 it
  // declares. Its content sits 31 in from the inline start, not the 20 the page
  // gutter would give — the tab row lands at 99.67..359 and the album row at 30..359.
  return (
    <section className="w-full bg-gradscale-900 py-24 lg:py-[96px]">
      <h2 className="pt-[12px] text-center font-display text-[32px] leading-[40px] text-brand-tint lg:h-[52px] lg:text-[48px]">
        {t("careerTitle")}
      </h2>

      <div className="mx-auto w-full max-w-[1200px] px-[31px] lg:px-[32px]">
        {/* Filter row — 134:4687 */}
        <ul
          aria-label={t("careerFilters")}
          // 259.33 wide on the 390 frame, which is exactly 74.67 + 79.67 + 89 and
          // two 8px gaps — it fits without wrapping, so it must not wrap.
          className="flex items-start gap-[8px] pt-6 lg:h-[37.667px] lg:pt-0"
        >
          {CAREER_FILTERS.map((filter) =>
            filter.active ? (
              <li
                key={filter.id}
                aria-current="true"
                className="rounded-full bg-primary-500 px-[20px] py-[8px] text-[14px] font-bold leading-[20px] text-white"
              >
                {t(`careerFilter.${filter.id}`)}
              </li>
            ) : (
              <li
                key={filter.id}
                className="rounded-full border-[0.833px] border-white/15 bg-white/[0.08] px-[20px] py-[8px] text-[14px] font-medium leading-[20px] text-brand-tint/70"
              >
                {t(`careerFilter.${filter.id}`)}
              </li>
            )
          )}
        </ul>

        {/* Grid — 134:4696. On the 390 frame the four releases are one horizontal
            RTL row instead: 269 wide on a 289 step, so 20 between them, the first
            flush to the row's inline start at 359 and the rest scrolled off to the
            left. Same idiom as the artists carousel and both filter bars. */}
        <div className="flex gap-[20px] overflow-x-auto overscroll-x-contain pt-10 [scrollbar-width:none] lg:grid lg:grid-cols-4 lg:overflow-visible lg:pt-[40px] [&::-webkit-scrollbar]:hidden">
          {releases.map((release) => (
            <article
              key={release.id}
              data-testid={`release-${release.id}`}
              className="flex w-[269px] shrink-0 flex-col lg:w-auto"
            >
              <div className="relative w-full overflow-hidden rounded-[14px] bg-[#2a1d13] lg:h-[268.997px]">
                <div className="relative aspect-square w-full lg:h-full">
                  <Image
                    src={release.cover_image_url}
                    alt={t("coverAlt", { title: release.title })}
                    fill
                    sizes="(max-width: 1023px) 100vw, 269px"
                    quality={90}
                    className="object-cover"
                  />
                </div>
                <span className="absolute start-[2.526px] top-[11.992px] rounded-full bg-primary-500 px-[10px] py-[4px] text-[8px] font-bold uppercase leading-[12px] tracking-[0.8px] text-white">
                  {t(release.release_type === "live" ? "releaseLive" : "releaseStudio")}
                </span>
              </div>

              <p className="pt-[16px] text-start text-[16px] font-bold leading-[20px] text-[#f0ebe1] lg:h-[36px]">
                {release.title}
              </p>

              <div className="flex h-[21px] items-start justify-between">
                <span className="mt-[4px] font-mono text-[11px] leading-[16.5px] text-primary-500">
                  {number.format(release.release_year)}
                </span>
                <span className="mt-[5px] text-[10px] leading-[15px] text-brand-tint/40">
                  {t("trackCount", {
                    count: release.track_count,
                    value: number.format(release.track_count),
                  })}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ArtistDiscography;
