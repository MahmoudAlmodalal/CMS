import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSiteSettings } from "@/lib/dal/site-settings";
import { getPublishedAcademyCourses } from "@/lib/dal/academy";
import {
  AcademyValueProps,
  AcademyTracks,
  AcademyNewsletter,
} from "@/components/public/academy";
import { PageHero } from "@/components/public";

export const dynamic = "force-static"; // Static per APPLICATION_ARCHITECTURE.md (no searchParams/cookies)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("academyTitle"),
    description: t("academyDescription"),
    openGraph: {
      title: t("academyTitle"),
      description: t("academyDescription"),
      type: "website",
      locale: locale === "ar" ? "ar_AR" : "en_US",
    },
  };
}

/**
 * الأكاديمية — Figma frame 91:16119.
 *
 * The frame is 1440x2503 on #F9F7F0 and runs: hero band 0-611, tracks 713-1128.6,
 * the value-props band 1210-1653.3, the newsletter 1702-2055, footer at 2118. The
 * gaps between those bands are not a rhythm — 81.4, 48.7 and 63 — so each one is
 * stated where it falls rather than folded into a shared section spacing.
 *
 * The order is hero, tracks, then the pillars: the page led with the pillars
 * before, which is not what the frame draws.
 *
 * Scope is unchanged and deliberately narrow: no enrolment, no payments, no
 * accounts, no progress tracking. Every registration goes to /booking?course=slug.
 */
export default async function AcademyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, courses, t] = await Promise.all([
    getSiteSettings(),
    getPublishedAcademyCourses(),
    getTranslations("academy"),
  ]);

  return (
    <div className="flex w-full flex-col bg-brand-cream">
      {/* Hero band 91:16331/91:16343 — 611 tall, the pill 185 down and the
          headline 62px under it in Qahwa Arabic 72/90. */}
      <PageHero
        eyebrow={t("kicker")}
        title={t.rich("title", {
          em: (chunks) => <span className="text-brand-primary">{chunks}</span>,
        })}
        subtitle={settings.academy_subtitle}
        height={611}
        contentTop={185}
        titleSize={72}
        titleLeading={90}
      />

      {/* Tracks 91:16347/91:16437, opening 102px under the band. */}
      <AcademyTracks courses={courses} />

      {/* Value-props band 91:16348, 81.4px under the tracks grid. */}
      <div className="pt-[81px]">
        <AcademyValueProps />
      </div>

      {/* Newsletter 91:16420, 48.7px under the band and 63px clear of the footer. */}
      <div className="pb-[63px] pt-[49px]">
        <AcademyNewsletter />
      </div>
    </div>
  );
}
