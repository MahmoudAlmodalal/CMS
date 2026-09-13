import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArtistTile } from "./ArtistTile";
import type { Artist } from "@/lib/types/artists";

interface FeaturedArtistsProps {
  artists: Artist[];
  heading?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function FeaturedArtists({ artists, heading, ctaLabel, ctaHref }: FeaturedArtistsProps) {
  const t = useTranslations("home");
  if (!artists?.length) return null;
  return (
    <section className="w-full bg-black py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
        <h2 className="text-center font-display text-[clamp(2rem,5vw,4rem)] font-normal leading-tight text-[#F9EDE8]">
          {heading || t("artistsHeading")}
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 xl:gap-5">
          {artists.slice(0, 6).map((artist, i) => (
            <ArtistTile key={artist.id} artist={artist} priority={i < 2} />
          ))}
        </div>
        <div className="mt-8 flex justify-center sm:mt-10">
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
