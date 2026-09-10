import { z } from "zod";

/**
 * Zod validation schema for admin testimonial creation/update (Task 48).
 *
 * Fields:
 *  - quote_ar: Arabic quote text, min 10 max 1000
 *  - author_name_ar: Arabic author name, min 2 max 120
 *  - author_role_ar: optional Arabic role, max 120
 *  - avatar_url: optional http/https URL
 *  - is_published: boolean
 *  - ordering: integer 0–9999 for display order
 */

export const testimonialSchema = z.object({
  quote_ar: z
    .string({ message: "الاقتباس مطلوب" })
    .transform((v) => v.trim())
    .refine((v) => v.length >= 10, { message: "يجب ألا يقل الاقتباس عن 10 أحرف" })
    .refine((v) => v.length <= 1000, { message: "يجب ألا يتجاوز الاقتباس 1000 حرف" }),
  author_name_ar: z
    .string({ message: "اسم الكاتب مطلوب" })
    .transform((v) => v.trim())
    .refine((v) => v.length >= 2, { message: "يجب ألا يقل الاسم عن حرفين" })
    .refine((v) => v.length <= 120, { message: "يجب ألا يتجاوز الاسم 120 حرفاً" }),
  author_role_ar: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length <= 120, { message: "يجب ألا يتجاوز المنصب 120 حرفاً" })
    .optional()
    .or(z.literal("")),
  avatar_url: z
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
      { message: "يجب أن يكون رابط الصورة عنوان ويب صالح" }
    )
    .optional()
    .or(z.literal("")),
  is_published: z.boolean().default(false),
  ordering: z
    .number({ message: "الترتيب يجب أن يكون رقماً" })
    .int({ message: "الترتيب يجب أن يكون عدداً صحيحاً" })
    .min(0, { message: "يجب ألا يقل الترتيب عن 0" })
    .max(9999, { message: "يجب ألا يتجاوز الترتيب 9999" })
    .default(0),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
