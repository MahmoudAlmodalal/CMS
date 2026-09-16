import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAcademyCourseBySlug } from "@/lib/dal/academy";
import { Container } from "@/components/ui/LayoutPrimitives";
import { PageHero } from "@/components/public";

interface AcademyCoursePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: AcademyCoursePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const course = await getAcademyCourseBySlug(slug);
  if (!course) return {};

  return {
    title: course.title,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: course.image_url ? [{ url: course.image_url }] : undefined,
    },
  };
}

export default async function AcademyCoursePage({ params }: AcademyCoursePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const course = await getAcademyCourseBySlug(slug);

  if (!course) notFound();

  const isArabic = locale === "ar";
  const labels = isArabic
    ? {
        overview: "عن المسار",
        curriculum: "ماذا ستتعلّم",
        curriculumBody: "منهج عملي مكثّف يجمع بين الأساس النظري والتطبيق المباشر مع فنانين ومدرّبين من أندلسيا.",
        register: "سجّل في هذا المسار",
        back: "العودة إلى الأكاديمية",
        category: "المسار التدريبي",
        instructor: "المدرّب",
      }
    : {
        overview: "About this path",
        curriculum: "What you will learn",
        curriculumBody: "An intensive practical curriculum combining strong foundations with direct guidance from Andalusia artists and instructors.",
        register: "Register for this path",
        back: "Back to the academy",
        category: "Training path",
        instructor: "Instructor",
      };

  return (
    <div className="flex w-full flex-col bg-brand-cream">
      <PageHero
        eyebrow={course.track_category}
        title={course.title}
        subtitle={course.description}
        image={course.image_url || undefined}
        height={611}
        mobileHeight={490}
        contentTop={185}
        titleSize={72}
        titleLeading={90}
      />

      <section className="py-12 sm:py-16 lg:py-24" aria-labelledby="academy-course-overview">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12" dir={isArabic ? "rtl" : "ltr"}>
            <article className="min-w-0">
              <div className="rounded-2xl bg-brand-espresso px-5 py-6 text-brand-tint sm:px-8">
                <p className="text-sm font-bold text-brand-primary">{labels.category}</p>
                <h1 id="academy-course-overview" className="mt-2 text-2xl font-bold leading-relaxed sm:text-3xl">
                  {course.title}
                </h1>
                {course.instructor_name && (
                  <p className="mt-3 text-sm text-brand-tint/75">
                    {labels.instructor}: {course.instructor_name}
                  </p>
                )}
              </div>

              <div className="mt-8 space-y-8 text-start text-base leading-8 text-brand-espresso/80 sm:text-lg">
                <div>
                  <h2 className="text-xl font-bold text-brand-espresso sm:text-2xl">{labels.overview}</h2>
                  <p className="mt-3">{course.description}</p>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-brand-espresso sm:text-2xl">{labels.curriculum}</h2>
                  <p className="mt-3">{labels.curriculumBody}</p>
                </div>
              </div>
            </article>

            <aside className="h-fit rounded-2xl bg-white p-6 shadow-card sm:p-8 lg:sticky lg:top-8">
              <p className="text-sm font-bold text-brand-primary">{course.track_category}</p>
              <h2 className="mt-2 text-2xl font-bold text-brand-espresso">{course.title}</h2>
              <p className="mt-4 text-sm leading-7 text-brand-espresso/70">{course.description}</p>
              <Link
                href={`/booking?course=${encodeURIComponent(course.slug)}`}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-primary px-5 text-center font-bold text-white transition-colors hover:bg-brand-primary-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                {labels.register}
              </Link>
              <Link
                href="/academy"
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-brand-primary px-5 text-center font-bold text-brand-primary transition-colors hover:bg-brand-primary/5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                {labels.back}
              </Link>
            </aside>
          </div>
        </Container>
      </section>

      <div className="h-12 bg-brand-espresso sm:h-20" aria-hidden="true" />
    </div>
  );
}
