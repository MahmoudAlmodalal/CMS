import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/LayoutPrimitives";
import {
  BookingHeader,
  BookingSidebar,
  BookingForm,
  BookingContextBanner,
  PageHero,
} from "@/components/public";
import { getBookingPageData } from "@/lib/dal/booking";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("bookingTitle"),
    description: t("bookingDescription"),
    openGraph: {
      title: t("bookingTitle"),
      description: t("bookingDescription"),
      locale: locale === "ar" ? "ar_AR" : "en_US",
      type: "website",
    },
  };
}

interface BookingPageProps {
  searchParams?: Promise<{
    event_id?: string;
    artist?: string;
    artist_id?: string;
    course?: string;
  }>;
}

/**
 * Task 38 — Booking Route `/booking`
 * Verified against Figma Screen "الحجز" (Node 91:17109):
 * - Frame 11 (Node 91:17123): Header with title & subtitle
 * - Frame 33 (Node 91:17792): 2-Column Responsive Layout (Form + Sidebar)
 * - Deep Link Parameter Binding:
 *   - ?event_id=[id] -> Pre-fills event context & associated artist
 *   - ?artist=[slug|id] -> Pre-selects artist in dropdown
 *   - ?course=[slug] -> Pre-fills academy registration inquiry
 */
export default async function BookingPage({ searchParams }: BookingPageProps) {
  const t = await getTranslations("page");
  const resolvedParams = searchParams ? await searchParams : {};
  const eventIdParam = resolvedParams.event_id;
  const artistParam = resolvedParams.artist || resolvedParams.artist_id;
  const courseParam = resolvedParams.course;

  // Retrieve published artists, event details, and configurable site settings
  const {
    subtitle,
    contactEmail,
    contactPhone,
    instagramUrl,
    artists,
    eventContext,
  } = await getBookingPageData(eventIdParam);

  // Derive preselection state from query parameters
  let defaultArtistId: string | undefined = undefined;
  let preferredArtistName: string | null = null;
  let defaultPreferredArtist: string | undefined = undefined;
  let defaultMessage: string | undefined = undefined;
  let defaultEventType = "private_concert";

  // 1. Event linkage preselection (?event_id=...)
  if (eventContext) {
    if (eventContext.artist_id) {
      defaultArtistId = eventContext.artist_id;
    }
    if (eventContext.performer_name && !defaultArtistId) {
      defaultPreferredArtist = eventContext.performer_name;
      preferredArtistName = eventContext.performer_name;
    }
    defaultEventType = "festival";
    defaultMessage = `${t("bookingPrefillEvent", { title: eventContext.title })}${
      eventContext.venue ? t("bookingPrefillVenue", { venue: eventContext.venue }) : ""
    }.`;
  }

  // 2. Artist preselection (?artist=...)
  if (artistParam && !eventContext) {
    const matchedArtist = artists.find(
      (a) => a.id === artistParam || a.slug === artistParam
    );
    if (matchedArtist) {
      defaultArtistId = matchedArtist.id;
      preferredArtistName = matchedArtist.name;
    } else {
      defaultPreferredArtist = artistParam;
      preferredArtistName = artistParam;
    }
  }

  // 3. Academy course preselection (?course=...)
  if (courseParam && !eventContext) {
    defaultEventType = "other";
    defaultMessage = t("bookingPrefillCourse", { course: courseParam });
  }

  return (
    <div className="w-full bg-brand-cream min-h-screen">
      <PageHero
        eyebrow={t("bookingEyebrow")}
        title={t("bookingTitle")}
        subtitle={subtitle}
      />
      <Container>
        {/* Header (Figma Frame 11 / Node 91:17123) */}
        <div className="sr-only"><BookingHeader subtitle={subtitle} /></div>

        {/* 2-Column Responsive Layout (Figma Frame 33 / Node 91:17792) */}
        <div className="w-full mt-6 sm:mt-8 flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
          {/* Main Form Column (Figma Form Node 91:17171) */}
          <main className="flex-1 w-full min-w-0">
            {/* Deep-link Context Alert */}
            <BookingContextBanner
              eventContext={eventContext}
              preferredArtistName={preferredArtistName}
              courseSlug={courseParam}
            />

            {/* Public Interactive Booking Form */}
            <BookingForm
              artists={artists}
              defaultArtistId={defaultArtistId}
              defaultEventId={eventContext?.id}
              defaultEventType={defaultEventType}
              defaultMessage={defaultMessage}
              defaultPreferredArtist={defaultPreferredArtist}
            />
          </main>

          {/* Sidebar Column (Figma Sidebar Node 91:17250) */}
          <BookingSidebar
            contactEmail={contactEmail}
            contactPhone={contactPhone}
            instagramUrl={instagramUrl}
          />
        </div>
      </Container>
    </div>
  );
}
