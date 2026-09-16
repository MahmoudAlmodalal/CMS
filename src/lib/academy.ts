import { publicNewsletterSubmissionSchema } from "./validations/newsletter.ts";

export interface CurriculumItem {
  number: string;
  title: string;
  title_en?: string | null;
  body: string;
  body_en?: string | null;
}

export interface AcademyCourse {
  id: string;
  title: string;
  slug: string;
  track_category: string;
  description: string;
  instructor_name?: string | null;
  /** Optional English translations; null falls back to the Arabic field. */
  title_en?: string | null;
  track_category_en?: string | null;
  description_en?: string | null;
  instructor_name_en?: string | null;
  instructor_id?: string | null;
  image_url?: string | null;
  display_order: number;
  is_published: boolean;
  // Detail sidebar fields
  price?: string | null;
  price_en?: string | null;
  duration?: string | null;
  duration_en?: string | null;
  group_size?: string | null;
  group_size_en?: string | null;
  certificate?: string | null;
  certificate_en?: string | null;
  language?: string | null;
  language_en?: string | null;
  // Detail body fields
  offer_text?: string | null;
  offer_text_en?: string | null;
  philosophy_text?: string | null;
  philosophy_text_en?: string | null;
  practice_text?: string | null;
  practice_text_en?: string | null;
  curriculum_title?: string | null;
  curriculum_title_en?: string | null;
  curriculum_items?: CurriculumItem[] | null;
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
    title_en: "Oud School",
    slug: "oud-school",
    track_category: "مدرسة التراث",
    track_category_en: "Heritage School",
    description:
      "تعلّم على يد خبراء مدرّبين على الأسلوب الموسيقي الكلاسيكي الأصيل. تعرّف على فنون العزف والألحان الأندلسية.",
    description_en:
      "Learn from experts trained in authentic classical music style. Discover the arts of playing and Andalusian melodies.",
    instructor_name: "طارق العود",
    instructor_name_en: "Tariq Al-Oud",
    image_url: "/assets/academy-oud.png",
    display_order: 1,
    is_published: true,
    price: "٤٥٠ دولار",
    price_en: "$450",
    duration: "٢٤ يوماً مكثفاً",
    duration_en: "24 intensive days",
    group_size: "٨ مشاركين كحد أقصى",
    group_size_en: "Maximum 8 participants",
    certificate: "شهادة إتمام رسمية ✓",
    certificate_en: "Official completion certificate ✓",
    language: "العربية",
    language_en: "Arabic",
    offer_text: "نعلّمك على يد عازفين محترفين مدرّبين على الأسلوب الموسيقي الكلاسيكي الأصيل، في فنون العزف والألحان الأندلسية.",
    offer_text_en: "Learn from professional musicians trained in authentic classical style, the arts of playing and Andalusian melodies.",
    philosophy_text: "ندرس في البرنامج قانوناً نشطاً يمرّون على خشبات المسرح كل أسبوع، وليس أكاديميين منعزلين عن الواقع الفني. هذا يعني أنك تتعلم العزف داخل العائلة الموسيقية الحقيقية.",
    philosophy_text_en: "The programme is led by active musicians who perform on stage every week, not academics detached from the artistic reality. You learn inside a real musical family.",
    practice_text: "البرنامج مصمم للمبتدئين الجادين والمحترفين الراغبين في تعميق مستواهم. يشترط امتلاك آلة عود والقدرة على عزف مقطوعة قصيرة.",
    practice_text_en: "Designed for serious beginners and experienced players who want to deepen their craft. Participants should own an oud and be able to play a short piece.",
    curriculum_title: "تقسيمة المساق",
    curriculum_title_en: "Course breakdown",
    curriculum_items: [
      { number: "7", title: "تقنيات الأساسيات", title_en: "Foundational techniques", body: "وضعية العود، الريشة، المقامات الثلاثة الأولى", body_en: "Oud posture, plectrum, first three maqams" },
      { number: "14", title: "تعلم النغم والإيقاع", title_en: "Melody and rhythm", body: "التقنيات المتقدمة، التمرين التحريري الحر", body_en: "Advanced techniques and free practice" },
      { number: "3", title: "العزف الأول الحقيقي", title_en: "Your first real performance", body: "تسجيل مقطوعة عود كاملة أمام جمهور حقيقي", body_en: "Record a complete oud piece before a real audience" },
    ],
  },
  {
    id: "c2-performance-art",
    title: "فن الأداء",
    title_en: "Performance Art",
    slug: "performance-art",
    track_category: "فن الأداء",
    track_category_en: "Performance Art",
    description:
      "طوّر أداءك المسرحي، تعلّم وقوف الجمهور ووجود المسرح أمام جماهير حقيقية في بيئة آمنة.",
    description_en:
      "Enhance your theatrical performance, learn audience presence and stage presence in front of real audiences in a safe environment.",
    instructor_name: "هيئة التدريب",
    instructor_name_en: "Training Faculty",
    image_url: "/assets/academy-performance.png",
    display_order: 2,
    is_published: true,
    price: "٥٠٠ دولار",
    price_en: "$500",
    duration: "١٨ يوماً مكثفاً",
    duration_en: "18 intensive days",
    group_size: "١٠ مشاركين كحد أقصى",
    group_size_en: "Maximum 10 participants",
    certificate: "شهادة إتمام رسمية ✓",
    certificate_en: "Official completion certificate ✓",
    language: "العربية والإنجليزية",
    language_en: "Arabic & English",
    offer_text: "برنامج تدريبي فريد يركز على الحضور المسرحي والثقة والتفاعل المباشر مع الجمهور.",
    offer_text_en: "A unique training programme focused on stage presence, confidence, and direct audience interaction.",
    philosophy_text: "المسرح ليس مكاناً للخوف بل مساحة للتعبير الصادق والتواصل الإنساني العميق.",
    philosophy_text_en: "The stage is not a place for fear, but a space for honest expression and deep human connection.",
    practice_text: "البرنامج مفتوح لجميع المؤدين والعازفين والمغنين الراغبين في صقل شخصيتهم الفنية أمام الجمهور.",
    practice_text_en: "Open to all performers, instrumentalists, and singers who wish to refine their artistic presence on stage.",
    curriculum_title: "تقسيمة المساق",
    curriculum_title_en: "Course breakdown",
    curriculum_items: [
      { number: "6", title: "لغة الجسد والحضور", title_en: "Body Language & Presence", body: "الوقوف، التنفس، وإدارة التوتر على المسرح", body_en: "Posture, breathing, and managing stage anxiety" },
      { number: "6", title: "التواصل مع الجمهور", title_en: "Audience Connection", body: "بناء الرابط العاطفي والتحكم بإيقاع العرض", body_en: "Building emotional connection and pacing the performance" },
      { number: "6", title: "العرض الختامي الحي", title_en: "Live Final Showcase", body: "تقديم عرض مسرحي كامل أمام لجنة وفنانين", body_en: "Delivering a full stage performance before panel and artists" },
    ],
  },
  {
    id: "c3-vocal-tarab",
    title: "الصوت والطرب",
    title_en: "Voice and Melody",
    slug: "vocal-tarab",
    track_category: "صوت ومجموع",
    track_category_en: "Voice and Ensemble",
    description:
      "تعرّف على معلمين من الكفاءة العالية وتعلّم فنون الغناء والطرب المعاصر والكلاسيكي.",
    description_en:
      "Meet highly qualified instructors and learn the arts of contemporary and classical singing.",
    instructor_name: "سارة الصوت",
    instructor_name_en: "Sarah Al-Sawt",
    image_url: "/assets/academy-vocal.png",
    display_order: 3,
    is_published: true,
    price: "٤٨٠ دولار",
    price_en: "$480",
    duration: "٢٠ يوماً مكثفاً",
    duration_en: "20 intensive days",
    group_size: "٦ مشاركين كحد أقصى",
    group_size_en: "Maximum 6 participants",
    certificate: "شهادة إتمام رسمية ✓",
    certificate_en: "Official completion certificate ✓",
    language: "العربية",
    language_en: "Arabic",
    offer_text: "إتقان مخارج الحروف، المقامات الشرقية، وأسرار الطرب الأندلسي مع نخبة المطربين.",
    offer_text_en: "Mastery of vocal projection, Eastern maqams, and Andalusian tarab secrets with top vocalists.",
    philosophy_text: "الصوت البشري هو أقدم الآلات وأصدقها، وتدريبه يتطلب صبراً ومعرفة بأسرار المقامات.",
    philosophy_text_en: "The human voice is the oldest and truest instrument; its training requires patience and deep knowledge of maqams.",
    practice_text: "يشترط وجود إحساس موسيقي أساسي والقدرة على أداء لحن بسيط بشكل صحيح.",
    practice_text_en: "Requires basic musical sense and the ability to sing a simple melody on pitch.",
    curriculum_title: "تقسيمة المساق",
    curriculum_title_en: "Course breakdown",
    curriculum_items: [
      { number: "5", title: "تمارين الصوت والتنفس", title_en: "Vocal & Breathing Exercises", body: "تقنيات الإحماء والتحكم في النفس وتوسيع المدى الصوتي", body_en: "Warm-ups, breath control, and vocal range expansion" },
      { number: "10", title: "المقامات والغناء الطربي", title_en: "Maqams & Tarab Singing", body: "دراسة المقامات الشرقية والتطريب وتلوين الصوت", body_en: "Study of Eastern maqams, tarab embellishments, and tonal coloring" },
      { number: "5", title: "تسجيل الأداء الصوتي", title_en: "Studio Recording Showcase", body: "تسجيل موشح أو مقطوعة كاملة في استوديو احترافي", body_en: "Recording a complete muwashshah or piece in a professional studio" },
    ],
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
