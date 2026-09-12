import { z } from "zod";

// ============================================================================
// Canonical Domain Enums (Task 30 / DATABASE_SCHEMA.md)
// ============================================================================

export const ARTIST_CATEGORIES = [
  "singing",
  "oud",
  "percussion",
  "contemporary",
  "heritage",
] as const;

export const RELEASE_TYPES = ["studio", "live"] as const;

export const EVENT_CATEGORIES = [
  "concert",
  "festival",
  "evening",
  "workshop",
] as const;

export const EVENT_STATUSES = [
  "upcoming",
  "ongoing",
  "completed",
  "cancelled",
] as const;

export const ARTICLE_CATEGORIES = [
  "culture",
  "artists",
  "academy",
  "events",
] as const;

export const BOOKING_EVENT_TYPES = [
  "private_concert",
  "wedding",
  "festival",
  "hotel",
  "other",
] as const;

export const BOOKING_STATUSES = [
  "pending",
  "contacted",
  "confirmed",
  "archived",
] as const;

export const NEWSLETTER_STATUSES = ["subscribed", "unsubscribed"] as const;

export const STORAGE_BUCKETS = [
  "site",
  "artists",
  "releases",
  "events",
  "academy",
  "articles",
  "audio",
] as const;

export type ArtistCategory = (typeof ARTIST_CATEGORIES)[number];
export type ReleaseType = (typeof RELEASE_TYPES)[number];
export type EventCategory = (typeof EVENT_CATEGORIES)[number];
export type EventStatus = (typeof EVENT_STATUSES)[number];
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];
export type BookingEventType = (typeof BOOKING_EVENT_TYPES)[number];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type NewsletterStatus = (typeof NEWSLETTER_STATUSES)[number];
export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

// ============================================================================
// Zod Enum Schemas
// ============================================================================

export const artistCategorySchema = z.enum(ARTIST_CATEGORIES, {
  message: "تصنيف الفنان غير صالح",
});

export const releaseTypeSchema = z.enum(RELEASE_TYPES, {
  message: "نوع الإصدار غير صالح",
});

export const eventCategorySchema = z.enum(EVENT_CATEGORIES, {
  message: "تصنيف الفعالية غير صالح",
});

export const eventStatusSchema = z.enum(EVENT_STATUSES, {
  message: "حالة الفعالية غير صالحة",
});

export const articleCategorySchema = z.enum(ARTICLE_CATEGORIES, {
  message: "تصنيف المقال غير صالح",
});

export const bookingEventTypeSchema = z.enum(BOOKING_EVENT_TYPES, {
  message: "نوع الفعالية للحجز غير صالح",
});

export const bookingStatusSchema = z.enum(BOOKING_STATUSES, {
  message: "حالة الحجز غير صالحة",
});

export const newsletterStatusSchema = z.enum(NEWSLETTER_STATUSES, {
  message: "حالة الاشتراك غير صالحة",
});

export const storageBucketSchema = z.enum(STORAGE_BUCKETS, {
  message: "مستودع التخزين غير مصرح به",
});

// ============================================================================
// Primitives & Validators
// ============================================================================

/**
 * Trims input string and enforces minimum and maximum character lengths.
 * Fails if whitespace-only input results in length < min.
 */
export function trimmedString(min: number = 1, max: number = 255, fieldName?: string) {
  const name = fieldName ? ` "${fieldName}"` : "";
  return z
    .string({
      message: `الحقل${name} مطلوب`,
    })
    .transform((val) => val.trim())
    .refine((val) => val.length >= min, {
      message: min === 1 ? `الحقل${name} لا يمكن أن يكون فارغاً` : `يجب ألا يقل طول الحقل${name} عن ${min} أحرف`,
    })
    .refine((val) => val.length <= max, {
      message: `يجب ألا يتجاوز طول الحقل${name} ${max} حرفاً`,
    });
}

/**
 * Optional trimmed string with maximum character bound.
 */
export function optionalTrimmedString(max: number = 255) {
  return z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length <= max, {
      message: `يجب ألا يتجاوز طول النص ${max} حرفاً`,
    });
}

/**
 * An optional English translation of an Arabic content field.
 *
 * Admin forms post an empty string for a field left untranslated. That empty
 * string is normalized to null so the column stores "no translation yet" —
 * pickLocalized then falls back to the Arabic text instead of rendering a blank.
 */
export function translationString(max: number = 255) {
  return z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => {
      if (val === null || val === undefined) return null;
      const trimmed = val.trim();
      return trimmed === "" ? null : trimmed;
    })
    .refine((val) => val === null || val.length <= max, {
      message: `يجب ألا يتجاوز طول الترجمة الإنجليزية ${max} حرفاً`,
    });
}

/**
 * Safe HTTP/HTTPS URL validator with maximum length limit.
 * Strictly rejects dangerous pseudo-protocols like javascript:, data:, ftp:, file:.
 */
