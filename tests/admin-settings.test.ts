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
