import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { artistWorkSchema } from "../src/lib/validations/cms.ts";
import { arMessages, enMessages } from "./helpers/i18n.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf-8");

const VALID = {
  artist_id: "5f0a1c1a-7b2b-4e34-9a3e-9c2f6c6a1234",
  title: "موّال البيات",
  work_type: "song",
  youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  display_order: 0,
  is_published: false,
};

test("أعمال — migration creates artist_works with RLS mirroring tracks", () => {
  const sql = read("supabase/migrations/20260918000000_create_artist_works.sql");

  assert.match(sql, /CREATE TABLE IF NOT EXISTS artist_works/);
  assert.match(sql, /REFERENCES artists\(id\) ON DELETE CASCADE/);
  assert.match(sql, /work_type [\s\S]*CHECK \(work_type IN \('song', 'concert', 'interview', 'documentary'\)\)/);
  assert.match(sql, /is_published BOOLEAN NOT NULL DEFAULT false/, "new content is a draft");
  assert.match(sql, /CREATE INDEX IF NOT EXISTS idx_artist_works_artist_id/);

  // Default-deny: the table is useless to anon without the published policy and
  // dangerous without FORCE.
  assert.match(sql, /ALTER TABLE artist_works ENABLE ROW LEVEL SECURITY/);
  assert.match(sql, /ALTER TABLE artist_works FORCE ROW LEVEL SECURITY/);
  for (const policy of ["select_published", "select_admin", "insert_admin", "update_admin", "delete_admin"]) {
    assert.match(sql, new RegExp(`artist_works_${policy}`), `missing policy artist_works_${policy}`);
  }
  // A published work on an unpublished artist must stay invisible.
  assert.match(sql, /artists\.is_published = true/);
});

test("أعمال — a custom thumbnail is protected from orphan cleanup", () => {
  const view = read("supabase/migrations/20260918000200_orphan_view_artist_work_thumbs.sql");
  assert.match(view, /SELECT thumbnail_image_url FROM public\.artist_works/);
  assert.match(read("src/lib/storage.ts"), /table: "artist_works", column: "thumbnail_image_url", bucket: "artists"/);
});

test("أعمال — artistWorkSchema accepts a full form and rejects out-of-contract values", () => {
  assert.equal(artistWorkSchema.safeParse(VALID).success, true);
  assert.equal(artistWorkSchema.safeParse({ ...VALID, youtube_url: "https://vimeo.com/123" }).success, false);
  assert.equal(artistWorkSchema.safeParse({ ...VALID, youtube_url: "javascript:alert(1)" }).success, false);
  assert.equal(artistWorkSchema.safeParse({ ...VALID, work_type: "podcast" }).success, false);
  assert.equal(artistWorkSchema.safeParse({ ...VALID, artist_id: "not-a-uuid" }).success, false);
  assert.equal(artistWorkSchema.safeParse({ ...VALID, title: "" }).success, false);
  assert.equal(artistWorkSchema.safeParse({ ...VALID, surprise: "x" }).success, false, "schema is strict");
});

test("أعمال — works route is dynamic and reads through the admin DAL", () => {
  const page = read("src/app/(admin)/admin/works/page.tsx");
  const dal = read("src/lib/dal/admin-artist-works.ts");

  assert.match(page, /dynamic = "force-dynamic"/);
  assert.match(page, /getAdminArtistWorks/);
  assert.match(page, /ArtistWorksManager/);
  assert.match(dal, /requireAdminSession/);
  assert.match(dal, /is_published/);
  assert.match(dal, /display_order/);
});

