import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Artist } from "@/lib/artists";

interface ArtistHeroProps {
  artist: Artist;
  /** Address the outline CTA opens. The frame draws a button with no target. */
  contactHref?: string;
}

/**
 * الفنان hero band — Figma frame 134:4420, nodes 134:4632 through 134:4643.
 *
 * The band is the artboard's first 611px: a photograph under a dark scrim
 * (134:4632), with four absolutely placed blocks over it. None of them is
 * centred on the artboard, so each carries the frame's own offset:
 *
 * - Heading 1 (134:4634) at (602,241), 236 wide. The quote sets that width and
 *   the name is right-aligned inside it, so the block is reproduced as a column
 *   that hugs its widest child and aligns both to the inline start. The name is
 *   Qahwa Arabic 48/44 in #ece6d0 (brand-surface), the quote Cairo 16.8/27.72 in
 *   primary-500 with a 24px pad under it.
 * - The standfirst (134:4638) at (495,332), 458 wide, Cairo 14.72/27.968 white
 *   and centred — 4px right of the artboard centre, which `me-[8px]` reproduces.
 * - The CTA pair (134:4639) at (549,449), 47.067 tall with a 16px gap. The
 *   terracotta booking link is drawn on the physical left and the outline button
 *   on the right, so in RTL the outline button comes first in the DOM. Neither
 *   has a corner radius. The pair sits 21.77px left of centre, which the start
 *   margin reproduces.
 *
 * The photograph (134:4631) is a licensed fill that cannot be exported from
 * here; the scrim is the CSS approximation shared with PageHero. Both are
 * recorded in docs/figma/asset-map.json.
 */
export function ArtistHero({ artist, contactHref = "mailto:hello@andalusia.art" }: ArtistHeroProps) {
  const t = useTranslations("artist");
  const quote = artist.quote?.trim();

  return (
    <section
      className="relative isolate h-[430px] w-full overflow-hidden bg-brand-espresso text-white sm:h-[500px] lg:h-[611px]"
      style={{
        backgroundImage: "url(/assets/figma/hero-stage-landscape.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,17,.52),rgba(43,29,20,.94))]"
      />

      <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-5 px-5 sm:bottom-16 lg:inset-0 lg:bottom-auto lg:block lg:gap-0 lg:px-0">
        {/* Heading 1 — 134:4634 */}
        <div className="flex w-full flex-col items-center lg:absolute lg:inset-x-0 lg:top-[241px]">
          <div className="flex flex-col items-center text-center lg:items-start lg:pb-[20px] lg:text-start">
            <h1 className="font-display text-[32px] leading-tight text-brand-surface sm:text-[40px] lg:whitespace-nowrap lg:text-[48px] lg:leading-[44px]">
              {artist.name}
            </h1>
            {quote ? (
              <p className="mt-3 max-w-[360px] text-[15px] leading-[26px] text-primary-500 lg:mt-0 lg:h-[52px] lg:pb-[24px] lg:text-[16.8px] lg:leading-[27.72px]">
                {`♪ "${quote}"`}
              </p>
            ) : null}
          </div>
        </div>

        {/* Standfirst — 134:4638 */}
        {artist.short_bio ? (
          <div className="flex w-full justify-center lg:absolute lg:inset-x-0 lg:top-[332px]">
            <p className="max-w-[458px] text-center text-[14px] leading-[24px] text-white lg:w-[458px] lg:me-[8px] lg:text-[14.72px] lg:leading-[27.968px]">
              {artist.short_bio}
            </p>
          </div>
        ) : null}

        {/* CTA pair — 134:4639. Outline first: it is the right-hand button in RTL. */}
        <div className="flex w-full justify-center lg:absolute lg:inset-x-0 lg:top-[449px]">
          <div className="flex flex-wrap justify-center gap-[16px] lg:flex-nowrap lg:ms-[43.54px]">
            <a
              href={contactHref}
              className="flex h-[47.067px] items-center border-[1.333px] border-[rgba(236,230,208,0.45)] px-[26.4px] text-[14.4px] font-bold leading-[21.6px] text-brand-surface"
            >
              {t("contactCta")}
            </a>
            <Link
              href={`/booking?artist=${artist.slug}`}
              className="flex h-[47.067px] items-center bg-primary-500 px-[28px] text-[14.4px] font-bold leading-[21.6px] text-brand-surface"
            >
              {t("bookCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ArtistHero;
