import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { localeDirection, type AppLocale } from "@/i18n/routing";
import { ArtistTile } from "./ArtistTile";
import type { Artist } from "@/lib/types/artists";

interface FeaturedArtistsProps {
  artists: Artist[];
}

/**
 * أصوات تصنع التاريخ — Figma Frame 14 (node 87:14240), 1440x615 at y=1619 on solid
 * #000000. Three blocks placed against the artboard:
 *
 *   heading 87:14298   x 152..1288, y 52,  Qahwa Arabic 64/48 on #F9EDE8, centred
 *   rail    87:14241   x 120,       y 165, 1200 wide, clipping its own overflow
 *   CTA     115:2179   x 616,       y 509, 207x48 outlined in #F9EDE8, r12
 *
 * The rail holds six 220px tiles on a 240px pitch, so it is 1420 wide inside a
 * 1200px box: five sit at x 120, 360, 600, 840 and 1080, and the sixth is clipped
 * away entirely at the container's edge. It reads as a scrollable rail, and is one
 * here, so the sixth tile stays reachable.
 *
 * DEVIATION — the frame lays that rail out left to right, against the direction of
 * the rest of the page: the first tile is the leftmost and the overflow is clipped
 * off the right edge, where an RTL rail would start at the right and spill off the
 * left. Figma auto-layout has no RTL mode and the designer used a rotate-180 pair
 * to flip other bands of this frame but not this one, so it reads as an artefact
 * rather than a decision. The frame is what is being matched, so the scroller is
 * given its own ltr direction — an overflowing track in an RTL box hangs off the
 * left, which is the wrong edge — and the page's direction is put back on the
 * track so the tiles keep their own text alignment, with flex-row-reverse cancelling
 * it for placement only. Dropping both lets the rail run with the page instead.
 *
 * The frame repeats two placeholder artists across the six tiles, which is a
 * stand-in rather than copy to reproduce, so the rail draws the real roster.
 *
 * The CTA is the outlined variant of the shared button, but the design sets its
 * label in SF Pro Bold 16/22.4 — a baked-in fallback in the file itself — so the
 * system stack is what gets asked for, as on the الرئيسية booking CTA.
 */
export function FeaturedArtists({ artists }: FeaturedArtistsProps) {
  const t = useTranslations("home");
  const direction = localeDirection[useLocale() as AppLocale] ?? "rtl";

  if (!artists || artists.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden bg-black py-12 lg:h-[615px] lg:py-0">
      {/* Heading 87:14298 */}
      <div className="px-5 lg:absolute lg:left-[152px] lg:right-[152px] lg:top-[52px] lg:px-0">
        <h2 className="text-center font-display text-3xl leading-tight text-[#F9EDE8] sm:text-5xl lg:whitespace-nowrap lg:text-[64px] lg:leading-[48px]">
          {t("artistsHeading")}
        </h2>
      </div>

      {/* Rail 87:14241 */}
      <div
        dir="ltr"
        className="mt-10 w-full overflow-x-auto px-5 [scrollbar-width:none] lg:absolute lg:left-[120px] lg:top-[165px] lg:mt-0 lg:w-[1200px] lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        <div dir={direction} className="flex w-max flex-row-reverse gap-[20px]">
          {artists.slice(0, 6).map((artist, i) => (
            <ArtistTile key={artist.id} artist={artist} priority={i < 2} />
          ))}
        </div>
      </div>

      {/* CTA 115:2179 */}
      <div className="mt-10 flex justify-center lg:absolute lg:left-[616px] lg:top-[509px] lg:mt-0 lg:block">
        <Link
          href="/artists"
          className="inline-flex h-[48px] w-[207px] items-center justify-center rounded-[12px] border border-[#F9EDE8] font-system text-[16px] font-bold leading-[22.4px] text-[#F9EDE8] transition-colors hover:bg-[#F9EDE8]/10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {t("artistsCta")}
        </Link>
      </div>
    </section>
  );
}
