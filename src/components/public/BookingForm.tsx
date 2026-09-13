"use client";

import React, { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { submitBookingAction, INITIAL_BOOKING_ACTION_STATE } from "@/actions/booking";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import type { BookingArtistOption } from "@/lib/dal/booking";

interface BookingFormProps {
  artists: BookingArtistOption[];
  defaultArtistId?: string;
  defaultEventId?: string;
  defaultEventType?: string;
  defaultMessage?: string;
  defaultPreferredArtist?: string;
}

/** Option values are stored verbatim; labels come from the `booking` message namespace. */
const EVENT_TYPE_OPTIONS = [
  { value: "private_concert", labelKey: "occasionPrivateConcert" },
  { value: "wedding", labelKey: "occasionWedding" },
  { value: "festival", labelKey: "occasionFestival" },
  { value: "hotel", labelKey: "occasionHotel" },
  { value: "other", labelKey: "occasionOther" },
];

/**
 * Figma 91:17109 form geometry, node by node.
 *
 * Controls (91:17182 and siblings) are a flat 48px on a 16px radius with a
 * 1.333px rgba(43,29,20,0.12) hairline, 16px of horizontal padding and Cairo
 * 12/15 placeholders in gradscale-400. Labels (91:17180) are Cairo Bold 13/19.5
 * in gradscale-900 with 7.2px of lead-out. The form itself carries no card: it
 * sits straight on the page surface, 672 wide.
 */
const FIELD_CLASS =
  "h-12 w-full rounded-[16px] border-[1.333px] bg-white px-4 text-[13px] leading-[19.5px] text-brand-espresso transition-colors placeholder:text-[12px] placeholder:leading-[15px] placeholder:text-gradscale-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30";
const SELECT_CLASS = `${FIELD_CLASS} appearance-none pe-10`;
const TEXTAREA_CLASS =
  "h-[138px] w-full resize-none rounded-[16px] border-[1.333px] bg-white px-4 py-[13.6px] text-[13px] leading-[19.5px] text-brand-espresso transition-colors placeholder:text-[12px] placeholder:leading-[15px] placeholder:text-gradscale-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30";
const FIELD_BORDER = "border-[rgba(43,29,20,0.12)] hover:border-brand-primary/50";
const FIELD_BORDER_ERROR = "border-alert-error ring-1 ring-alert-error/20";
const LABEL_CLASS = "block pb-[7.2px] text-[13px] font-bold leading-[19.5px] text-gradscale-900";
const LEGEND_CLASS =
  "flex w-full items-center gap-2 border-b-2 border-[rgba(198,72,23,0.12)] pb-3 text-start text-[16px] font-bold leading-[24px] text-brand-primary";

/**
 * Booking Form Component
 * Verified against Figma Screen "الحجز" (Node 91:17109 / Form Frame 91:17171):
 * - Form Group 1: "♪ معلوماتك الشخصية" (Node 91:17174)
 * - Form Group 2: "♪ تفاصيل المناسبة" (Node 91:17207)
 * - Legal Terms notice (Node 91:17246)
 * - Primary Action CTA: "أرسل الطلب" (Node 186:1827)
 * 
 * Interactivity:
 * - Powered by React 19 useActionState + Server Action submitBookingAction
 * - Inline validation error feedback with ARIA accessibility
 * - Safe success state without leaking private CRM records
 */
export function BookingForm({
  artists,
  defaultArtistId,
  defaultEventId,
  defaultEventType = "private_concert",
  defaultMessage = "",
  defaultPreferredArtist = "",
}: BookingFormProps) {
  const t = useTranslations("booking");
  const [state, formAction, isPending] = useActionState(
    submitBookingAction,
    INITIAL_BOOKING_ACTION_STATE
  );

  const [selectedArtistId, setSelectedArtistId] = useState<string>(defaultArtistId || "");
  const [submittedAgainKey, setSubmittedAgainKey] = useState<number>(0);

  // Calculate today's date formatted as YYYY-MM-DD for native datepicker min constraint
  const todayStr = new Date().toISOString().split("T")[0];

  if (state.success) {
    return (
      <div className="w-full bg-white rounded-2xl p-8 sm:p-12 border border-brand-espresso/10 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-6">
          <CheckIcon size={32} />
        </div>

        <h2 className="font-calligraphic text-2xl sm:text-3xl font-bold text-brand-espresso mb-3">
          {t("successTitle")}
        </h2>

        <p className="max-w-lg mx-auto text-base text-brand-espresso/80 leading-relaxed mb-8">
          {state.message || t("successBody")}
        </p>

        <div className="p-4 rounded-xl bg-brand-cream/60 border border-brand-espresso/5 max-w-md mx-auto mb-8 text-start text-xs text-brand-espresso/70 space-y-1">
          <p className="font-semibold text-brand-espresso">{t("successNoteLabel")}</p>
          <p>{t("successNote")}</p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setSubmittedAgainKey((k) => k + 1);
            // Reset to clean state by reloading or re-rendering
            window.location.href = "/booking";
          }}
          className="px-8"
        >
          {t("successAgain")}
        </Button>
      </div>
    );
  }

  return (
    <form
      key={submittedAgainKey}
      action={formAction}
      noValidate
      className="flex w-full flex-col text-start pb-[52.8px] lg:w-[672px]"
    >
      {/* Hidden Event Preselection Linkage */}
      {defaultEventId && <input type="hidden" name="event_id" value={defaultEventId} />}

      {/* The design draws no free-text artist field — node 91:17222 is the artist
          select alone — but arriving from an event or an artist page still carries a
          performer name the request should record, so it travels hidden. */}
      {defaultPreferredArtist && (
        <input type="hidden" name="preferred_artist" value={defaultPreferredArtist} />
      )}

      {/* General Alert Error Banner */}
      {state.error && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-xl bg-red-50 text-red-800 text-sm border border-red-200 flex items-start gap-3"
        >
          <span className="text-alert-error font-bold shrink-0 mt-0.5">⚠️</span>
          <div>
            <p className="font-semibold">{state.error}</p>
            {state.fieldErrors && Object.keys(state.fieldErrors).length > 0 && (
              <ul className="mt-2 list-disc list-inside text-xs space-y-0.5 text-red-700">
                {Object.entries(state.fieldErrors).map(([field, msgs]) => (
                  <li key={field}>{msgs[0]}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* Group 1: Personal Information (Figma Node 91:17174)                 */}
      {/* ================================================================== */}
      <fieldset className="m-0 flex flex-col border-0 p-0">
        <legend className={LEGEND_CLASS}>
          <span>♪</span>
          <span>{t("groupPersonal")}</span>
        </legend>

        <div className="grid grid-cols-2 gap-4 pt-6 md:grid-cols-[318px_246px]">
          {/* Full Name */}
          <div className="flex flex-col text-start">
            <label htmlFor="full_name" className={LABEL_CLASS}>
              {t("fieldName")} <span className="text-brand-primary" aria-hidden="true">*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              aria-required="true"
              aria-invalid={!!state.fieldErrors?.full_name}
              aria-describedby={state.fieldErrors?.full_name ? "full_name-error" : undefined}
              placeholder={t("fieldNamePlaceholder")}
              className={`${FIELD_CLASS} ${state.fieldErrors?.full_name ? FIELD_BORDER_ERROR : FIELD_BORDER}`}
            />
            {state.fieldErrors?.full_name && (
              <p id="full_name-error" className="text-alert-error text-xs mt-1">
                {state.fieldErrors.full_name[0]}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="flex flex-col text-start">
            <label htmlFor="email" className={LABEL_CLASS}>
              {t("fieldEmail")} <span className="text-brand-primary" aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              aria-required="true"
              dir="ltr"
              aria-invalid={!!state.fieldErrors?.email}
              aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
              placeholder={t("fieldEmailPlaceholder")}
              className={`${FIELD_CLASS} ${state.fieldErrors?.email ? FIELD_BORDER_ERROR : FIELD_BORDER}`}
            />
            {state.fieldErrors?.email && (
              <p id="email-error" className="text-alert-error text-xs mt-1 text-start">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-[318px_246px] md:pt-[20.3px]">
          {/* Phone Number */}
          <div className="flex flex-col text-start">
            <label htmlFor="phone" className={LABEL_CLASS}>
              {t("fieldPhone")}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              dir="ltr"
              aria-invalid={!!state.fieldErrors?.phone}
              aria-describedby={state.fieldErrors?.phone ? "phone-error" : undefined}
              placeholder={t("fieldPhonePlaceholder")}
              className={`${FIELD_CLASS} ${state.fieldErrors?.phone ? FIELD_BORDER_ERROR : FIELD_BORDER}`}
            />
            {state.fieldErrors?.phone && (
              <p id="phone-error" className="text-alert-error text-xs mt-1 text-start">
                {state.fieldErrors.phone[0]}
              </p>
            )}
          </div>

          {/* Budget Range */}
          <div className="flex flex-col text-start">
            <label htmlFor="budget_range" className={LABEL_CLASS}>
              {t("fieldBudget")}
            </label>
            <input
              id="budget_range"
              name="budget_range"
              type="text"
              aria-invalid={!!state.fieldErrors?.budget_range}
              aria-describedby={state.fieldErrors?.budget_range ? "budget_range-error" : undefined}
              placeholder={t("fieldBudgetPlaceholder")}
              className={`${FIELD_CLASS} ${state.fieldErrors?.budget_range ? FIELD_BORDER_ERROR : FIELD_BORDER}`}
            />
            {state.fieldErrors?.budget_range && (
              <p id="budget_range-error" className="text-alert-error text-xs mt-1">
                {state.fieldErrors.budget_range[0]}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* ================================================================== */}
      {/* Group 2: Event Details (Figma Node 91:17207)                       */}
      {/* ================================================================== */}
      <fieldset className="m-0 flex flex-col border-0 pt-10 md:pt-[43px]">
        <legend className={LEGEND_CLASS}>
          <span>♪</span>
          <span>{t("groupOccasion")}</span>
        </legend>

        <div className="grid grid-cols-2 gap-4 pt-6 md:grid-cols-[320px_246px]">
          {/* Event Type */}
          <div className="flex flex-col text-start">
            <label htmlFor="event_type" className={LABEL_CLASS}>
              {t("fieldOccasionType")} <span className="text-brand-primary" aria-hidden="true">*</span>
            </label>
            <div className="relative w-full">
              <select
                id="event_type"
                name="event_type"
                required
                defaultValue={defaultEventType}
                aria-required="true"
                aria-invalid={!!state.fieldErrors?.event_type}
                aria-describedby={state.fieldErrors?.event_type ? "event_type-error" : undefined}
                className={`${SELECT_CLASS} ${state.fieldErrors?.event_type ? FIELD_BORDER_ERROR : FIELD_BORDER}`}
              >
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3.5 text-brand-espresso/60">
                <span className="text-xs">▼</span>
              </div>
            </div>
            {state.fieldErrors?.event_type && (
              <p id="event_type-error" className="text-alert-error text-xs mt-1">
                {state.fieldErrors.event_type[0]}
              </p>
            )}
          </div>

          {/* Event Date */}
          <div className="flex flex-col text-start">
            <label htmlFor="event_date" className={LABEL_CLASS}>
              {t("fieldDate")} <span className="text-brand-primary" aria-hidden="true">*</span>
            </label>
            <input
              id="event_date"
              name="event_date"
              type="date"
              required
              min={todayStr}
              aria-required="true"
              aria-invalid={!!state.fieldErrors?.event_date}
              aria-describedby={state.fieldErrors?.event_date ? "event_date-error" : undefined}
              className={`${FIELD_CLASS} ${state.fieldErrors?.event_date ? FIELD_BORDER_ERROR : FIELD_BORDER}`}
            />
            {state.fieldErrors?.event_date && (
              <p id="event_date-error" className="text-alert-error text-xs mt-1">
                {state.fieldErrors.event_date[0]}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-4 md:w-[582px] md:grid-cols-1 md:pt-[26px]">
          {/* Artist Dropdown */}
          <div className="flex flex-col text-start">
            <label htmlFor="artist_id" className={LABEL_CLASS}>
              {t("fieldArtist")}
            </label>
            <div className="relative w-full">
              <select
                id="artist_id"
                name="artist_id"
                value={selectedArtistId}
                onChange={(e) => setSelectedArtistId(e.target.value)}
                aria-invalid={!!state.fieldErrors?.artist_id}
                aria-describedby={state.fieldErrors?.artist_id ? "artist_id-error" : undefined}
                className={`${SELECT_CLASS} md:mt-[9.4px] ${state.fieldErrors?.artist_id ? FIELD_BORDER_ERROR : FIELD_BORDER}`}
              >
                <option value="">{t("fieldArtistPlaceholder")}</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3.5 text-brand-espresso/60">
                <span className="text-xs">▼</span>
              </div>
            </div>
            {state.fieldErrors?.artist_id && (
              <p id="artist_id-error" className="text-alert-error text-xs mt-1">
                {state.fieldErrors.artist_id[0]}
              </p>
            )}
          </div>

        </div>

        {/* Message / Additional Details */}
        <div className="flex flex-col pt-4 text-start md:w-[580px] md:pb-[6.5px]">
          <label htmlFor="message" className={LABEL_CLASS}>
            {t("fieldDetails")} <span className="text-brand-primary" aria-hidden="true">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            defaultValue={defaultMessage}
            aria-required="true"
            aria-invalid={!!state.fieldErrors?.message}
            aria-describedby={state.fieldErrors?.message ? "message-error" : undefined}
            placeholder={t("fieldDetailsPlaceholder")}
            className={`${TEXTAREA_CLASS} ${state.fieldErrors?.message ? FIELD_BORDER_ERROR : FIELD_BORDER}`}
          />
          {state.fieldErrors?.message ? (
            <p id="message-error" className="text-alert-error text-xs mt-1">
              {state.fieldErrors.message[0]}
            </p>
          ) : null}
        </div>
      </fieldset>

      {/* ================================================================== */}
      {/* Legal Disclaimer Notice (Figma Node 91:17246)                      */}
      {/* ================================================================== */}
      <div className="flex flex-col items-start gap-4 pb-6 text-start md:w-[507px]">
        <p className="text-[12px] leading-[15px] text-gradscale-400">{t("consent")}</p>

        {/* Submit (91:17789): 175x44 on a 16px radius, Cairo Bold 16/24. */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className="h-11 w-[175px] rounded-[16px] text-[16px] font-bold leading-[24px]"
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>{t("submitting")}</span>
            </span>
          ) : (
            <span>{t("submit")}</span>
          )}
        </Button>
      </div>
    </form>
  );
}
