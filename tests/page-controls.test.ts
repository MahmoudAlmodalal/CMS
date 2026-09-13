import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { siteSettingsSchema } from "../src/lib/validations/cms.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf-8");
const partial = siteSettingsSchema.partial();

test("Page controls — CTA links accept internal paths and http(s) only", () => {
  for (const href of ["/booking", "/artists?x=1", "https://example.com", "", null]) {
    assert.ok(partial.safeParse({ home_hero_primary_href: href }).success, `should accept ${href}`);
  }
  for (const href of ["javascript:alert(1)", "//evil.com", "data:text/html,x", "/../admin"]) {
    assert.equal(partial.safeParse({ booking_cta_href: href }).success, false, `should reject ${href}`);
  }
});

test("Page controls — admin tabs expose the new fields", () => {
  const home = read("src/components/admin/pages/HomeTab.tsx");
  for (const field of [
    "show_hero", "show_about", "show_featured_artists",
    "home_hero_primary_href", "home_hero_secondary_href", "home_about_href",
    "home_artists_href", "home_events_href", "booking_cta_href",
    "home_about_heading", "home_events_image_url", "booking_banner_image_url",
    "seo_default_title", "seo_default_description", "seo_og_image_url",
  ]) {
    assert.ok(home.includes(field), `HomeTab must include ${field}`);
  }
  const booking = read("src/components/admin/pages/BookingTab.tsx");
  for (const field of ["booking_title", "booking_subtitle", "seo_booking_title", "seo_booking_description"]) {
    assert.ok(booking.includes(field), `BookingTab must include ${field}`);
  }
  assert.ok(read("src/components/admin/pages/ArtistsTab.tsx").includes("artist_hero_image_url"));
  assert.match(read("src/components/admin/pages/PagesEditor.tsx"), /key: "booking"/);
});

test("Page controls — public pages read the new settings", () => {
  const home = read("src/app/[locale]/(public)/page.tsx");
  assert.match(home, /settings\.show_hero &&/);
  assert.match(home, /settings\.show_about &&/);
  assert.match(home, /settings\.show_featured_artists &&/);
  assert.match(home, /seo_og_image_url/);
  assert.match(read("src/components/public/HeroSection.tsx"), /home_hero_primary_href \|\| "\/artists"/);
  assert.match(read("src/components/public/BookingBanner.tsx"), /booking_banner_image_url/);
  const booking = read("src/app/[locale]/(public)/booking/page.tsx");
  assert.match(booking, /seo_booking_title\?\.trim\(\) \|\| t\("bookingTitle"\)/);
  assert.match(booking, /booking_title/);
  assert.match(read("src/app/[locale]/layout.tsx"), /seo_default_title\?\.trim\(\) \|\| t\("title"\)/);
});

test("Page controls — new image columns are storage references in the orphan view", () => {
  const sql = read("supabase/migrations/20260917000100_page_controls.sql");
  for (const col of ["home_events_image_url", "booking_banner_image_url", "artist_hero_image_url", "seo_og_image_url"]) {
    assert.match(sql, new RegExp(`SELECT ${col} FROM public\\.site_settings`));
  }
});