export function safeUrlSchema(max: number = 500) {
  return z
    .string({
      message: "الرابط مطلوب",
    })
    .transform((val) => val.trim())
    .refine((val) => val.length <= max, {
      message: `يجب ألا يتجاوز طول الرابط ${max} حرفاً`,
    })
    .refine(
      (val) => {
        try {
          const parsed = new URL(val);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      {
        message: "يجب أن يكون الرابط عنوان ويب صالح يبدأ بـ http:// أو https://",
      }
    );
}

/**
 * Email schema adhering strictly to PostgreSQL check constraint:
 * ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$
 * Lowercases, trims, and enforces max length of 255 characters.
 */
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const emailSchema = z
  .string({
    message: "البريد الإلكتروني مطلوب",
  })
  .transform((val) => val.trim().toLowerCase())
  .refine((val) => val.length > 0, {
    message: "البريد الإلكتروني لا يمكن أن يكون فارغاً",
  })
  .refine((val) => val.length <= 255, {
    message: "يجب ألا يتجاوز البريد الإلكتروني 255 حرفاً",
  })
  .refine((val) => EMAIL_REGEX.test(val), {
    message: "صيغة البريد الإلكتروني غير صحيحة",
  });

/**
 * Phone number schema allowing international and regional formats (+, digits, spaces, -, (, ), .).
 * Enforces 7 to 20 digits, max 50 characters, and no letters/injection characters.
 */
const PHONE_PATTERN = /^(\+)?[0-9\s\-().]{7,50}$/;

export const phoneSchema = z
  .string({
    message: "رقم الهاتف مطلوب",
  })
  .transform((val) => val.trim())
  .refine((val) => val.length >= 7 && val.length <= 50, {
    message: "يجب أن يتراوح رقم الهاتف بين 7 و 50 حرفاً",
  })
  .refine((val) => PHONE_PATTERN.test(val), {
    message: "صيغة رقم الهاتف غير صحيحة (أرقام ورموز اتصال فقط)",
  })
  .refine(
    (val) => {
      const digits = val.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 20;
    },
    {
      message: "يجب أن يحتوي رقم الهاتف على 7 إلى 20 رقماً فعلياً",
    }
  );

/**
 * Slug validator matching PostgreSQL constraint: CHECK (slug ~ '^[a-z0-9-]+$')
 * Requires lowercase alphanumeric and hyphens, no leading/trailing hyphens.
 */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugSchema(max: number = 150) {
  return z
    .string({
      message: "المعرف اللطيف (slug) مطلوب",
    })
    .transform((val) => val.trim().toLowerCase())
    .refine((val) => val.length >= 2, {
      message: "يجب ألا يقل المعرف اللطيف عن حرفين",
    })
    .refine((val) => val.length <= max, {
      message: `يجب ألا يتجاوز المعرف اللطيف ${max} حرفاً`,
    })
    .refine((val) => SLUG_REGEX.test(val), {
      message: "يجب أن يتكون المعرف اللطيف من أحرف إنجليزية صغيرة وأرقام وشرطات فقط بدون شرطات طرفية",
    });
}

/**
 * Strict calendar date validator (YYYY-MM-DD).
 * Catches JavaScript Date rollover anomalies (e.g. Feb 31 -> March 3).
 */
export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export const dateStringSchema = z
  .string({
    message: "التاريخ مطلوب",
  })
  .transform((val) => val.trim())
  .refine(
    (val) => {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val);
      if (!match) return false;
      const y = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const d = parseInt(match[3], 10);
      return isValidCalendarDate(y, m, d);
    },
    {
      message: "صيغة التاريخ غير صحيحة، يجب أن تكون بصيغة YYYY-MM-DD وتاريخ ميلادي صالح",
    }
  );

/**
 * Strict ISO 8601 Date-Time validator (e.g. 2026-09-15T18:00:00Z).
 */
export const isoDateTimeSchema = z
  .string({
    message: "الوقت والتاريخ مطلوب",
  })
  .transform((val) => val.trim())
  .refine(
    (val) => {
      const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.exec(val);
      if (!match) return false;
      const y = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const d = parseInt(match[3], 10);
      if (!isValidCalendarDate(y, m, d)) return false;
      const parsed = new Date(val);
      return !isNaN(parsed.getTime());
    },
    {
      message: "صيغة التاريخ والوقت غير صحيحة، يجب أن تكون بتنسيق ISO 8601 صالح",
    }
  );

/**
 * UUID v4 validator
 */
export const uuidSchema = z.string().uuid({
  message: "المعرف يجب أن يكون بصيغة UUID صالحة",
});

/**
 * Positive Integer Validator
 */
export function positiveInt(max: number = 2147483647) {
  return z
    .number({
      message: "يجب أن تكون القيمة رقماً صحيحاً",
    })
    .int({ message: "يجب أن يكون الرقم عدداً صحيحاً" })
    .positive({ message: "يجب أن يكون الرقم أكبر من صفر" })
    .max(max, { message: `الرقم يتجاوز الحد الأقصى المسموح (${max})` });
}
