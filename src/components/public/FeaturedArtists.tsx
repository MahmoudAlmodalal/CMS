"use client";

import React, { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArtistTile } from "./ArtistTile";
import type { Artist } from "@/lib/types/artists";
import { ChevronEndIcon, ChevronStartIcon } from "@/components/ui/Icons";

interface FeaturedArtistsProps {
  artists: Artist[];
  heading?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function FeaturedArtists({ artists, heading, ctaLabel, ctaHref }: FeaturedArtistsProps) {
  const t = useTranslations("home");
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const featuredArtists = artists.slice(0, 6);

  const updateActiveIndex = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const tiles = Array.from(carousel.querySelectorAll<HTMLElement>("[data-artist-tile]"));
    if (tiles.length === 0) return;
    const carouselCenter = carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
    const nearest = tiles.reduce(
      (best, tile, index) => {
        const distance = Math.abs(tile.getBoundingClientRect().left + tile.offsetWidth / 2 - carouselCenter);
        return distance < best.distance ? { distance, index } : best;
      },
      { distance: Number.POSITIVE_INFINITY, index: 0 },
    );
    setActiveIndex(nearest.index);
  }, []);

  const scrollToArtist = useCallback((index: number) => {
    const carousel = carouselRef.current;
    const tile = carousel?.querySelectorAll<HTMLElement>("[data-artist-tile]")[index];
    tile?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setActiveIndex(index);
  }, []);

  const moveArtist = useCallback((direction: -1 | 1) => {
    const nextIndex = Math.max(0, Math.min(featuredArtists.length - 1, activeIndex + direction));
    scrollToArtist(nextIndex);
  }, [activeIndex, featuredArtists.length, scrollToArtist]);

  if (!artists || artists.length === 0) return null;
  return (
    <section className="w-full overflow-x-hidden bg-black py-12 sm:py-16 md:py-20 lg:min-h-[615px] lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
        <h2 className="text-center font-display text-4xl font-normal leading-tight text-[#F9EDE8] lg:text-[64px] lg:leading-tight">
          {heading || t("artistsHeading")}
        </h2>
        <div className="relative mt-4 sm:mt-7">
          <div
            ref={carouselRef}
            onScroll={updateActiveIndex}
            className="no-scrollbar mx-auto flex w-full max-w-full snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain scroll-smooth px-1 pb-2 sm:gap-3 md:gap-4 lg:grid lg:grid-cols-4 lg:justify-items-center lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0 xl:grid-cols-6"
            aria-label={t("artistsHeading")}
          >
            {featuredArtists.map((artist, i) => (
              <div key={artist.id} data-artist-tile className="shrink-0 snap-center lg:shrink">
                <ArtistTile artist={artist} priority={i < 2} />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 start-0 w-8 bg-gradient-to-r from-black via-black/50 to-transparent lg:hidden" />
          <div className="pointer-events-none absolute inset-y-0 end-0 w-12 bg-gradient-to-l from-black via-black/50 to-transparent lg:hidden" />
          <div className="absolute inset-x-1 top-1/2 flex -translate-y-1/2 justify-between lg:hidden">
            <button
              type="button"
              onClick={() => moveArtist(-1)}
              disabled={activeIndex === 0}
              className="pointer-events-auto flex size-9 items-center justify-center rounded-full bg-white/90 text-brand-espresso shadow-subtle transition-opacity disabled:opacity-30"
              aria-label="Previous artist"
            >
              <ChevronStartIcon size={18} />
            </button>
            <button
              type="button"
              onClick={() => moveArtist(1)}
              disabled={activeIndex === featuredArtists.length - 1}
              className="pointer-events-auto flex size-9 items-center justify-center rounded-full bg-white/90 text-brand-espresso shadow-subtle transition-opacity disabled:opacity-30"
              aria-label="Next artist"
            >
              <ChevronEndIcon size={18} />
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5 lg:hidden" aria-label="Artist carousel pagination">
          {featuredArtists.map((artist, index) => (
            <button
              key={artist.id}
              type="button"
              onClick={() => scrollToArtist(index)}
              aria-label={`Go to artist ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all ${activeIndex === index ? "w-5 bg-brand-primary" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
        <div className="mt-5 flex justify-center sm:mt-7">
          <Link
            href={ctaHref || "/artists"}
            className="inline-flex min-h-11 w-full max-w-[207px] items-center justify-center rounded-xl border border-[#F9EDE8] px-5 text-center font-system text-base font-bold text-[#F9EDE8] transition-colors hover:bg-[#F9EDE8]/10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {ctaLabel || t("artistsCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