test("أعمال — manager covers canonical fields and guarded actions", () => {
  const manager = read("src/components/admin/ArtistWorksManager.tsx");

  for (const field of [
    "artist_id", "title", "work_type", "youtube_url", "description",
    "thumbnail_image_url", "display_order", "is_published",
  ]) {
    assert.ok(manager.includes(field), `works manager must include ${field}`);
  }

  assert.match(manager, /createArtistWorkAction/);
  assert.match(manager, /updateArtistWorkAction/);
  assert.match(manager, /deleteArtistWorkAction/);
  assert.match(manager, /setPublishStatusAction\("artist_works"/);
  assert.match(manager, /window\.confirm/);
  assert.match(manager, /<Notice notice=\{notice\} \/>/);
  assert.match(manager, /dir="rtl"/);
  // The client must validate with the very function the server validates with,
  // or the form can post a link the action will reject.
  assert.match(manager, /parseYouTubeId/);
});

test("أعمال — update action validates partial input behind requireAdminSession", () => {
  const action = read("src/actions/cms.ts");
  assert.match(action, /artistWorkSchema\.omit\(\{ id: true \}\)\.partial\(\)\.safeParse\(input\)/);
  assert.match(action, /export async function createArtistWorkAction/);
  assert.match(action, /export async function deleteArtistWorkAction/);
  assert.match(action, /"artist_works",/, "publish toggle needs artist_works in PUBLISHABLE_TABLES");
});

test("أعمال — the public band is a facade: no iframe until the visitor clicks", () => {
  const section = read("src/components/public/artist/ArtistWorks.tsx");
  const card = read("src/components/public/artist/ArtistWorkCard.tsx");
  const embed = read("src/components/ui/YouTubeEmbed.tsx");

  assert.doesNotMatch(section, /"use client"/, "the list stays a server component");
  assert.match(embed, /^"use client";/, "only the play toggle is client-side");

  // The card delegates the whole facade to the one shared embed component.
  assert.match(card, /<YouTubeEmbed/);
  assert.doesNotMatch(card, /<iframe/, "the card must not hand-roll an iframe");

  // One iframe per *clicked* card. An unconditional iframe would fire a
  // third-party request and set a cookie for every work on the page.
  assert.match(embed, /\{playing \?/);
  assert.match(embed, /youTubeEmbedUrl/);
  // The embed must not hand-build an embed URL; the no-cookie host is the
  // helper's job, so that is where it is asserted.
  assert.doesNotMatch(embed, /https:\/\/www\.youtube/, "embed URL comes from the shared helper");
  assert.match(read("src/lib/youtube.ts"), /youtube-nocookie\.com\/embed/);

  assert.match(section, /parseYouTubeId/, "unparseable rows are skipped, not rendered dead");
  assert.match(section, /if \(playable\.length === 0\) return null/);
});

test("أعمال — the artist page renders the band between the gallery and the discography", () => {
  const src = read("src/app/[locale]/(public)/artists/[slug]/page.tsx");

  assert.match(src, /getPublishedWorksByArtist/);
  const gallery = src.indexOf("<ArtistGallery");
  const works = src.indexOf("<ArtistWorks");
  const discography = src.indexOf("<ArtistDiscography");
  assert.ok(gallery > -1 && works > gallery, "works come after the gallery");
  assert.ok(discography > works, "works come before the career band");

  // With no published work the band must not leave a gap behind.
  assert.match(src, /empty:mt-0/);
});

test("أعمال — copy exists in both locales and title carries the rich <em>", () => {
  for (const key of [
    "artist.worksTitle", "artist.worksRegion", "artist.workPlay", "artist.workThumbAlt",
    "artist.workType.song", "artist.workType.concert",
    "artist.workType.interview", "artist.workType.documentary",
  ]) {
    assert.ok(arMessages[key]?.trim(), `ar is missing ${key}`);
    assert.ok(enMessages[key]?.trim(), `en is missing ${key}`);
  }
  assert.match(arMessages["artist.worksTitle"], /<em>/);
  assert.match(enMessages["artist.worksTitle"], /<em>/);
  assert.match(arMessages["artist.workPlay"], /\{title\}/);
});

test("أعمال — title and description are translatable through the shared localizer", () => {
  const localize = read("src/lib/dal/localize.ts");
  assert.match(localize, /artist_works: \["title", "description"\],/);
});
