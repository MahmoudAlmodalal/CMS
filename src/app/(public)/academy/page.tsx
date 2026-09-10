import React from "react";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/dal/site-settings";
import { getPublishedAcademyCourses } from "@/lib/dal/academy";
import {
  AcademyHeader,
  AcademyValueProps,
  AcademyTracks,
  AcademyNewsletter,
} from "@/components/public/academy";

export const metadata: Metadata = {
  title: "الأكاديمية الموسيقية | فرقة أندلسيا",
  description:
    "مسارات تدريبية تخصصية في العود، المقامات، والغناء الأندلسي والتراثي مع نخبة من فناني أندلسيا.",
  openGraph: {
    title: "الأكاديمية الموسيقية | فرقة أندلسيا",
    description:
      "مسارات تدريبية تخصصية في العود، المقامات، والغناء الأندلسي والتراثي مع نخبة من فناني أندلسيا.",
    type: "website",
    locale: "ar_AR",
  },
};

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
export default async function AcademyPage() {
  const [settings, courses] = await Promise.all([
    getSiteSettings(),
    getPublishedAcademyCourses(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Header with dynamic subtitle */}
      <AcademyHeader subtitle={settings.academy_subtitle} />

      {/* 2. Value propositions & methodology */}
      <AcademyValueProps />

      {/* 3. Three curriculum tracks */}
      <AcademyTracks courses={courses} />

      {/* 4. Newsletter subscription */}
      <AcademyNewsletter />
    </div>
  );
}
