import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { siteSettingsSchema } from "../src/lib/validations/cms.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

test("Task 43 — settings route loads the safe singleton fallback and form", () => {
  const page = read("src/app/(admin)/admin/settings/page.tsx");

  assert.match(page, /getSiteSettings/);
  assert.match(page, /SiteSettingsForm/);
  assert.match(page, /dynamic = "force-dynamic"/);
  assert.match(page, /id = default/);
});

test("Task 43 — form covers approved fields and guarded save feedback", () => {
  const form = read("src/components/admin/SiteSettingsForm.tsx");

  for (const field of [
    "hero_headline", "hero_subheadline", "hero_image_url", "about_headline", "about_body", "about_image_url",
    "booking_banner_title", "booking_banner_body", "artists_subtitle", "events_subtitle", "academy_subtitle", "booking_subtitle",
    "contact_email", "contact_phone", "operational_regions", "footer_mission", "copyright_text", "social_links", "instagram", "tiktok",
    "home_featured_artists_count", "home_featured_articles_count", "home_upcoming_events_count",
    "show_testimonials", "show_editorial", "show_events", "show_booking_banner",
    "events_title", "events_hero_image_url", "artists_title", "artists_hero_image_url",
    "academy_title", "academy_kicker", "academy_hero_image_url", "academy_tracks_heading",
    "news_title", "news_subtitle", "news_kicker",
    "home_hero_primary_cta", "home_hero_secondary_cta", "home_about_cta",
    "home_artists_heading", "home_artists_cta", "home_testimonials_heading",
    "home_editorial_heading", "home_events_heading", "home_events_cta",
    "academy_values_heading", "academy_value1_title", "academy_value1_body",
    "academy_value2_title", "academy_value2_body", "academy_value3_title", "academy_value3_body",
    "academy_newsletter_heading", "academy_newsletter_tagline",
  ]) {
    assert.ok(form.includes(field), `settings form must include ${field}`);
  }

  assert.match(form, /updateSiteSettingsAction/);
  assert.match(form, /useTransition/);
  assert.match(form, /isLoading={pending}/);
  assert.match(form, /role="status"/);
  assert.match(form, /role="alert"/);
  assert.doesNotMatch(form, /SUPABASE_SERVICE_ROLE_KEY/);
});

test("Task 43 / Home Sections — schema applies defaults and enforces count bounds", () => {
  const baseValid = {
    hero_headline: "عنوان",
    hero_subheadline: "عنوان فرعي",
    hero_image_url: "",
    about_headline: "من نحن",
    about_body: "نص تعريفي",
    about_image_url: "",
    booking_banner_title: "احجز الآن",
    booking_banner_body: "تواصل معنا",
    contact_email: "hello@example.com",
    contact_phone: "+961 1 234 567",
    operational_regions: "لبنان",
    footer_mission: "رسالة",
    copyright_text: "© أندلسيا",
  };

  const defaultResult = siteSettingsSchema.safeParse(baseValid);
  assert.equal(defaultResult.success, true);
  if (defaultResult.success) {
    assert.equal(defaultResult.data.home_featured_artists_count, 6);
    assert.equal(defaultResult.data.home_featured_articles_count, 4);
    assert.equal(defaultResult.data.home_upcoming_events_count, 3);
    assert.equal(defaultResult.data.show_testimonials, true);
    assert.equal(defaultResult.data.show_editorial, true);
    assert.equal(defaultResult.data.show_events, true);
    assert.equal(defaultResult.data.show_booking_banner, true);
  }

  // Count 0 rejected for all three count fields
  assert.equal(
    siteSettingsSchema.safeParse({ ...baseValid, home_featured_artists_count: 0 }).success,
    false,
    "home_featured_artists_count 0 must be rejected"
  );
  assert.equal(
    siteSettingsSchema.safeParse({ ...baseValid, home_featured_articles_count: 0 }).success,
    false,
    "home_featured_articles_count 0 must be rejected"
  );
  assert.equal(
    siteSettingsSchema.safeParse({ ...baseValid, home_upcoming_events_count: 0 }).success,
    false,
    "home_upcoming_events_count 0 must be rejected"
  );

  // Count 13 rejected for all three count fields
  assert.equal(
    siteSettingsSchema.safeParse({ ...baseValid, home_featured_artists_count: 13 }).success,
    false,
    "home_featured_artists_count 13 must be rejected"
  );
  assert.equal(
    siteSettingsSchema.safeParse({ ...baseValid, home_featured_articles_count: 13 }).success,
    false,
    "home_featured_articles_count 13 must be rejected"
  );
  assert.equal(
    siteSettingsSchema.safeParse({ ...baseValid, home_upcoming_events_count: 13 }).success,
    false,
    "home_upcoming_events_count 13 must be rejected"
  );
});

