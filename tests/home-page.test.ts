import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { arMessages, enMessages } from "./helpers/i18n.ts";

const root = path.resolve(".");
const pub = (...segs: string[]) => path.join(root, "src/app/[locale]/(public)", ...segs);
const comp = (...segs: string[]) => path.join(root, "src/components/public", ...segs);
const read = (p: string) => fs.readFileSync(p, "utf-8");

test("Milestone 2 — 1. Canonical 8-Stage Vertical Coordinate Sequence & Landmark Architecture", () => {
  const pageSrc = read(pub("page.tsx"));
  const layoutSrc = read(pub("layout.tsx"));

  // 1. All 7 page stages imported in clean barrel or module imports
  const requiredStageImports = [
    "HeroSection",
    "AboutSection",
    "FeaturedArtists",
    "TestimonialsSlider",
    "EditorialFeature",
    "HomeEvents",
    "BookingBanner",
  ];
  for (const component of requiredStageImports) {
    assert.match(
      pageSrc,
      new RegExp(`\\b${component}\\b`),
      `src/app/[locale]/(public)/page.tsx must import ${component}`
    );
  }

  // 2. Strict Y-order sequence of stage component invocations
  const stageIndices = requiredStageImports.map((name) => {
    const idx = pageSrc.indexOf(`<${name}`);
    assert.ok(
      idx !== -1,
      `src/app/[locale]/(public)/page.tsx must render component <${name} />`
    );
    return { name, idx };
  });

  for (let i = 0; i < stageIndices.length - 1; i++) {
    const current = stageIndices[i];
    const next = stageIndices[i + 1];
    assert.ok(
      current.idx < next.idx,
      `Stage ${i + 1} (${current.name}) must precede Stage ${i + 2} (${next.name}) in DOM order`
    );
  }

  // 3. Stage 8 (Footer) rendered immediately following <main> in layout.tsx
  const mainIdx = layoutSrc.indexOf("<main");
  const footerIdx = layoutSrc.indexOf("<Footer");
  assert.ok(mainIdx !== -1, "Public layout must contain <main> landmark");
  assert.ok(footerIdx !== -1, "Public layout must render <Footer> (Stage 8)");
  assert.ok(
    mainIdx < footerIdx,
    "Layout <main> viewport must precede <Footer /> (Stage 8) in DOM order"
  );

  // 4. Zero duplicate wrappers: No nested <main> or duplicate <footer> in page.tsx
  assert.doesNotMatch(
    pageSrc,
    /<main[\s>]/,
    "page.tsx must not contain duplicate <main> landmark (already declared in layout.tsx)"
  );
  assert.doesNotMatch(
    pageSrc,
    /<Footer[\s\/>]/,
    "page.tsx must not render duplicate <Footer /> (already rendered globally in layout.tsx)"
  );
});

