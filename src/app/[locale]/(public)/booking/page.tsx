import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  BookingHeader,
  BookingSidebar,
  BookingForm,
  BookingContextBanner,
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
 * Booking route `/booking` — Figma frame 91:17109.
 *
 * The frame is a 611px hero band, then a single content row (91:17792) 676px
 * down: the sidebar (412) and the form (672) 58px apart, the pair centred, and
 * the footer at 1568. The row is laid out sidebar-first because that is the
 * order the design draws it in — in Arabic that puts the form on the right.
 *
 * Deep Link Parameter Binding:
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
    <div className="w-full bg-brand-cream">
      {/* Hero band 91:17110/91:17111/91:17123 — full-bleed, 611 tall, navbar over it. */}
      <BookingHeader subtitle={subtitle} />

      {/* Content row 91:17792: form 672 and sidebar 412, 58px apart, the pair
          centred on the 1440 artboard, opening 65px under the hero band and
          leaving 18px before the footer at y=1568 — the form's own content runs
          past the 829px the frame gives its box, so the gap is measured off the
          rendered reference rather than off that number. The form comes first so
          that in Arabic it lands on the right, where the design draws it. */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-8 px-5 pb-16 pt-12 sm:px-8 lg:w-[1142px] lg:flex-row lg:gap-[58px] lg:px-0 lg:pb-[18px] lg:pt-[65px]">
        <main className="w-full min-w-0 lg:w-[672px]">
          <BookingContextBanner
            eventContext={eventContext}
            preferredArtistName={preferredArtistName}
            courseSlug={courseParam}
          />

          <BookingForm
            artists={artists}
            defaultArtistId={defaultArtistId}
            defaultEventId={eventContext?.id}
            defaultEventType={defaultEventType}
            defaultMessage={defaultMessage}
            defaultPreferredArtist={defaultPreferredArtist}
          />
        </main>

        <BookingSidebar
          contactEmail={contactEmail}
          contactPhone={contactPhone}
          instagramUrl={instagramUrl}
        />
      </div>
    </div>
  );
}
