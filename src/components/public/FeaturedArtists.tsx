import React from "react";
import { Container } from "@/components/ui/LayoutPrimitives";
import { ArtistTile } from "./ArtistTile";
import { PublicButton } from "./PublicButton";
import type { Artist } from "@/lib/types/artists";

interface FeaturedArtistsProps {
  artists: Artist[];
}

/**
 * Verified against Figma Frame 14 (Node 87:14240, 1440x615):
 * - Surface: solid #000000 (NOT a light parchment)
 * - Heading (87:14299): Qahwa Arabic 64px, #F9EDE8, CENTERED above the rail
 * - Rail (87:14241): row of 6 tiles, 20px gap, 220px each — overflows the 1200px
 *   container in Figma, so it reads as a horizontally scrollable rail
 * - CTA (115:2179): OUTLINE 207x48 button centered below the rail
 */
export function FeaturedArtists({ artists }: FeaturedArtistsProps) {
  if (!artists || artists.length === 0) {
    return null;
  }

  return (
    <section className="py-12 lg:py-0 min-h-[615px] lg:h-[615px] bg-black flex flex-col justify-center overflow-hidden">
      <Container>
        {/* Section Heading (Figma Node 87:14299 — Qahwa 64px, centered) */}
        <h2 className="font-calligraphic text-3xl sm:text-5xl lg:text-[64px] font-normal text-[#F9EDE8] leading-[1.25] text-center pb-10">
          أصوات تصنع التاريخ
        </h2>
      </Container>

      {/* Artist Rail (Figma Node 87:14241 — 220px tiles, 20px gap) */}
      <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-5 w-max mx-auto px-6 sm:px-8 lg:px-12">
          {artists.slice(0, 6).map((artist, i) => (
            <ArtistTile key={artist.id} artist={artist} priority={i < 2} />
          ))}
        </div>
      </div>

      {/* View-all CTA (Figma Node 115:2179 — outline 207x48, centered) */}
      <div className="flex justify-center pt-10">
        <PublicButton href="/artists" variant="secondary" size="md">
          عرض جميع الفنانين ←
        </PublicButton>
      </div>
    </section>
  );
}
