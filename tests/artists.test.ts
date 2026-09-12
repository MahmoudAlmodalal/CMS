import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".");

const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf-8");
const comp = (name: string) => read(`src/components/public/${name}`);

/** Strip comments so a `match` cannot pass on prose that merely describes a value. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "");
}

/**
 * الفنانين — the 1440 frame 91:17844 and the 390 frame 140:14652.
 *
 * The two frames do not draw the same directory. Desktop is a four-column grid;
 * mobile is two horizontal carousels. Both are pinned here because the mobile shape
 * was reverse-engineered from node geometry and would otherwise be one `lg:` away
 * from silently collapsing back into the stack it used to be.
 */
test("الفنانين — the 390 frame draws two RTL carousels, not the desktop grid at one column", () => {
  const grid = stripComments(comp("ArtistsGrid.tsx"));

  // Frame 40 (141:15048) is 387x900: two rows of 355x442, sixteen apart.
  assert.match(grid, /h-\[442px\] w-\[355px\]/, "Each carousel row is 355x442");
  assert.match(grid, /flex flex-col items-start gap-4/, "The two rows sit 16px apart");

  // Cards at x = -869, -563, -257, 49 — a 306 step, so 296 wide with 10 between,
  // inside a row padded by 10. Only the last is on-frame; the rest are scrolled off
  // toward the inline end, which in Arabic is the left.
  assert.match(grid, /gap-\[10px\] overflow-x-auto/, "The row scrolls horizontally with 10 between cards");
  assert.match(grid, /p-\[10px\]/, "The row is 10px padded, which holds the 422 card inside 442");
  assert.match(grid, /snap-x snap-mandatory/, "The carousel snaps to its cards");

  // A classic scrollbar would take its 15px out of the card, not out of the row.
  assert.match(grid, /\[scrollbar-width:none\]/, "Scrollbar gutters are suppressed so the 442 stays the card's");
  assert.match(grid, /\[&::-webkit-scrollbar\]:hidden/, "…in Chromium too");

  // The rows exist only where the design draws them. Above lg they collapse so the
  // cards are direct grid children again.
  assert.match(grid, /lg:contents/, "The rows flatten away above lg");
  assert.match(grid, /lg:grid lg:ms-\[113px\] lg:w-\[1214px\] lg:grid-cols-4/, "Desktop is still the 1214 four-column grid");
  assert.match(grid, /lg:gap-x-\[10px\] lg:gap-y-\[44px\]/, "Desktop keeps 10 across and 44 down");

  // Two rows is the design's own split of the list, not a wrap: the 442 is fixed, so
  // a wrap putting a variable number of cards in each row would not hold it.
  assert.match(grid, /Math\.ceil\(artists\.length \/ 2\)/, "The rows are built by halving the list");
  assert.doesNotMatch(grid, /flex-wrap/, "The carousel must not wrap");
  assert.doesNotMatch(grid, /grid-cols-1|sm:grid-cols-2/, "The mobile stack the frame does not draw is gone");
});

test("الفنانين — the card is one fixed 296x422 at every width", () => {
  const card = stripComments(comp("ArtistCard.tsx"));

  // 140:14884 on the 390 frame is the same box as 91:18063 on the 1440 one: a 340
  // image container hung at y=-26 over a 134 body at y=314, clipped to 422. So the
  // card carries no responsive width at all.
  assert.match(card, /h-\[422px\] w-\[296px\]/, "The card is 296x422 unconditionally");
  assert.match(card, /h-\[314px\]/, "The visible photograph is 314 tall");
  assert.match(card, /h-\[134px\] shrink-0 p-5/, "The body is 134 tall on 20px of padding");
  assert.match(card, /rounded-\[16px\]/, "The card radius is 16");
  assert.doesNotMatch(card, /lg:w-\[296px\]|lg:h-\[422px\]/, "The card's size is not lg-gated");
  assert.doesNotMatch(card, /aspect-/, "A fixed 296 width needs no aspect ratio to get 314");
  assert.match(card, /shrink-0 snap-start/, "The card is a snap target that does not compress in the row");

  // `priority` is deprecated in Next 16; the docs point at loading="eager".
  assert.doesNotMatch(card, /priority=\{priority\}/, "next/image priority is deprecated in Next 16");
  assert.match(card, /loading=\{priority \? "eager" : "lazy"\}/, "Above-the-fold cards load eagerly instead");
});

test("الفنانين — the filter bar is a 366x66.53 scroller on the 390 frame", () => {
  const tabs = stripComments(comp("ArtistFilterTabs.tsx"));

  // 140:14826 is 366x66.53 at x=10 — wider than the page's own 350 content box —
  // holding a 318x38 row on the same 24 of side padding as desktop.
  assert.match(tabs, /h-\[66\.533px\] w-\[366px\]/, "The bar is 366x66.533");
  assert.match(tabs, /ms-\[-6px\]/, "It breaks out of the page's 20px side padding to reach x=10");
  assert.match(tabs, /px-6 py-\[14\.267px\]/, "24 across, 14.267 down");

  // The labels keep the 32px rhythm, but عود وموسيقى opens at -67 and غناء at -125 —
  // off the row's inline end. So it scrolls; it must not wrap, which is what made it
  // 107 tall against the designed 66.53.
  assert.match(tabs, /gap-8 overflow-x-auto/, "The six labels sit 32 apart and scroll");
  assert.doesNotMatch(tabs, /flex-wrap/, "The bar must not wrap");
  assert.match(tabs, /shrink-0 cursor-pointer/, "No label compresses to fit");
  assert.match(tabs, /lg:h-auto lg:w-\[506px\]/, "Desktop is still the 506 pill");
});

test("الفنانين — the 390 frame's vertical rhythm", () => {
  const page = stripComments(read("src/app/[locale]/(public)/artists/page.tsx"));
  const client = stripComments(comp("ArtistsDirectoryClient.tsx"));
  const hero = stripComments(comp("PageHero.tsx"));

  // Band 0-678, filter bar at 710, carousel 809-1709, footer bottom-anchored at 2007.
  assert.match(page, /mobileHeight=\{678\}/, "The band is 678 on the 390 frame");
  assert.match(page, /pb-\[298px\] pt-\[32px\] lg:pb-\[172px\] lg:pt-\[127px\]/, "32 opens the section and 298 closes it");
  assert.match(client, /gap-\[32\.467px\] lg:items-stretch lg:gap-\[41\.7px\]/, "32.467 between the filter bar and the carousel");

  // The band height is per-frame, so it cannot come from a shared default.
  assert.match(hero, /--hero-mobile-height/, "PageHero takes its 390 band height from the frame");
  assert.doesNotMatch(hero, /sm:h-\[500px\]/, "The invented tablet band height is gone — Figma has no tablet frame");
});