test("Milestone 2 — 4. Stage 3: Featured Artists Geometry & 4:5 Card Aspect Ratios (Figma Frame 14, 87:14240)", () => {
  const artistsSectionSrc = read(comp("FeaturedArtists.tsx"));
  // The homepage rail renders ArtistTile, not the directory's ArtistCard; these
  // assertions read the component that is actually on the frame.
  const artistTileSrc = read(comp("ArtistTile.tsx"));

  // Height: 615px
  assert.match(
    artistsSectionSrc,
    /615px/,
    "FeaturedArtists must enforce canonical Figma height: 615px"
  );

  // Heading: Qahwa 64px "أصوات تصنع التاريخ"
  assert.match(
    artistsSectionSrc,
    /text-\[64px\]|text-4xl[\s\S]*lg:text-\[64px\]/,
    "FeaturedArtists heading must declare 64px display font size"
  );
  assert.match(
    artistsSectionSrc,
    /artistsHeading/,
    "FeaturedArtists heading must render the home.artistsHeading message"
  );
  assert.equal(arMessages["home.artistsHeading"], "أصوات تصنع التاريخ", "Arabic heading copy is confirmed by Figma");
  assert.ok(enMessages["home.artistsHeading"], "English heading copy must exist");

  // Action link to /artists
  assert.match(
    artistsSectionSrc,
    /ctaHref \|\| "\/artists"/,
    "FeaturedArtists action link must route to /artists by default"
  );

  // Tile geometry — a 16px-radius tile, 220x293 on the 1440 frame (87:14241) and
  // 160x239 on the 390 one (136:5396), where the rail becomes a 2x2 grid.
  assert.match(
    artistTileSrc,
    /h-\[239px\] w-\[160px\]/,
    "ArtistTile must enforce the 390 frame's 160x239 tile"
  );
  assert.match(
    artistTileSrc,
    /lg:h-\[293px\] lg:w-\[220px\]/,
    "ArtistTile must enforce the frame's 220x293 tile"
  );
  assert.match(
    artistTileSrc,
    /rounded-\[16px\]/,
    "ArtistTile must enforce the frame's 16px corner radius"
  );

  // Marquee pause on hover
  assert.match(
    artistsSectionSrc,
    /<Marquee[\s\S]*?pauseOnHover/,
    "FeaturedArtists must pass pauseOnHover to Marquee"
  );
  const marqueeSrc = read(comp("motion/Marquee.tsx"));
  assert.match(
    marqueeSrc,
    /pauseOnHover/,
    "Marquee must support pauseOnHover prop"
  );
  assert.match(
    marqueeSrc,
    /onMouseEnter/,
    "Marquee must pause on mouse hover"
  );

  assert.match(artistsSectionSrc, /<section[\s>]/, "FeaturedArtists must use semantic <section> tag");
});

test("Milestone 2 — 5. Stage 4: Testimonials Section Geometry & Single Quote Card (Figma Section 87:14313)", () => {
  const testimonialsSrc = read(comp("TestimonialsSlider.tsx"));

  // Height: 597px
  assert.match(
    testimonialsSrc,
    /597px/,
    "TestimonialsSlider must enforce canonical Figma height: 597px"
  );

  // Surface fill: Warm Parchment #F9F7F0
  assert.match(
    testimonialsSrc,
    /#F9F7F0|bg-\[#F9F7F0\]/,
    "TestimonialsSlider must use verified warm parchment surface: #F9F7F0"
  );
  assert.doesNotMatch(
    testimonialsSrc,
    /#F7F4EE/,
    "TestimonialsSlider must purge unverified legacy surface #F7F4EE"
  );

  // Heading: Cairo Bold 64px (NOT Qahwa)
  assert.match(
    testimonialsSrc,
    /text-\[64px\]|text-4xl[\s\S]*lg:text-\[64px\]/,
    "Testimonials heading must declare Cairo Bold 64px"
  );
  assert.match(
    testimonialsSrc,
    /testimonialsHeading/,
    "Testimonials heading must render the home.testimonialsHeading message"
  );
  assert.equal(
    arMessages["home.testimonialsHeading"],
    "يقولون عن *أندلسيا*",
    "Arabic heading copy is confirmed by Figma, with أندلسيا carrying the second fill"
  );
  assert.ok(enMessages["home.testimonialsHeading"], "English heading copy must exist");

  // Single quote card geometry: Frame 176:6169 (805x161px)
  assert.match(
    testimonialsSrc,
    /805px|161px|max-w-4xl/,
    "Testimonials must enforce canonical quote card container geometry"
  );

  assert.match(testimonialsSrc, /<section[\s>]/, "TestimonialsSlider must use semantic <section> tag");
});

