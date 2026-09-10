import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { artistSchema } from "../src/lib/validations/cms.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

test("Task 44 — artists route is dynamic and reads through the admin DAL", () => {
  const page = read("src/app/(admin)/admin/artists/page.tsx");
  const dal = read("src/lib/dal/artists.ts");

  assert.match(page, /dynamic = "force-dynamic"/);
  assert.match(page, /getAdminArtists/);
  assert.match(page, /ArtistsManager/);
  assert.match(dal, /requireAdminSession/);
  assert.match(dal, /is_published/); // The same query returns published artists and drafts.
  assert.match(dal, /display_order/);
});

test("Task 44 — manager covers canonical artist fields and guarded actions", () => {
  const manager = read("src/components/admin/ArtistsManager.tsx");

  for (const field of [
    "name", "slug", "category", "genre_tag", "city", "quote", "spotlight_quote", "short_bio",
    "full_bio", "specialties", "portrait_image_url", "is_featured", "is_published", "display_order",
  ]) {
    assert.ok(manager.includes(field), `artist manager must include ${field}`);
  }

  assert.match(manager, /createArtistAction/);
  assert.match(manager, /updateArtistAction/);
  assert.match(manager, /deleteArtistAction/);
  assert.match(manager, /setPublishStatusAction\("artists"/);
  assert.match(manager, /window\.confirm/);
  assert.match(manager, /role=\{notice\.type === "error" \? "alert" : "status"\}/);
  assert.match(manager, /dir="rtl"/);
});

test("Task 44 — existing artist validation accepts the full form and rejects unsafe updates", () => {
  const input = {
    name: "فنان تجريبي",
    slug: "tajribi",
    category: "singing",
    genre_tag: "غناء عربي",
    city: "بيروت",
    quote: "الموسيقى ذاكرة حيّة",
    spotlight_quote: null,
    short_bio: "نبذة مختصرة",
    full_bio: "سيرة فنية كاملة",
    specialties: "الغناء • الموشحات",
    portrait_image_url: "https://example.com/artist.webp",
    is_featured: true,
    is_published: false,
    display_order: 2,
  };

  assert.equal(artistSchema.safeParse(input).success, true);
  assert.equal(artistSchema.safeParse({ ...input, portrait_image_url: "javascript:alert(1)" }).success, false);
  assert.equal(artistSchema.safeParse({ ...input, category: "jazz" }).success, false);
});

test("Task 44 — update action validates partial artist updates and preserves storage reference contract", () => {
  const action = read("src/actions/cms.ts");
  const storage = read("src/lib/storage.ts");

  assert.match(action, /artistSchema\.omit\(\{ id: true \}\)\.partial\(\)\.safeParse\(input\)/);
  assert.match(action, /requireAdminSession/);
  assert.match(storage, /table: "artists", column: "portrait_image_url", bucket: "artists"/);
});

test("Task 44 — route exposes loading and artist-specific error states", () => {
  const loading = read("src/app/(admin)/admin/artists/loading.tsx");
  const error = read("src/app/(admin)/admin/artists/error.tsx");

  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /animate-pulse/);
  assert.match(error, /use client/);
  assert.match(error, /تعذر تحميل الفنانين/);
  assert.match(error, /reset/);
});
