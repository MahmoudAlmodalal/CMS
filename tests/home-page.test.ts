import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".");
const pub = (...segs: string[]) => path.join(root, "src/app/(public)", ...segs);
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
      `src/app/(public)/page.tsx must import ${component}`
    );
  }

  // 2. Strict Y-order sequence of stage component invocations
  const stageIndices = requiredStageImports.map((name) => {
    const idx = pageSrc.indexOf(`<${name}`);
    assert.ok(
      idx !== -1,
      `src/app/(public)/page.tsx must render component <${name} />`
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

test("Milestone 2 — 2. Stage 1: Hero Section Geometry & Cairo Typography (Figma Component 20, 148:3708)", () => {
  const heroSrc = read(comp("HeroSection.tsx"));

  // Height: 740px
  assert.match(
    heroSrc,
    /740px/,
    "HeroSection must enforce canonical Figma height: 740px"
  );

  // Headline: Cairo Bold 64px
  assert.match(
    heroSrc,
    /text-\[64px\]|text-\[40px\][\s\S]*lg:text-\[64px\]/,
    "Hero headline must declare 64px desktop font size"
  );
  // Figma Node 148:3671 uses Cairo Bold, not the Qahwa display face.
  assert.match(
    heroSrc,
    /font-sans[\s\S]*font-bold/,
    "Hero headline must use the Cairo sans face with bold weight"
  );
  assert.match(
    heroSrc,
    /<Highlight/,
    "Hero headline must render the two-fill terracotta treatment via <Highlight />"
  );

  // Subtitle: Cairo Medium 25px max-width 693px
  assert.match(
    heroSrc,
    /text-\[25px\]|text-lg[\s\S]*lg:text-\[25px\]/,
    "Hero subtitle must declare 25px desktop font size"
  );
  assert.match(
    heroSrc,
    /max-w-\[693px\]/,
    "Hero subtitle must enforce canonical max-width: 693px"
  );

  // Primary CTA: 207x48 with hover expansion to 56px, routing to /booking
  assert.match(
    heroSrc,
    /href="\/booking"/,
    "Hero primary CTA must route directly to /booking"
  );

  // Secondary CTA: routing to /artists
  assert.match(
    heroSrc,
    /href="\/artists"/,
    "Hero secondary CTA must route directly to /artists"
  );

  // Clean header: Semantic <section> landmark
  assert.match(heroSrc, /<section[\s>]/, "HeroSection must use semantic <section> tag");
});

test("Milestone 2 — 3. Stage 2: About Section Geometry & Warm Parchment Surface (Figma Component 9, 112:850)", () => {
  const aboutSrc = read(comp("AboutSection.tsx"));

  // Height: 879px
  assert.match(
    aboutSrc,
    /879px/,
    "AboutSection must enforce canonical Figma height: 879px"
  );

  // Surface fill: Warm Parchment #F9F7F0
  assert.match(
    aboutSrc,
    /#F9F7F0|bg-\[#F9F7F0\]/,
    "AboutSection must use verified warm parchment surface: #F9F7F0"
  );
  assert.doesNotMatch(
    aboutSrc,
    /#F7F4EE/,
    "AboutSection must purge unverified legacy surface #F7F4EE"
  );

  // Kicker: Cairo Bold 61px
  assert.match(
    aboutSrc,
    /text-\[61px\]|text-3xl[\s\S]*lg:text-\[61px\]/,
    "AboutSection kicker must declare Cairo Bold 61px"
  );
  assert.match(
    aboutSrc,
    /من نحن/,
    "AboutSection must include confirmed kicker text 'من نحن'"
  );

  // Statement: Qahwa 48px
  assert.match(
    aboutSrc,
    /text-\[48px\]|text-4xl[\s\S]*lg:text-\[48px\]/,
    "AboutSection statement must declare display/calligraphic 48px"
  );

  // Body: Cairo Medium 25px
  assert.match(
    aboutSrc,
    /text-\[25px\]|text-lg[\s\S]*lg:text-\[25px\]/,
    "AboutSection body copy must declare Cairo Medium 25px"
  );

  // Action link to /artists
  assert.match(
    aboutSrc,
    /href="\/artists"/,
    "AboutSection action link must route to /artists"
  );
  assert.match(aboutSrc, /<section[\s>]/, "AboutSection must use semantic <section> tag");
});

test("Milestone 2 — 4. Stage 3: Featured Artists Geometry & 4:5 Card Aspect Ratios (Figma Frame 14, 87:14240)", () => {
  const artistsSectionSrc = read(comp("FeaturedArtists.tsx"));
  const artistCardSrc = read(comp("ArtistCard.tsx"));

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
    /أصوات تصنع التاريخ/,
    "FeaturedArtists heading must display 'أصوات تصنع التاريخ'"
  );

  // Action link to /artists
  assert.match(
    artistsSectionSrc,
    /href="\/artists"/,
    "FeaturedArtists action link must route to /artists"
  );

  // 4:5 Aspect Ratio on Artist Cards
  assert.match(
    artistCardSrc,
    /aspect-\[4\/5\]/,
    "ArtistCard must enforce canonical 4:5 portrait aspect ratio (aspect-[4/5])"
  );

  // 24px Card Radius
  assert.match(
    artistCardSrc + artistsSectionSrc,
    /rounded-\[24px\]|rounded-card/,
    "Artist cards must enforce canonical 24px corner radius"
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
    /يقولون عن أندلسيا/,
    "Testimonials heading must display 'يقولون عن أندلسيا'"
  );

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
    /نكتب كي لا تضيع التفاصيل/,
    "Editorial heading must display 'نكتب كي لا تضيع التفاصيل'"
  );

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
    /href="\/events"/,
    "HomeEvents action link must route to /events"
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

  // CTA link to /booking
  assert.match(
    bookingSrc,
    /href="\/booking"/,
    "BookingBanner CTA button must route to /booking"
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
    /فرقة أندلسيا للموسيقى والتراث/,
    "HomePage metadata must declare canonical Arabic title"
  );
  assert.match(
    pageSrc,
    /locale:\s*["']ar_AR["']/,
    "HomePage metadata must declare Arabic RTL OpenGraph locale"
  );
});
