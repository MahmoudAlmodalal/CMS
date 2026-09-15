import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".");
const read = (...segments: string[]) => fs.readFileSync(path.join(root, ...segments), "utf8");

test("Responsive public pages — mobile and tablet layout contracts", () => {
  const grid = read("src/components/public/ArtistsGrid.tsx");
  const filters = read("src/components/public/ArtistFilterTabs.tsx");
  const card = read("src/components/public/ArtistCard.tsx");
  const form = read("src/components/public/BookingForm.tsx");
  const bookingPage = read("src/app/[locale]/(public)/booking/page.tsx");
  const footer = read("src/components/public/Footer.tsx");
  const shell = read("src/components/public/MobileNavbar.tsx");

  assert.match(grid, /w-full|max-w-\[355px\]/);
  assert.match(grid, /overflow-x-auto/);
  assert.match(filters, /overflow-x-auto/);
  assert.match(card, /shrink-0 snap-start/);
  assert.match(form, /grid min-w-0 grid-cols-1/);
  assert.match(form, /sm:grid-cols-2/);
  assert.match(bookingPage, /min-w-0 w-full max-w-full/);
  assert.match(footer, /flex flex-col/);
  assert.match(footer, /lg:flex-row/);
  assert.match(shell, /absolute inset-x-2\.5/);
  assert.match(shell, /top-\[36px\]/);
});

test("Responsive public pages — no mobile-only arbitrary desktop width regression", () => {
  const sources = [
    read("src/components/public/ArtistsGrid.tsx"),
    read("src/components/public/ArtistCard.tsx"),
    read("src/components/public/BookingForm.tsx"),
    read("src/components/public/Footer.tsx"),
  ].join("\n");

  assert.doesNotMatch(sources, /w-\[736px\]|w-\[1280px\]/);
  assert.doesNotMatch(sources, /nth-child\(n\+5\)/);
});
