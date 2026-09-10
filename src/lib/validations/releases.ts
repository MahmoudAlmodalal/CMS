/**
 * Zod validation schema for Releases/Albums (Task 45).
 */

import { z } from "zod";
import {
  trimmedString,
  safeUrlSchema,
  uuidSchema,
  releaseTypeSchema,
} from "./primitives.ts";

export const releaseSchema = z
  .object({
    id: uuidSchema.optional(),
    /** Arabic title — required, 1–200 chars */
    title: trimmedString(1, 200, "عنوان الألبوم/الإصدار"),
    artist_id: uuidSchema,
    release_type: releaseTypeSchema,
    track_count: z
      .number({ message: "عدد المقطوعات يجب أن يكون رقماً صحيحاً" })
      .int({ message: "عدد المقطوعات يجب أن يكون رقماً صحيحاً" })
      .min(1, { message: "يجب أن يحتوي الإصدار على مقطوعة واحدة على الأقل" })
      .max(100, { message: "عدد المقطوعات لا يمكن أن يتجاوز 100" }),
    release_year: z
      .number({ message: "سنة الإصدار يجب أن تكون رقماً صحيحاً" })
      .int({ message: "سنة الإصدار يجب أن تكون رقماً صحيحاً" })
      .min(1900, { message: "سنة الإصدار يجب أن تكون 1900 أو أحدث" })
      .max(2100, { message: "سنة الإصدار يجب ألا تتجاوز 2100" }),
    cover_image_url: safeUrlSchema(500),
    is_published: z.boolean().default(false),
    /** Display order 0–9999 */
    display_order: z
      .number({ message: "الترتيب يجب أن يكون رقماً صحيحاً" })
      .int({ message: "الترتيب يجب أن يكون رقماً صحيحاً" })
      .min(0, { message: "الترتيب يجب أن يكون صفراً أو أكبر" })
      .max(9999, { message: "الترتيب لا يمكن أن يتجاوز 9999" })
      .default(0),
  })
  .strict();

export type ReleaseInput = z.infer<typeof releaseSchema>;
