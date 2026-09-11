import { publicNewsletterSubmissionSchema } from "./validations/newsletter.ts";

export interface AcademyCourse {
  id: string;
  title: string;
  slug: string;
  track_category: string;
  description: string;
  instructor_name?: string | null;
  instructor_id?: string | null;
  image_url?: string | null;
  display_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * The three curriculum tracks, with their labels and bodies taken verbatim from
 * Figma nodes 91:16439, 91:16452 and 91:16465 in frame 91:16119:
 * 1. "مدرسة العود" (oud-school) — مدرسة التراث
 * 2. "فن الأداء" (performance-art) — فن الأداء
 * 3. "الصوت والطرب" (vocal-tarab) — صوت ومجموع
 *
 * instructor_name and image_url stay on the record for the admin side; the design
 * draws neither on the public card.
 */
export const CANONICAL_ACADEMY_COURSES: AcademyCourse[] = [
  {
    id: "c1-oud-school",
    title: "مدرسة العود",
    slug: "oud-school",
    track_category: "مدرسة التراث",
    description:
      "تعلّم على يد خبراء مدرّبين على الأسلوب الموسيقي الكلاسيكي الأصيل. تعرّف على فنون العزف والألحان الأندلسية.",
    instructor_name: "طارق العود",
    image_url: "/assets/academy-oud.png",
    display_order: 1,
    is_published: true,
  },
  {
    id: "c2-performance-art",
    title: "فن الأداء",
    slug: "performance-art",
    track_category: "فن الأداء",
    description:
      "طوّر أداءك المسرحي، تعلّم وقوف الجمهور ووجود المسرح أمام جماهير حقيقية في بيئة آمنة.",
    instructor_name: "هيئة التدريب",
    image_url: "/assets/academy-performance.png",
    display_order: 2,
    is_published: true,
  },
  {
    id: "c3-vocal-tarab",
    title: "الصوت والطرب",
    slug: "vocal-tarab",
    track_category: "صوت ومجموع",
    description:
      "تعرّف على معلمين من الكفاءة العالية وتعلّم فنون الغناء والطرب المعاصر والكلاسيكي.",
    instructor_name: "سارة الصوت",
    image_url: "/assets/academy-vocal.png",
    display_order: 3,
    is_published: true,
  },
];

export function findCanonicalAcademyCourse(slug: string): AcademyCourse | null {
  if (!slug) return null;
  return CANONICAL_ACADEMY_COURSES.find((c) => c.slug === slug) || null;
}

export const NEWSLETTER_MESSAGES = {
  SUCCESS: "تم الاشتراك بنجاح في النشرة البريدية.",
  ALREADY_SUBSCRIBED: "أنت مسجل بالفعل في قائمتنا البريدية.",
  INVALID_EMAIL: "يرجى إدخال بريد إلكتروني صحيح.",
  SERVER_ERROR: "حدث خطأ أثناء تسجيل اشتراكك. يرجى المحاولة لاحقاً.",
} as const;

/**
 * Pure validation helper for visitor newsletter submissions.
 */
export function validateNewsletterEmail(rawEmail: unknown): {
  success: boolean;
  email?: string;
  error?: string;
} {
  const result = publicNewsletterSubmissionSchema.safeParse({ email: rawEmail });
  if (!result.success) {
    const errorMsg =
      result.error.errors[0]?.message || NEWSLETTER_MESSAGES.INVALID_EMAIL;
    return { success: false, error: errorMsg };
  }
  return { success: true, email: result.data.email };
}
