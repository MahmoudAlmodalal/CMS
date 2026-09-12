import { z } from "zod";
import {
  trimmedString,
  optionalTrimmedString,
  safeUrlSchema,
  emailSchema,
  phoneSchema,
  slugSchema,
  isoDateTimeSchema,
  uuidSchema,
  positiveInt,
  artistCategorySchema,
  releaseTypeSchema,
  eventCategorySchema,
  eventStatusSchema,
  articleCategorySchema,
  translationString,
} from "./primitives.ts";

// ============================================================================
// 1. Site Settings Schema (Singleton id='default')
// ============================================================================

const siteImageUrlSchema = z.union([z.literal(""), safeUrlSchema(500)]);

export const siteSettingsSchema = z
  .object({
    id: z.literal("default").default("default"),
    hero_headline: trimmedString(1, 255, "عنوان الهيرو الرئيسي"),
    hero_headline_en: translationString(255),
    hero_subheadline: trimmedString(1, 500, "العنوان الفرعي للهيرو"),
    hero_subheadline_en: translationString(500),
    hero_image_url: siteImageUrlSchema,
    about_headline: trimmedString(1, 255, "عنوان قسم من نحن"),
    about_headline_en: translationString(255),
    about_body: trimmedString(1, 10000, "نص قسم من نحن"),
    about_body_en: translationString(10000),
    about_image_url: siteImageUrlSchema,
    booking_banner_title: trimmedString(1, 255, "عنوان بنر الحجز"),
    booking_banner_title_en: translationString(255),
    booking_banner_body: trimmedString(1, 5000, "نص بنر الحجز"),
    booking_banner_body_en: translationString(5000),
    artists_subtitle: optionalTrimmedString(500).optional().nullable(),
    artists_subtitle_en: translationString(500),
    events_subtitle: optionalTrimmedString(500).optional().nullable(),
    events_subtitle_en: translationString(500),
    academy_subtitle: optionalTrimmedString(500).optional().nullable(),
    academy_subtitle_en: translationString(500),
    booking_subtitle: optionalTrimmedString(500).optional().nullable(),
    booking_subtitle_en: translationString(500),
    contact_email: emailSchema,
    contact_phone: phoneSchema,
    social_links: z
      .object({
        instagram: z.string().max(500).optional().default(""),
        tiktok: z.string().max(500).optional().default(""),
      })
      .default({ instagram: "", tiktok: "" }),
    operational_regions: trimmedString(1, 255, "مناطق النشاط"),
    operational_regions_en: translationString(255),
    footer_mission: trimmedString(1, 2000, "رسالة التذييل"),
    footer_mission_en: translationString(2000),
    copyright_text: trimmedString(1, 255, "نص حقوق النشر"),
    copyright_text_en: translationString(255),
  })
  .strict();

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

// ============================================================================
// 2. Artist Schema
// ============================================================================

export const artistSchema = z
  .object({
    id: uuidSchema.optional(),
    name: trimmedString(1, 150, "اسم الفنان"),
    name_en: translationString(150),
    slug: slugSchema(150),
    category: artistCategorySchema,
    genre_tag: trimmedString(1, 100, "وسم النمط الموسيقي"),
    genre_tag_en: translationString(100),
    city: trimmedString(1, 100, "المدينة"),
    city_en: translationString(100),
    quote: trimmedString(1, 1000, "الاقتباس الفني"),
    quote_en: translationString(1000),
    spotlight_quote: optionalTrimmedString(1000).optional().nullable(),
    spotlight_quote_en: translationString(1000),
    short_bio: trimmedString(1, 1000, "نبذة مختصرة"),
    short_bio_en: translationString(1000),
    full_bio: trimmedString(1, 20000, "السيرة الذاتية الكاملة"),
    full_bio_en: translationString(20000),
    specialties: trimmedString(1, 255, "التخصصات"),
    specialties_en: translationString(255),
    portrait_image_url: safeUrlSchema(500),
    is_featured: z.boolean().default(false),
    is_published: z.boolean().default(true),
    display_order: z.number().int().min(0).default(0),
  })
  .strict();

export type ArtistInput = z.infer<typeof artistSchema>;

// ============================================================================
// 3. Track Schema
// ============================================================================

export const trackSchema = z
  .object({
    id: uuidSchema.optional(),
    artist_id: uuidSchema,
    title: trimmedString(1, 200, "عنوان المقطع الصوتي"),
    title_en: translationString(200),
    audio_file_url: safeUrlSchema(500),
    duration_seconds: positiveInt(7200),
    cover_image_url: safeUrlSchema(500).optional().nullable(),
    display_order: z.number().int().min(0).default(0),
    is_published: z.boolean().default(true),
  })
  .strict();

export type TrackInput = z.infer<typeof trackSchema>;

// ============================================================================
// 4. Release Schema
// ============================================================================

