import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAcademyCourseBySlug } from "@/lib/dal/academy";
import type { CurriculumItem } from "@/lib/academy";
import { Container } from "@/components/ui/LayoutPrimitives";
import { PageHero } from "@/components/public";
import { Highlight } from "@/components/ui/Highlight";

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
    openGraph: { title: course.title, description: course.description, images: course.image_url ? [{ url: course.image_url }] : undefined },
  };
}

function DotPattern({ side }: { side: "start" | "end" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute top-[150px] hidden h-[112px] w-[92px] opacity-90 lg:block ${side === "start" ? "-start-1" : "-end-1"}`}
      style={{ backgroundImage: "radial-gradient(circle, #C54716 2px, transparent 2.5px)", backgroundSize: "13px 13px" }}
    />
  );
}

export default async function AcademyCoursePage({ params }: AcademyCoursePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const course = await getAcademyCourseBySlug(slug);
  if (!course) notFound();

  const isArabic = locale === "ar";

  // ── Sidebar copy — CMS overrides with Figma defaults ──────────────────────
  const price       = course.price       ?? (isArabic ? "٤٥٠ دولار"           : "$450");
  const duration    = course.duration    ?? (isArabic ? "٢٤ يوماً مكثفاً"      : "24 intensive days");
  const groupSize   = course.group_size  ?? (isArabic ? "٨ مشاركين كحد أقصى"  : "Maximum 8 participants");
  const certificate = course.certificate ?? (isArabic ? "شهادة إتمام رسمية ✓"  : "Official completion certificate ✓");
  const language    = course.language    ?? (isArabic ? "العربية"               : "Arabic");

  // ── Body copy — CMS overrides with Figma defaults ─────────────────────────
  const offerText = course.offer_text ?? (
    isArabic
      ? "نعلّمك على يد عازفين محترفين مدرّبين على الأسلوب الموسيقي الكلاسيكي الأصيل، في فنون العزف والألحان الأندلسية."
      : "Learn from professional musicians trained in authentic classical style, the arts of playing and Andalusian melodies."
  );

  const introText = isArabic
    ? `مدرسة العود في أندلسيا هي تجربة الغوص كاملة في إرث مدرسة فن العود. ${course.description} — سنعلّمك كيف تعزف كل لحن، ومن أين أتى، وكيف تجعله خاصاً بك.`
    : `The Oud School at Andalusia is a complete immersion in the heritage of the oud. ${course.description} We will teach you how to play each melody, where it comes from, and how to make it your own.`;

  const philosophyText = course.philosophy_text ?? (
    isArabic
      ? "ندرس في البرنامج قانوناً نشطاً يمرّون على خشبات المسرح كل أسبوع، وليس أكاديميين منعزلين عن الواقع الفني. هذا يعني أنك تتعلم العزف داخل العائلة الموسيقية الحقيقية."
      : "The programme is led by active musicians who perform on stage every week, not academics detached from the artistic reality. You learn inside a real musical family."
  );

  const practiceText = course.practice_text ?? (
    isArabic
      ? "البرنامج مصمم للمبتدئين الجادين والمحترفين الراغبين في تعميق مستواهم. يشترط امتلاك آلة عود والقدرة على عزف مقطوعة قصيرة."
      : "Designed for serious beginners and experienced players who want to deepen their craft. Participants should own an oud and be able to play a short piece."
  );

  const curriculumTitle = course.curriculum_title ?? (isArabic ? "تقسيمة المساق" : "Course breakdown");
  const weeksLabel      = isArabic ? "أسبوعاً مكثفاً" : "intensive weeks";
  const totalLabel      = isArabic ? "المجموع الكلي"  : "Total";
  const registerLabel   = isArabic ? "سجّل الآن"      : "Register now";
  const formTitle       = registerLabel;
  const formSubtitle    = isArabic ? `سجّل في ${course.title}` : `Register for ${course.title}`;
  const formButton      = isArabic ? `سجّل في ${course.title} ›` : `Register for ${course.title} ›`;
  const formNote        = isArabic
    ? "سنتواصل معك خلال 48 ساعة لتأكيد مقعدك."
    : "We will contact you within 48 hours to confirm your seat.";
  const backLabel       = isArabic ? "العودة إلى الأكاديمية" : "Back to the academy";
  const eyebrow         = isArabic ? "أكاديمية أندلسيا الموسيقية" : "Andalusia Music Academy";

  // ── Curriculum items — CMS overrides with Figma defaults ──────────────────
  const defaultLessons = isArabic
    ? [
        { number: "7",  title: "تقنيات الأساسيات",  body: "وضعية العود، الريشة، المقامات الثلاثة الأولى" },
        { number: "14", title: "تعلم النغم والإيقاع", body: "التقنيات المتقدمة، التمرين التحريري الحر" },
        { number: "3",  title: "العزف الأول الحقيقي", body: "تسجيل مقطوعة عود كاملة أمام جمهور حقيقي" },
      ]
    : [
        { number: "7",  title: "Foundational techniques",     body: "Oud posture, plectrum, first three maqams" },
        { number: "14", title: "Melody and rhythm",           body: "Advanced techniques and free practice" },
        { number: "3",  title: "Your first real performance", body: "Record a complete oud piece before a real audience" },
      ];

  const lessons: { number: string; title: string; body: string }[] =
    Array.isArray(course.curriculum_items) && course.curriculum_items.length > 0
      ? (course.curriculum_items as CurriculumItem[]).map((item) => ({
          number: String(item.number),
          title: isArabic ? item.title : (item.title_en || item.title),
          body:  isArabic ? item.body  : (item.body_en  || item.body),
        }))
      : defaultLessons;

  // ── Label totals ───────────────────────────────────────────────────────────
  const totalWeeks = lessons.reduce((sum, l) => sum + (parseInt(l.number, 10) || 0), 0);

  // ── Form fields ───────────────────────────────────────────────────────────
  const formFields = isArabic
    ? [["الاسم الكامل *", "اكتب اسمك"], ["العمر *", "مثال: ٢٤"], ["الدولة *", "اختر دولتك"], ["رقم الجوال *", "+961 ..."]]
    : [["Full name *", "Your name"], ["Age *", "e.g. 24"], ["Country *", "Choose your country"], ["Phone number *", "+961 ..."]];

  return (
    <div className="flex w-full flex-col bg-[#F9F7F0]" dir={isArabic ? "rtl" : "ltr"}>
      <PageHero
        eyebrow={eyebrow}
        title={isArabic ? (
          <><span className="text-brand-primary">مدرسة</span> <span className="text-white">{course.title}</span></>
        ) : (
          <><span className="text-white">{course.title}</span></>
        )}
        subtitle={course.description}
        image={course.image_url || "/assets/academy-oud.png"}
        height={611}
        mobileHeight={490}
        contentTop={185}
        titleSize={72}
        titleLeading={90}
      />

      <section className="relative min-h-[1450px] overflow-hidden py-12 sm:py-16 lg:min-h-[1700px] lg:py-[78px]">
        <DotPattern side="start" />
        <DotPattern side="end" />
        <Container>
          <div className="relative z-10 grid items-start gap-8 lg:grid-cols-[485px_minmax(0,1fr)] lg:gap-[55px]">
            <article className="min-w-0 lg:col-start-2">
              <div className="rounded-[10px] bg-brand-espresso px-5 py-5 text-center text-sm leading-7 text-brand-tint sm:px-8">
                <span aria-hidden="true" className="float-start text-brand-primary">›</span>
                {offerText}
              </div>
              <div className="mt-7 space-y-5 text-[15px] leading-8 text-brand-espresso/70 sm:text-[16px]">
                <p>{introText}</p>
                <p>{philosophyText}</p>
                <p>{practiceText}</p>
              </div>

              <div className="mt-8 overflow-hidden rounded-[10px] border border-brand-espresso/10 bg-white shadow-sm">
                <div className="bg-brand-espresso px-6 py-4 text-lg font-bold text-brand-tint">
                  <Highlight text={curriculumTitle} highlightClassName="text-primary-500" />
                </div>
                <div>
                  {lessons.map((lesson) => (
                    <div key={lesson.number} className="flex min-h-[102px] items-center gap-5 border-b border-brand-espresso/10 px-6 py-5 last:border-b-0">
                      <div className="min-w-[55px] text-center">
                        <strong className="block text-4xl font-black leading-none text-brand-primary">{lesson.number}</strong>
                        <span className="text-[11px] text-brand-espresso/50">{weeksLabel}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-espresso">{lesson.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-brand-espresso/55">{lesson.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between bg-brand-primary px-6 py-3 text-sm font-bold text-white">
                  <span>{totalLabel}</span><span>{totalWeeks} {weeksLabel}</span>
                </div>
              </div>
            </article>

            <aside className="min-w-0 lg:col-start-1 lg:row-start-1">
              <div className="rounded-[16px] bg-brand-espresso p-6 text-brand-tint shadow-sm sm:p-8">
                <p className="text-right text-3xl font-bold text-brand-primary">{price}</p>
                <dl className="mt-6 grid grid-cols-[1fr_auto] gap-y-5 text-sm">
                  <dt className="text-brand-tint/75">{duration}</dt><dd className="text-brand-tint/90">{isArabic ? "المدة الكاملة" : "Full duration"}</dd>
                  <dt className="text-brand-tint/75">{groupSize}</dt><dd className="text-brand-tint/90">{isArabic ? "حجم المجموعة" : "Group size"}</dd>
                  <dt className="text-brand-tint/75">{certificate}</dt><dd className="text-brand-tint/90">{isArabic ? "الشهادة" : "Certificate"}</dd>
                  <dt className="text-brand-tint/75">{language}</dt><dd className="text-brand-tint/90">{isArabic ? "اللغة" : "Language"}</dd>
                </dl>
              </div>

              <div className="mt-5 rounded-[16px] bg-white p-5 shadow-sm sm:p-8">
                <h2 className="text-xl font-bold text-brand-espresso">{formTitle}</h2>
                <p className="mt-1 text-xs text-brand-espresso/50">{formSubtitle}</p>
                <div className="mt-6 space-y-4">
                  {formFields.map(([label, placeholder]) => (
                    <label key={label} className="block text-xs font-bold text-brand-espresso">
                      {label}
                      <input readOnly placeholder={placeholder} className="mt-2 h-11 w-full rounded-xl border border-brand-espresso/10 bg-white px-3 text-sm font-normal outline-none placeholder:text-brand-espresso/30 focus:border-brand-primary" />
                    </label>
                  ))}
                  <Link href={`/booking?course=${encodeURIComponent(course.slug)}`} className="flex h-12 w-full items-center justify-center rounded-xl bg-brand-primary text-center text-sm font-bold text-white transition-colors hover:bg-brand-primary-hover">
                    {formButton}
                  </Link>
                  <p className="text-center text-[10px] leading-5 text-brand-espresso/40">{formNote}</p>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <div className="bg-brand-espresso py-16 text-center text-brand-tint">
        <Link href="/academy" className="text-sm font-bold text-brand-primary hover:text-brand-primary-hover">{backLabel}</Link>
      </div>
    </div>
  );
}
