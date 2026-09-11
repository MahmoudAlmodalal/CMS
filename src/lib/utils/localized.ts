import type { AppLocale } from "@/i18n/routing";

/**
 * Content tables store Arabic in the base column and an optional English
 * translation in a `_en` sibling (see
 * supabase/migrations/20260912000000_add_english_content_columns.sql).
 *
 * Arabic is the authored source of truth, so a missing or blank translation
 * falls back to it rather than rendering an empty page.
 */
export function pickLocalized<T extends object>(
  row: T | null | undefined,
  field: Extract<keyof T, string>,
  locale: AppLocale,
): string {
  if (!row) return "";
  const source = row as Record<string, unknown>;
  const arabic = source[field];
  if (locale === "ar") return typeof arabic === "string" ? arabic : "";

  const translated = source[`${field}_en`];
  if (typeof translated === "string" && translated.trim() !== "") return translated;
  return typeof arabic === "string" ? arabic : "";
}

/**
 * Resolves every named field of a row for the given locale, returning a row of
 * the same shape with the base columns replaced by the localized values. Use
 * this at the DAL boundary so components never see `_en` columns at all.
 */
export function localizeRow<T extends object>(
  row: T,
  fields: ReadonlyArray<string>,
  locale: AppLocale,
): T {
  if (locale === "ar") return row;
  const out: Record<string, unknown> = { ...(row as Record<string, unknown>) };
  for (const field of fields) {
    // Only fields the row actually carries; a missing column stays untouched.
    if (!(field in row)) continue;
    out[field] = pickLocalized(row, field as Extract<keyof T, string>, locale);
  }
  return out as T;
}
