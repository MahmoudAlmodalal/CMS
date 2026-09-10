/**
 * Task 29 — Storage policy tests (STORAGE_ARCHITECTURE.md, Task 20A).
 * Pure-function coverage: paths, MIME allowlists, spoofed content, size
 * boundaries, SVG safety, dimensions, URL helpers, reference map, orphans.
 * Server Actions (upload/replace/delete/cleanup) require live Supabase
 * credentials and are exercised in Tasks 50/55; the admin-claim gate they
 * enforce is covered here via isAdminClaim.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  AUDIO_MAX_BYTES,
  BUCKET_ALLOWED_MIMES,
  BUCKET_BYTE_LIMITS,
  BUCKET_FOLDERS,
  IMAGE_MAX_BYTES,
  MEDIA_REFERENCES,
  ORPHAN_GRACE_HOURS,
  STORAGE_BUCKETS,
  buildStoragePath,
  computeOrphans,
  extractStoragePath,
  findMediaReference,
  getImageDimensions,
  isAdminClaim,
  isSafeSvg,
  resolveMediaUrl,
  sanitizeSlug,
  sniffMime,
  validateUploadFile,
} from "../src/lib/storage.ts";

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://xyzcompany.supabase.co";

// --- minimal binary fixtures ------------------------------------------------

function pngBytes(w: number, h: number): Uint8Array {
  const b = new Uint8Array(33);
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);
  b.set([0x49, 0x48, 0x44, 0x52], 12); // IHDR
  b[16] = (w >>> 24) & 0xff; b[17] = (w >>> 16) & 0xff; b[18] = (w >>> 8) & 0xff; b[19] = w & 0xff;
  b[20] = (h >>> 24) & 0xff; b[21] = (h >>> 16) & 0xff; b[22] = (h >>> 8) & 0xff; b[23] = h & 0xff;
  b.set([8, 2, 0, 0, 0], 24);
  return b;
}

function jpegBytes(w: number, h: number): Uint8Array {
  const b = new Uint8Array(30);
  b.set([0xff, 0xd8, 0xff, 0xe0, 0, 2], 0); // SOI + empty APP0
  b.set([0xff, 0xc0, 0, 0x0b, 8], 6); // SOF0
  b[11] = (h >>> 8) & 0xff; b[12] = h & 0xff;
  b[13] = (w >>> 8) & 0xff; b[14] = w & 0xff;
  b.set([3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 15);
  return b;
}

function webpBytes(w: number, h: number): Uint8Array {
  const b = new Uint8Array(30);
  const enc = new TextEncoder();
  b.set(enc.encode("RIFF"), 0);
  b.set(enc.encode("WEBP"), 8);
  b.set(enc.encode("VP8X"), 12);
  const w1 = w - 1, h1 = h - 1;
  b[24] = w1 & 0xff; b[25] = (w1 >>> 8) & 0xff; b[26] = (w1 >>> 16) & 0xff;
  b[27] = h1 & 0xff; b[28] = (h1 >>> 8) & 0xff; b[29] = (h1 >>> 16) & 0xff;
  return b;
}

function avifBytes(): Uint8Array {
  const b = new Uint8Array(12);
  new TextEncoder().encodeInto("....ftypavif", b);
  return b;
}

function mp3Bytes(): Uint8Array {
  const b = new Uint8Array(10);
  b.set([0x49, 0x44, 0x33, 3, 0, 0, 0, 0, 0, 0]); // ID3
  return b;
}

const enc = new TextEncoder();
const svgClean = enc.encode('<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="4"/></svg>');
const svgEvil = enc.encode('<svg xmlns="http://www.w3.org/2000/svg" onload="steal()"><circle cx="5" cy="5" r="4"/></svg>');
const exeBytes = enc.encode("MZ\x90\x00evil-binary-payload");

// --- buckets / limits / allowlists ------------------------------------------

test("Task 29 — 7 canonical buckets with quotas and MIME lists", () => {
  assert.deepEqual([...STORAGE_BUCKETS], ["site", "artists", "releases", "events", "academy", "articles", "audio"]);
  assert.equal(IMAGE_MAX_BYTES, 5242880);
  assert.equal(AUDIO_MAX_BYTES, 31457280);
  for (const b of ["site", "artists", "releases", "events", "academy", "articles"] as const) {
    assert.equal(BUCKET_BYTE_LIMITS[b], IMAGE_MAX_BYTES);
    assert.ok(BUCKET_ALLOWED_MIMES[b].includes("image/avif"), `${b} allows avif`);
  }
  assert.equal(BUCKET_BYTE_LIMITS.audio, AUDIO_MAX_BYTES);
  assert.ok(BUCKET_ALLOWED_MIMES.audio.includes("audio/aac"), "audio allows aac");
  assert.ok(BUCKET_ALLOWED_MIMES.site.includes("image/svg+xml"), "site allows svg");
  assert.ok(!BUCKET_ALLOWED_MIMES.artists.includes("image/svg+xml"), "svg is site-only");
  assert.ok(Object.values(BUCKET_FOLDERS).every((f) => f.length > 0));
});

// --- paths -------------------------------------------------------------------

test("Task 29 — deterministic version-addressed paths, slug sanitization", () => {
  const p = buildStoragePath({
    bucket: "artists", entityId: "8f4c2e6b-7a1b-4f9e-8c3d-1e2a3b4c5d6e",
    label: "Sara Voice", mime: "image/webp", timestamp: 1741604400,
  });
  assert.equal(p, "portraits/8f4c2e6b-7a1b-4f9e-8c3d-1e2a3b4c5d6e/1741604400_sara-voice.webp");
  assert.equal(sanitizeSlug("صورة-عمر (النهائية).PNG"), "png");
  assert.equal(sanitizeSlug("Taqsim Bayati!!"), "taqsim-bayati");
  assert.equal(sanitizeSlug("???"), "file");
  assert.throws(() => buildStoragePath({
    bucket: "artists", entityId: "../evil", label: "x", mime: "image/png", timestamp: 1,
  }), /entity id/);
  assert.throws(() => buildStoragePath({
    bucket: "artists", folder: "tracks", entityId: "a", label: "x", mime: "image/png", timestamp: 1,
  }), /Folder/);
});

// --- URL helpers --------------------------------------------------------------

test("Task 29 — resolveMediaUrl and extractStoragePath round-trip", () => {
  const rel = "portraits/abc/1_x.webp";
  const abs = resolveMediaUrl("artists", rel);
  assert.equal(abs, "https://xyzcompany.supabase.co/storage/v1/object/public/artists/portraits/abc/1_x.webp");
  assert.equal(resolveMediaUrl("artists", abs), abs);
  assert.equal(resolveMediaUrl("artists", null), null);
  const back = extractStoragePath(abs!);
  assert.deepEqual(back, { bucket: "artists", path: rel });
  assert.equal(extractStoragePath("portraits/abc/1_x.webp"), null);
  assert.equal(extractStoragePath("https://xyzcompany.supabase.co/storage/v1/object/public/nope/1_x.webp"), null);
});

// --- sniffing / spoofing -------------------------------------------------------

test("Task 29 — magic-byte sniffing incl. spoofed uploads", () => {
  assert.equal(sniffMime(pngBytes(100, 50)), "image/png");
  assert.equal(sniffMime(jpegBytes(200, 100)), "image/jpeg");
  assert.equal(sniffMime(webpBytes(300, 150)), "image/webp");
  assert.equal(sniffMime(avifBytes()), "image/avif");
  assert.equal(sniffMime(mp3Bytes()), "audio/mpeg");
  assert.equal(sniffMime(svgClean), "image/svg+xml");
  assert.equal(sniffMime(exeBytes), null);
  // executable masquerading as audio must not sniff as audio
  assert.notEqual(sniffMime(exeBytes), "audio/mpeg");
});

test("Task 29 — SVG script content rejected", () => {
  assert.equal(isSafeSvg(svgClean), true);
  assert.equal(isSafeSvg(svgEvil), false);
  assert.equal(isSafeSvg(enc.encode('<svg><script>alert(1)</script></svg>')), false);
});

// --- dimensions -----------------------------------------------------------------

test("Task 29 — dimension parsing PNG/JPEG/WebP", () => {
  assert.deepEqual(getImageDimensions(pngBytes(100, 50), "image/png"), { w: 100, h: 50 });
  assert.deepEqual(getImageDimensions(jpegBytes(200, 100), "image/jpeg"), { w: 200, h: 100 });
  assert.deepEqual(getImageDimensions(webpBytes(300, 150), "image/webp"), { w: 300, h: 150 });
  assert.equal(getImageDimensions(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), "image/jpeg"), null);
});

// --- upload validation matrix ----------------------------------------------------

function check(over: Partial<Parameters<typeof validateUploadFile>[0]> = {}) {
  return validateUploadFile({
    bucket: "artists", entityId: "abc", label: "photo.png",
    mime: "image/png", size: 1000, bytes: pngBytes(100, 50), ...over,
  });
}

test("Task 29 — valid files pass; invalid MIME / spoofed ext / oversize fail", () => {
  assert.equal(check().ok, true);
  assert.equal(check({ mime: "image/gif", bytes: enc.encode("GIF89a.........") }).ok, false);
  assert.equal(check({ label: "song.mp3" }).errors.join(" ").includes("Extension"), true);
  assert.equal(check({ size: IMAGE_MAX_BYTES + 1 }).ok, false);
  assert.equal(check({ size: 0, bytes: new Uint8Array(0) }).ok, false);
  // PNG bytes declared as audio → content mismatch
  const spoof = check({ bucket: "audio", label: "x.mp3", mime: "audio/mpeg", bytes: pngBytes(100, 50) });
  assert.equal(spoof.ok, false);
  assert.ok(spoof.errors.join(" ").includes("sniffed"));
  // exe bytes unrecognized
  assert.ok(check({ bytes: exeBytes }).errors.join(" ").includes("recognized"));
  // tiny / huge images rejected by guardrails
  assert.equal(check({ bytes: pngBytes(10, 10) }).ok, false);
  assert.equal(check({ bytes: pngBytes(5000, 10) }).ok, false);
  // corrupt jpeg headers rejected
  assert.equal(check({
    label: "x.jpg", mime: "image/jpeg", bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xd9]),
  }).ok, false);
});

test("Task 29 — audio 30 MB boundary + SVG site-only rule", () => {
  const ok = validateUploadFile({
    bucket: "audio", entityId: "abc", label: "taqsim.mp3",
    mime: "audio/mpeg", size: AUDIO_MAX_BYTES, bytes: mp3Bytes(),
  });
  assert.equal(ok.ok, true);
  const over = validateUploadFile({
    bucket: "audio", entityId: "abc", label: "taqsim.mp3",
    mime: "audio/mpeg", size: AUDIO_MAX_BYTES + 1, bytes: mp3Bytes(),
  });
  assert.equal(over.ok, false);
  assert.equal(check({ bucket: "artists", label: "x.svg", mime: "image/svg+xml", bytes: svgClean }).ok, false);
  assert.equal(check({ bucket: "site", label: "logo.svg", mime: "image/svg+xml", bytes: svgClean }).ok, true);
  assert.equal(check({ bucket: "site", label: "evil.svg", mime: "image/svg+xml", bytes: svgEvil }).ok, false);
  // avif accepted in image buckets (dimension check skipped by design)
  assert.equal(check({ label: "x.avif", mime: "image/avif", bytes: avifBytes() }).ok, true);
});

// --- admin claim / references / orphans --------------------------------------------

test("Task 29 — canonical admin claim check", () => {
  assert.equal(isAdminClaim({ role: "admin" }), true);
  assert.equal(isAdminClaim({ role: "user" }), false);
  assert.equal(isAdminClaim({}), false);
  assert.equal(isAdminClaim(null), false);
});

test("Task 29 — media reference map guards replace/delete", () => {
  assert.equal(MEDIA_REFERENCES.length, 9);
  assert.ok(findMediaReference("artists", "portrait_image_url"));
  assert.ok(findMediaReference("tracks", "audio_file_url"));
  assert.equal(findMediaReference("artists", "name"), null);
  assert.equal(findMediaReference("booking_requests", "message"), null);
});

test("Task 29 — orphan set-difference with 24h grace", () => {
  const now = Date.now();
  const h = 3600 * 1000;
  const objs = [
    { bucket: "artists", path: "portraits/a/1_x.webp", createdAtMs: now - 25 * h, sizeBytes: 10 },
    { bucket: "artists", path: "portraits/a/2_y.webp", createdAtMs: now - 23 * h, sizeBytes: 10 },
    { bucket: "artists", path: "portraits/a/3_z.webp", createdAtMs: now - 30 * h, sizeBytes: 10 },
    { bucket: "nope", path: "x", createdAtMs: now - 30 * h, sizeBytes: 10 },
  ];
  const orphans = computeOrphans(objs, new Set(["portraits/a/3_z.webp"]), now, ORPHAN_GRACE_HOURS);
  assert.deepEqual(orphans.map((o) => o.path), ["portraits/a/1_x.webp"]);
});
