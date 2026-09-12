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

  const half = Math.ceil(artists.length / 2);
  const rows = [artists.slice(0, half), artists.slice(half)].filter((row) => row.length > 0);

  return (
    <div
      data-testid="artists-grid"
      className={`flex flex-col items-start gap-4 lg:grid lg:ms-[113px] lg:w-[1214px] lg:grid-cols-4 lg:gap-x-[10px] lg:gap-y-[44px] ${className}`}
    >
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          data-testid={`artists-row-${rowIndex}`}
          // The 355 is 5 wider than the page's own 350 content box: the row's inline
          // start sits on it and the overhang falls on the inline end, off toward the
          // cards that are already scrolled out. Scrollbar gutters are suppressed
          // because the 442 is the design's height and a classic bar would eat 15 of
          // it out of the card rather than out of the row.
          className="flex h-[442px] w-[355px] shrink-0 snap-x snap-mandatory gap-[10px] overflow-x-auto overscroll-x-contain p-[10px] [scrollbar-width:none] lg:contents [&::-webkit-scrollbar]:hidden"
        >
          {row.map((artist, index) => (
            <ArtistCard
              key={artist.id || artist.slug}
              artist={artist}
              priority={rowIndex === 0 && index < 4}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
