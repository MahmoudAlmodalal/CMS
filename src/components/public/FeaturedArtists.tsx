"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArtistTile } from "./ArtistTile";
import type { Artist } from "@/lib/types/artists";
import { ScrollReveal } from "./ScrollReveal";
import { TextReveal } from "./motion/TextReveal";
import { Marquee } from "./motion/Marquee";
import { StrokeUnderline } from "./motion/StrokeUnderline";

interface FeaturedArtistsProps {
  artists: Artist[];
  heading?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function FeaturedArtists({ artists, heading, ctaLabel, ctaHref }: FeaturedArtistsProps) {
  const t = useTranslations("home");
  const featuredArtists = artists.slice(0, 6);

  if (!artists || artists.length === 0) return null;
  return (
    <section className="relative w-full min-h-[615px] overflow-x-hidden bg-black py-12 md:py-16 lg:py-24">
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
          <Marquee durationSeconds={28} pauseOnHover>
            {featuredArtists.map((artist, i) => (
              <div key={artist.id} className="px-2.5">
                <ArtistTile artist={artist} priority={i < 2} />
              </div>
            ))}
          </Marquee>
        </div>

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
