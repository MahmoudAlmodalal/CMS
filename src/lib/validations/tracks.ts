/**
 * Zod validation schema for Tracks (Task 45).
 *
 * Audio file limit: 30 MB enforced at upload time (Task 50).
 * URL validation here only checks format; file size is a storage concern.
 */

import { z } from "zod";
import {
  trimmedString,
  safeUrlSchema,
  uuidSchema,
} from "./primitives.ts";

export const trackSchema = z
  .object({
    id: uuidSchema.optional(),
    /** Arabic title — required, 1–200 chars */
    title: trimmedString(1, 200, "عنوان المقطع الصوتي"),
    artist_id: uuidSchema,
    /**
     * Audio file URL (required).
     * NOTE: 30 MB upload limit is enforced at storage layer (Task 50),
     * not here. This only validates that the URL is a valid HTTP/HTTPS URL.
     */
    audio_file_url: safeUrlSchema(500),
    /** Optional cover image URL */
    cover_image_url: safeUrlSchema(500).optional().nullable(),
    /** Duration in seconds: 1 – 7200 (2 hours max) */
    duration_seconds: z
      .number({ message: "مدة المقطع يجب أن تكون رقماً صحيحاً" })
      .int({ message: "مدة المقطع يجب أن تكون رقماً صحيحاً" })
      .min(1, { message: "مدة المقطع يجب أن تكون ثانية واحدة على الأقل" })
      .max(7200, { message: "مدة المقطع لا يمكن أن تتجاوز 7200 ثانية (ساعتين)" }),
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

export type TrackInput = z.infer<typeof trackSchema>;
