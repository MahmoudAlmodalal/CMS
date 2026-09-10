import React from "react";
import {
  toArabicDigits,
  formatCurrency,
  formatArabicDate,
  formatHijriDate,
} from "@/lib/formatters";

/**
 * Bdi: Bidirectional Isolate container component.
 * Isolates its children from the surrounding bidirectional text context.
 */
export function Bdi({
  children,
  className = "",
  dir,
}: {
  children: React.ReactNode;
  className?: string;
  dir?: "ltr" | "rtl" | "auto";
}) {
  return (
    <bdi dir={dir} className={`inline-block ${className}`}>
      {children}
    </bdi>
  );
}

/**
 * LocalizedNumber: Renders numbers using either Western Arabic (0-9) or Eastern Arabic-Indic (٠-٩)
 * with tabular-nums and monospaced font alignment to prevent jitter in tables and stats.
 */
export function LocalizedNumber({
  value,
  variant = "western",
  className = "",
}: {
  value: number | string;
  variant?: "western" | "eastern";
  className?: string;
}) {
  const display = variant === "eastern" ? toArabicDigits(value) : value;
  return (
    <span className={`tabular-nums font-mono ${className}`}>
      <bdi>{display}</bdi>
    </span>
  );
}

/**
 * LocalizedPrice: Renders currency with proper Arabic suffix and bidi stability.
 */
export function LocalizedPrice({
  amount,
  currency = "د.أ",
  variant = "western",
  className = "",
}: {
  amount: number;
  currency?: string;
  variant?: "western" | "eastern";
  className?: string;
}) {
  return (
    <span className={`inline-flex items-baseline gap-1 font-semibold ${className}`}>
      <LocalizedNumber value={amount} variant={variant} />
      <span className="text-sm font-normal text-brand-espresso/70">{currency}</span>
    </span>
  );
}

/**
 * LocalizedDate: Formats dates into Gregorian Arabic or Hijri with safe bidi isolation.
 */
export function LocalizedDate({
  date,
  calendar = "gregorian",
  format = "long",
  className = "",
}: {
  date: Date | string | number;
  calendar?: "gregorian" | "hijri";
  format?: "long" | "short" | "numeric";
  className?: string;
}) {
  const options: Intl.DateTimeFormatOptions =
    format === "short"
      ? { year: "numeric", month: "numeric", day: "numeric" }
      : format === "numeric"
      ? { year: "numeric", month: "2-digit", day: "2-digit" }
      : { year: "numeric", month: "long", day: "numeric" };

  const formatted =
    calendar === "hijri" ? formatHijriDate(date, options) : formatArabicDate(date, options);

  return (
    <time
      dateTime={typeof date === "string" ? date : new Date(date).toISOString()}
      className={`inline-block ${className}`}
    >
      <bdi>{formatted}</bdi>
    </time>
  );
}

/**
 * PhoneNumber: Formats a phone number inside an RTL flow.
 * Essential: dir="ltr" and unicode-bidi: isolate so the country code (+)
 * and digit groupings never get misplaced.
 */
export function PhoneNumber({
  phone,
  href,
  className = "",
}: {
  phone: string;
  href?: string;
  className?: string;
}) {
  const content = (
    <span
      dir="ltr"
      className={`inline-block font-mono tracking-wide select-all text-start ${className}`}
      style={{ unicodeBidi: "isolate" }}
    >
      {phone}
    </span>
  );

  if (href) {
    return (
      <a
        href={href || `tel:${phone.replace(/\s+/g, "")}`}
        className="text-brand-primary hover:underline transition-colors"
      >
        {content}
      </a>
    );
  }

  return content;
}

/**
 * UrlDisplay: Safely renders URLs inside RTL content with LTR direction and truncation.
 */
export function UrlDisplay({
  url,
  maxLength = 40,
  showIcon = false,
  className = "",
}: {
  url: string;
  maxLength?: number;
  showIcon?: boolean;
  className?: string;
}) {
  const displayUrl =
    url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;

  return (
    <span
      dir="ltr"
      className={`inline-flex items-center gap-1 font-mono text-sm underline text-brand-primary break-all ${className}`}
      style={{ unicodeBidi: "isolate" }}
    >
      <a href={url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
        {displayUrl}
      </a>
      {showIcon && (
        <span className="text-xs" aria-hidden="true">
          ↗
        </span>
      )}
    </span>
  );
}

/**
 * MixedText: Safely highlights Latin terms inside Arabic text with bidi boundary protection.
 */
export function MixedText({
  arabicLead,
  latinPhrase,
  arabicTrail,
  className = "",
}: {
  arabicLead: string;
  latinPhrase: string;
  arabicTrail?: string;
  className?: string;
}) {
  return (
    <span className={`inline ${className}`}>
      <span>{arabicLead}</span>{" "}
      <bdi dir="ltr" className="font-semibold text-brand-primary">
        {`"${latinPhrase}"`}
      </bdi>{" "}
      {arabicTrail && <span>{arabicTrail}</span>}
    </span>
  );
}
