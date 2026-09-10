/**
 * Bidi-safe formatting utilities for Arabic RTL foundations
 */

export const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/**
 * Converts Western digits (0-9) to Eastern Arabic-Indic digits (٠-٩)
 */
export function toArabicDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => ARABIC_DIGITS[parseInt(digit, 10)]);
}

/**
 * Converts Eastern Arabic-Indic digits to Western digits (0-9)
 */
export function toWesternDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)));
}

/**
 * Formats a currency value with proper Arabic placement
 */
export function formatCurrency(
  amount: number,
  currency: string = "د.أ",
  useEasternDigits: boolean = false
): string {
  const formattedNumber = new Intl.NumberFormat("ar-EG", {
    useGrouping: true,
  }).format(amount);

  const displayNum = useEasternDigits ? formattedNumber : amount.toLocaleString("en-US");
  return `${displayNum} ${currency}`;
}

/**
 * Formats a date using the Gregorian calendar with Arabic locale
 */
export function formatArabicDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ar-EG", options).format(d);
}

/**
 * Formats a date using the Islamic / Hijri calendar
 */
export function formatHijriDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", options).format(d);
}

/**
 * Normalizes and formats a telephone number for safe display in RTL context.
 * Wraps in Left-to-Right Mark (LRM) or bidi containment.
 */
export function formatPhoneNumber(phone: string): { raw: string; display: string; ltrHtml: string } {
  const cleaned = phone.trim();
  // Ensure the + sign and digits stay grouped LTR
  return {
    raw: cleaned,
    display: cleaned,
    ltrHtml: `<bdi dir="ltr">${cleaned}</bdi>`,
  };
}

/**
 * Formats a track duration in seconds as m:ss for the audio player timeline.
 * Guards against NaN, negative, and infinite values (metadata not yet loaded).
 */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Normalizes URL for safe display inside RTL paragraphs
 */
export function formatUrlForDisplay(url: string): { full: string; domain: string } {
  try {
    const parsed = new URL(url);
    return {
      full: url,
      domain: parsed.hostname,
    };
  } catch {
    return {
      full: url,
      domain: url,
    };
  }
}
