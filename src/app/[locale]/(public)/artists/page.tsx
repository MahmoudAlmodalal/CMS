import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPublishedArtists } from "@/lib/dal/artists";
import { getSiteSettings } from "@/lib/dal/site-settings";
import { ArtistsDirectoryClient, PageHero } from "@/components/public";

/**
 * الفنانين — Figma frame 91:17844.
 *
 * 1440x2290 on #F9F7F0: the hero band 0-611 with the headline in Qahwa Arabic
 * 64/91.5 and no pill, the filter bar 739-804, the grid 846-1734, the footer at
 * 1905. The design draws no heading over the directory.
 *
 * The page used to declare both revalidate=3600 and force-dynamic, which cancel
 * out — the second wins and the ISR window in APPLICATION_ARCHITECTURE.md never
 * applied. The artist list is the same for everyone and only the ?category= filter
 * varies, and that is read in the client, so the page keeps the documented ISR
 * window and puts the directory behind a Suspense boundary for useSearchParams
 * rather than turning the whole route dynamic.
 */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = locale === "ar" ? "/artists" : "/en/artists";
  return {
    title: t("artistsTitle"),
    description: t("artistsDescription"),
    alternates: { canonical: path },
    openGraph: {
      title: t("artistsTitle"),
      description: t("artistsDescription"),
      url: path,
      type: "website",
      locale: locale === "ar" ? "ar_AR" : "en_US",
    },
  };
}

export default async function ArtistsPage() {
  const [artists, settings, t] = await Promise.all([
    getPublishedArtists(),
    getSiteSettings(),
    getTranslations("artists"),
  ]);

  return (
    <div className="w-full bg-brand-cream">
      {/* Hero band 91:18055/91:18057 — 611 tall, the block 247 down, the headline
          at 64/91.5 with its first word in primary-500. No pill on this frame. */}
      <PageHero
        title={t.rich("title", {
          em: (chunks) => <span className="text-brand-primary">{chunks}</span>,
        })}
        subtitle={settings.artists_subtitle}
        height={611}
        contentTop={247}
        titleSize={64}
        titleLeading={91.5}
      />

      {/* The filter bar opens 128px under the band, and the grid's last row leaves
          171px before the footer at 1905. Both marks hang off their own edge of the
          artboard, so they are drawn only where there is a margin to hang them in. */}
      <section className="relative w-full overflow-hidden pb-[172px] pt-[127px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-[97px] hidden h-[112px] w-[62px] bg-[url('/assets/branding/dots-artists-start.png')] bg-contain bg-no-repeat lg:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-[1085px] hidden h-[112px] w-[63px] bg-[url('/assets/branding/dots-artists-end.png')] bg-contain bg-no-repeat lg:block"
        />

        <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-0">
          <Suspense fallback={<div className="min-h-[888px]" />}>
            <ArtistsDirectoryClient initialArtists={artists} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
