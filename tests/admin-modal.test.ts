import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf-8");

const MANAGERS = [
  ["src/components/admin/ArtistsManager.tsx", "artist-form"],
  ["src/components/admin/TracksManager.tsx", "track-form"],
  ["src/components/admin/ReleasesManager.tsx", "release-form"],
  ["src/components/admin/ArtistWorksManager.tsx", "work-form"],
  ["src/components/admin/ArticlesManager.tsx", "article-form"],
  ["src/components/admin/TestimonialsManager.tsx", "testimonial-form"],
  ["src/components/admin/events/EventsTable.tsx", "event-form"],
] as const;

test("النماذج — ModalShell is a real dialog, not a card below the list", () => {
  const kit = read("src/components/admin/ManagerKit.tsx");

  assert.match(kit, /<dialog/, "a native dialog gives focus trapping and inertness for free");
  assert.match(kit, /showModal\(\)/, "showModal, not show — the page behind must be inert");
  assert.match(kit, /onCancel=/, "Esc must route through the caller so React state stays in sync");
  assert.match(kit, /backdrop:/, "the dim backdrop is what makes it read as a modal");
  assert.match(kit, /dir="rtl"/);
  assert.match(kit, /overflow-y-auto/, "the artist form is taller than any viewport");
  assert.match(kit, /max-h-\[90vh\]/);
});

test("النماذج — every manager opens its form in the modal, none inline", () => {
  for (const [file, formId] of MANAGERS) {
    const src = read(file);
    assert.match(src, /<ModalShell/, `${file} must render its form in ModalShell`);
    assert.match(src, new RegExp(`id="${formId}"`), `${file} must keep id="${formId}"`);
    assert.match(src, /onClose=\{closeForm\}/, `${file} must close the modal on Esc/backdrop`);
    // The old shape: a primary-bordered Card appended after the table, which is
    // why clicking تعديل on a long list looked like it did nothing.
    assert.doesNotMatch(
      src,
      /<Card variant="primary-border" id="/,
      `${file} still renders the inline form card`,
    );
  }
});

test("النماذج — an error notice renders inside the modal, not behind its backdrop", () => {
  for (const [file] of MANAGERS) {
    assert.match(
      read(file),
      /notice=\{<Notice notice=\{notice\} \/>\}/,
      `${file} must surface validation errors inside the open dialog`,
    );
  }
});

test("النماذج — portalled dropdowns escape the dialog's top layer", () => {
  const dropdown = read("src/components/ui/Dropdown.tsx");
  // A dialog opened with showModal() paints in the top layer, above every
  // z-index — so a listbox portalled to document.body would open behind it.
  assert.match(dropdown, /container \?\? modalContainer \?\? document\.body/);
  assert.match(dropdown, /useModalPortalContainer/);
  assert.match(read("src/components/admin/ManagerKit.tsx"), /ModalPortalContext\.Provider/);
});
