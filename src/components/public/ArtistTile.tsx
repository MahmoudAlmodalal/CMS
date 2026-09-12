import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Artist } from "@/lib/types/artists";
import { resolveMediaUrl } from "@/lib/storage";

export interface ArtistTileProps {
  artist: Artist;
  priority?: boolean;
}

/**
 * Home-page artist tile — Figma Nodes 87:14242…87:14286 (Frame 14 rail).
 *
 * Deliberately much barer than the shared <ArtistCard /> used by the /artists
 * directory: a 220x293 tile on #2A1D13 rounded 16 and clipping its own overflow,
 * carrying a 220x293.333 photograph, a scrim over it, and one text block. Figma
 * carries no category pill, city badge, quote, specialties or booking button here.
 *
 * The text block (87:14245) is placed against the tile at top 208.54 rather than
 * hung off its bottom, and pads 20 all round: the name in Cairo Bold 16.8/25.2 on
 * #F0EBE1, then a 20px-tall box padded 4 at the top holding the genre in DM Mono
 * 10.4/15.6 tracked 1.04 on #C8441B. That comes to 85.2 against the 86 the frame
 * gives it, and runs 1.5px past the tile, which the tile clips.
 *
 * The tile's fourth child (87:14250) is a 40px box whose only paint is 40px of
 * transparent left and top border — a corner spacer that draws nothing — so it is
 * not reproduced.
 */
export function ArtistTile({ artist, priority = false }: ArtistTileProps) {
  const t = useTranslations("artist");
  const tileImage = artist.rail_image_url?.trim() || artist.portrait_image_url?.trim() || "";
  const resolved = resolveMediaUrl("artists", tileImage);

  return (
    <Link
      href={`/artists/${artist.slug}`}
      data-testid={`artist-tile-${artist.slug}`}
      className="group relative block h-[239px] w-[160px] shrink-0 rounded-[16px] lg:h-[293px] lg:w-[220px] overflow-hidden bg-[#2A1D13] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      aria-label={t("viewProfile", { name: artist.name })}
    >
      {resolved ? (
        <Image
          src={resolved}
          alt={t("portraitAlt", { name: artist.name })}
          fill
          sizes="(max-width: 1023px) 160px, 220px"
          priority={priority}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div
          data-testid="artist-tile-fallback"
          className="absolute inset-0 flex items-center justify-center bg-[#2A1D13] text-[#F0EBE1]/40 font-sans text-5xl font-bold"
          aria-hidden="true"
        >
          {artist.name.charAt(0)}
        </div>
      )}

      {/* Scrim: linear-gradient(0deg, rgba(23,16,10,.92) 0%, transparent 55%) */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(23,16,10,0.92)_0%,rgba(23,16,10,0)_55%)] pointer-events-none" />

      {/* Text block 87:14245 — placed at 208.54, padded 20. */}
      <div className="absolute inset-x-0 top-[163px] flex flex-col items-start p-[20px] text-start lg:top-[208.54px]">
        {/* 87:14246 */}
        <p className="w-full truncate font-sans text-[16.8px] font-bold leading-[25.2px] text-[#F0EBE1]">
          {artist.name}
        </p>
        {/* 87:14248 */}
        <div className="h-[20px] w-[180px] max-w-full pt-[4px]">
          <p className="truncate font-mono text-[10.4px] leading-[15.6px] tracking-[1.04px] text-[#C8441B]">
            {artist.genre_tag}
          </p>
        </div>
      </div>
    </Link>
  );
}
