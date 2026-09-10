import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/LayoutPrimitives";
import { getPublishedArtists } from "@/lib/dal/artists";
import { getSiteSettings } from "@/lib/dal/site-settings";
import {
  ArtistsHeader,
  ArtistsDirectoryClient,
} from "@/components/public";

/**
 * Task 33 — Artists Directory (/artists)
 * ISR revalidation every 1 hour (3600s) as specified in APPLICATION_ARCHITECTURE.md §4.1
 */
export const revalidate = 3600;

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
    <div className="py-10 sm:py-14 lg:py-20">
      <Container>
        <div className="space-y-10 lg:space-y-12">
          {/* Header section matching Figma Frame 10 (91:17844 / 91:18060) */}
          <ArtistsHeader
            subtitle={settings.artists_subtitle}
            socialLinks={settings.social_links}
          />

          {/* Interactive filter & grid wrapped in Suspense for useSearchParams */}
          <Suspense
            fallback={
              <div className="py-16 text-center text-gradscale-400">
                <span className="font-calligraphic text-xl text-brand-espresso">
                  جاري تحميل دليل الفنانين...
                </span>
              </div>
            }
          >
            <ArtistsDirectoryClient initialArtists={artists} />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}
