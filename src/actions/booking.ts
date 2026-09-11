"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import {
  publicBookingSubmissionSchema,
  type PublicBookingSubmission,
} from "@/lib/validations/booking";

export interface BookingActionState {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export const INITIAL_BOOKING_ACTION_STATE: BookingActionState = {
  success: false,
};

/**
 * Sanitizes form data by converting empty strings or sentinel values to null
 * so optional fields (phone, budget, uuids) validate cleanly under Zod.
 */
function sanitizeFormData(formData: FormData): Record<string, unknown> {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "" || trimmed === "none" || trimmed === "undefined" || trimmed === "null") {
        raw[key] = null;
      } else {
        raw[key] = trimmed;
      }
    } else {
      raw[key] = value;
    }
  }
  return raw;
}

/**
 * Server Action: Ingests public booking inquiries.
 * 
 * Security & RLS Compliance:
 * - Enforces zero public query capability: booking inquiries are strictly write-only.
 * - Enforces initial status = 'pending' and admin_notes = null to comply with RLS policy:
 *   "booking_requests_insert_public"
 * - Revalidates /admin/bookings so triage administrators immediately see incoming leads.
 */
export async function submitBookingAction(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const sanitized = sanitizeFormData(formData);
  const validated = publicBookingSubmissionSchema.safeParse(sanitized);

  if (!validated.success) {
    const flattened = validated.error.flatten();
    return {
      success: false,
      error: "يرجى تصحيح الأخطاء الواردة في النموذج قبل المتابعة.",
      fieldErrors: flattened.fieldErrors,
    };
  }

  const submission: PublicBookingSubmission = validated.data;

  try {
    const supabase = await createClient();

    const bookingRequest: Database["public"]["Tables"]["booking_requests"]["Insert"] = {
      full_name: submission.full_name,
      email: submission.email,
      phone: submission.phone ?? null,
      budget_range: submission.budget_range ?? null,
      event_type: submission.event_type,
      event_date: submission.event_date,
      preferred_artist: submission.preferred_artist ?? null,
      artist_id: submission.artist_id ?? null,
      event_id: submission.event_id ?? null,
      message: submission.message,
      status: "pending",
      admin_notes: null,
    };
    const { error } = await supabase.from("booking_requests").insert(bookingRequest);

    if (error) {
      console.error("[Booking Submission DB Error]:", error.message);
      return {
        success: false,
        error: "تعذر حفظ طلب الحجز في الوقت الحالي. يرجى المحاولة لاحقاً أو التواصل معنا مباشرة.",
      };
    }

    // Revalidate admin bookings inbox
    try {
      revalidatePath("/admin/bookings");
    } catch {
      // Ignore during testing or static generation
    }

    return {
      success: true,
      message: "تم استلام طلبك بنجاح! سنتواصل معك خلال ٤٨ ساعة لمناقشة التفاصيل وتأكيد الحجز.",
    };
  } catch (err: unknown) {
    console.error("[Booking Submission Exception]:", err instanceof Error ? err.message : String(err));
    return {
      success: false,
      error: "حدث خطأ غير متوقع أثناء معالجة الطلب. يرجى إعادة المحاولة.",
    };
  }
}
