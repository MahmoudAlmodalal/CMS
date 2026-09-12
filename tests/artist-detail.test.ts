import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { arMessages, enMessages } from "./helpers/i18n.ts";
import { CANONICAL_RELEASES } from "../src/lib/releases.ts";
import { CANONICAL_FEATURED_ARTISTS } from "../src/lib/artists.ts";

const root = path.resolve(".");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf-8");

test("الفنان 134:4420 — 1. Component architecture & files", () => {
  const expected = [
    "src/app/[locale]/(public)/artists/[slug]/page.tsx",
    "src/components/public/artist/ArtistHero.tsx",
    "src/components/public/artist/ArtistProfileCard.tsx",
    "src/components/public/artist/ArtistGallery.tsx",
    "src/components/public/artist/ArtistDiscography.tsx",
    "src/components/public/artist/index.ts",
    "src/lib/releases.ts",
    "src/lib/dal/releases.ts",
  ];
  for (const rel of expected) {
    assert.ok(fs.existsSync(path.join(root, rel)), `Expected artist profile file: ${rel}`);
  }
});

test("الفنان 134:4420 — 2. Hero band geometry (134:4632-134:4643)", () => {
  const src = read("src/components/public/artist/ArtistHero.tsx");

  assert.match(src, /lg:h-\[611px\]/, "Hero band is the artboard's first 611px");
  // Heading 1 at (602,241): name Qahwa 48/44 over the quote in Cairo 16.8/27.72
  assert.match(src, /lg:top-\[241px\]/, "Heading block sits 241px down");
  assert.match(src, /lg:text-\[48px\][\s\S]*?lg:leading-\[44px\]/, "Name is 48/44");
  assert.match(src, /lg:text-\[16\.8px\][\s\S]*?lg:leading-\[27\.72px\]/, "Quote is 16.8/27.72");
  assert.match(src, /lg:pb-\[24px\]/, "Quote carries the frame's 24px pad");
  // Standfirst 134:4638 at (495,332), 458 wide, 4px right of centre
  assert.match(src, /lg:top-\[332px\]/, "Standfirst sits 332px down");
  assert.match(src, /lg:w-\[458px\]/, "Standfirst is 458px wide");
  assert.match(src, /lg:me-\[8px\]/, "Standfirst centres 4px right of the artboard");
  assert.match(src, /lg:text-\[14\.72px\][\s\S]*?lg:leading-\[27\.968px\]/, "Standfirst is 14.72/27.968");
  // CTA pair 134:4639 at (549,449), 47.067 tall, 16px gap, no radius
  assert.match(src, /lg:top-\[449px\]/, "CTA pair sits 449px down");
  assert.match(src, /h-\[47\.067px\]/, "CTA buttons are 47.067px tall");
  assert.match(src, /gap-\[16px\]/, "CTA pair is 16px apart");
  assert.match(src, /lg:ms-\[43\.54px\]/, "CTA pair centres 21.77px left of the artboard");
  assert.doesNotMatch(src, /rounded/, "Neither hero CTA has a corner radius in the frame");

  // The outline button is drawn on the physical right, so it comes first in RTL
  assert.ok(
    src.indexOf("contactCta") < src.indexOf("bookCta"),
    "Outline button precedes the terracotta link in the RTL DOM"
  );

  assert.equal(arMessages["artist.bookCta"], "احجز الفنان ♪");
  assert.equal(arMessages["artist.contactCta"], "تواصل مباشرة");
  assert.ok(enMessages["artist.bookCta"] && enMessages["artist.contactCta"]);
});

