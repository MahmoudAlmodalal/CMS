"use client";

import React, { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArtistTile } from "./ArtistTile";
import type { Artist } from "@/lib/types/artists";
import { ChevronEndIcon, ChevronStartIcon } from "@/components/ui/Icons";
import { ScrollReveal } from "./ScrollReveal";
import { TextReveal } from "./motion/TextReveal";
import { Marquee } from "./motion/Marquee";
import { StrokeUnderline } from "./motion/StrokeUnderline";
import { useMotionPrefs } from "./motion/useMotionPrefs";

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
  const { reduced } = useMotionPrefs();

  /**
   * The rail is the primary display on every viewport: a seamless infinite
   * loop, so visitors reaching the band find the tiles already cycling.
   * The swipe carousel (arrows, dots, snap points) is the fallback for
   * reduced-motion visitors. Hover and touch never pause the loop.
   */
  const useRail = !reduced;

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
    <section className="relative w-full overflow-x-hidden bg-black py-12 md:py-16 lg:py-24">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
        <TextReveal
          as="h2"
          text={heading || t("artistsHeading")}
          className="text-center font-display text-3xl font-normal leading-relaxed text-[#F9EDE8] sm:text-4xl md:text-5xl lg:text-[64px] lg:leading-tight"
        />
        <ScrollReveal variant="soft" delay={0.12}>
          <StrokeUnderline className="mx-auto mt-2" />
        </ScrollReveal>
        <div className="relative mt-6 sm:mt-8">
          {useRail ? (
            <Marquee durationSeconds={28}>
              {featuredArtists.map((artist, i) => (
                <div key={artist.id} className="px-2.5">
                  <ArtistTile artist={artist} priority={i < 2} />
                </div>
              ))}
            </Marquee>
          ) : null}

          <div
            ref={carouselRef}
            onScroll={updateActiveIndex}
            className={`${useRail ? "hidden " : ""}no-scrollbar mx-auto flex w-full max-w-full snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth px-2 pb-4 sm:gap-4 md:gap-5 lg:grid lg:grid-cols-4 lg:justify-items-center lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0 xl:grid-cols-6`}
            aria-label={t("artistsHeading")}
          >
            {featuredArtists.map((artist, i) => (
              <div key={artist.id} data-artist-tile className="shrink-0 snap-center lg:shrink">
                <ArtistTile artist={artist} priority={i < 2} />
              </div>
            ))}
          </div>
          {!useRail ? (
            <>
              <div className="pointer-events-none absolute inset-y-0 start-0 w-6 bg-gradient-to-r from-black/80 to-transparent lg:hidden" />
              <div className="pointer-events-none absolute inset-y-0 end-0 w-8 bg-gradient-to-l from-black/80 to-transparent lg:hidden" />
            </>
          ) : null}
        </div>

        {/* Carousel controls — only with the reduced-motion fallback carousel */}
        {!useRail ? (
        <div className="mt-4 flex items-center justify-between px-4 lg:hidden" aria-label="Artist carousel controls">
          <button
            type="button"
            onClick={() => moveArtist(-1)}
            disabled={activeIndex === 0}
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-95 disabled:opacity-20"
            aria-label="Previous artist"
          >
            <ChevronStartIcon size={18} />
          </button>

          <div className="flex items-center justify-center gap-1.5" aria-label="Artist carousel pagination">
            {featuredArtists.map((artist, index) => (
              <button
                key={artist.id}
                type="button"
                onClick={() => scrollToArtist(index)}
                aria-label={`Go to artist ${index + 1}`}
                aria-current={activeIndex === index ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === index ? "w-5 bg-brand-primary" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => moveArtist(1)}
            disabled={activeIndex === featuredArtists.length - 1}
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-95 disabled:opacity-20"
            aria-label="Next artist"
          >
            <ChevronEndIcon size={18} />
          </button>
        </div>
        ) : null}

        <div className="mt-6 flex justify-center sm:mt-8">
          <Link
            href={ctaHref || "/artists"}
            className="inline-flex min-h-11 w-full max-w-[207px] items-center justify-center rounded-xl border border-[#F9EDE8] px-5 text-center font-system text-base font-bold text-[#F9EDE8] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F9EDE8]/10 hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {ctaLabel || t("artistsCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
