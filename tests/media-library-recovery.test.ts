import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

test("the middleware never answers an admin Server Action with a redirect", () => {
  const middleware = read("src/middleware.ts");

  // A Server Action POST answered with a 307 to an HTML login page leaves the
  // client-side action promise pending forever — not resolved, not rejected —
  // so .finally never runs and the Media Library sits on its spinner. Only
  // document navigations may be redirected.
  assert.match(
    middleware,
    /request\.method !== "GET" && request\.method !== "HEAD"/,
    "non-GET admin requests must be handled separately from navigations",
  );
  assert.match(middleware, /status: 401/, "an unauthorized action must get a real error status");

  const guardIndex = middleware.indexOf('request.method !== "GET"');
  const redirectIndex = middleware.indexOf('new URL("/login", request.url)', guardIndex);
  assert.ok(
    guardIndex > -1 && redirectIndex > guardIndex,
    "the method guard must come before the login redirect it protects",
  );
});

test("a failed listing surfaces as an error with a retry, never a permanent spinner", () => {
  const library = read("src/components/admin/media/MediaLibrary.tsx");

  assert.match(library, /role="alert"/, "the failure must be announced");
  assert.match(library, /onClick=\{reload\}/, "the failure must be retryable in place");
  assert.match(
    library,
    /\.finally\(\s*\(\)\s*=>\s*\{[\s\S]*?setLoading\(false\)/,
    "loading must clear on every settlement path",
  );

  assert.ok(
    fs.existsSync(path.join(ROOT, "src/app/(admin)/admin/media/error.tsx")),
    "/admin/media needs an error boundary: without one a throw in this tree leaves the server-rendered loading text on screen",
  );
});

test("storage errors reach the UI instead of being swallowed into an empty list", () => {
  const dal = read("src/lib/dal/admin-media.ts");
  const action = read("src/actions/admin-media.ts");

  // `return []` on a storage error made a misconfigured bucket, a bad key and a
  // genuinely empty library indistinguishable — the panel just said "no files".
  assert.doesNotMatch(
    dal,
    /console\.error\([\s\S]{0,200}?\n\s*return \[\];/,
    "listBucketFiles must return the error, not swallow it into []",
  );
  assert.match(dal, /return \{ files: \[\], error: error\.message \}/);
  assert.match(action, /if \(error\) return \{ success: false/, "the action must propagate it");
});

test("the media-library entity id has exactly one definition", () => {
  assert.match(
    read("src/lib/storage.ts"),
    /export const MEDIA_LIBRARY_ENTITY_ID = "media-library"/,
    "defined in the universal module so client and server share one literal",
  );
  const zone = read("src/components/admin/media/MediaUploadZone.tsx");
  assert.doesNotMatch(
    zone,
    /export const MEDIA_LIBRARY_ENTITY_ID = ["']media-library["']/,
    "the client component must re-export the shared constant, not redeclare the literal",
  );
});

test("Media Library uploads land inside an approved bucket folder", () => {
  // The live upload path is @/actions/storage — the copy in @/actions/admin-media
  // was an unreachable duplicate and is gone.
  const action = read("src/actions/storage.ts");

  // `uploads/<ts>_<name>` is not in BUCKET_FOLDERS, so objects written there sit
  // outside every folder the pickers list and inside the orphan-cleanup reap set.
  assert.doesNotMatch(action, /`uploads\/\$\{ts\}/, "no ad-hoc uploads/ prefix");
  assert.match(action, /buildStoragePath\(\{/, "paths come from the shared builder");

  // The folder allowlist is enforced by validateUploadFile, which every upload
  // runs before it builds a path.
  assert.match(action, /validateUploadFile\(\{/, "uploads are validated before they are written");
  assert.match(
    read("src/lib/storage.ts"),
    /const folders = BUCKET_FOLDERS\[input\.bucket\]/,
    "validateUploadFile must check the folder against BUCKET_FOLDERS",
  );
});
