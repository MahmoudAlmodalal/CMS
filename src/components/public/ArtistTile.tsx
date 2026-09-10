import React from "react";
import Image from "next/image";
import Link from "next/link";
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
 * directory: 220x293.33 dark photo tile (#2A1D13, r=16) with a bottom-up scrim and
 * two lines of text. Figma carries no category pill, city badge, quote, specialties
 * or booking button here.
 */
export function ArtistTile({ artist, priority = false }: ArtistTileProps) {
  const resolved = resolveMediaUrl("artists", artist.portrait_image_url?.trim() || "");

  return (
    <Link
      href={`/artists/${artist.slug}`}
      data-testid={`artist-tile-${artist.slug}`}
      className="group relative block w-[220px] h-[293px] shrink-0 rounded-[16px] overflow-hidden bg-[#2A1D13] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      aria-label={`عرض الملف الشخصي للفنان ${artist.name}`}
    >
      {resolved ? (
        <Image
          src={resolved}
          alt={`صورة الفنان ${artist.name}`}
          fill
          sizes="220px"
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

      {/* Text block (Figma EL-64a077da — y=208.54, padding 20) */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="font-sans text-[16.8px] font-bold leading-[1.5] text-[#F0EBE1] line-clamp-1">
          {artist.name}
        </p>
        <p className="font-mono text-[10.4px] tracking-[0.1em] leading-[1.5] text-[#C8441B] pt-1 line-clamp-1">
          {artist.genre_tag}
        </p>
      </div>
    </Link>
  );
}
