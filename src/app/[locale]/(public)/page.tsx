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

export const revalidate = 3600; // 1 hour ISR as locked in APPLICATION_ARCHITECTURE.md

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
  title: t("homeTitle"),
  description: t("homeDescription"),
  openGraph: {
    title: t("homeOgTitle"),
    description: t("homeOgDescription"),
    locale: locale === "ar" ? "ar_AR" : "en_US",
    type: "website",
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

  const [settings, artists, testimonials, articles, events] = await Promise.all([
    getSiteSettings(),
    getFeaturedArtists(6),
    getPublishedTestimonials(),
    getFeaturedArticles(4),
    getUpcomingEvents(3),
  ]);

  return (
    <>
      {/* Stage 1: Hero Banner (Figma Component 20, 740px) */}
      <HeroSection settings={settings} />

      {/* Stage 2: About / Manifesto Section (Figma Component 9, 879px, #F9F7F0) */}
      <div className="lg:-mt-[22px]">
        <AboutSection settings={settings} />
      </div>

      {/* Stage 3: Featured Artists Rail (Figma Frame 14, 615px, #000000, 220x293 tiles) */}
      <div className="lg:mt-[22px]">
        <FeaturedArtists artists={artists} />
      </div>

      {/* Stage 4: Testimonials Carousel (Figma Section 87:14313, 597px, #F9F7F0) */}
      <div className="mb-[30px] lg:mb-0 lg:-mt-[16px]">
        <TestimonialsSlider testimonials={testimonials} />
      </div>

      {/* Stage 5: Editorial Feature (Figma Frame 26, 709px, #1F0900, 4 cards) */}
      <EditorialFeature articles={articles} />

      {/* Stage 6: Upcoming Events Strip (Figma Frame 28, 678px, split banner) */}
      <div className="lg:mt-[26px]">
        <HomeEvents events={events} />
      </div>

      {/* Stage 7: Booking CTA Banner (Figma Section 87:14534, 498px, #2B1D14 overlay) */}
      <div className="flex min-h-[427.992px] flex-col lg:mt-[54px] lg:block lg:min-h-0">
        <BookingBanner settings={settings} />
      </div>
    </>
  );
}
