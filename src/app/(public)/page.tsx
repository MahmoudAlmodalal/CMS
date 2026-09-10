import React from "react";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "فرقة أندلسيا للموسيقى والتراث | منصتك الأولى لاكتشاف المواهب الثقافية",
  description:
    "أندلسيا منصة متخصصة في تمثيل ودعم المواهب الفنية التراثية وإحياء المقامات والموشحات الأندلسية عبر فعاليات ثقافية وأكاديمية متكاملة.",
  openGraph: {
    title: "فرقة أندلسيا للموسيقى والتراث",
    description:
      "منصتك الأولى لاكتشاف ودعم المواهب الفنية والتراثية وإحياء روائع الموشحات والمقامات.",
    locale: "ar_AR",
    type: "website",
  },
};

/**
 * Milestone 2 — Home Page 8-Stage Vertical Coordinate Sequence
 * Verified against canonical Figma screen "الرئيسية" (Node 89:15216, 1440x5165px desktop):
 *
 * Stage 1: Hero Section (Component 20, Node 148:3708, y=0, h=740px)
 * Stage 2: About / Manifesto (Component 9, Node 112:850, y=718, h=879px, surface #F9F7F0)
 * Stage 3: Featured Artists (Frame 14, Node 87:14240, y=1619, h=615px, 4:5 cards)
 * Stage 4: Testimonials (Section, Node 87:14313, y=2218, h=597px, surface #F9F7F0)
 * Stage 5: Editorial Feature (Frame 26, Node 87:14400, y=2815, h=709px)
 * Stage 6: Upcoming Events (Frame 28, Node 87:14466, y=3550, h=678px, split banner)
 * Stage 7: Booking CTA Banner (Section, Node 87:14534, y=4282, h=498px, #2B1D14 overlay)
 * Stage 8: Global Footer (Node 94:18289, y=4780, h=385px, #2B1D14 texture) [Rendered in PublicLayout]
 */
export default async function HomePage() {
  const [settings, artists, testimonials, articles, events] = await Promise.all([
    getSiteSettings(),
    getFeaturedArtists(4),
    getPublishedTestimonials(),
    getFeaturedArticles(3),
    getUpcomingEvents(3),
  ]);

  return (
    <>
      {/* Stage 1: Hero Banner (Figma Component 20, 740px) */}
      <HeroSection settings={settings} />

      {/* Stage 2: About / Manifesto Section (Figma Component 9, 879px, #F9F7F0) */}
      <AboutSection settings={settings} />

      {/* Stage 3: Featured Artists Strip (Figma Frame 14, 615px, 4:5 cards) */}
      <FeaturedArtists artists={artists} />

      {/* Stage 4: Testimonials Carousel (Figma Section 87:14313, 597px, #F9F7F0) */}
      <TestimonialsSlider testimonials={testimonials} />

      {/* Stage 5: Editorial Feature (Figma Frame 26, 709px) */}
      <EditorialFeature articles={articles} />

      {/* Stage 6: Upcoming Events Strip (Figma Frame 28, 678px, split banner) */}
      <HomeEvents events={events} />

      {/* Stage 7: Booking CTA Banner (Figma Section 87:14534, 498px, #2B1D14 overlay) */}
      <BookingBanner settings={settings} />
    </>
  );
}
