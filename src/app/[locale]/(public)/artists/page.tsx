import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
    getTranslations("page"),
  ]);

  return (
    <div>
      <PageHero
        eyebrow={t("artistsEyebrow")}
        title={t("artistsTitle")}
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
