import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

test("Task: Pages route is force-dynamic and uses getSiteSettings", () => {
  const page = read("src/app/(admin)/admin/pages/page.tsx");

  assert.match(page, /dynamic = "force-dynamic"/);
  assert.match(page, /getSiteSettings/);
  assert.match(page, /PagesEditor/);
  assert.match(page, /id = default/);
});

test("Task: Admin navigation contains /admin/pages", () => {
  const nav = read("src/components/admin/adminNavConfig.ts");

  assert.ok(nav.includes("/admin/pages"), "nav must contain /admin/pages");
  assert.match(nav, /href:\s*["']\/admin\/pages["']/);
  assert.match(nav, /title:\s*["']صفحات الموقع["']/);
});

test("Task: HomeTab contains key fields, seo_* fields, and uses MediaPickerField for image fields", () => {
  const homeTab = read("src/components/admin/pages/HomeTab.tsx");

  const expectedFields = [
    "hero_headline",
    "hero_subheadline",
    "hero_image_url",
    "about_headline",
    "about_body",
    "about_image_url",
    "home_hero_primary_cta",
    "home_hero_secondary_cta",
    "home_about_cta",
    "home_artists_heading",
    "home_artists_cta",
    "home_events_heading",
    "home_events_cta",
    "home_testimonials_heading",
    "home_editorial_heading",
    "home_featured_artists_count",
    "home_featured_articles_count",
    "home_upcoming_events_count",
    "show_testimonials",
    "show_editorial",
    "show_events",
    "show_booking_banner",
    "booking_banner_title",
    "booking_banner_body",
    "booking_cta_label",
    "seo_home_title",
    "seo_home_description",
  ];

  for (const field of expectedFields) {
    assert.ok(homeTab.includes(field), `HomeTab must include field: ${field}`);
  }

  assert.match(homeTab, /MediaPickerField/);
  assert.match(homeTab, /id="hero_image_url"/);
  assert.match(homeTab, /id="about_image_url"/);
});

test("Task: EventsTab contains key fields, seo_* fields, and uses MediaPickerField for image fields", () => {
  const eventsTab = read("src/components/admin/pages/EventsTab.tsx");

  const expectedFields = [
    "events_title",
    "events_subtitle",
    "events_hero_image_url",
    "events_filter_all_label",
    "seo_events_title",
    "seo_events_description",
  ];

  for (const field of expectedFields) {
    assert.ok(eventsTab.includes(field), `EventsTab must include field: ${field}`);
  }

  assert.match(eventsTab, /MediaPickerField/);
  assert.match(eventsTab, /id="events_hero_image_url"/);
  assert.match(eventsTab, /\/admin\/events/);
  assert.match(eventsTab, /publishedCount/);
});

test("Task: NewsTab contains key fields, seo_* fields, and summary information", () => {
  const newsTab = read("src/components/admin/pages/NewsTab.tsx");

  const expectedFields = [
    "news_title",
    "news_kicker",
    "news_subtitle",
    "seo_news_title",
    "seo_news_description",
  ];

  for (const field of expectedFields) {
    assert.ok(newsTab.includes(field), `NewsTab must include field: ${field}`);
  }

  assert.match(newsTab, /\/admin\/articles/);
  assert.match(newsTab, /المقالات المميزة تتحكم في البطل وشبكة البطاقات الثلاث/);
  assert.match(newsTab, /publishedCount/);
  assert.match(newsTab, /featuredCount/);
});

test("Task: ArtistsTab contains key fields, seo_* fields, and uses MediaPickerField for image fields", () => {
  const artistsTab = read("src/components/admin/pages/ArtistsTab.tsx");

  const expectedFields = [
    "artists_title",
    "artists_subtitle",
    "artists_hero_image_url",
    "artists_filter_all_label",
    "seo_artists_title",
    "seo_artists_description",
  ];

  for (const field of expectedFields) {
    assert.ok(artistsTab.includes(field), `ArtistsTab must include field: ${field}`);
  }

  assert.match(artistsTab, /MediaPickerField/);
  assert.match(artistsTab, /id="artists_hero_image_url"/);
  assert.match(artistsTab, /\/admin\/artists/);
  assert.match(artistsTab, /المميز وترتيب العرض يتحكمان في شريط الرئيسية والدليل/);
  assert.match(artistsTab, /publishedCount/);
  assert.match(artistsTab, /featuredCount/);
});

test("Task: AcademyTab contains key fields, seo_* fields, and uses MediaPickerField for image fields", () => {
  const academyTab = read("src/components/admin/pages/AcademyTab.tsx");

  const expectedFields = [
    "academy_title",
    "academy_kicker",
    "academy_subtitle",
    "academy_hero_image_url",
    "academy_tracks_heading",
    "academy_values_heading",
    "academy_value1_title",
    "academy_value1_body",
    "academy_value2_title",
    "academy_value2_body",
    "academy_value3_title",
    "academy_value3_body",
    "academy_newsletter_heading",
    "academy_newsletter_tagline",
    "seo_academy_title",
    "seo_academy_description",
  ];

  for (const field of expectedFields) {
    assert.ok(academyTab.includes(field), `AcademyTab must include field: ${field}`);
  }

  assert.match(academyTab, /MediaPickerField/);
  assert.match(academyTab, /id="academy_hero_image_url"/);
  assert.match(academyTab, /\/admin\/academy/);
  assert.match(academyTab, /publishedCount/);
});

test("Task: PagesEditor calls updateSiteSettingsAction via the kit", () => {
  const editor = read("src/components/admin/pages/PagesEditor.tsx");
  const kit = read("src/components/admin/pages/settingsFormKit.tsx");

  assert.match(editor, /useSiteSettingsForm/);
  assert.match(editor, /role="tablist"/);
  assert.match(editor, /role="tab"/);
  assert.match(editor, /role="status"/);
  assert.match(editor, /role="alert"/);
  assert.match(editor, /isLoading={pending}/);

  assert.match(kit, /updateSiteSettingsAction/);
  assert.match(kit, /buildSiteSettingsInput/);
  assert.match(kit, /getInitialValues/);
  assert.match(kit, /useTransition/);
});
