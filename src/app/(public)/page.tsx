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
 * Task 32 — Home Page `/`
 * Verified against Figma screen "الرئيسية" (Node 89:15216):
 * 1. Hero Section (Figma Component 20, Node 148:3708)
 * 2. About Section (Figma Component 9, Node 112:850)
 * 3. Featured Artists (Figma Frame 14, Node 87:14240)
 * 4. Testimonials Carousel (Figma Section, Node 87:14313)
 * 5. Editorial Feature (Figma Frame 26, Node 87:14400)
 * 6. Upcoming Events Preview (Figma Frame 28, Node 87:14466)
 * 7. Booking Banner (Figma Section, Node 87:14534)
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
    <div className="flex flex-col w-full">
      {/* 1. Hero Banner */}
      <HeroSection settings={settings} />

      {/* 2. About / Manifesto Section */}
      <AboutSection settings={settings} />

      {/* 3. Featured Artists Strip (4 items) */}
      <FeaturedArtists artists={artists} />

      {/* 4. Testimonials Carousel */}
      <TestimonialsSlider testimonials={testimonials} />

      {/* 5. Editorial / Cultural Stories Highlight (3 items) */}
      <EditorialFeature articles={articles} />

      {/* 6. Upcoming Events Strip (3 items) */}
      <HomeEvents events={events} />

      {/* 7. Booking CTA Banner */}
      <BookingBanner settings={settings} />
    </div>
  );
}