test("الفنان 134:4420 — 3. Profile row geometry (134:4671-134:4681)", () => {
  const src = read("src/components/public/artist/ArtistProfileCard.tsx");

  assert.match(src, /border-t-\[0\.833px\] border-secondary-400/, "0.833px secondary-400 rule on top");
  assert.match(src, /lg:py-\[48px\]/, "48px of air either side");
  assert.match(src, /max-w-\[1200px\][\s\S]*?lg:px-\[32px\]/, "1200px container padded 32px");
  assert.match(src, /lg:gap-\[40px\]/, "40px between portrait and text");
  assert.match(src, /lg:size-\[160px\]/, "Portrait is 160px");
  assert.match(src, /border-\[3\.333px\] border-primary-500\/20/, "3.333px primary-500 at 20%");
  assert.match(src, /lg:flex-\[936\.016_0_0\]/, "Text column takes the remaining 936.016px");
  assert.match(src, /lg:text-\[31px\][\s\S]*?lg:leading-\[46\.5px\]/, "Name is 31/46.5");
  assert.match(src, /tracking-\[0\.35px\] text-primary-500/, "Specialties are primary-500 tracked 0.35");
  assert.match(src, /lg:leading-\[32px\]/, "Biography is 16/32");
  assert.match(src, /text-brand-espresso\/70/, "Biography is 70% espresso");

  // The portrait is drawn on the physical left — the inline end in Arabic
  assert.ok(
    src.indexOf("full_bio") < src.indexOf("portraitAlt"),
    "Text column precedes the portrait in the RTL DOM"
  );
});

test("الفنان 134:4420 — 4. Gallery geometry (134:4644-134:4659)", () => {
  const src = read("src/components/public/artist/ArtistGallery.tsx");

  assert.match(src, /max-w-\[1280px\]/, "Section is 1280 wide");
  assert.match(src, /lg:px-\[40px\] lg:py-\[24px\]/, "Padded 40/24");
  assert.match(src, /lg:text-\[48px\] lg:leading-\[42\.27px\]/, "H2 is 48/42.27");
  assert.match(src, /tracking-\[-0\.5636px\]/, "H2 is tracked -0.5636");
  assert.match(src, /lg:pt-\[48px\]/, "Grid sits 48px under the heading");
  assert.match(
    src,
    /lg:grid-cols-\[265\.677px_295\.979px_265\.677px\]/,
    "Grid is 265.677 / 295.979 / 265.677"
  );
  assert.match(src, /lg:grid-rows-\[295\.979px\]/, "Row is 295.979 tall");
  assert.match(src, /gap-\[16px\]/, "Cells are 16px apart");
  assert.match(src, /rounded-\[12px\]/, "Cells are 12px-rounded");
  // Pull quote 134:4651
  assert.match(src, /bg-primary-500 px-\[40px\] py-\[48px\]/, "Quote card is padded 40/48 on terracotta");
  assert.match(src, /gap-\[24px\]/, "Quote card stacks 24px apart");
  assert.match(src, /text-\[56px\] leading-\[56px\] text-brand-surface\/\[0\.79\]/, "♪ is 56/56 at 79%");
  assert.match(src, /w-\[216px\][\s\S]*?leading-\[26\.4px\]/, "Quote is 16/26.4 over 216px");
  assert.match(src, /tracking-\[1\.12px\]/, "Attribution is tracked 1.12");

  assert.equal(arMessages["artist.galleryTitle"], "<em>الفن</em> في لحظته الأصدق");
  assert.ok(enMessages["artist.galleryTitle"]);
  for (const src2 of ["/assets/artists/stage-1.png", "/assets/artists/stage-2.png"]) {
    assert.ok(fs.existsSync(path.join(root, "public", src2.slice(1))), `Missing plate: ${src2}`);
  }
});

