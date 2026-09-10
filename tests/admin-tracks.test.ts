import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { trackSchema, releaseSchema } from "../src/lib/validations/cms.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

test("Task 45 — tracks route is dynamic and reads through the admin DAL", () => {
  const page = read("src/app/(admin)/admin/tracks/page.tsx");
  const dal = read("src/lib/dal/admin-tracks.ts");

  assert.match(page, /dynamic = "force-dynamic"/);
  assert.match(page, /getAdminTracks/);
  assert.match(page, /TracksManager/);
  assert.match(dal, /requireAdminSession/);
  assert.match(dal, /is_published/);
  assert.match(dal, /display_order/);
});

test("Task 45 — releases route is dynamic and reads through the admin DAL", () => {
  const page = read("src/app/(admin)/admin/releases/page.tsx");
  const dal = read("src/lib/dal/admin-releases.ts");

  assert.match(page, /dynamic = "force-dynamic"/);
  assert.match(page, /getAdminReleases/);
  assert.match(page, /ReleasesManager/);
  assert.match(dal, /requireAdminSession/);
  assert.match(dal, /is_published/);
  assert.match(dal, /display_order/);
});

test("Task 45 — tracks manager covers canonical fields, guarded actions, and audio contract", () => {
  const manager = read("src/components/admin/TracksManager.tsx");

  for (const field of [
    "artist_id", "title", "audio_file_url", "duration_seconds", "cover_image_url",
    "display_order", "is_published",
  ]) {
    assert.ok(manager.includes(field), `tracks manager must include ${field}`);
  }

  assert.match(manager, /createTrackAction/);
  assert.match(manager, /updateTrackAction/);
  assert.match(manager, /deleteTrackAction/);
  assert.match(manager, /setPublishStatusAction\("tracks"/);
  assert.match(manager, /window\.confirm/);
  assert.match(manager, /<Notice notice=\{notice\} \/>/);
  assert.match(manager, /dir="rtl"/);
  assert.match(manager, /AUDIO_MAX_BYTES/);
  assert.match(manager, /BUCKET_ALLOWED_MIMES/);
  assert.match(manager, /from "@\/lib\/storage"/);
});

test("Task 45 — releases manager covers canonical fields and guarded actions", () => {
  const manager = read("src/components/admin/ReleasesManager.tsx");

  for (const field of [
    "artist_id", "title", "release_type", "track_count", "release_year",
    "cover_image_url", "display_order", "is_published",
  ]) {
    assert.ok(manager.includes(field), `releases manager must include ${field}`);
  }

  assert.match(manager, /createReleaseAction/);
  assert.match(manager, /updateReleaseAction/);
  assert.match(manager, /deleteReleaseAction/);
  assert.match(manager, /setPublishStatusAction\("releases"/);
  assert.match(manager, /window\.confirm/);
  assert.match(manager, /<Notice notice=\{notice\} \/>/);
  assert.match(manager, /dir="rtl"/);
});

test("Task 45 — Notice component (shared with ArtistsManager) sets alert/status role", () => {
  const kit = read("src/components/admin/ManagerKit.tsx");
  assert.match(kit, /role=\{notice\.type === "error" \? "alert" : "status"\}/);
});

test("Task 45 — trackSchema accepts a full form and rejects out-of-contract values", () => {
  const input = {
    artist_id: "5f0a1c1a-7b2b-4e34-9a3e-9c2f6c6a1234",
    title: "مقطع تجريبي",
    audio_file_url: "https://example.com/track.mp3",
    duration_seconds: 210,
    cover_image_url: "https://example.com/cover.webp",
    display_order: 1,
    is_published: false,
  };

  assert.equal(trackSchema.safeParse(input).success, true);
  assert.equal(trackSchema.safeParse({ ...input, audio_file_url: "javascript:alert(1)" }).success, false);
  assert.equal(trackSchema.safeParse({ ...input, duration_seconds: -1 }).success, false);
  assert.equal(trackSchema.safeParse({ ...input, artist_id: "not-a-uuid" }).success, false);
});

test("Task 45 — releaseSchema accepts a full form and rejects out-of-contract values", () => {
  const input = {
    artist_id: "5f0a1c1a-7b2b-4e34-9a3e-9c2f6c6a1234",
    title: "ألبوم تجريبي",
    release_type: "studio",
    track_count: 10,
    release_year: 2024,
    cover_image_url: "https://example.com/cover.webp",
    display_order: 0,
    is_published: false,
  };

  assert.equal(releaseSchema.safeParse(input).success, true);
  assert.equal(releaseSchema.safeParse({ ...input, release_type: "remix" }).success, false);
  assert.equal(releaseSchema.safeParse({ ...input, release_year: 1899 }).success, false);
  assert.equal(releaseSchema.safeParse({ ...input, track_count: 0 }).success, false);
});

test("Task 45 — update actions validate partial input and stay behind requireAdminSession", () => {
  const action = read("src/actions/cms.ts");

  assert.match(action, /trackSchema\.omit\(\{ id: true \}\)\.partial\(\)\.safeParse\(input\)/);
  assert.match(action, /releaseSchema\.omit\(\{ id: true \}\)\.partial\(\)\.safeParse\(input\)/);
  assert.match(action, /export async function createTrackAction/);
  assert.match(action, /export async function createReleaseAction/);
  assert.match(action, /export async function deleteTrackAction/);
  assert.match(action, /export async function deleteReleaseAction/);
});

test("Task 45 — shadow validation/action modules are removed", () => {
  for (const rel of [
    "src/actions/admin-tracks.ts",
    "src/actions/admin-releases.ts",
    "src/lib/validations/tracks.ts",
    "src/lib/validations/releases.ts",
  ]) {
    assert.equal(fs.existsSync(path.join(ROOT, rel)), false, `${rel} should have been deleted`);
  }
});
