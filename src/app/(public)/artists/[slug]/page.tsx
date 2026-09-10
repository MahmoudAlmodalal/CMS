import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/LayoutPrimitives";
import { getArtistBySlug, getPublishedArtists } from "@/lib/dal/artists";

export async function generateStaticParams() {
  // Published-only slugs: drafts never pre-render (Task 40 draft exclusion).
  const artists = await getPublishedArtists();
  return artists.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) return { title: "الفنان غير موجود | فرقة أندلسيا" };
  const canonicalUrl = `/artists/${artist.slug}`;
  return {
    title: `${artist.name} | فرقة أندلسيا`,
    description: artist.short_bio || `الصفحة الرسمية للفنان ${artist.name} في فرقة أندلسيا.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${artist.name} | فرقة أندلسيا`,
      description: artist.short_bio || undefined,
      type: "profile",
      locale: "ar_AR",
      url: canonicalUrl,
    },
  };
}

/**
 * Task 40 — Public Integration Review wiring for /artists/[slug].
 * Connects the route to the published-only Supabase query (draft artists
 * resolve to null → 404). Full profile sections (biography, tracks player,
 * discography, gallery, social links) belong to Task 34.
 */
export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  return (
    <Container className="py-12 sm:py-16">
      <div className="space-y-4 text-start">
        <span className="text-xs font-bold text-brand-primary">الملف الشخصي للفنان</span>
        {/* Artist name — Figma الفنان screen: display face (Qahwa) Heading 1 */}
        <h1 className="font-display text-4xl sm:text-5xl font-normal text-brand-espresso leading-[1.25]">
          {artist.name}
        </h1>
        {[artist.genre_tag, artist.city].filter(Boolean).join(" · ") ? (
          <p className="text-sm text-brand-espresso/70">
            {[artist.genre_tag, artist.city].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        {artist.short_bio ? (
          <p className="max-w-2xl leading-8 text-brand-espresso/80">{artist.short_bio}</p>
        ) : null}
      </div>
    </Container>
  );
}
