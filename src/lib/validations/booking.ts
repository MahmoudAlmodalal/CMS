import { z } from "zod";
import {
  trimmedString,
  optionalTrimmedString,
  emailSchema,
  phoneSchema,
  dateStringSchema,
  uuidSchema,
  bookingEventTypeSchema,
  bookingStatusSchema,
} from "./primitives.ts";

// ============================================================================
// Public Booking Submission Schema (/booking)
// ============================================================================

/**
 * Validates public visitor booking inquiry submissions.
 * Uses .strict() to prevent parameter injection (status, admin_notes, id, etc.).
 */
export const publicBookingSubmissionSchema = z
  .object({
    full_name: trimmedString(2, 150, "الاسم الكامل"),
    email: emailSchema,
    phone: phoneSchema.optional().nullable(),
    budget_range: optionalTrimmedString(100).optional().nullable(),
    event_type: bookingEventTypeSchema,
    event_date: dateStringSchema.refine(
      (val) => {
        // Enforce event date is today or in the future
        const target = new Date(val + "T00:00:00Z");
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return target >= today;
      },
      { message: "تاريخ الفعالية لا يمكن أن يكون في الماضي" }
    ),
    preferred_artist: optionalTrimmedString(150).optional().nullable(),
    artist_id: uuidSchema.optional().nullable(),
    event_id: uuidSchema.optional().nullable(),
    message: trimmedString(5, 2000, "تفاصيل الحجز والرسالة"),
  })
  .strict();

export type PublicBookingSubmission = z.infer<typeof publicBookingSubmissionSchema>;

// ============================================================================
// Admin Booking Update Schema (Protected CMS Triage)
// ============================================================================

export const adminBookingUpdateSchema = z
  .object({
    status: bookingStatusSchema.optional(),
    admin_notes: optionalTrimmedString(5000).optional().nullable(),
  })
  .strict();

export type AdminBookingUpdate = z.infer<typeof adminBookingUpdateSchema>;
