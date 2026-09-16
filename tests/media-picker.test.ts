import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".");

test("MediaPickerField — client component structure and exports", () => {
  const filePath = path.join(root, "src/components/admin/media/MediaPickerField.tsx");
  assert.ok(fs.existsSync(filePath), "MediaPickerField.tsx must exist");

  const source = fs.readFileSync(filePath, "utf-8");

  // Client component
  assert.match(source, /^"use client";/, 'Must have "use client" directive');

  // Imports ImageUploadField and listFolderMedia
  assert.match(
    source,
    /import\s+.*ImageUploadField.*from\s+["']@\/components\/admin\/media\/ImageUploadField["']/,
    "Must import ImageUploadField",
  );
  // listFolderMedia, not listMediaAction directly: it is the one path that
  // carries the timeout, so the picker cannot hang open on a spinner.
  assert.match(
    source,
    /import\s+.*listFolderMedia.*from\s+["']\.\/listFolderMedia["']/,
    "Must load files through listFolderMedia",
  );
  assert.doesNotMatch(
    source,
    /from\s+["']@\/actions\/admin-media["']/,
    "Must not call the listing action directly, bypassing the timeout",
  );

  // Exports MediaPickerField and MediaPickerFieldProps
  assert.match(source, /export\s+interface\s+MediaPickerFieldProps/, "Must export MediaPickerFieldProps");
  assert.match(source, /export\s+function\s+MediaPickerField/, "Must export MediaPickerField");
});

test("MediaPickerField — accessible states and composition contract", () => {
  const filePath = path.join(root, "src/components/admin/media/MediaPickerField.tsx");
  const source = fs.readFileSync(filePath, "utf-8");

  // Uses aria-pressed and role="alert"
  assert.match(source, /aria-pressed/, 'Must use aria-pressed for selected state');
  assert.match(source, /role="alert"/, 'Must use role="alert" for error reporting');

  // Button text
  assert.match(source, /اختر من مكتبة الوسائط/, 'Must include "اختر من مكتبة الوسائط" toggle button');

  // Composes ImageUploadField with site-settings entity
  assert.match(source, /entityId="site-settings"/, 'Must pass entityId "site-settings" to ImageUploadField');

  // Bucket filter and labels
  assert.match(source, /BUCKET_ALLOWED_MIMES/, "Must filter image buckets via BUCKET_ALLOWED_MIMES");
  assert.match(source, /BUCKET_LABELS/, "Must use BUCKET_LABELS for bucket names");

  // RTL-safe logical styles
  assert.doesNotMatch(source, /\b(ml-|mr-|pl-|pr-)\w+/, "Must not use non-logical physical directional margins or paddings");
});
