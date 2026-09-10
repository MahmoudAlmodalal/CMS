import { z } from "zod";

/**
 * Zod validation schema for admin article creation/update (Task 48).
 *
 * Key constraints:
 *  - slug: lowercase alphanumeric + hyphens, min 2, max 80. Uniqueness enforced at DB level.
 *  - title_ar: Arabic title, min 2 max 250
 *  - cover_url: optional http/https URL
 *  - content_ar: article body, min 20 max 50000
 *  - category: enum – news | culture | interview | announcement
 *  - is_featured: boolean flag
 *  - publish_now: action helper (not stored in DB), sets published_at = now()
 */

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const ARTICLE_ADMIN_CATEGORIES = [
  "news",
  "culture",
  "interview",
  "announcement",
] as const;

export const articleSchema = z.object({
  slug: z
    .string({ message: "المعرف اللطيف مطلوب" })
    .transform((v) => v.trim().toLowerCase())
    .refine((v) => v.length >= 2, { message: "يجب ألا يقل المعرف عن حرفين" })
    .refine((v) => v.length <= 80, { message: "يجب ألا يتجاوز المعرف 80 حرفاً" })
    .refine((v) => SLUG_REGEX.test(v), {
      message: "يجب أن يحتوي المعرف على أحرف إنجليزية صغيرة وأرقام وشرطات فقط",
    }),
  title_ar: z
    .string({ message: "العنوان بالعربية مطلوب" })
    .transform((v) => v.trim())
    .refine((v) => v.length >= 2, { message: "يجب ألا يقل العنوان عن حرفين" })
    .refine((v) => v.length <= 250, { message: "يجب ألا يتجاوز العنوان 250 حرفاً" }),
  cover_url: z
    .string()
    .transform((v) => v.trim())
    .refine(
      (v) => {
        if (!v) return true;
        try {
          const u = new URL(v);
          return u.protocol === "http:" || u.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "يجب أن يكون رابط الغلاف عنوان ويب صالح" }
    )
    .optional()
    .or(z.literal("")),
  content_ar: z
    .string({ message: "المحتوى بالعربية مطلوب" })
    .transform((v) => v.trim())
    .refine((v) => v.length >= 20, { message: "يجب ألا يقل المحتوى عن 20 حرفاً" })
    .refine((v) => v.length <= 50000, { message: "يجب ألا يتجاوز المحتوى 50000 حرف" }),
  category: z.enum(ARTICLE_ADMIN_CATEGORIES, {
    message: "تصنيف المقال غير صالح، الخيارات: news, culture, interview, announcement",
  }),
  is_featured: z.boolean().default(false),
  /** Action-only helper: if true, set published_at = now() on create/update */
  publish_now: z.boolean().default(false),
});

export type ArticleInput = z.infer<typeof articleSchema>;
