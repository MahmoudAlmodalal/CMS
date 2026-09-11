import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { type Artist } from "@/lib/types/artists";
import { resolveMediaUrl } from "@/lib/storage";

export interface ArtistCardProps {
  artist: Artist;
  priority?: boolean;
  className?: string;
}

/**
 * Artist card — Figma node 91:18063 in frame 91:17844.
 *
 * White, a 16px radius, 296x422 and clipped. The design expresses it as a 474-tall
 * stack — a 340 image box over a 134 body — centred in a 422 box that clips 26px
 * off each end, so what it actually draws is 314 of photograph and 108 of body with
 * the body's own bottom padding cut off. That visible result is what is built here.
 *
 * The body is 20px padded and reads from the inline start — the right-hand edge of
 * the Arabic frame: the genre in Cairo Medium 13/19.5 primary-500, the name in
 * Cairo Bold 16/24 #1B1B1B 4.8px down, then the city in Cairo 12.8/19.2 a further
 * 2.4px down.
 *
 * The design draws nothing else on the card — no scrim, no category pill, no
 * featured star, no quote, no specialties and no second link. All of those were
 * removed as unverified inventions; the whole card is the link to the profile.
 */
export function ArtistCard({ artist, priority = false, className = "" }: ArtistCardProps) {
  const a = useTranslations("artist");
  const portrait = resolveMediaUrl("artists", artist.portrait_image_url?.trim() || "");

  return (
    <article
      data-testid={`artist-card-${artist.slug}`}
      className={`group flex w-full flex-col overflow-hidden rounded-[16px] bg-white text-start lg:h-[422px] lg:w-[296px] ${className}`}
    >
      <Link
        href={`/artists/${artist.slug}`}
        aria-label={a("viewProfile", { name: artist.name })}
        className="flex flex-1 flex-col focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
      >
        <div className="relative aspect-[296/314] w-full shrink-0 overflow-hidden bg-brand-surface/40 lg:aspect-auto lg:h-[314px]">
          {portrait ? (
            <Image
              src={portrait}
              alt={a("portraitAlt", { name: artist.name })}
              fill
              sizes="(min-width: 1024px) 296px, (min-width: 640px) 50vw, 100vw"
              priority={priority}
              quality={90}
              className="object-cover"
            />
          ) : (
            /* Missing-asset fallback: the initial on the card's own surface, so an
               artist without a portrait never renders a broken image. */
            <div
              data-testid="artist-card-fallback-image"
              className="flex h-full w-full items-center justify-center bg-brand-surface/60 text-3xl font-bold text-brand-primary"
            >
              {artist.name.charAt(0)}
            </div>
          )}
        </div>

        <div className="h-[134px] shrink-0 p-5">
          <p className="text-[13px] font-medium leading-[19.5px] text-brand-primary">
            {artist.genre_tag}
          </p>

          <h2 className="pt-[4.8px] text-[16px] font-bold leading-[24px] text-gradscale-900 transition-colors group-hover:text-brand-primary">
            {artist.name}
          </h2>

          <p className="pt-[2.4px] text-[12.8px] leading-[19.2px] text-gradscale-900">
            {artist.city}
          </p>
        </div>
      </Link>
    </article>
  );
}
