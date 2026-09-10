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
 * The 3 canonical educational curriculum tracks confirmed by Figma and Content Inventory:
 * 1. "مدرسة العود" (oud-school) - مدرسة التراث
 * 2. "فن الأداء" (performance-art) - فن الأداء
 * 3. "الصوت والطرب" (vocal-tarab) - الصوت والطرب
 */
export const CANONICAL_ACADEMY_COURSES: AcademyCourse[] = [
  {
    id: "c1-oud-school",
    title: "مدرسة العود",
    slug: "oud-school",
    track_category: "مدرسة التراث",
    description:
      "برنامج تدريبي مكثف على أصول العزف والانتقال بين المقامات الموسيقية والارتجال المتقن والتكنيك الأندلسي الأصيل.",
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
      "تطوير الحضور المسرحي والتفاعل الحي مع الجمهور وبناء الثقة الإبداعية والتناغم الجماعي فوق خشبة المسرح.",
    instructor_name: "هيئة التدريب",
    image_url: "/assets/academy-performance.png",
    display_order: 2,
    is_published: true,
  },
  {
    id: "c3-vocal-tarab",
    title: "الصوت والطرب",
    slug: "vocal-tarab",
    track_category: "الصوت والطرب",
    description:
      "تقنيات التنفس السليم، تدريب الأحبال الصوتية، وأداء الموشحات والمقامات التراثية الأصيلة بإحساس فني عميق.",
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
