"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import {
  publicBookingSubmissionSchema,
  type PublicBookingSubmission,
  type BookingActionState,
} from "@/lib/validations/booking";

export type { BookingActionState };

/**
 * Sanitizes form data by converting empty strings or sentinel values to null
 * so optional fields (phone, budget, uuids) validate cleanly under Zod.
 */
function sanitizeFormData(formData: FormData): Record<string, unknown> {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    // React/Next add $ACTION_* bookkeeping fields to action FormData; the strict schema would reject them.
    if (key.startsWith("$ACTION")) continue;
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

/** Arabic keeps its source text; other locales read booking.server.* so /en never shows Arabic errors. */
async function serverMessages() {
  const locale = await getLocale();
  const t = await getTranslations("booking.server");
  return (key: string, arabic: string) => (locale === "ar" ? arabic : t(key as never));
}

/** Arabic source copy for an accepted submission; the honeypot reply must match it exactly. */
const BOOKING_SUCCESS_AR =
  "تم استلام طلبك بنجاح! سنتواصل معك خلال ٤٨ ساعة لمناقشة التفاصيل وتأكيد الحجز.";

/** The booking_requests rate-limit trigger raises P0001 with this hint. */
function isRateLimitRejection(error: { code?: string; message?: string; hint?: string | null }): boolean {
  return (
    error.hint === "BOOKING_RATE_LIMIT" ||
    (error.code === "P0001" && (error.message ?? "").includes("booking rate limit"))
  );
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
  const msg = await serverMessages();

  // Honeypot, same convention as the newsletter's _hp field: a hidden input no
  // person can see or tab into. Answer a bot with the success it expects rather
  // than an error that tells it what to change.
  const honeypot = formData.get("_hp");
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return { success: true, message: msg("success", BOOKING_SUCCESS_AR) };
  }

  const sanitized = sanitizeFormData(formData);
  const validated = publicBookingSubmissionSchema.safeParse(sanitized);

  if (!validated.success) {
    const flattened = validated.error.flatten();
    return {
      success: false,
      error: msg("invalid", "يرجى تصحيح الأخطاء الواردة في النموذج قبل المتابعة."),
      fieldErrors: Object.fromEntries(
        Object.entries(flattened.fieldErrors).map(([field, errors]) => [field, [msg(`field_${field}`, errors?.[0] ?? "")]]),
      ),
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
      // The rate-limit trigger (20260922000000) refuses a fourth submission from
      // one email inside ten minutes. That is a refusal, not a failure, so say
      // so rather than telling a visitor to "try again later" — which is the one
      // thing that would make it worse.
      if (isRateLimitRejection(error)) {
        return {
          success: false,
          error: msg(
            "rateLimited",
            "لقد أرسلت عدة طلبات حجز خلال دقائق قليلة. سنتواصل معك قريباً — يرجى الانتظار قبل إرسال طلب جديد.",
          ),
        };
      }

      console.error("[Booking Submission DB Error]:", error.message);
      return {
        success: false,
        error: msg("saveFailed", "تعذر حفظ طلب الحجز في الوقت الحالي. يرجى المحاولة لاحقاً أو التواصل معنا مباشرة."),
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
      message: msg("success", BOOKING_SUCCESS_AR),
    };
  } catch (err: unknown) {
    console.error("[Booking Submission Exception]:", err instanceof Error ? err.message : String(err));
    return {
      success: false,
      error: msg("unexpected", "حدث خطأ غير متوقع أثناء معالجة الطلب. يرجى إعادة المحاولة."),
    };
  }
}
