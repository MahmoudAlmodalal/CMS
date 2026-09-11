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
 * Task 36 — Academy Public Route (/academy)
 * Verified against Figma Node 91:16119 & 139:12420
 * 
 * Sections:
 * 1. AcademyHeader: "تعلّم من اليد التي تعرف الطريق" + dynamic site_settings.academy_subtitle
 * 2. AcademyValueProps: "التعلّم هنا مختلف" + 3 core pillars (small groups, active artists, real performance)
 * 3. AcademyTracks: "ثلاثة مسارات، موهبة واحدة" + Track cards backed by academy_courses (display_order ASC)
 * 4. AcademyNewsletter: "رسالة واحدة في الشهر. ♪ لكنها تستحق كل الانتظار." + validated subscription form
 * 
 * Strictly Excluded (Scope Integrity):
 * - No student enrollment system
 * - No payment processing
 * - No user accounts / login
 * - No progress or course completion tracking
 * All course registrations route through /booking?course=[slug]
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
    getTranslations("page"),
  ]);

  return (
    <div className="flex flex-col">
      {/* 1. Figma academy hero */}
      <PageHero
        eyebrow={t("academyEyebrow")}
        title={t("academyTitle")}
        subtitle={settings.academy_subtitle}
      />

      {/* 2. Value propositions & methodology */}
      <AcademyValueProps />

      {/* 3. Three curriculum tracks */}
      <AcademyTracks courses={courses} />

      {/* 4. Newsletter subscription */}
      <AcademyNewsletter />
    </div>
  );
}
