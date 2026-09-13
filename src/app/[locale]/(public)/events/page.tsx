import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EventsCatalogView } from "@/components/public/events";
import { PageHero } from "@/components/public";
import {
  getPublishedEvents,
  getFeaturedEvent,
  getEventsSubtitle,
} from "@/lib/dal/events";
import type { CategoryFilterId } from "@/lib/types/events";

/**
 * الفعاليات — Figma frame 91:16532.
 *
 * The frame is 1440x2290 on brand-cream: the hero band 0-611, the filter bar at
 * 671, the two columns from 748 to 1576, the footer at 1905. The 329px of air
 * under the list is the frame's, not a rhythm — it is what leaves room for the
 * dotted mark at 1682.
 *
 * STRICT RULE: there is no per-event detail route. Every booking, from the row
 * link or the featured panel, goes to /booking?event_id=...
 * ISR: revalidate = 1800 (APPLICATION_ARCHITECTURE.md §3).
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
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string }>;
}

export default async function EventsPage({ params, searchParams }: EventsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const query = searchParams ? await searchParams : {};
  const requestedCategory = (query.category as CategoryFilterId) || "all";

  const [events, featuredEvent, subtitle, t] = await Promise.all([
    getPublishedEvents(),
    getFeaturedEvent(),
    getEventsSubtitle(),
    getTranslations("events"),
  ]);

  return (
    <div className="flex w-full flex-col bg-brand-cream">
      {/* Hero band 91:16745/91:16746 — 611 tall, the headline 247 down in Qahwa
          Arabic 64/91.5 with the first word in primary-500, the standfirst 24px
          under it. This frame draws no pill. */}
      <PageHero
        title={t.rich("title", {
          em: (chunks) => <span className="text-brand-primary">{chunks}</span>,
        })}
        subtitle={subtitle}
        height={611}
        mobileHeight={678}
        contentTop={247}
        titleSize={64}
        titleLeading={91.5}
        titleTone="text-brand-tint"
      />

      {/* Catalogue band — the bar 60px under the hero, the columns 24px under it,
          and 329px of air down to the footer. The 390 frame runs on a 38px rhythm
          instead — band 0-678, filter bar at 716, list at 808, featured panel at
          1337 — and closes on 84 before the footer at 2007. */}
      <section className="relative w-full overflow-hidden pb-[84px] pt-[38px] lg:pb-[329px] lg:pt-[60px]">
        {/* Dotted marks 91:16533 and 91:16638, both hanging off the artboard. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-[94px] hidden h-[112px] w-[62px] bg-[url('/assets/branding/dots-events-start.png')] bg-cover bg-no-repeat lg:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-[1071px] hidden h-[112px] w-[64px] bg-[url('/assets/branding/dots-events-end.png')] bg-cover bg-no-repeat lg:block"
        />

        <Suspense fallback={<div className="min-h-[828px]" />}>
          <EventsCatalogView
            initialEvents={events}
            featuredEvent={featuredEvent}
            initialCategory={requestedCategory}
          />
        </Suspense>
      </section>
    </div>
  );
}
