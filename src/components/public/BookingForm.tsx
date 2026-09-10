"use client";

import React, { useActionState, useState } from "react";
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

const EVENT_TYPE_OPTIONS = [
  { value: "private_concert", label: "حفل موسيقي خاص" },
  { value: "wedding", label: "حفل زفاف أو خطوبة" },
  { value: "festival", label: "مهرجان أو فعالية ثقافية" },
  { value: "hotel", label: "فندق أو أمسية مطعم راقية" },
  { value: "other", label: "مناسبة أخرى (حدد في التفاصيل)" },
];

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
          تم استلام طلب الحجز بنجاح! ♪
        </h2>

        <p className="max-w-lg mx-auto text-base text-brand-espresso/80 leading-relaxed mb-8">
          {state.message || "شكراً لتواصلك معنا. سنراجع طلبك ونتواصل معك خلال ٤٨ ساعة لمناقشة التفاصيل وتأكيد الترتيبات."}
        </p>

        <div className="p-4 rounded-xl bg-brand-cream/60 border border-brand-espresso/5 max-w-md mx-auto mb-8 text-start text-xs text-brand-espresso/70 space-y-1">
          <p className="font-semibold text-brand-espresso">ملاحظة هامة:</p>
          <p>تم تسجيل طلبك ضمن سجلات الحجوزات الخاصة الآمنة، وسيتولى المنسق الفني التواصل معك مباشرة عبر الهاتف أو البريد الإلكتروني.</p>
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
          تقديم طلب حجز آخر
        </Button>
      </div>
    );
  }

  return (
    <form
      key={submittedAgainKey}
      action={formAction}
      noValidate
      className="w-full bg-white rounded-2xl p-6 sm:p-10 border border-brand-espresso/10 shadow-sm flex flex-col gap-8 text-start"
    >
      {/* Hidden Event Preselection Linkage */}
      {defaultEventId && <input type="hidden" name="event_id" value={defaultEventId} />}

      {/* General Alert Error Banner */}
      {state.error && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-xl bg-red-50 text-red-800 text-sm border border-red-200 flex items-start gap-3"
        >
          <span className="text-red-500 font-bold shrink-0 mt-0.5">⚠️</span>
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
      <fieldset className="flex flex-col gap-5 p-0 m-0 border-0">
        <legend className="w-full pb-3 border-b-2 border-brand-primary/15 text-start font-bold text-brand-primary text-base sm:text-lg flex items-center gap-2">
          <span>♪</span>
          <span>معلوماتك الشخصية</span>
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5 text-start">
            <label htmlFor="full_name" className="text-sm font-semibold text-brand-espresso">
              الاسم الكامل <span className="text-brand-primary" aria-hidden="true">*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              aria-required="true"
              aria-invalid={!!state.fieldErrors?.full_name}
              aria-describedby={state.fieldErrors?.full_name ? "full_name-error" : undefined}
              placeholder="مثال: أحمد عبد الله"
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-brand-espresso transition-colors placeholder:text-brand-espresso/40 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary ${
                state.fieldErrors?.full_name
                  ? "border-red-500 ring-1 ring-red-500/20"
                  : "border-brand-espresso/15 hover:border-brand-primary/50"
              }`}
            />
            {state.fieldErrors?.full_name && (
              <p id="full_name-error" className="text-red-500 text-xs mt-1">
                {state.fieldErrors.full_name[0]}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5 text-start">
            <label htmlFor="email" className="text-sm font-semibold text-brand-espresso">
              البريد الإلكتروني <span className="text-brand-primary" aria-hidden="true">*</span>
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
              placeholder="name@example.com"
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-brand-espresso transition-colors placeholder:text-brand-espresso/40 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary text-start ${
                state.fieldErrors?.email
                  ? "border-red-500 ring-1 ring-red-500/20"
                  : "border-brand-espresso/15 hover:border-brand-primary/50"
              }`}
            />
            {state.fieldErrors?.email && (
              <p id="email-error" className="text-red-500 text-xs mt-1 text-start">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Phone Number */}
          <div className="flex flex-col gap-1.5 text-start">
            <label htmlFor="phone" className="text-sm font-semibold text-brand-espresso">
              رقم الهاتف أو الواتساب <span className="text-xs font-normal text-brand-espresso/60">(اختياري)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              dir="ltr"
              aria-invalid={!!state.fieldErrors?.phone}
              aria-describedby={state.fieldErrors?.phone ? "phone-error" : undefined}
              placeholder="+961 70 123 456"
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-brand-espresso transition-colors placeholder:text-brand-espresso/40 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary text-start ${
                state.fieldErrors?.phone
                  ? "border-red-500 ring-1 ring-red-500/20"
                  : "border-brand-espresso/15 hover:border-brand-primary/50"
              }`}
            />
            {state.fieldErrors?.phone && (
              <p id="phone-error" className="text-red-500 text-xs mt-1 text-start">
                {state.fieldErrors.phone[0]}
              </p>
            )}
          </div>

          {/* Budget Range */}
          <div className="flex flex-col gap-1.5 text-start">
            <label htmlFor="budget_range" className="text-sm font-semibold text-brand-espresso">
              الميزانية التقريبية <span className="text-xs font-normal text-brand-espresso/60">(اختياري)</span>
            </label>
            <input
              id="budget_range"
              name="budget_range"
              type="text"
              aria-invalid={!!state.fieldErrors?.budget_range}
              aria-describedby={state.fieldErrors?.budget_range ? "budget_range-error" : undefined}
              placeholder="مثال: ١٠٠٠ - ٥٠٠٠ دولار"
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-brand-espresso transition-colors placeholder:text-brand-espresso/40 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary ${
                state.fieldErrors?.budget_range
                  ? "border-red-500 ring-1 ring-red-500/20"
                  : "border-brand-espresso/15 hover:border-brand-primary/50"
              }`}
            />
            {state.fieldErrors?.budget_range && (
              <p id="budget_range-error" className="text-red-500 text-xs mt-1">
                {state.fieldErrors.budget_range[0]}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* ================================================================== */}
      {/* Group 2: Event Details (Figma Node 91:17207)                       */}
      {/* ================================================================== */}
      <fieldset className="flex flex-col gap-5 p-0 m-0 border-0">
        <legend className="w-full pb-3 border-b-2 border-brand-primary/15 text-start font-bold text-brand-primary text-base sm:text-lg flex items-center gap-2">
          <span>♪</span>
          <span>تفاصيل المناسبة</span>
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Event Type */}
          <div className="flex flex-col gap-1.5 text-start">
            <label htmlFor="event_type" className="text-sm font-semibold text-brand-espresso">
              نوع المناسبة <span className="text-brand-primary" aria-hidden="true">*</span>
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
                className={`w-full appearance-none rounded-xl border bg-white py-2.5 ps-4 pe-10 text-sm text-brand-espresso transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary ${
                  state.fieldErrors?.event_type
                    ? "border-red-500"
                    : "border-brand-espresso/15 hover:border-brand-primary/50"
                }`}
              >
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3.5 text-brand-espresso/60">
                <span className="text-xs">▼</span>
              </div>
            </div>
            {state.fieldErrors?.event_type && (
              <p id="event_type-error" className="text-red-500 text-xs mt-1">
                {state.fieldErrors.event_type[0]}
              </p>
            )}
          </div>

          {/* Event Date */}
          <div className="flex flex-col gap-1.5 text-start">
            <label htmlFor="event_date" className="text-sm font-semibold text-brand-espresso">
              تاريخ الفعالية المفضل <span className="text-brand-primary" aria-hidden="true">*</span>
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
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-brand-espresso transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary ${
                state.fieldErrors?.event_date
                  ? "border-red-500 ring-1 ring-red-500/20"
                  : "border-brand-espresso/15 hover:border-brand-primary/50"
              }`}
            />
            {state.fieldErrors?.event_date && (
              <p id="event_date-error" className="text-red-500 text-xs mt-1">
                {state.fieldErrors.event_date[0]}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Artist Dropdown */}
          <div className="flex flex-col gap-1.5 text-start">
            <label htmlFor="artist_id" className="text-sm font-semibold text-brand-espresso">
              اختر الفنان / الفرقة <span className="text-xs font-normal text-brand-espresso/60">(اختياري)</span>
            </label>
            <div className="relative w-full">
              <select
                id="artist_id"
                name="artist_id"
                value={selectedArtistId}
                onChange={(e) => setSelectedArtistId(e.target.value)}
                aria-invalid={!!state.fieldErrors?.artist_id}
                aria-describedby={state.fieldErrors?.artist_id ? "artist_id-error" : undefined}
                className={`w-full appearance-none rounded-xl border bg-white py-2.5 ps-4 pe-10 text-sm text-brand-espresso transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary ${
                  state.fieldErrors?.artist_id
                    ? "border-red-500"
                    : "border-brand-espresso/15 hover:border-brand-primary/50"
                }`}
              >
                <option value="">فرقة أندلسيا الكاملة / باقة تراثية متكاملة</option>
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
              <p id="artist_id-error" className="text-red-500 text-xs mt-1">
                {state.fieldErrors.artist_id[0]}
              </p>
            )}
          </div>

          {/* Preferred Artist Free Text */}
          <div className="flex flex-col gap-1.5 text-start">
            <label htmlFor="preferred_artist" className="text-sm font-semibold text-brand-espresso">
              فنان محدد أو عازف معين <span className="text-xs font-normal text-brand-espresso/60">(اختياري)</span>
            </label>
            <input
              id="preferred_artist"
              name="preferred_artist"
              type="text"
              defaultValue={defaultPreferredArtist}
              aria-invalid={!!state.fieldErrors?.preferred_artist}
              aria-describedby={state.fieldErrors?.preferred_artist ? "preferred_artist-error" : undefined}
              placeholder="مثال: عازف عود منفرد أو تخت شرقي خماسي"
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-brand-espresso transition-colors placeholder:text-brand-espresso/40 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary ${
                state.fieldErrors?.preferred_artist
                  ? "border-red-500 ring-1 ring-red-500/20"
                  : "border-brand-espresso/15 hover:border-brand-primary/50"
              }`}
            />
            {state.fieldErrors?.preferred_artist && (
              <p id="preferred_artist-error" className="text-red-500 text-xs mt-1">
                {state.fieldErrors.preferred_artist[0]}
              </p>
            )}
          </div>
        </div>

        {/* Message / Additional Details */}
        <div className="flex flex-col gap-1.5 text-start">
          <label htmlFor="message" className="text-sm font-semibold text-brand-espresso">
            تفاصيل إضافية عن الفعالية <span className="text-brand-primary" aria-hidden="true">*</span>
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
            placeholder="يرجى ذكر مكان الفعالية (المدينة، القاعة)، التوقيت التقريبي، عدد الحضور المتوقع، وأي رغبات خاصة في الموشحات أو الأغاني..."
            className={`w-full rounded-xl border bg-white p-3.5 text-sm text-brand-espresso transition-colors placeholder:text-brand-espresso/40 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary min-h-[120px] ${
              state.fieldErrors?.message
                ? "border-red-500 ring-1 ring-red-500/20"
                : "border-brand-espresso/15 hover:border-brand-primary/50"
            }`}
          />
          {state.fieldErrors?.message ? (
            <p id="message-error" className="text-red-500 text-xs mt-1">
              {state.fieldErrors.message[0]}
            </p>
          ) : (
            <span className="text-xs text-brand-espresso/50">
              أدخل ٥ أحرف على الأقل لوصف متطلبات الحفل.
            </span>
          )}
        </div>
      </fieldset>

      {/* ================================================================== */}
      {/* Legal Disclaimer Notice (Figma Node 91:17246)                      */}
      {/* ================================================================== */}
      <div className="p-4 rounded-xl bg-brand-cream/50 border border-brand-espresso/5 text-xs text-brand-espresso/70 leading-relaxed text-start">
        بإرسالك هذا الطلب، فإنك توافق على سياسة الخصوصية وشروط حجز الفعاليات لدى فرقة أندلسيا. تبقى كافة المعلومات سرية ولأغراض تنسيق الفعالية حصراً.
      </div>

      {/* ================================================================== */}
      {/* Submit Action Button (Figma Node 186:1827)                         */}
      {/* ================================================================== */}
      <div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className="w-full py-3.5 text-base font-bold shadow-md hover:shadow-lg transition-all rounded-xl"
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>جارٍ إرسال الطلب...</span>
            </span>
          ) : (
            <span>أرسل الطلب ♪</span>
          )}
        </Button>
      </div>
    </form>
  );
}
