import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { storageErrorMessageAr, storageHintAr } from "../src/lib/storage.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf-8");

test("الرفع — the hint quotes the limits the validator actually enforces", () => {
  const portrait = storageHintAr("artists", "portraits");
  assert.match(portrait, /800×1000/, "recommended dimensions come from RECOMMENDED_DIMENSIONS");
  assert.match(portrait, /5MB/, "byte ceiling comes from BUCKET_BYTE_LIMITS");
  assert.match(portrait, /JPG/);
  assert.doesNotMatch(portrait, /SVG/, "svg is site-only, so it must not be advertised here");

  // A folder with no entry in the matrix must degrade, not print "undefined".
  const audio = storageHintAr("audio", "tracks");
  assert.doesNotMatch(audio, /undefined|NaN|×/);
  assert.match(audio, /30MB/);
});

test("الرفع — Supabase storage errors are translated into actionable Arabic", () => {
  // The production failure: Storage rejecting the service-role bearer token.
  const jws = storageErrorMessageAr("Invalid Compact JWS");
  assert.match(jws, /SUPABASE_SERVICE_ROLE_KEY/, "must name the setting that is wrong");
  assert.doesNotMatch(jws, /Invalid Compact JWS/, "the raw string told the editor nothing");

  assert.match(storageErrorMessageAr("The object exceeded the maximum allowed size"), /الحد المسموح/);
  assert.match(storageErrorMessageAr("mime type video/mp4 is not supported"), /نوع الملف/);
  assert.match(storageErrorMessageAr("Bucket not found"), /حاوية/);
  assert.match(storageErrorMessageAr("new row violates row-level security policy"), /صلاحية/);
  // An unrecognised error still reaches the editor rather than being swallowed.
  assert.match(storageErrorMessageAr("some novel failure"), /some novel failure/);
});

test("الرفع — the upload tries the admin's own session before the service key", () => {
  const action = read("src/actions/storage.ts");

  const session = action.indexOf("supabase.storage.from(input.bucket).upload");
  const service = action.indexOf("admin.storage.from(input.bucket).upload");
  assert.ok(session > -1 && service > -1, "both upload paths must exist");
  assert.ok(session < service, "the RLS session client must be tried first");

  assert.match(action, /storageErrorMessageAr\(uploadError\.message\)/);
  assert.doesNotMatch(action, /Upload failed: \$\{/, "raw English errors must not reach the CMS");
});

test("الرفع — Server Actions accept more than the 1MB default body", () => {
  // Without this every image over ~1MB died at the action boundary with React
  // error #441 before any of our code ran.
  assert.match(read("next.config.ts"), /bodySizeLimit/);
});

test("الرفع — audio file upload is gone; the field takes a pasted link only", () => {
  const field = read("src/components/admin/media/AudioUploadField.tsx");
  assert.doesNotMatch(field, /uploadMediaAction/, "audio no longer uploads through a Server Action");
  assert.doesNotMatch(field, /type="file"/);
  assert.match(field, /type="url"/, "an already-hosted track still pastes in");
  assert.match(field, /<audio controls/, "and still previews");
});

test("الرفع — the site bucket accepts the video MIMEs the app advertises", () => {
  // src/lib/storage.ts allowed video in `site` while the bucket row did not, so
  // every hero-video upload was rejected by the Storage API.
  const migration = read("supabase/migrations/20260918000100_widen_site_bucket_video.sql");
  for (const mime of ["video/mp4", "video/webm", "video/ogg", "video/quicktime"]) {
    assert.ok(migration.includes(mime), `site bucket must accept ${mime}`);
    assert.ok(read("src/lib/storage.ts").includes(mime));
  }
  assert.match(migration, /file_size_limit = 52428800|52428800/);
});
