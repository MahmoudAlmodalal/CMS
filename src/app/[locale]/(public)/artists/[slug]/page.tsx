import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  ArtistHero,
  ArtistProfileCard,
  ArtistGallery,
  ArtistWorks,
  ArtistDiscography,
  BookingBanner,
  ScrollReveal,
} from "@/components/public";
import { getArtistBySlug, getPublishedArtistSlugs } from "@/lib/dal/artists";
import { getPublishedReleasesByArtist } from "@/lib/dal/releases";
import { getPublishedWorksByArtist } from "@/lib/dal/artist-works";
import { getSiteSettings } from "@/lib/dal/site-settings";

/**
 * الفنان — Figma frame 134:4420.
 *
 * 1440x2968 on brand-cream, five bands drawn at absolute coordinates:
 * the hero 0-611, the profile row 623-879.83, the gallery 911-1361.98, the dark
 * career band 1442-2089.16 and the booking banner 2085-2583, with the footer
 * under it. The banner is drawn over the last 4.16px of the career band, so it
 * is pulled up by that much rather than stacked after it.
 *
 * The dotted mark 134:4421 hangs off the inline start at y=708 — the same
 * coordinates the الفنانين index draws it at, so it reuses that crop. Its pair
 * 134:4526 falls at y=1696, inside the gradscale-900 band, where the reference
 * render shows a flat #1b1b1b: invisible, so it is not drawn.
 *
 * ISR: revalidate = 3600, matching the الفنانين index.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  // Published-only slugs: drafts never pre-render (Task 40 draft exclusion).
  return getPublishedArtistSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const artist = await getArtistBySlug(slug);
  if (!artist) return { title: t("artistNotFound") };
  const canonicalUrl = locale === "ar" ? `/artists/${artist.slug}` : `/en/artists/${artist.slug}`;
  return {
    title: t("artistTitle", { name: artist.name }),
    description: artist.short_bio || t("artistDescription", { name: artist.name }),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: t("artistTitle", { name: artist.name }),
      description: artist.short_bio || undefined,
      type: "profile",
      locale: locale === "ar" ? "ar_AR" : "en_US",
      url: canonicalUrl,
    },
  };
}

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const artist = await getArtistBySlug(slug);
  if (!artist) {
    notFound();
  }

  const [releases, works, t, settings] = await Promise.all([
    getPublishedReleasesByArtist(artist.id),
    getPublishedWorksByArtist(artist.id),
    getTranslations("artist"),
    getSiteSettings(),
  ]);

  return (
    <div className="relative flex w-full flex-col overflow-hidden bg-brand-cream">
      {/* Dotted mark 134:4421 — hangs off the artboard, 62px of it visible. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[708px] hidden h-[112px] w-[62px] bg-[url('/assets/branding/dots-artists-start.png')] bg-contain bg-no-repeat xl:block"
      />

      <ArtistHero
        artist={artist}
        imageUrl={settings.artist_hero_image_url || undefined}
        contactHref={settings.contact_email ? `mailto:${settings.contact_email}` : undefined}
      />

      {/* The 390 frame (141:16217) opens `Frame 44` at 733 — 55 under the hero's
          678 band — and closes it at 1133. */}
      <div className="mt-[55px] lg:mt-[12px]">
        <ArtistProfileCard artist={artist} />
      </div>

      {/* 84 from `Frame 44`'s close at 1133 to the band heading `141:16466` at 1217. */}
      <div className="mt-[84px] lg:mt-[31.17px]">
        <ScrollReveal>
          <ArtistGallery
            artistName={artist.name}
            quote={artist.spotlight_quote?.trim() || artist.quote}
          />
        </ScrollReveal>
      </div>

      {/* الأعمال — not a Figma band: the frame draws no works section because the
          schema had no works table. It takes the gallery's own rhythm so the
          page reads the same with or without it, and renders nothing when the
          artist has no published work. */}
      <div className="mt-[64px] empty:mt-0">
        <ArtistWorks works={works} />
      </div>

      {/* 66 from the quote column's close at 2050 to `Section` 141:16468 at 2116. */}
      <div className="mt-[66px] lg:mt-[80.02px]">
        <ScrollReveal>
          <ArtistDiscography releases={releases} />
        </ScrollReveal>
      </div>

      <div className="lg:-mt-[4.16px]">
        <BookingBanner
          variant="artist"
          settings={settings}
          headline={t("bookingHeadline", { name: artist.name })}
          body={t("bookingBody")}
          ctaHref={`/booking?artist=${artist.slug}`}
        />
      </div>
    </div>
  );
}
