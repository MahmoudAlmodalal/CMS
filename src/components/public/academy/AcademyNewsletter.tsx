"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { subscribeNewsletter } from "@/actions/newsletter";

/**
 * Academy newsletter band — Figma node 91:16420 in frame 91:16119.
 *
 * Full-bleed on the page's own cream, 96px of padding top and bottom, everything
 * centred:
 * - Heading (91:16423) in Qahwa Arabic 40/36 #2B1D14.
 * - Tagline (91:16425) in Cairo 16.8/25.2 primary-500, 8px down.
 * - Form (91:16427) 40px down, 652 wide and 51 tall: the email field first so
 *   Arabic puts it on the right — 491 wide on #ECE6D0 under a 1.333px 15% #2B1D14
 *   hairline at a 16px radius — then 12px of gap and the 149x44 primary-500 button.
 *
 * Two notes on the design's own copy. The button is the booking CTA component
 * dropped in whole, so it reads "أحجز الآن" over a form that subscribes; the label
 * is drawn as the design has it and the accessible name says what the control
 * really does. And the design draws no standfirst, no privacy line and no feedback
 * state, so those are rendered only once the reader submits.
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
        setFeedback({ type: "error", message: t("newsletterError") });
      }
    });
  };

  return (
    <section
      id="newsletter"
      aria-labelledby="academy-newsletter-heading"
      className="w-full px-6 py-24"
    >
      <div className="mx-auto flex w-full max-w-[1393px] flex-col items-center">
        <h2
          id="academy-newsletter-heading"
          className="text-center font-display text-[32px] leading-[36px] text-brand-espresso lg:whitespace-nowrap"
        >
          {t("newsletterHeading")}
        </h2>

        <p className="pt-2 text-center text-[16.8px] leading-[26px] text-brand-primary">
          {t("newsletterTagline")}
        </p>

        <form onSubmit={handleSubmit} className="w-full pt-10">
          {/* Honeypot: hidden from readers, caught on bots. */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="_hp_newsletter">{t("newsletterHoneypot")}</label>
            <input type="text" id="_hp_newsletter" name="_hp" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="-mx-[8.5px] flex w-auto items-start gap-3 lg:mx-auto lg:w-full lg:max-w-[652px]">
            <label htmlFor="academy-newsletter-email" className="sr-only">
              {t("newsletterPlaceholder")}
            </label>
            <input
              id="academy-newsletter-email"
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletterPlaceholder")}
              disabled={isPending}
              className="h-[51px] min-w-0 flex-1 rounded-[16px] border-[1.333px] border-[rgba(43,29,20,0.15)] bg-brand-surface px-4 py-[13.6px] text-start text-[14.4px] leading-normal text-brand-espresso transition-colors placeholder:text-[rgba(43,29,20,0.5)] focus:border-brand-primary focus:outline-hidden"
            />

            <button
              type="submit"
              disabled={isPending}
              aria-label={t("newsletterSubmitLabel")}
              className="h-11 w-[149px] shrink-0 rounded-[16px] bg-brand-primary text-[16px] font-bold leading-[24px] text-brand-tint transition-colors hover:bg-brand-primary-hover disabled:opacity-70"
            >
              {t("newsletterSubmit")}
            </button>
          </div>

          {feedback.message && (
            <div
              role="alert"
              aria-live="polite"
              className={`mx-auto mt-4 max-w-[652px] rounded-[16px] p-3.5 text-center text-sm font-medium ${
                feedback.type === "success"
                  ? "bg-brand-primary/15 text-brand-primary"
                  : "bg-alert-error/15 text-alert-error"
              }`}
            >
              {feedback.message}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
