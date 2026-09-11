import React from "react";
import { type Artist } from "@/lib/types/artists";
import { ArtistCard } from "./ArtistCard";
import { ArtistsEmptyState } from "./ArtistsEmptyState";

export interface ArtistsGridProps {
  artists: Artist[];
  category?: string;
  onResetFilter?: () => void;
  className?: string;
}

/**
 * Artists grid — Figma node 91:18061 in frame 91:17844.
 *
 * Four 296-wide columns 10px apart over 1214, its inline start 114px in from the
 * edge of the 1440 artboard, with 44px between rows. The design expresses that as a
 * 1254-wide container with 10px of padding holding two rows that are themselves
 * 10px padded and 24px apart; the measured result is the same.
 */
export function ArtistsGrid({
  artists,
  category = "all",
  onResetFilter,
  className = "",
}: ArtistsGridProps) {
  if (artists.length === 0) {
    return (
      <ArtistsEmptyState category={category} onResetFilter={onResetFilter} className={className} />
    );
  }

  return (
    <div
      data-testid="artists-grid"
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:ms-[113px] lg:w-[1214px] lg:grid-cols-4 lg:gap-x-[10px] lg:gap-y-[44px] ${className}`}
    >
      {artists.map((artist, index) => (
        <ArtistCard key={artist.id || artist.slug} artist={artist} priority={index < 4} />
      ))}
    </div>
  );
}
