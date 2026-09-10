import { z } from "zod";

/**
 * Zod validation schema for the admin Academy Course form.
 *
 * Field mapping to DB columns:
 *   title_ar        → title (displayed in Arabic)
 *   description_ar  → description
 *   instructor_id   → instructor_id (FK artists.id, optional)
 *   image_url       → image_url (optional URL)
 *   signup_copy_ar  → stored as extra metadata
 *   is_published    → is_published
 *   ordering        → display_order
 */
export const courseSchema = z.object({
  title_ar: z
    .string({ required_error: "عنوان الدورة مطلوب" })
    .min(2, { message: "عنوان الدورة يجب أن يكون حرفين على الأقل" })
    .max(200, { message: "عنوان الدورة يجب ألا يتجاوز 200 حرف" }),

  description_ar: z
    .string({ required_error: "وصف الدورة مطلوب" })
    .min(10, { message: "وصف الدورة يجب أن يكون 10 أحرف على الأقل" })
    .max(3000, { message: "وصف الدورة يجب ألا يتجاوز 3000 حرف" }),

  instructor_id: z
    .string()
    .uuid({ message: "معرّف المدرب يجب أن يكون UUID صالحاً" })
    .optional()
    .nullable(),

  image_url: z
    .union([
      z.string().url({ message: "رابط الصورة يجب أن يكون URL صالحاً" }).max(500),
      z.literal(""),
    ])
    .optional()
    .nullable()
    .transform((v) => v || null),

  signup_copy_ar: z
    .string()
    .max(500, { message: "نص التسجيل يجب ألا يتجاوز 500 حرف" })
    .optional()
    .nullable(),

  is_published: z.boolean({ required_error: "حالة النشر مطلوبة" }),

  ordering: z
    .number({
      required_error: "الترتيب مطلوب",
      invalid_type_error: "الترتيب يجب أن يكون رقماً",
    })
    .int({ message: "الترتيب يجب أن يكون عدداً صحيحاً" })
    .min(0, { message: "الترتيب يجب أن يكون 0 أو أكثر" })
    .max(9999, { message: "الترتيب يجب ألا يتجاوز 9999" }),
});

export type CourseInput = z.infer<typeof courseSchema>;
