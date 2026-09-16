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
  const copy = isArabic
    ? {
        academy: "أكاديمية أندلسيا الموسيقية",
        price: "٤٥٠ دولار",
        duration: "٢٤ يوماً مكثفاً",
        group: "٨ مشاركين كحد أقصى",
        certificate: "شهادة إتمام رسمية ✓",
        language: "العربية",
        register: "سجّل الآن",
        formTitle: "سجّل الآن",
        formSubtitle: "سجّل في مدرسة العود",
        name: "الاسم الكامل *",
        namePlaceholder: "اكتب اسمك",
        age: "العمر *",
        agePlaceholder: "مثال: ٢٤",
        country: "الدولة *",
        countryPlaceholder: "اختر دولتك",
        phone: "رقم الجوال *",
        phonePlaceholder: "+961 ...",
        formButton: "سجّل في مدرسة العود ›",
        note: "سنتواصل معك خلال 48 ساعة لتأكيد مقعدك.",
        offer: "نعلّمك على يد عازفين محترفين مدرّبين على الأسلوب الموسيقي الكلاسيكي الأصيل، في فنون العزف والألحان الأندلسية.",
        intro: `مدرسة العود في أندلسيا هي تجربة الغوص كاملة في إرث مدرسة فن العود. ${course.description} — سنعلّمك كيف تعزف كل لحن، ومن أين أتى، وكيف تجعله خاصاً بك.`,
        philosophy: "ندرس في البرنامج قانوناً نشطاً يمرّون على خشبات المسرح كل أسبوع، وليس أكاديميين منعزلين عن الواقع الفني. هذا يعني أنك تتعلم العزف داخل العائلة الموسيقية الحقيقية.",
        practice: "البرنامج مصمم للمبتدئين الجادين والمحترفين الراغبين في تعميق مستواهم. يشترط امتلاك آلة عود والقدرة على عزف مقطوعة قصيرة.",
        curriculum: "تقسيمة المساق",
        total: "المجموع الكلي",
        weeks: "أسبوعاً مكثفاً",
        lesson1: "تقنيات الأساسيات",
        lesson1Body: "وضعية العود، الريشة، المقامات الثلاثة الأولى",
        lesson2: "تعلم النغم والإيقاع",
        lesson2Body: "التقنيات المتقدمة، التمرين التحريري الحر",
        lesson3: "العزف الأول الحقيقي",
        lesson3Body: "تسجيل مقطوعة عود كاملة أمام جمهور حقيقي",
        back: "العودة إلى الأكاديمية",
      }
    : {
        academy: "Andalusia Music Academy",
        price: "$450",
        duration: "24 intensive days",
        group: "Maximum 8 participants",
        certificate: "Official completion certificate ✓",
        language: "Arabic",
        register: "Register now",
        formTitle: "Register now",
        formSubtitle: "Register for Oud School",
        name: "Full name *",
        namePlaceholder: "Your name",
        age: "Age *",
        agePlaceholder: "e.g. 24",
        country: "Country *",
        countryPlaceholder: "Choose your country",
        phone: "Phone number *",
        phonePlaceholder: "+961 ...",
        formButton: "Register for Oud School ›",
        note: "We will contact you within 48 hours to confirm your seat.",
        offer: "Learn from professional musicians trained in authentic classical style, the arts of playing and Andalusian melodies.",
        intro: `The Oud School at Andalusia is a complete immersion in the heritage of the oud. ${course.description} We will teach you how to play each melody, where it comes from, and how to make it your own.`,
        philosophy: "The programme is led by active musicians who perform on stage every week, not academics detached from the artistic reality. You learn inside a real musical family.",
        practice: "Designed for serious beginners and experienced players who want to deepen their craft. Participants should own an oud and be able to play a short piece.",
        curriculum: "Course breakdown",
        total: "Total",
        weeks: "intensive weeks",
        lesson1: "Foundational techniques",
        lesson1Body: "Oud posture, plectrum, first three maqams",
        lesson2: "Melody and rhythm",
        lesson2Body: "Advanced techniques and free practice",
        lesson3: "Your first real performance",
        lesson3Body: "Record a complete oud piece before a real audience",
        back: "Back to the academy",
      };

  const lessons = [
    { number: "7", title: copy.lesson1, body: copy.lesson1Body },
    { number: "14", title: copy.lesson2, body: copy.lesson2Body },
    { number: "3", title: copy.lesson3, body: copy.lesson3Body },
  ];

  return (
    <div className="flex w-full flex-col bg-[#F9F7F0]" dir={isArabic ? "rtl" : "ltr"}>
      <PageHero
        eyebrow={copy.academy}
        title={isArabic ? (
          <><span className="text-brand-primary">مدرسة</span> <span className="text-white">العود</span></>
        ) : (
          <><span className="text-white">Oud</span> <span className="text-brand-primary">School</span></>
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
                {copy.offer}
              </div>
              <div className="mt-7 space-y-5 text-[15px] leading-8 text-brand-espresso/70 sm:text-[16px]">
                <p>{copy.intro}</p>
                <p>{copy.philosophy}</p>
                <p>{copy.practice}</p>
              </div>

              <div className="mt-8 overflow-hidden rounded-[10px] border border-brand-espresso/10 bg-white shadow-sm">
                <div className="bg-brand-espresso px-6 py-4 text-lg font-bold text-brand-tint">{copy.curriculum}</div>
                <div>
                  {lessons.map((lesson) => (
                    <div key={lesson.number} className="flex min-h-[102px] items-center gap-5 border-b border-brand-espresso/10 px-6 py-5 last:border-b-0">
                      <div className="min-w-[55px] text-center">
                        <strong className="block text-4xl font-black leading-none text-brand-primary">{lesson.number}</strong>
                        <span className="text-[11px] text-brand-espresso/50">{copy.weeks}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-espresso">{lesson.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-brand-espresso/55">{lesson.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between bg-brand-primary px-6 py-3 text-sm font-bold text-white">
                  <span>{copy.total}</span><span>٢٤ {copy.weeks}</span>
                </div>
              </div>
            </article>

            <aside className="min-w-0 lg:col-start-1 lg:row-start-1">
              <div className="rounded-[16px] bg-brand-espresso p-6 text-brand-tint shadow-sm sm:p-8">
                <p className="text-right text-3xl font-bold text-brand-primary">{copy.price}</p>
                <dl className="mt-6 grid grid-cols-[1fr_auto] gap-y-5 text-sm">
                  <dt className="text-brand-tint/75">{copy.duration}</dt><dd className="text-brand-tint/90">المدة الكاملة</dd>
                  <dt className="text-brand-tint/75">{copy.group}</dt><dd className="text-brand-tint/90">حجم المجموعة</dd>
                  <dt className="text-brand-tint/75">{copy.certificate}</dt><dd className="text-brand-tint/90">الشهادة</dd>
                  <dt className="text-brand-tint/75">{copy.language}</dt><dd className="text-brand-tint/90">اللغة</dd>
                </dl>
              </div>

              <div className="mt-5 rounded-[16px] bg-white p-5 shadow-sm sm:p-8">
                <h2 className="text-xl font-bold text-brand-espresso">{copy.formTitle}</h2>
                <p className="mt-1 text-xs text-brand-espresso/50">{copy.formSubtitle}</p>
                <div className="mt-6 space-y-4">
                  {[
                    [copy.name, copy.namePlaceholder],
                    [copy.age, copy.agePlaceholder],
                    [copy.country, copy.countryPlaceholder],
                    [copy.phone, copy.phonePlaceholder],
                  ].map(([label, placeholder]) => (
                    <label key={label} className="block text-xs font-bold text-brand-espresso">
                      {label}
                      <input readOnly placeholder={placeholder} className="mt-2 h-11 w-full rounded-xl border border-brand-espresso/10 bg-white px-3 text-sm font-normal outline-none placeholder:text-brand-espresso/30 focus:border-brand-primary" />
                    </label>
                  ))}
                  <Link href={`/booking?course=${encodeURIComponent(course.slug)}`} className="flex h-12 w-full items-center justify-center rounded-xl bg-brand-primary text-center text-sm font-bold text-white transition-colors hover:bg-brand-primary-hover">
                    {copy.formButton}
                  </Link>
                  <p className="text-center text-[10px] leading-5 text-brand-espresso/40">{copy.note}</p>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <div className="bg-brand-espresso py-16 text-center text-brand-tint">
        <Link href="/academy" className="text-sm font-bold text-brand-primary hover:text-brand-primary-hover">{copy.back}</Link>
      </div>
    </div>
  );
}