test("Task 43 — schema preserves the seeded empty image fallback and singleton id", () => {
  const result = siteSettingsSchema.safeParse({
    hero_headline: "عنوان",
    hero_subheadline: "عنوان فرعي",
    hero_image_url: "",
    about_headline: "من نحن",
    about_body: "نص تعريفي",
    about_image_url: "",
    booking_banner_title: "احجز الآن",
    booking_banner_body: "تواصل معنا",
    contact_email: "hello@example.com",
    contact_phone: "+961 1 234 567",
    operational_regions: "لبنان",
    footer_mission: "رسالة",
    copyright_text: "© أندلسيا",
  });

  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.id, "default");
  assert.equal(siteSettingsSchema.safeParse({ ...(result.success ? result.data : {}), id: "other" }).success, false);
});

test("Task 43 — action validates the singleton update and refreshes public cache", () => {
  const action = read("src/actions/cms.ts");

  assert.match(action, /siteSettingsSchema\.safeParse\(input\)/);
  assert.match(action, /\.from\("site_settings"\)/);
  assert.match(action, /\.eq\("id" as never, "default" as never\)/);
  assert.match(action, /revalidatePath\("\/", "layout"\)/);
});

test("CMS mutations trigger on-demand public site revalidation", () => {
  const cmsSrc = read("src/actions/cms.ts");

  // Private helper definition
  assert.match(cmsSrc, /function revalidateSite\(\)/);
  assert.doesNotMatch(cmsSrc, /export (?:async )?function revalidateSite/);
  assert.match(cmsSrc, /revalidatePath\("\/", "layout"\)/);

  const revalidatingActions = [
    // Create operations
    "createArtistAction",
    "createTrackAction",
    "createReleaseAction",
    "createEventAction",
    "createAcademyCourseAction",
    "createArticleAction",
    "createTestimonialAction",
    // Edit operations
    "updateSiteSettingsAction",
    "updateArtistAction",
    "updateTrackAction",
    "updateReleaseAction",
    "updateEventAction",
    "updateAcademyCourseAction",
    "updateArticleAction",
    "updateTestimonialAction",
    // Delete operations
    "deleteArtistAction",
    "deleteTrackAction",
    "deleteReleaseAction",
    "deleteEventAction",
    "deleteAcademyCourseAction",
    "deleteArticleAction",
    "deleteTestimonialAction",
    // Publish operations
    "setPublishStatusAction",
  ];

  for (const actionName of revalidatingActions) {
    const fnRegex = new RegExp(`export async function ${actionName}\\b[\\s\\S]*?(?=(?:export (?:async )?function|export const|export type|export interface|$))`);
    const match = cmsSrc.match(fnRegex);
    assert.ok(match, `Action ${actionName} must exist in cms.ts`);
    assert.ok(
      match[0].includes("revalidateSite()"),
      `Action ${actionName} must invoke revalidateSite() on success`
    );
  }

  // Ensure actions without public surface do NOT invoke revalidateSite
  const nonRevalidatingActions = [
    "createPrivilegedBookingAction",
    "createPrivilegedSubscriberAction",
    "updateBookingRequestAction",
    "updateSubscriberAction",
    "deleteBookingRequestAction",
    "deleteSubscriberAction",
  ];

  for (const actionName of nonRevalidatingActions) {
    const fnRegex = new RegExp(`export async function ${actionName}\\b[\\s\\S]*?(?=(?:export (?:async )?function|export const|export type|export interface|$))`);
    const match = cmsSrc.match(fnRegex);
    if (match) {
      assert.ok(
        !match[0].includes("revalidateSite()"),
        `Action ${actionName} must not invoke revalidateSite()`
      );
    }
  }
});

