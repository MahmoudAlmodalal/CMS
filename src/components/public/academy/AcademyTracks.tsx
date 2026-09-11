import React from "react";
import { useTranslations } from "next-intl";
import { Container, Grid } from "@/components/ui/LayoutPrimitives";
import { TrackCard } from "./TrackCard";
import type { AcademyCourse } from "@/lib/dal/academy";

interface AcademyTracksProps {
  courses: AcademyCourse[];
}

/**
 * Academy Tracks Section
 * Figma Node: 91:16119 / 91:16347 / 91:16438
 * - Section Title: "ثلاثة مسارات، موهبة واحدة"
 * - 3 Tracks Grid backed by academy_courses
 */
export function AcademyTracks({ courses }: AcademyTracksProps) {
  const t = useTranslations("academy");

  return (
    <section className="py-16 sm:py-20 lg:py-24" id="tracks">
      <Container>
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-sans font-black text-[40px] text-brand-espresso mb-4 leading-[1.2]">
            {t("tracksHeading")}
          </h2>
          <p className="text-base sm:text-lg text-gradscale-400 font-sans leading-relaxed">
            {t("tracksSubtitle")}
          </p>
        </div>

        {/* 3 Courses Grid */}
        {courses.length > 0 ? (
          <Grid cols={3} className="gap-6 lg:gap-8 items-stretch">
            {courses.map((course, idx) => (
              <TrackCard key={course.id || course.slug} course={course} index={idx} />
            ))}
          </Grid>
        ) : (
          <div className="text-center py-12 bg-white rounded-card border border-brand-espresso-subtle">
            <p className="text-gradscale-400 font-sans">{t("tracksEmpty")}</p>
          </div>
        )}
      </Container>
    </section>
  );
}
