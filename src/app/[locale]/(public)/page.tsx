import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  HeroSection,
  AboutSection,
  FeaturedArtists,
  TestimonialsSlider,
  EditorialFeature,
  HomeEvents,
  BookingBanner,
} from "@/components/public";
import { getSiteSettings } from "@/lib/dal/site-settings";
import { getFeaturedArtists } from "@/lib/dal/artists";
import { getPublishedTestimonials } from "@/lib/dal/testimonials";
import { getFeaturedArticles } from "@/lib/dal/articles";
import { getUpcomingEvents } from "@/lib/dal/events";
import { getFeaturedPublishedTrack } from "@/lib/dal/tracks";

export const revalidate = 3600; // 1 hour ISR as locked in APPLICATION_ARCHITECTURE.md

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const [settings, t] = await Promise.all([
    getSiteSettings(),
    getTranslations({ locale, namespace: "meta" }),
  ]);
  const title = settings.seo_home_title?.trim() || t("homeTitle");
  const description = settings.seo_home_description?.trim() || t("homeDescription");
  const ogTitle = settings.seo_home_title?.trim() || t("homeOgTitle");
  const ogDescription = settings.seo_home_description?.trim() || t("homeOgDescription");
  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      locale: locale === "ar" ? "ar_AR" : "en_US",
      type: "website",
      images: settings.seo_og_image_url ? [settings.seo_og_image_url] : undefined,
    },
  };
}

/**
 * Milestone 2 — Home Page 8-Stage Vertical Coordinate Sequence
 * Verified against canonical Figma screen "الرئيسية" (Node 89:15216, 1440x5165px desktop):
 *
 * Stage 1: Hero Section (Component 20, Node 148:3708, y=0, h=740px)
 * Stage 2: About / Manifesto (Component 9, Node 112:850, y=718, h=879px, surface #F9F7F0)
 * Stage 3: Featured Artists (Frame 14, Node 87:14240, y=1619, h=615px, surface #000000,
 *          rail of 6 x 220x293 dark tiles)
 * Stage 4: Testimonials (Section, Node 87:14313, y=2218, h=597px, surface #F9F7F0)
 * Stage 5: Editorial Feature (Frame 26, Node 87:14400, y=2815, h=709px, surface #1F0900,
 *          4 x 273x317 cards)
 * Stage 6: Upcoming Events (Frame 28, Node 87:14466, y=3550, h=678px, split banner)
 * Stage 7: Booking CTA Banner (Section, Node 87:14534, y=4282, h=498px, #2B1D14 overlay)
 * Stage 8: Global Footer (Node 94:18289, y=4780, h=385px, #2B1D14 texture) [Rendered in PublicLayout]
 *
 * The bands are drawn at absolute coordinates and do not simply stack: the hero
 * and المنهج overlap by 22px, أصوات starts 22px after المنهج ends, يقولون
 * overlaps by 16px, نكتب is flush, نلتقي starts 26px later, and the booking band
 * 54px after that. Stacking them flush walks the page 160px out of alignment by
 * the footer, so each carries the frame's own offset at lg.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const settings = await getSiteSettings();

  const [artists, testimonials, articles, events, featuredTrack] = await Promise.all([
    settings.show_featured_artists !== false
      ? getFeaturedArtists(settings.home_featured_artists_count)
      : Promise.resolve([]),
    settings.show_testimonials !== false ? getPublishedTestimonials() : Promise.resolve([]),
    settings.show_editorial !== false
      ? getFeaturedArticles(settings.home_featured_articles_count)
      : Promise.resolve([]),
    settings.show_events !== false
      ? getUpcomingEvents(settings.home_upcoming_events_count)
      : Promise.resolve([]),
    getFeaturedPublishedTrack(),
  ]);

  return (
    <>
      {/* Stage 1: Hero Banner (Figma Component 20, 740px) */}
      {settings.show_hero && (
        <HeroSection
          settings={settings}
          primaryCtaLabel={settings.home_hero_primary_cta || undefined}
          secondaryCtaLabel={settings.home_hero_secondary_cta || undefined}
        />
      )}

      {/* Stage 2: About / Manifesto Section (Figma Component 9, 879px, #F9F7F0) */}
      {settings.show_about && (
        <div className="lg:-mt-[22px]">
          <AboutSection settings={settings} ctaLabel={settings.home_about_cta || undefined} featuredTrack={featuredTrack} />
        </div>
      )}

      {/* Stage 3: Featured Artists Rail (Figma Frame 14, 615px, #000000, 220x293 tiles) */}
      {settings.show_featured_artists && (
        <div className="lg:mt-[22px]">
          <FeaturedArtists
            artists={artists}
            heading={settings.home_artists_heading || undefined}
            ctaLabel={settings.home_artists_cta || undefined}
            ctaHref={settings.home_artists_href || undefined}
          />
        </div>
      )}

      {/* Stage 4: Testimonials Carousel (Figma Section 87:14313, 597px, #F9F7F0) */}
      {settings.show_testimonials !== false && (
        <div className="mb-[30px] lg:mb-0 lg:-mt-[16px]">
          <TestimonialsSlider testimonials={testimonials} heading={settings.home_testimonials_heading || undefined} />
        </div>
      )}

      {/* Stage 5: Editorial Feature (Figma Frame 26, 709px, #1F0900, 4 cards) */}
      {settings.show_editorial !== false && (
        <EditorialFeature articles={articles} heading={settings.home_editorial_heading || undefined} />
      )}

      {/* Stage 6: Upcoming Events Strip (Figma Frame 28, 678px, split banner) */}
      {settings.show_events !== false && (
        <div className="lg:mt-[26px]">
          <HomeEvents
            events={events}
            heading={settings.home_events_heading || undefined}
            ctaLabel={settings.home_events_cta || undefined}
            ctaHref={settings.home_events_href || undefined}
            imageUrl={settings.home_events_image_url || undefined}
          />
        </div>
      )}

      {/* Stage 7: Booking CTA Banner (Figma Section 87:14534, 498px, #2B1D14 overlay) */}
      {settings.show_booking_banner !== false && (
        <div className="flex min-h-[427.992px] flex-col lg:mt-[54px] lg:block lg:min-h-0">
          <BookingBanner settings={settings} ctaLabel={settings.booking_cta_label} />
        </div>
      )}
    </>
  );
}