test("SEO metadata and label override controls schema and migration validation", () => {
  const NEW_COLUMNS = [
    "seo_home_title",
    "seo_home_title_en",
    "seo_home_description",
    "seo_home_description_en",
    "seo_events_title",
    "seo_events_title_en",
    "seo_events_description",
    "seo_events_description_en",
    "seo_news_title",
    "seo_news_title_en",
    "seo_news_description",
    "seo_news_description_en",
    "seo_artists_title",
    "seo_artists_title_en",
    "seo_artists_description",
    "seo_artists_description_en",
    "seo_academy_title",
    "seo_academy_title_en",
    "seo_academy_description",
    "seo_academy_description_en",
    "events_filter_all_label",
    "events_filter_all_label_en",
    "artists_filter_all_label",
    "artists_filter_all_label_en",
    "booking_cta_label",
    "booking_cta_label_en",
  ];

  const migration = read("supabase/migrations/20260915000000_add_seo_and_label_controls.sql");
  for (const col of NEW_COLUMNS) {
    assert.ok(migration.includes(col), `migration must define column ${col}`);
  }
  assert.match(migration, /COMMENT ON COLUMN site_settings\.seo_home_title/);
  assert.match(migration, /COMMENT ON COLUMN site_settings\.events_filter_all_label/);

  const baseValid = {
    hero_headline: "عنوان",
    hero_subheadline: "عنوان فرعي",
    hero_image_url: "",
    about_headline: "من نحن",
    about_body: "نص تعريفي",
    about_image_url: "",
    booking_banner_title: "احجز الآن",
    booking_banner_body: "تواصل معنا",
    contact_email: "hello@example.com",
    contact_phone: "+961 1 234 567",
    operational_regions: "لبنان",
    footer_mission: "رسالة",
    copyright_text: "© أندلسيا",
  };

  const populated = siteSettingsSchema.safeParse({
    ...baseValid,
    seo_home_title: "أندلسيا - الرئيسية",
    seo_home_title_en: "Andalusia - Home",
    seo_home_description: "منصة المواهب الفنية",
    seo_home_description_en: "Platform for artistic talents",
    seo_events_title: "فعاليات أندلسيا",
    seo_events_title_en: "Andalusia Events",
    seo_events_description: "أجندة الفعاليات الموسيقية",
    seo_events_description_en: "Musical events calendar",
    seo_news_title: "أخبار أندلسيا",
    seo_news_title_en: "Andalusia News",
    seo_news_description: "آخر المقالات والأخبار",
    seo_news_description_en: "Latest articles and news",
    seo_artists_title: "فناني أندلسيا",
    seo_artists_title_en: "Andalusia Artists",
    seo_artists_description: "دليل فناني المنصة",
    seo_artists_description_en: "Directory of artists",
    seo_academy_title: "أكاديمية أندلسيا",
    seo_academy_title_en: "Andalusia Academy",
    seo_academy_description: "مسارات وورش تعليمية",
    seo_academy_description_en: "Educational tracks and workshops",
    events_filter_all_label: "كل الفعاليات",
    events_filter_all_label_en: "All Events",
    artists_filter_all_label: "كل الفنانين",
    artists_filter_all_label_en: "All Artists",
    booking_cta_label: "احجز موعداً",
    booking_cta_label_en: "Book Now",
  });
  assert.equal(populated.success, true);
  if (populated.success) {
    assert.equal(populated.data.seo_home_title, "أندلسيا - الرئيسية");
    assert.equal(populated.data.seo_home_title_en, "Andalusia - Home");
    assert.equal(populated.data.events_filter_all_label, "كل الفعاليات");
    assert.equal(populated.data.booking_cta_label, "احجز موعداً");
  }

  const emptyStrings = siteSettingsSchema.safeParse({
    ...baseValid,
    seo_home_title: "",
    seo_home_title_en: "",
    seo_home_description: "",
    seo_home_description_en: "",
    events_filter_all_label: "",
    events_filter_all_label_en: "",
    booking_cta_label: "",
    booking_cta_label_en: "",
  });
  assert.equal(emptyStrings.success, true);
  if (emptyStrings.success) {
    assert.equal(emptyStrings.data.seo_home_title_en, null);
    assert.equal(emptyStrings.data.seo_home_description_en, null);
    assert.equal(emptyStrings.data.events_filter_all_label_en, null);
    assert.equal(emptyStrings.data.booking_cta_label_en, null);
    assert.equal(emptyStrings.data.seo_home_title, "");
  }

  const nullValues = siteSettingsSchema.safeParse({
    ...baseValid,
    seo_home_title: null,
    seo_home_title_en: null,
    events_filter_all_label: null,
    events_filter_all_label_en: null,
    booking_cta_label: null,
    booking_cta_label_en: null,
  });
  assert.equal(nullValues.success, true);
  if (nullValues.success) {
    assert.equal(nullValues.data.seo_home_title, null);
    assert.equal(nullValues.data.seo_home_title_en, null);
  }

  assert.equal(
    siteSettingsSchema.safeParse({
      ...baseValid,
      seo_home_title: "x".repeat(121),
    }).success,
    false,
    "seo_home_title over 120 chars must be rejected"
  );
  assert.equal(
    siteSettingsSchema.safeParse({
      ...baseValid,
      seo_home_title_en: "x".repeat(121),
    }).success,
    false,
    "seo_home_title_en over 120 chars must be rejected"
  );
});