test("Milestone 2 — 6. Stage 5: Editorial Feature Geometry & Story Headlines (Figma Frame 26, 87:14400)", () => {
  const editorialSrc = read(comp("EditorialFeature.tsx"));

  // Height: 709px
  assert.match(
    editorialSrc,
    /709px/,
    "EditorialFeature must enforce canonical Figma height: 709px"
  );

  // Heading: Qahwa 64px "نكتب كي لا تضيع التفاصيل"
  assert.match(
    editorialSrc,
    /text-\[64px\]|text-4xl[\s\S]*lg:text-\[64px\]/,
    "Editorial heading must declare 64px display font size"
  );
  assert.match(
    editorialSrc,
    /editorialHeading/,
    "Editorial heading must render the home.editorialHeading message"
  );
  assert.equal(arMessages["home.editorialHeading"], "نكتب كي لا تضيع التفاصيل", "Arabic heading copy is confirmed by Figma");
  assert.ok(enMessages["home.editorialHeading"], "English heading copy must exist");

  // Figma Frame 26 carries no "view all" link — the four cards deep-link individually.
  assert.match(
    editorialSrc,
    /href=\{`\/news\/\$\{article\.slug\}`\}/,
    "Editorial cards must deep-link to /news/[slug]"
  );
  assert.match(
    editorialSrc,
    /#1F0900/,
    "EditorialFeature must use the verified near-black surface #1F0900"
  );
  assert.match(
    editorialSrc,
    /slice\(0,\s*4\)/,
    "EditorialFeature must render the four equal Figma cards (115:2436…115:2439)"
  );

  assert.match(editorialSrc, /<section[\s>]/, "EditorialFeature must use semantic <section> tag");
});

test("Milestone 2 — 7. Stage 6: Home Events Section Geometry & Deep-Link Booking (Figma Frame 28, 87:14466)", () => {
  const eventsSrc = read(comp("HomeEvents.tsx"));
  const eventCardSrc = read(comp("EventCard.tsx"));

  // Height: 678px
  assert.match(
    eventsSrc,
    /678px/,
    "HomeEvents must enforce canonical Figma height: 678px"
  );

  // Action link to /events
  assert.match(
    eventsSrc,
    /ctaHref \|\| "\/events"/,
    "HomeEvents action link must route to /events by default"
  );

  // Deep-link booking: event card action must route to /booking?event_id=...
  assert.match(
    eventCardSrc,
    /\/booking\?event_id=/,
    "Event cards must enforce direct deep-link to /booking?event_id=..."
  );

  // Strict architectural exclusion: NO /events/[slug]
  assert.doesNotMatch(
    eventsSrc + eventCardSrc,
    /\/events\/\$\{.*slug\}/,
    "HomeEvents and EventCard must never generate speculative /events/[slug] routes"
  );

  assert.match(eventsSrc, /<section[\s>]/, "HomeEvents must use semantic <section> tag");
});

test("Milestone 2 — 8. Stage 7: Booking CTA Banner Geometry & Dark Espresso Overlay (Figma Section 87:14534)", () => {
  const bookingSrc = read(comp("BookingBanner.tsx"));

  // Height: 498px
  assert.match(
    bookingSrc,
    /498px/,
    "BookingBanner must enforce canonical Figma height: 498px"
  );

  // Musical Glyph ♪ (Cairo Regular 44px)
  assert.match(
    bookingSrc,
    /♪/,
    "BookingBanner must contain musical glyph ♪"
  );
  assert.match(
    bookingSrc,
    /text-\[44px\]|44px/,
    "Musical glyph ♪ must declare 44px font size"
  );

  // Headline: Qahwa 60px
  assert.match(
    bookingSrc,
    /text-\[60px\]|text-4xl[\s\S]*lg:text-\[60px\]/,
    "BookingBanner headline must declare 60px display font size"
  );

  // CTA link to /booking. الفنان (134:4660) reuses the band with the artist
  // pre-selected, so the target is a prop whose default is the home frame's.
  assert.match(
    bookingSrc,
    /ctaHref \|\| settings\?\.booking_cta_href \|\| "\/booking"/,
    "BookingBanner CTA button must route to /booking by default"
  );

  assert.match(bookingSrc, /<section[\s>]/, "BookingBanner must use semantic <section> tag");
});

