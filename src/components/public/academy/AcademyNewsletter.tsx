'use client';

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/LayoutPrimitives";
import { Button } from "@/components/ui/Button";
import { subscribeNewsletter } from "@/actions/newsletter";

/**
 * Academy Newsletter Subscription Section
 * Figma Node: 91:16119 / 91:16420 / 91:16423 / 91:16425 / 91:16431 / 186:1061
 * - Heading: "رسالة واحدة في الشهر."
 * - Tagline: "♪ لكنها تستحق كل الانتظار."
 * - Validated Email ingestion into newsletter_subscribers
 * - Honeypot anti-spam protection
 */
export function AcademyNewsletter() {
  const t = useTranslations("academy");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback({ type: null, message: null });

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await subscribeNewsletter({ success: false, message: "" }, formData);
        if (result.success) {
          setFeedback({ type: "success", message: result.message });
          setEmail("");
        } else {
          setFeedback({ type: "error", message: result.message });
        }
      } catch {
        setFeedback({
          type: "error",
          message: t("newsletterError"),
        });
      }
    });
  };

  return (
    <section className="py-16 sm:py-20 bg-brand-espresso text-white relative overflow-hidden" id="newsletter">
      {/* Subtle background glow */}
      <div
        className="absolute top-1/2 end-10 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <Container className="relative z-10 max-w-3xl text-center">
        {/* Confirmed Figma Copy */}
        <h2 className="font-calligraphic text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-white">
          {t("newsletterHeading")}
        </h2>

        <p className="text-primary-400 font-bold text-lg sm:text-xl font-sans mb-8">
          {t("newsletterTagline")}
        </p>

        <p className="text-secondary-100/70 text-sm sm:text-base font-sans max-w-xl mx-auto mb-10 leading-relaxed">
          {t("newsletterBody")}
        </p>

        {/* Subscription Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 text-start">
          {/* Honeypot field (hidden from real users, caught by bots) */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="_hp_newsletter">{t("newsletterHoneypot")}</label>
            <input
              type="text"
              id="_hp_newsletter"
              name="_hp"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("newsletterPlaceholder")}
                dir="ltr"
                disabled={isPending}
                className="w-full h-[48px] bg-white/10 text-white placeholder:text-secondary-100/50 placeholder:text-sm placeholder:font-sans rounded-input px-4 py-3 border border-white/20 focus:outline-none focus:border-primary-400 focus:bg-white/15 transition-all text-start"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isPending}
              disabled={isPending}
              className="sm:w-auto px-8"
            >
              {t("newsletterSubmit")}
            </Button>
          </div>

          {/* Feedback messages */}
          {feedback.message && (
            <div
              role="alert"
              aria-live="polite"
              className={`p-3.5 rounded-button text-xs sm:text-sm font-sans font-medium text-center transition-all ${
                feedback.type === "success"
                  ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                  : "bg-alert-error/20 text-red-200 border border-alert-error/30"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <p className="text-center text-xs text-secondary-100/50 font-sans mt-3">
            {t("newsletterPrivacy")}
          </p>
        </form>
      </Container>
    </section>
  );
}
