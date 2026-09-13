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
 * Artists grid — Figma node 91:18061 in frame 91:17844, and node 141:15048 in the
 * 390 frame 140:14652.
 *
 * Desktop is four 296-wide columns 10px apart over 1214, its inline start 114px in
 * from the edge of the 1440 artboard, with 44px between rows. The design expresses
 * that as a 1254-wide container with 10px of padding holding two rows that are
 * themselves 10px padded and 24px apart; the measured result is the same.
 *
 * Mobile is NOT that grid at one column. `Frame 40` is 387x900 holding two rows of
 * 355x442 sixteen apart, and each row holds all four of its cards at x = -869, -563,
 * -257 and 49 — a 306 step, so 296 wide with 10 between. Only the last is inside the
 * row; the other three run off its inline end. That is a horizontal RTL carousel
 * parked at its start: in Arabic the inline start is the right edge, so the card at
 * 49 is the first one and the rest are scrolled off to the left. The rows are 10px
 * padded, which is what puts that first card at 64 and holds the 422 card inside 442.
 *
 * Two rows is the design's own split of the eight artists, so the rows are built by
 * halving the list rather than by wrapping — a wrap would put a variable number in
 * each row and the 442 row height is fixed.
 *
 * `lg:contents` flattens the rows away above lg so the cards become direct children
 * of the grid again; the carousel exists only where the design draws it.
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
      className={`grid w-full min-w-0 grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {artists.map((artist, index) => (
        <ArtistCard key={artist.id || artist.slug} artist={artist} priority={index < 4} />
      ))}
    </div>
  );
}