test("الفنان 134:4420 — 5. Career band geometry (134:4682-134:4744)", () => {
  const src = read("src/components/public/artist/ArtistDiscography.tsx");

  assert.match(src, /bg-gradscale-900/, "Band is gradscale-900 (#1B1B1B)");
  assert.match(src, /lg:py-\[96px\]/, "96px of air either side");
  assert.match(src, /pt-\[12px\][\s\S]*?lg:h-\[52px\]/, "H2 box is 52px with a 12px top pad");
  assert.match(src, /lg:text-\[48px\] lg:leading-\[40px\]/, "H2 is 48/40");
  assert.match(src, /text-brand-tint/, "H2 is brand-tint");
  // Filter row 134:4687 — drawn right to left as ألبومات, حفلات, أغاني
  assert.match(src, /lg:h-\[37\.667px\]/, "Filter row is 37.667px tall");
  assert.match(src, /gap-\[8px\]/, "Pills are 8px apart");
  assert.match(src, /bg-primary-500 px-\[20px\] py-\[8px\]/, "Active pill padded 20/8 on terracotta");
  assert.match(src, /border-\[0\.833px\] border-white\/15 bg-white\/\[0\.08\]/, "Idle pill is 8% white behind a 15% hairline");
  const order = ["albums", "concerts", "songs"].map((id) => src.indexOf(`"${id}"`));
  assert.ok(order[0] < order[1] && order[1] < order[2], "Pills run ألبومات, حفلات, أغاني in the RTL DOM");
  // Grid 134:4696
  assert.match(src, /lg:grid-cols-4/, "Four cards to a row");
  assert.match(src, /gap-\[20px\]/, "Cards are 20px apart");
  assert.match(src, /lg:pt-\[40px\]/, "Grid sits 40px under the filter row");
  assert.match(src, /lg:h-\[268\.997px\]/, "Cover plate is 268.997px tall");
  assert.match(src, /rounded-\[14px\] bg-\[#2a1d13\]/, "Plate is 14px-rounded on #2a1d13");
  assert.match(src, /start-\[2\.526px\] top-\[11\.992px\]/, "Badge hangs off the inline-start corner");
  assert.match(src, /text-\[8px\][\s\S]*?leading-\[12px\][\s\S]*?tracking-\[0\.8px\]/, "Badge is 8/12 tracked 0.8");
  assert.match(src, /lg:h-\[36px\]/, "Title box is 36px");
  assert.match(src, /text-\[#f0ebe1\]/, "Title is #f0ebe1");
  assert.match(src, /h-\[21px\]/, "Meta row is 21px");
  assert.match(src, /font-mono text-\[11px\] leading-\[16\.5px\] text-primary-500/, "Year is DM Mono 11/16.5 terracotta");
  assert.match(src, /text-\[10px\] leading-\[15px\] text-brand-tint\/40/, "Track count is 10/15 at 40% brand-tint");

  // The year is drawn at the physical right — the inline start in Arabic
  assert.ok(src.indexOf("release_year") < src.indexOf("trackCount"), "Year precedes the track count in the RTL DOM");
});

test("الفنان 134:4420 — 6. Discography content matches the frame", () => {
  const sara = CANONICAL_FEATURED_ARTISTS.find((a) => a.slug === "sara-alsawt");
  assert.ok(sara, "سارة الصوت is the artist the frame draws");
  const drawn = CANONICAL_RELEASES.filter((r) => r.artist_id === sara.id);

  // Right to left: نسمة من الأندلس, حنين, ليالي بيروت, عطر الماضي
  assert.deepEqual(
    drawn.map((r) => [r.title, r.release_type, r.track_count, r.release_year]),
    [
      ["نسمة من الأندلس", "studio", 12, 2023],
      ["حنين", "studio", 9, 2021],
      ["ليالي بيروت", "live", 10, 2019],
      ["عطر الماضي", "studio", 8, 2017],
    ],
    "Album row must carry the frame's titles, badges, counts and years in order"
  );
  for (const release of drawn) {
    assert.ok(
      fs.existsSync(path.join(root, "public", release.cover_image_url.slice(1))),
      `Missing cover: ${release.cover_image_url}`
    );
  }

  // The frame's own copy for the profile it draws
  assert.equal(sara.quote, "الصوت هو المرآة الأصدق للروح.");
  assert.equal(sara.spotlight_quote, "الصوت هو المرآة الأصدق للروح — لا تكذب على جمهورك أبداً.");
  assert.equal(sara.specialties, "الصوت • الغناء الأندلسي • الطرب الأصيل");
  assert.equal(sara.profile_image_url, "/assets/artists/sara-alsawt-profile.png");
  assert.equal(arMessages["artist.careerTitle"], "مسيرتها الفنية");
  assert.equal(arMessages["artist.releaseStudio"], "ألبوم استوديو");
  assert.equal(arMessages["artist.releaseLive"], "ألبوم حي");
});

test("الفنان 134:4420 — 7. Booking band variant (134:4660)", () => {
  const src = read("src/components/public/BookingBanner.tsx");

  assert.match(src, /lg:h-\[498px\]/, "Band is 498px tall");
  assert.match(src, /bg-\[rgba\(43,29,20,0\.88\)\]/, "Photograph sits under an 88% espresso wash");
  assert.match(src, /h-\[12\.05%\] w-\[6\.39%\][\s\S]*?opacity-\[0\.08\]/, "Arabesque mark is 6.39% x 12.05% at 8%");
  // artist variant offsets
  assert.match(src, /glyphTop: 57\.2/, "الفنان draws the ♪ at 57.2");
  assert.match(src, /headingTop: 201/, "الفنان draws the headline at 201");
  assert.match(src, /headingShift: 125/, "الفنان headline centres 62.5px left of the artboard");
  assert.match(src, /bodyTop: 271/, "الفنان draws the body at 271");
  assert.match(src, /ctaTop: 342/, "الفنان draws the button at 342");
  assert.match(src, /lg:leading-\[49\.315px\]/, "الفنان headline is 48/49.315");
  assert.match(src, /rounded-\[16px\] px-\[40px\] py-\[15\.2px\]/, "الفنان button is 16px-rounded, padded 40/15.2");
  // home variant is unchanged in shape
  assert.match(src, /lg:text-\[60px\] lg:leading-\[60px\]/, "الرئيسية headline is 60/60");
  assert.match(src, /h-\[48px\] w-\[207px\] rounded-\[12px\]/, "الرئيسية button is 207x48, 12px-rounded");

  assert.equal(arMessages["artist.bookingHeadline"], "تريد {name} في مناسبتك؟");
  assert.equal(arMessages["artist.bookingBody"], "تواصل معنا وسنصمم لك تجربة موسيقية لا تُنسى.");
  assert.ok(enMessages["artist.bookingHeadline"] && enMessages["artist.bookingBody"]);
});

test("الفنان 134:4420 — 8. Page assembles the frame's bands in order", () => {
  const src = read("src/app/[locale]/(public)/artists/[slug]/page.tsx");

  const order = ["ArtistHero", "ArtistProfileCard", "ArtistGallery", "ArtistDiscography", "BookingBanner"];
  let cursor = src.indexOf("return (");
  for (const name of order) {
    const at = src.indexOf(`<${name}`, cursor);
    assert.ok(at > -1, `Page must render ${name} after the band before it`);
    cursor = at;
  }

  // Band offsets straight off the frame
  assert.match(src, /lg:mt-\[12px\]/, "Profile row starts 12px under the hero");
  assert.match(src, /lg:mt-\[31\.17px\]/, "Gallery starts 31.17px under the profile row");
  assert.match(src, /lg:mt-\[80\.02px\]/, "Career band starts 80.02px under the gallery");
  assert.match(src, /lg:-mt-\[4\.16px\]/, "Booking band overlaps the career band by 4.16px");

  // Only the start dotted mark is drawn: its pair falls invisible on the dark band
  assert.match(src, /dots-artists-start\.png/);
  assert.doesNotMatch(src, /dots-artists-end\.png/);
  assert.match(src, /top-\[708px\]/, "Dotted mark hangs at y=708");

  // Contract carried over from Task 40
  assert.match(src, /getArtistBySlug/);
  assert.match(src, /getPublishedArtists/);
  assert.match(src, /getPublishedReleasesByArtist/);
  assert.match(src, /export async function generateStaticParams\(/);
  assert.match(src, /notFound\(\)/);
  assert.match(src, /from\s*["']next\/navigation["']/);
  assert.match(src, /export async function generateMetadata\(/);
  assert.match(src, /canonical/);
});
