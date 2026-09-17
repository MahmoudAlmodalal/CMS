import "server-only";
import { cache } from "react";
import { getLocale } from "next-intl/server";
import { isAppLocale, routing, type AppLocale } from "@/i18n/routing";
import { localizeRow } from "@/lib/utils";

/**
 * The locale the current request should read content in.
 *
 * Admin routes live outside the [locale] segment, so no locale is negotiated
 * there and this resolves to Arabic — which is what the panel edits.
 *
 * Cached per request: a homepage fans out to site-settings + artists + events
 * + articles + testimonials (≈10 getLocale() calls before). Without the cache
 * every DAL helper pays a full next-intl lookup; with it the first call wins
 * and the rest resolve from the request memo.
 */
export const getContentLocale = cache(async (): Promise<AppLocale> => {
  try {
    const locale = await getLocale();
    return isAppLocale(locale) ? locale : routing.defaultLocale;
  } catch {
    return routing.defaultLocale;
  }
});

/**
 * The translatable fields of each content table. Kept next to the DAL so a new
 * `_en` column is wired up in one place.
 */
export const LOCALIZED_FIELDS = {
  artists: ["name", "genre_tag", "city", "quote", "spotlight_quote", "short_bio", "full_bio", "specialties"],
  events: ["title", "location", "city", "performer_name", "description"],
  academy_courses: ["title", "track_category", "description", "instructor_name", "price", "duration", "group_size", "certificate", "language", "offer_text", "philosophy_text", "practice_text", "curriculum_title"],
  articles: ["title", "excerpt", "content", "author_name"],
  testimonials: ["quote", "author_name", "author_role"],
  releases: ["title"],
  tracks: ["title"],
  artist_works: ["title", "description"],
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
    "events_title",
    "artists_title",
    "academy_title",
    "academy_kicker",
    "academy_tracks_heading",
    "news_title",
    "news_subtitle",
    "news_kicker",
    "home_hero_primary_cta",
    "home_hero_secondary_cta",
    "home_about_cta",
    "home_artists_heading",
    "home_artists_cta",
    "home_testimonials_heading",
    "home_editorial_heading",
    "home_events_heading",
    "home_events_cta",
    "academy_values_heading",
    "academy_value1_title",
    "academy_value1_body",
    "academy_value2_title",
    "academy_value2_body",
    "academy_value3_title",
    "academy_value3_body",
    "academy_newsletter_heading",
    "academy_newsletter_tagline",
    "seo_home_title",
    "seo_home_description",
    "seo_events_title",
    "seo_events_description",
    "seo_news_title",
    "seo_news_description",
    "seo_artists_title",
    "seo_artists_description",
    "seo_academy_title",
    "seo_academy_description",
    "events_filter_all_label",
    "artists_filter_all_label",
    "booking_cta_label",
    "home_about_heading",
    "booking_title",
    "seo_booking_title",
    "seo_booking_description",
    "seo_default_title",
    "seo_default_description",
    "booking_group_personal",
    "booking_group_occasion",
    "booking_consent_text",
    "booking_submit_label",
    "booking_loading_label",
    "booking_success_title",
    "booking_success_body",
    "booking_success_note",
  ],
} as const;

type Table = keyof typeof LOCALIZED_FIELDS;
type FieldsOf<Tb extends Table> = (typeof LOCALIZED_FIELDS)[Tb][number];

/** A row is localizable only if it actually carries the table's translatable fields. */
type Localizable<Tb extends Table> = { [K in FieldsOf<Tb>]?: unknown };

/** Resolves one row's translatable fields for the request's locale.
 * Pass `locale` when the caller already resolved it (e.g. site-settings) to
 * skip a second lookup. Arabic returns the row untouched — no copy, no loop. */
export async function localizeContent<Tb extends Table, T extends Localizable<Tb>>(
  table: Tb,
  row: T,
  locale?: AppLocale,
): Promise<T> {
  const resolved = locale ?? (await getContentLocale());
  if (resolved === "ar") return row;
  return localizeRow(row, LOCALIZED_FIELDS[table], resolved);
}

/** Resolves a list of rows in a single locale lookup.
 * Pass `locale` when the caller already resolved it to skip the lookup. */
export async function localizeContentList<Tb extends Table, T extends Localizable<Tb>>(
  table: Tb,
  rows: T[],
  locale?: AppLocale,
): Promise<T[]> {
  const resolved = locale ?? (await getContentLocale());
  if (resolved === "ar") return rows;
  const fields = LOCALIZED_FIELDS[table];
  return rows.map((row) => localizeRow(row, fields, resolved));
}
