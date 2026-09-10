'use server';

import { createClient } from "@/lib/supabase/server";
import {
  NEWSLETTER_MESSAGES,
  validateNewsletterEmail,
} from "@/lib/academy";

export interface NewsletterActionState {
  success: boolean;
  message: string;
  error?: string | null;
}

/**
 * Server Action for subscribing a visitor to the newsletter on /academy.
 * 
 * Security & Data Model:
 * - Validates email via Zod (publicNewsletterSubmissionSchema via validateNewsletterEmail).
 * - Enforces honeypot protection (_hp) to silently neutralize spam bots.
 * - Inserts into newsletter_subscribers with status = 'subscribed'.
 * - Relies on RLS policy: newsletter_subscribers_insert_public (anon/authenticated write-only).
 * - Handles duplicate email safely without leaking sensitive information.
 */
export async function subscribeNewsletter(
  _prevState: NewsletterActionState,
  formData: FormData
): Promise<NewsletterActionState> {
  // Honeypot check: if bot filled out hidden field, fake success
  const honeypot = formData.get("_hp") as string | null;
  if (honeypot && honeypot.trim().length > 0) {
    return {
      success: true,
      message: NEWSLETTER_MESSAGES.SUCCESS,
      error: null,
    };
  }

  const rawEmail = (formData.get("email") as string | null)?.trim() ?? "";

  // 1. Zod Validation
  const validation = validateNewsletterEmail(rawEmail);
  if (!validation.success || !validation.email) {
    const errorMsg = validation.error || NEWSLETTER_MESSAGES.INVALID_EMAIL;
    return {
      success: false,
      message: errorMsg,
      error: errorMsg,
    };
  }

  const { email } = validation;

  // 2. Database Insertion (if configured)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Graceful offline/demo fallback
    return {
      success: true,
      message: NEWSLETTER_MESSAGES.SUCCESS,
      error: null,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email,
      status: "subscribed",
    } as unknown as { email: string; status: string });

    if (error) {
      // 23505: Unique violation (email already subscribed)
      if (error.code === "23505" || error.message.includes("unique")) {
        return {
          success: true,
          message: NEWSLETTER_MESSAGES.ALREADY_SUBSCRIBED,
          error: null,
        };
      }

      console.error("Newsletter subscription error:", error.message);
      return {
        success: false,
        message: NEWSLETTER_MESSAGES.SERVER_ERROR,
        error: error.message,
      };
    }

    return {
      success: true,
      message: NEWSLETTER_MESSAGES.SUCCESS,
      error: null,
    };
  } catch (err: unknown) {
    console.error("Newsletter submission exception:", err);
    return {
      success: false,
      message: "تعذر الاتصال بالخادم، يرجى التحقق من اتصالك والمحاولة مرة أخرى.",
      error: "Connection exception",
    };
  }
}
