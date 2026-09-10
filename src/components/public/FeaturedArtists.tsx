import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/LayoutPrimitives";
import { ArrowEndIcon } from "@/components/ui/Icons";
import { ArtistCard } from "./ArtistCard";
import type { Artist } from "@/lib/types/artists";

interface FeaturedArtistsProps {
  artists: Artist[];
}

/**
 * Verified against Figma Frame 14 (Nodes 87:14240, 87:14299, 186:1051):
 * - Height: 615px desktop (min-h-[615px] lg:h-[615px])
 * - Section Title: display face (Qahwa Regular) 64px "أصوات تصنع التاريخ" font-calligraphic
 * - Frame carries no pill badge and no subtitle — header is H2 + action link only
 * - Action Link: "عرض جميع الفنانين ←" SF Pro Bold 16px -> /artists
 * - 4-Column Responsive Grid: 1 col mobile, 2 col tablet, 4 col desktop
 * - 4:5 aspect ratio, 24px corner radius on cards
 */
export function FeaturedArtists({ artists }: FeaturedArtistsProps) {
  if (!artists || artists.length === 0) {
    return null;
  }

  return (
    <section className="py-12 lg:py-0 min-h-[615px] lg:h-[615px] bg-[#F2EEE0] border-t border-brand-espresso/5 flex items-center">
      <Container>
        {/* Section Header (Figma Frame 14 — H2 64px + link, no badge/subtitle) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-12">
          <h2 className="font-calligraphic text-3xl sm:text-5xl lg:text-[64px] font-normal text-brand-espresso leading-[1.25] text-start">
            أصوات تصنع التاريخ
          </h2>

          {/* View All Link */}
          <Link
            href="/artists"
            className="inline-flex items-center gap-2 text-base font-bold text-brand-primary hover:text-brand-primary-hover active:text-brand-primary-pressed transition-colors group shrink-0"
          >
            <span>عرض جميع الفنانين</span>
            <span className="transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1">
              <ArrowEndIcon size={18} />
            </span>
          </Link>
        </div>

        {/* 4-Item Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {artists.slice(0, 4).map((artist) => (
            <ArtistCard key={artist.id} artist={artist} className="rounded-[24px]" />
          ))}
        </div>
      </Container>
    </section>
  );
}
