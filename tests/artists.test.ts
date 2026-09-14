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
