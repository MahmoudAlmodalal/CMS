import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pickLocalized, localizeRow } from "../src/lib/utils/localized.ts";
import {
  siteSettingsSchema,
  artistSchema,
  trackSchema,
  releaseSchema,
  eventSchema,
  academyCourseSchema,
  articleSchema,
  testimonialSchema,
} from "../src/lib/validations/cms.ts";

const root = path.resolve(".");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf-8");

const MIGRATION = "supabase/migrations/20260912000000_add_english_content_columns.sql";

/**
 * Every `_en` column the migration adds, grouped by table, parsed from the SQL
 * itself so the test tracks the real schema rather than a hand-kept copy.
 */
function migrationColumnsByTable(): Map<string, string[]> {
  const sql = read(MIGRATION);
  const byTable = new Map<string, string[]>();
  // Each block is `ALTER TABLE <name> ... ;` with one ADD COLUMN per line.
  for (const block of sql.split(/ALTER TABLE\s+/).slice(1)) {
    const table = block.split(/\s/)[0];
    const statement = block.slice(0, block.indexOf(";"));
    const columns = [...statement.matchAll(/ADD COLUMN IF NOT EXISTS\s+(\w+_en)\s/g)].map((m) => m[1]);
    byTable.set(table, columns);
  }
  return byTable;
}

test("English content — 1. Every migrated _en column is wired into LOCALIZED_FIELDS", () => {
  const byTable = migrationColumnsByTable();
  assert.equal(byTable.size, 8, "the migration must cover all 8 content tables");

  // LOCALIZED_FIELDS lives in a "server-only" module, so it is read as source.
  const localize = read("src/lib/dal/localize.ts");

  for (const [table, columns] of byTable) {
    assert.ok(columns.length > 0, `${table} must gain at least one _en column`);

    const block = localize.match(new RegExp(`\\b${table}:\\s*\\[([^\\]]*)\\]`, "s"));
    assert.ok(block, `LOCALIZED_FIELDS must declare the ${table} table`);

    const declared = [...block[1].matchAll(/"(\w+)"/g)].map((m) => m[1]);
    for (const column of columns) {
      const base = column.replace(/_en$/, "");
      assert.ok(
        declared.includes(base),
        `LOCALIZED_FIELDS.${table} must list "${base}" so ${column} is actually read`
      );
    }
    assert.equal(
      declared.length,
      columns.length,
      `LOCALIZED_FIELDS.${table} lists ${declared.length} fields but the migration adds ${columns.length} columns`
    );
  }
});

test("English content — 2. pickLocalized falls back to Arabic, never to blank", () => {
  const row = {
    title: "ليلة الطرب الأندلسي",
    title_en: "An Andalusian Tarab Night",
    city: "بيروت",
    city_en: null,
    location: "مسرح المدينة",
    location_en: "   ",
  };

  // Arabic always reads the base column, even when a translation exists.
  assert.equal(pickLocalized(row, "title", "ar"), "ليلة الطرب الأندلسي");
  assert.equal(pickLocalized(row, "city", "ar"), "بيروت");

  // English prefers the translation when one is actually written.
  assert.equal(pickLocalized(row, "title", "en"), "An Andalusian Tarab Night");

  // A null translation falls back to Arabic rather than rendering empty.
  assert.equal(pickLocalized(row, "city", "en"), "بيروت");

  // A whitespace-only translation is treated as absent, not as content.
  assert.equal(pickLocalized(row, "location", "en"), "مسرح المدينة");

  // A missing row never throws — it yields an empty string.
  assert.equal(pickLocalized(null, "title" as never, "en"), "");
  assert.equal(pickLocalized(undefined, "title" as never, "ar"), "");
});

test("English content — 3. localizeRow replaces base columns only for English", () => {
  const fields = ["title", "city"] as const;
  const row = {
    id: "e1",
    title: "مهرجان التراث",
    title_en: "Heritage Festival",
    city: "دبي",
    city_en: null,
    is_published: true,
  };

  // Arabic is the authored source: the row is passed through untouched.
  assert.equal(localizeRow(row, fields, "ar"), row);

  const english = localizeRow(row, fields, "en");
  assert.notEqual(english, row, "English must not mutate or return the Arabic row");
  assert.equal(english.title, "Heritage Festival");
  assert.equal(english.city, "دبي", "an untranslated field keeps its Arabic value");
  assert.equal(english.is_published, true, "non-translatable fields survive untouched");
  assert.equal(row.title, "مهرجان التراث", "the source row is never mutated in place");

  // A field the row does not carry is skipped rather than set to "".
  const partial = localizeRow({ title: "عنوان", title_en: "Title" }, ["title", "city"], "en");
  assert.equal(partial.title, "Title");
  assert.ok(!("city" in partial), "a column absent from the row must not be invented");
});

test("English content — 4. translationString normalizes blanks to null", () => {
  const base = {
    quote: "أندلسيا جسر بين التراث والحاضر.",
    author_name: "عمر الحاج",
    author_role: "ناقد موسيقي",
    avatar_image_url: null,
    display_order: 1,
    is_published: true,
  };

  // An untranslated field posted as "" is stored as null, so pickLocalized
  // falls back to Arabic instead of rendering an empty English page.
  const blank = testimonialSchema.safeParse({ ...base, quote_en: "", author_name_en: "   " });
  assert.ok(blank.success, blank.success ? "" : JSON.stringify(blank.error.issues));
  assert.equal(blank.data.quote_en, null);
  assert.equal(blank.data.author_name_en, null);
  assert.equal(blank.data.author_role_en, null, "an omitted translation defaults to null");

  // A real translation is kept, trimmed.
  const filled = testimonialSchema.safeParse({ ...base, quote_en: "  A bridge to heritage.  " });
  assert.ok(filled.success);
  assert.equal(filled.data.quote_en, "A bridge to heritage.");

  // An explicit null is accepted (the admin form clears a translation this way).
  const cleared = testimonialSchema.safeParse({ ...base, quote_en: null });
  assert.ok(cleared.success);
  assert.equal(cleared.data.quote_en, null);

  // Over-long translations are still rejected — the bound is not bypassed.
  const tooLong = testimonialSchema.safeParse({ ...base, author_name_en: "x".repeat(151) });
  assert.equal(tooLong.success, false, "translationString must enforce its max length");
});

