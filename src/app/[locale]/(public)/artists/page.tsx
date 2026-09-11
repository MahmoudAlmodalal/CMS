import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/LayoutPrimitives";
import { getPublishedArtists } from "@/lib/dal/artists";
import { getSiteSettings } from "@/lib/dal/site-settings";
import {
  ArtistsHeader,
  ArtistsDirectoryClient,
  PageHero,
} from "@/components/public";

/**
 * Task 33 — Artists Directory (/artists)
 * ISR revalidation every 1 hour (3600s) as specified in APPLICATION_ARCHITECTURE.md §4.1
 */
export const revalidate = 3600;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الفنانين | فرقة أندلسيا",
  description:
    "دليل فناني فرقة أندلسيا للموسيقى العربية والتراث الأندلسي والمقامات الشرقية. تعرف على نخبة العازفين والمغنين واحجز عروضهم الموسيقية.",
  alternates: {
    canonical: "/artists",
  },
  openGraph: {
    title: "الفنانين | فرقة أندلسيا",
    description:
      "دليل فناني فرقة أندلسيا للموسيقى العربية والتراث الأندلسي والمقامات الشرقية.",
    url: "/artists",
    type: "website",
  },
};

export default async function ArtistsPage() {
  const [artists, settings] = await Promise.all([
    getPublishedArtists(),
    getSiteSettings(),
  ]);

  return (
    <div>
      <PageHero
        eyebrow="دليل الفنانين ♪"
        title="أصوات تصنع التاريخ"
        subtitle={settings.artists_subtitle}
      />
      <Container>
        <div className="space-y-10 py-10 lg:space-y-12 lg:py-16">
          {/* Header section matching Figma Frame 10 (91:17844 / 91:18060) */}
          <div className="sr-only"><ArtistsHeader subtitle={settings.artists_subtitle} socialLinks={settings.social_links} /></div>

          {/* Interactive filter & grid; dynamic rendering avoids a static fallback replacing the cards. */}
          <ArtistsDirectoryClient initialArtists={artists} />
        </div>
      </Container>
    </div>
  );
}
