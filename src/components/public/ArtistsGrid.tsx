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
 * ArtistsGrid Component
 * Mapped to Figma Frame 21 (Nodes 91:17844 / 91:18061 / 91:18062 Frame 19 & Frame 20):
 * - 3-column responsive grid on desktop (lg:grid-cols-3)
 * - 2-column on tablet (sm:grid-cols-2)
 * - 1-column on mobile (grid-cols-1)
 * - 24px/32px gutter (gap-6 lg:gap-8)
 * - Empty state feedback when artist list is empty
 */
export function ArtistsGrid({
  artists,
  category = "all",
  onResetFilter,
  className = "",
}: ArtistsGridProps) {
  if (artists.length === 0) {
    return (
      <ArtistsEmptyState
        category={category}
        onResetFilter={onResetFilter}
        className={className}
      />
    );
  }

  return (
    <div
      data-testid="artists-grid"
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 ${className}`}
    >
      {artists.map((artist, index) => (
        <ArtistCard
          key={artist.id || artist.slug}
          artist={artist}
          priority={index < 3} // Preload top row portraits
        />
      ))}
    </div>
  );
}