export const releaseSchema = z
  .object({
    id: uuidSchema.optional(),
    artist_id: uuidSchema,
    title: trimmedString(1, 200, "عنوان الألبوم/الإصدار"),
    title_en: translationString(200),
    release_type: releaseTypeSchema,
    track_count: positiveInt(100),
    release_year: z
      .number({ message: "سنة الإصدار يجب أن تكون رقماً صحيحاً" })
      .int({ message: "سنة الإصدار يجب أن تكون رقماً صحيحاً" })
      .min(1900, { message: "سنة الإصدار يجب أن تكون 1900 أو أحدث" })
      .max(2100, { message: "سنة الإصدار يجب ألا تتجاوز 2100" }),
    cover_image_url: safeUrlSchema(500),
    display_order: z.number().int().min(0).default(0),
    is_published: z.boolean().default(true),
  })
  .strict();

export type ReleaseInput = z.infer<typeof releaseSchema>;

// ============================================================================
// 5. Event Schema
// ============================================================================

export const eventSchema = z
  .object({
    id: uuidSchema.optional(),
    title: trimmedString(1, 200, "عنوان الفعالية"),
    title_en: translationString(200),
    slug: slugSchema(200),
    category: eventCategorySchema,
    event_date: isoDateTimeSchema,
    location: trimmedString(1, 200, "المكان والبلد"),
    location_en: translationString(200),
    city: trimmedString(1, 100, "المدينة"),
    city_en: translationString(100),
    performer_name: trimmedString(1, 150, "اسم المؤدي أو الفرقة"),
    performer_name_en: translationString(150),
    artist_id: uuidSchema.optional().nullable(),
    description: optionalTrimmedString(5000).optional().nullable(),
    description_en: translationString(5000),
    image_url: safeUrlSchema(500),
    ticket_url: safeUrlSchema(500).optional().nullable(),
    is_featured: z.boolean().default(false),
    status: eventStatusSchema.default("upcoming"),
    is_published: z.boolean().default(true),
    display_order: z.number().int().min(0).default(0),
  })
  .strict();

export type EventInput = z.infer<typeof eventSchema>;

// ============================================================================
// 6. Academy Course Track Schema
// ============================================================================

export const academyCourseSchema = z
  .object({
    id: uuidSchema.optional(),
    title: trimmedString(1, 150, "عنوان المسار التعليمي"),
    title_en: translationString(150),
    slug: slugSchema(150),
    track_category: trimmedString(1, 100, "تصنيف المسار"),
    track_category_en: translationString(100),
    description: trimmedString(1, 5000, "وصف المسار"),
    description_en: translationString(5000),
    instructor_name: optionalTrimmedString(150).optional().nullable(),
    instructor_name_en: translationString(150),
    instructor_id: uuidSchema.optional().nullable(),
    image_url: safeUrlSchema(500).optional().nullable(),
    display_order: z
      .number({ message: "الترتيب يجب أن يكون رقماً صحيحاً" })
      .int({ message: "الترتيب يجب أن يكون رقماً صحيحاً" })
      .min(1, { message: "الترتيب يجب أن يكون بين 1 و 10" })
      .max(10, { message: "الترتيب يجب أن يكون بين 1 و 10" })
      .default(1),
    is_published: z.boolean().default(true),
  })
  .strict();

export type AcademyCourseInput = z.infer<typeof academyCourseSchema>;

// ============================================================================
// 7. Article Schema
// ============================================================================

export const articleSchema = z
  .object({
    id: uuidSchema.optional(),
    title: trimmedString(1, 250, "عنوان المقال"),
    title_en: translationString(250),
    slug: slugSchema(250),
    category: articleCategorySchema,
    excerpt: trimmedString(1, 350, "المقتطف الصحفي"),
    excerpt_en: translationString(350),
    content: trimmedString(1, 50000, "محتوى المقال الكامل"),
    content_en: translationString(50000),
    cover_image_url: safeUrlSchema(500),
    author_name: trimmedString(1, 150, "اسم الكاتب أو هيئة التحرير"),
    author_name_en: translationString(150),
    featured_artist_id: uuidSchema.optional().nullable(),
    published_at: isoDateTimeSchema,
    is_featured: z.boolean().default(false),
    is_published: z.boolean().default(true),
  })
  .strict();

export type ArticleInput = z.infer<typeof articleSchema>;

// ============================================================================
// 8. Testimonial Schema
// ============================================================================

export const testimonialSchema = z
  .object({
    id: uuidSchema.optional(),
    quote: trimmedString(1, 1000, "نص الشهادة أو التزكية"),
    quote_en: translationString(1000),
    author_name: trimmedString(1, 150, "اسم صاحب الشهادة"),
    author_name_en: translationString(150),
    author_role: trimmedString(1, 150, "صفة أو مهنة صاحب الشهادة"),
    author_role_en: translationString(150),
    avatar_image_url: safeUrlSchema(500).optional().nullable(),
    display_order: z.number().int().min(0).default(0),
    is_published: z.boolean().default(true),
  })
  .strict();

export type TestimonialInput = z.infer<typeof testimonialSchema>;
