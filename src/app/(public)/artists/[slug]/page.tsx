import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/LayoutPrimitives";
import { getArtistBySlug, getPublishedArtists } from "@/lib/dal/artists";
import { PageHero } from "@/components/public";

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
    <div>
      <PageHero
        eyebrow="الملف الشخصي للفنان"
        title={artist.name}
        subtitle={[artist.genre_tag, artist.city].filter(Boolean).join(" · ")}
      />
      <Container className="py-12 sm:py-16 lg:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(300px,440px)_1fr] lg:gap-16">
          <div className="overflow-hidden rounded-[28px] bg-brand-surface shadow-card">
            <Image
              src={artist.portrait_image_url || "/assets/artists/artist-1.png"}
              alt={artist.name}
              width={700}
              height={820}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <article className="space-y-8 text-start">
            <div>
              <span className="text-xs font-bold tracking-wider text-brand-primary">عن الفنان</span>
              <h2 className="mt-3 font-display text-4xl font-normal text-brand-espresso sm:text-5xl">{artist.name}</h2>
              <p className="mt-3 text-sm text-brand-espresso/65">{[artist.genre_tag, artist.city].filter(Boolean).join(" · ")}</p>
            </div>
            <p className="max-w-2xl text-lg leading-9 text-brand-espresso/80">{artist.full_bio || artist.short_bio}</p>
            <div className="rounded-[24px] bg-brand-espresso p-7 text-[#F9F7F0]">
              <p className="text-xl leading-9">“{artist.quote}”</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {artist.specialties.split("•").map((item) => (
                <span key={item} className="rounded-full border border-brand-primary/30 bg-brand-tint px-4 py-2 text-sm font-bold text-brand-primary">{item.trim()}</span>
              ))}
            </div>
          </article>
        </div>
      </Container>
    </div>
  );
}
