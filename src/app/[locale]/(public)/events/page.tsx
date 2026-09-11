import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/LayoutPrimitives";
import {
  EventsHeader,
  EventsCatalogView,
} from "@/components/public/events";
import { PageHero } from "@/components/public";
import {
  getPublishedEvents,
  getFeaturedEvent,
  getEventsSubtitle,
} from "@/lib/dal/events";
import type { CategoryFilterId } from "@/lib/types/events";

/**
 * Task 35 — Events (/events)
 * Canonical spec:
 * - Content Inventory §7 (Figma Node 91:16532)
 * - Display published events with category, date, venue, city, image, and ticket/booking action
 * - Implement only confirmed filters and fields
 * - Link internal booking to /booking?event_id=...
 * - STRICT RULE: NO dynamic event detail route (no event slug route)
 * - ISR: revalidate = 1800 (APPLICATION_ARCHITECTURE.md §3)
 */
export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("eventsTitle"),
    description: t("eventsDescription"),
    openGraph: {
      title: t("eventsTitle"),
      description: t("eventsDescription"),
      locale: locale === "ar" ? "ar_AR" : "en_US",
      type: "website",
    },
  };
}

interface EventsPageProps {
  searchParams?: Promise<{
    category?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = searchParams ? await searchParams : {};
  const requestedCategory = (params.category as CategoryFilterId) || "all";

  // Fetch dynamic content via Data Access Layer
  const [events, featuredEvent, subtitle, t] = await Promise.all([
    getPublishedEvents(),
    getFeaturedEvent(),
    getEventsSubtitle(),
    getTranslations("page"),
  ]);

  return (
    <div className="w-full">
      <PageHero
        eyebrow={t("eventsEyebrow")}
        title={t("eventsTitle")}
        subtitle={subtitle}
      />
      <Container className="space-y-10 sm:space-y-12">
        {/* 1. Header (Figma 91:16532 / 91:16748) */}
        <div className="sr-only"><EventsHeader title={t("eventsTitle")} subtitle={subtitle} /></div>

        {/* 2. Catalog View with Suspense for useSearchParams boundary */}
        <Suspense
          fallback={
            <div className="space-y-8 animate-pulse">
              <div className="h-64 sm:h-80 bg-secondary-200 rounded-card w-full" />
              <div className="h-10 bg-secondary-200 rounded-badge w-64" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="h-80 bg-secondary-200 rounded-card" />
                <div className="h-80 bg-secondary-200 rounded-card" />
                <div className="h-80 bg-secondary-200 rounded-card" />
              </div>
            </div>
          }
        >
          <EventsCatalogView
            initialEvents={events}
            featuredEvent={featuredEvent}
            initialCategory={requestedCategory}
          />
        </Suspense>
      </Container>
    </div>
  );
}