test("English content — 5. Every CMS schema declares an _en twin for each translatable field", () => {
  const byTable = migrationColumnsByTable();
  const schemas: Record<string, { shape: Record<string, unknown> }> = {
    site_settings: siteSettingsSchema as never,
    artists: artistSchema as never,
    tracks: trackSchema as never,
    releases: releaseSchema as never,
    events: eventSchema as never,
    academy_courses: academyCourseSchema as never,
    articles: articleSchema as never,
    testimonials: testimonialSchema as never,
  };

  for (const [table, columns] of byTable) {
    const schema = schemas[table];
    assert.ok(schema, `a Zod schema must exist for ${table}`);
    for (const column of columns) {
      assert.ok(
        column in schema.shape,
        `${table} schema is .strict(), so it must declare "${column}" or admin saves will be rejected`
      );
    }
  }
});

test("English content — 6. Public DAL readers resolve content into the request locale", () => {
  // Each public reader is a thin wrapper over a private *Raw fetcher; the
  // wrapper is what pages import, so localization cannot be bypassed.
  const wrappers: Array<[string, string[]]> = [
    ["src/lib/dal/artists.ts", ["getFeaturedArtists", "getPublishedArtists", "getArtistBySlug"]],
    ["src/lib/dal/events.ts", ["getUpcomingEvents", "getPublishedEvents", "getFeaturedEvent"]],
    ["src/lib/dal/articles.ts", ["getPublishedArticles", "getFeaturedArticles", "getArticleBySlug", "getRelatedArticles"]],
    ["src/lib/dal/academy.ts", ["getPublishedAcademyCourses", "getAcademyCourseBySlug"]],
    ["src/lib/dal/testimonials.ts", ["getPublishedTestimonials"]],
    ["src/lib/dal/site-settings.ts", ["getSiteSettings"]],
  ];

  for (const [file, readers] of wrappers) {
    const source = read(file);
    assert.match(
      source,
      /from "\.\/localize"/,
      `${file} must go through the shared localize layer`
    );
    for (const reader of readers) {
      const body = source.match(new RegExp(`export async function ${reader}\\b[\\s\\S]*?\\n\\}`));
      assert.ok(body, `${file} must export ${reader}`);
      assert.match(
        body[0],
        /localizeContent(List)?\(/,
        `${reader} must resolve its rows through localizeContent/localizeContentList`
      );
    }
  }

  // Booking builds its payload by hand, so it localizes field by field instead.
  const booking = read("src/lib/dal/booking.ts");
  assert.match(booking, /pickLocalized\(row, "title", locale\)/);
  assert.match(booking, /pickLocalized\(s, "booking_subtitle", locale\)/);
  assert.match(booking, /name: pickLocalized\(row, "name", locale\)/);

  // Admin routes live outside the [locale] segment, so content stays Arabic there.
  const localize = read("src/lib/dal/localize.ts");
  assert.match(
    localize,
    /return routing\.defaultLocale;/,
    "getContentLocale must fall back to Arabic where no locale is negotiated"
  );
});

test("English content — 7. Admin forms expose an English input for every translatable field", () => {
  assert.match(
    read("src/components/admin/ManagerKit.tsx"),
    /export function TranslationField\(/,
    "the shared English-input control must live in ManagerKit"
  );

  // Each manager owns the tables it edits; the form must carry one English
  // input per translatable column or a translation can never be authored.
  const forms: Array<[string, string[]]> = [
    ["src/components/admin/ArtistsManager.tsx", [
      "name_en", "genre_tag_en", "city_en", "quote_en",
      "spotlight_quote_en", "short_bio_en", "full_bio_en", "specialties_en",
    ]],
    ["src/components/admin/events/EventForm.tsx", [
      "title_en", "location_en", "city_en", "performer_name_en", "description_en",
    ]],
    ["src/components/admin/AcademyManager.tsx", [
      "title_en", "track_category_en", "description_en", "instructor_name_en",
    ]],
    ["src/components/admin/ArticlesManager.tsx", ["title_en", "excerpt_en", "content_en", "author_name_en"]],
    ["src/components/admin/TestimonialsManager.tsx", ["quote_en", "author_name_en", "author_role_en"]],
    ["src/components/admin/TracksManager.tsx", ["title_en"]],
    ["src/components/admin/ReleasesManager.tsx", ["title_en"]],
  ];

  for (const [file, fields] of forms) {
    const source = read(file);
    for (const field of fields) {
      assert.match(
        source,
        new RegExp(`setField\\("${field}"`),
        `${file} must let an editor write ${field}`
      );
    }
  }

  // Site settings keeps its own local Field, and submits "" as null.
  const settings = read("src/components/admin/SiteSettingsForm.tsx");
  for (const field of ["hero_headline_en", "about_body_en", "footer_mission_en", "copyright_text_en"]) {
    assert.match(settings, new RegExp(`setField\\("${field}"`), `settings form must edit ${field}`);
    assert.match(
      settings,
      new RegExp(`${field}: values\\.${field} \\|\\| null`),
      `${field} must submit an empty input as null, not as ""`
    );
  }
});