test("Milestone 2 — 9. Stage 8: Global Footer Canvas & Arabesque Texture (Figma Node 94:18289)", () => {
  const footerSrc = read(comp("Footer.tsx"));

  // Height: 385px
  assert.match(
    footerSrc,
    /385px/,
    "Footer must declare canonical desktop height: 385px"
  );

  // Max width: 1454px
  assert.match(
    footerSrc,
    /1454px/,
    "Footer must declare canonical max canvas width: 1454px"
  );

  // Background: Dark Espresso #2B1D14
  assert.match(
    footerSrc,
    /bg-\[#2B1D14\]|bg-brand-espresso/,
    "Footer must enforce #2B1D14 / brand-espresso background"
  );

  // Arabesque texture overlay ref
  assert.match(
    footerSrc,
    /da60c98546b43a3524b1bbd7667d8f518e1c7ee3/,
    "Footer must integrate Andalusian arabesque geometric texture overlay"
  );

  // Figma Node 94:18289 has no partner/patron marquee and no social icon buttons —
  // both were unverified inventions and must stay purged.
  assert.doesNotMatch(
    footerSrc,
    /شركاء الثقافة والموسيقى/,
    "Footer must not reintroduce the invented partner marquee"
  );
  assert.doesNotMatch(
    footerSrc,
    /instagram\.com|tiktok\.com|youtube\.com/,
    "Footer must not reintroduce the invented social icon buttons"
  );

  // Brand column leads with the raster logo (Figma Node 89:15223 — 210.5x85.5)
  assert.match(
    footerSrc,
    /logo-footer/,
    "Footer brand column must render the Figma raster logo"
  );

  // Semantic landmark
  assert.match(
    footerSrc,
    /<footer[\s\S]*role="contentinfo"/,
    "Footer must declare semantic <footer role='contentinfo'>"
  );
});

test("Milestone 2 — 10. Public Home Integration & ISR Data Contracts", () => {
  const pageSrc = read(pub("page.tsx"));

  // DAL function calls
  const requiredDals = [
    "getSiteSettings",
    "getFeaturedArtists",
    "getPublishedTestimonials",
    "getFeaturedArticles",
    "getUpcomingEvents",
  ];
  for (const fn of requiredDals) {
    assert.match(
      pageSrc,
      new RegExp(`\\b${fn}\\b`),
      `HomePage must call DAL function: ${fn}`
    );
  }

  // 1-hour ISR revalidation
  assert.match(
    pageSrc,
    /export const revalidate\s*=\s*3600;/,
    "HomePage must declare 1-hour ISR revalidation (3600s)"
  );

  // Metadata verification
  assert.match(
    pageSrc,
    /t\("homeTitle"\)/,
    "HomePage metadata must be built from the meta message namespace"
  );
  assert.match(
    arMessages["meta.homeTitle"],
    /فرقة أندلسيا للموسيقى والتراث/,
    "HomePage metadata must declare canonical Arabic title"
  );
  assert.ok(enMessages["meta.homeTitle"], "HomePage metadata title must exist in English");
  assert.match(
    pageSrc,
    /locale: locale === "ar" \? "ar_AR" : "en_US"/,
    "HomePage OpenGraph locale must follow the active locale, with Arabic still ar_AR"
  );

  // Landing-page section controls: dynamic counts and show_* flags
  for (const field of [
    "home_featured_artists_count",
    "home_featured_articles_count",
    "home_upcoming_events_count",
    "show_testimonials",
    "show_editorial",
    "show_events",
    "show_booking_banner",
  ]) {
    assert.match(
      pageSrc,
      new RegExp(`\\b${field}\\b`),
      `HomePage must read settings.${field}`
    );
  }
});

/**
 * الرئيسية on the 390 frame — 136:5854.
 *
 * Every band matches the frame and the footer lands on the frame's own 5735. The
 * 90px that remain are the frame overrunning its declared 6528 canvas
 * (5735 + 882 = 6617), the same fault as news-mobile. See docs/figma/DECISIONS.md §16.
 */
