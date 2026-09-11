import "server-only";
import { getLocale } from "next-intl/server";
import { isAppLocale, routing, type AppLocale } from "@/i18n/routing";
import { localizeRow } from "@/lib/utils";

/**
 * The locale the current request should read content in.
 *
 * Admin routes live outside the [locale] segment, so no locale is negotiated
 * there and this resolves to Arabic — which is what the panel edits.
 */
export async function getContentLocale(): Promise<AppLocale> {
  try {
    const locale = await getLocale();
    return isAppLocale(locale) ? locale : routing.defaultLocale;
  } catch {
    return routing.defaultLocale;
  }
}

/**
 * The translatable fields of each content table. Kept next to the DAL so a new
 * `_en` column is wired up in one place.
 */
export const LOCALIZED_FIELDS = {
  artists: ["name", "genre_tag", "city", "quote", "spotlight_quote", "short_bio", "full_bio", "specialties"],
  events: ["title", "location", "city", "performer_name", "description"],
  academy_courses: ["title", "track_category", "description", "instructor_name"],
  articles: ["title", "excerpt", "content", "author_name"],
  testimonials: ["quote", "author_name", "author_role"],
  releases: ["title"],
  tracks: ["title"],
  site_settings: [
    "hero_headline",
    "hero_subheadline",
    "about_headline",
    "about_body",
    "booking_banner_title",
    "booking_banner_body",
    "artists_subtitle",
    "events_subtitle",
    "academy_subtitle",
    "booking_subtitle",
    "operational_regions",
    "footer_mission",
    "copyright_text",
  ],
} as const;

type Table = keyof typeof LOCALIZED_FIELDS;
type FieldsOf<Tb extends Table> = (typeof LOCALIZED_FIELDS)[Tb][number];

/** A row is localizable only if it actually carries the table's translatable fields. */
type Localizable<Tb extends Table> = { [K in FieldsOf<Tb>]?: unknown };

/** Resolves one row's translatable fields for the request's locale. */
export async function localizeContent<Tb extends Table, T extends Localizable<Tb>>(
  table: Tb,
  row: T,
): Promise<T> {
  const locale = await getContentLocale();
  return localizeRow(row, LOCALIZED_FIELDS[table], locale);
}

/** Resolves a list of rows in a single locale lookup. */
export async function localizeContentList<Tb extends Table, T extends Localizable<Tb>>(
  table: Tb,
  rows: T[],
): Promise<T[]> {
  const locale = await getContentLocale();
  if (locale === "ar") return rows;
  const fields = LOCALIZED_FIELDS[table];
  return rows.map((row) => localizeRow(row, fields, locale));
}
