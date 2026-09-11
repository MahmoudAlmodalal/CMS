"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { type Artist, getCategoryLabel } from "@/lib/types/artists";
import { resolveMediaUrl } from "@/lib/storage";
import { ArrowEndIcon, MusicIcon } from "@/components/ui/Icons";

export interface ArtistCardProps {
  artist: Artist;
  priority?: boolean;
  className?: string;
}

/**
 * ArtistCard Component
 * Mapped to Figma Component 16 / Frame 19/20 (Nodes 91:18068-143, 91:18070, 91:18072):
 * - 4:5 portrait photo with missing-image fallback
 * - Musician name, genre tag, city, and quote
 * - Category badge and interactive hover states
 * - Canonical link to /artists/[slug] and quick booking CTA
 */
export function ArtistCard({
  artist,
  priority = false,
  className = "",
}: ArtistCardProps) {
  const t = useTranslations("artists");
  const a = useTranslations("artist");
  const [imageError, setImageError] = useState(false);

  const rawImageUrl = artist.portrait_image_url?.trim() || "";
  const resolvedImageUrl = resolveMediaUrl("artists", rawImageUrl);
  const showFallbackImage = !resolvedImageUrl || imageError;

  return (
    <article
      data-testid={`artist-card-${artist.slug}`}
      className={`group relative flex flex-col bg-white rounded-card overflow-hidden border border-brand-espresso-subtle hover:border-brand-primary/50 shadow-card hover:shadow-card-hover transition-all duration-300 text-start ${className}`}
    >
      {/* 1. Portrait Visual (4:5 Aspect Ratio) */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-surface/40 select-none">
        {showFallbackImage ? (
          <div
            data-testid="artist-card-fallback-image"
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-brand-surface/60 to-brand-cream"
          >
            <div className="w-20 h-20 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mb-3">
              <span className="font-sans text-3xl font-bold">
                {artist.name.charAt(0)}
              </span>
            </div>
            <p className="font-sans text-lg font-bold text-brand-espresso">
              {artist.name}
            </p>
            <span className="text-xs text-brand-primary font-medium mt-1 flex items-center gap-1">
              <MusicIcon size={14} />
              {artist.genre_tag}
            </span>
          </div>
        ) : (
          <Image
            src={resolvedImageUrl}
            alt={`صورة الفنان ${artist.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            onError={() => setImageError(true)}
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        )}

        {/* Gradient Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/70 via-transparent to-black/20 pointer-events-none" />

        {/* Category Pill Overlay */}
        <div className="absolute top-3.5 start-3.5 z-10">
          <span className="px-3 py-1 rounded-badge text-xs font-bold tracking-wide bg-brand-espresso/80 backdrop-blur-xs text-brand-tint border border-white/10 shadow-subtle">
            {getCategoryLabel(artist.category)}
          </span>
        </div>

        {/* Featured Kicker if applicable */}
        {artist.is_featured && (
          <div className="absolute top-3.5 end-3.5 z-10">
            <span className="px-2.5 py-1 rounded-badge text-xs font-bold bg-brand-primary text-white shadow-subtle flex items-center gap-1">
              <span aria-hidden="true">★</span>
              <span>مميز</span>
            </span>
          </div>
        )}

        {/* Bottom In-Image Badge: City & Genre */}
        <div className="absolute bottom-3 start-3.5 end-3.5 z-10 text-white flex items-center justify-between pointer-events-none text-xs">
          <span className="font-medium bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
            📍 {artist.city}
          </span>
          <span className="font-medium bg-brand-primary/90 px-2 py-0.5 rounded-md">
            {artist.genre_tag}
          </span>
        </div>
      </div>

      {/* 2. Card Metadata & Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4 text-start">
        <div className="space-y-2">
          {/* Musician Name */}
          <h2 className="font-sans font-bold text-xl text-brand-espresso group-hover:text-brand-primary transition-colors line-clamp-1">
            {artist.name}
          </h2>

          {/* Artist Quote or Short Bio */}
          {(artist.quote || artist.short_bio) && (
            <p className="text-xs text-gradscale-400 italic line-clamp-2 leading-relaxed">
              &ldquo;{artist.quote || artist.short_bio}&rdquo;
            </p>
          )}

          {/* Specialties if present */}
          {artist.specialties && (
            <p className="text-xs text-brand-espresso/70 line-clamp-1 font-medium pt-1">
              <span className="text-brand-primary font-bold">التخصص: </span>
              {artist.specialties}
            </p>
          )}
        </div>

        {/* 3. Card Footer with Profile & Booking Links */}
        <div className="pt-3 border-t border-brand-espresso-subtle/50 flex items-center justify-between gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 font-bold text-brand-primary group-hover:text-brand-primary-pressed transition-colors">
            <span>الملف الشخصي</span>
            <ArrowEndIcon size={16} />
          </span>

          <Link
            href={`/booking?artist=${encodeURIComponent(artist.slug)}`}
            onClick={(e) => e.stopPropagation()}
            className="z-10 relative px-3 py-1.5 rounded-lg bg-brand-surface/80 hover:bg-brand-primary hover:text-white text-brand-espresso font-bold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label={`احجز الفنان ${artist.name}`}
          >
            احجز الفنان ♪
          </Link>
        </div>
      </div>

      {/* 4. Full Card Hit Area for canonical /artists/[slug] navigation */}
      <Link
        href={`/artists/${artist.slug}`}
        className="absolute inset-0 z-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-card"
        aria-label={a("viewProfile", { name: artist.name })}
      />
    </article>
  );
}
