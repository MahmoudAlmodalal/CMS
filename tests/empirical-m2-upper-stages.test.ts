import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".");
const comp = (...segs: string[]) => path.join(root, "src/components/public", ...segs);
const pub = (...segs: string[]) => path.join(root, "src/app/(public)", ...segs);
const read = (p: string) => fs.readFileSync(p, "utf-8");

// =============================================================================
// EMPIRICAL CHALLENGE SUITE: Milestone 2 — Upper Stages Verification
// Sourced from Canonical Specs: FIGMA_DESIGN_SPEC.md, FIGMA_DESIGN_AUDIT_PLAN.md
// Targets:
//   1. Hero Section (740px, Cairo Bold 64px, Cairo Medium 25px max-w 693px)
//   2. About Section (879px, #F9F7F0 surface, Cairo Bold 61px kicker, Qahwa 48px)
//   3. Featured Artists (615px, Qahwa 64px, 4:5 card aspect ratios, 24px radius)
// =============================================================================

test("Challenger M2-1 — 1. Hero Section Geometry: 740px Desktop Height Enforcement", () => {
  const heroSrc = read(comp("HeroSection.tsx"));

  // Must declare exact 740px height for desktop
  assert.match(
    heroSrc,
    /min-h-\[740px\]\s+lg:h-\[740px\]|lg:h-\[740px\]\s+min-h-\[740px\]/,
    "HeroSection must enforce desktop height: min-h-[740px] lg:h-[740px]"
  );

  // Must not have contradictory or legacy heights
  assert.doesNotMatch(
    heroSrc,
    /lg:h-\[(?!740px)\d+px\]/,
    "HeroSection must not declare arbitrary desktop heights other than 740px"
  );
  assert.doesNotMatch(
    heroSrc,
    /min-h-\[(?!740px)\d+px\]/,
    "HeroSection must not declare min-heights other than 740px"
  );

  // Negative offset for floating navbar (-mt-14 lg:-mt-24 with pt-14 lg:pt-24)
  assert.match(
    heroSrc,
    /-mt-14\s+lg:-mt-24/,
    "HeroSection must declare -mt-14 lg:-mt-24 for seamless floating navbar integration"
  );
  assert.match(
    heroSrc,
    /pt-14\s+lg:pt-24/,
    "HeroSection must compensate negative margin with pt-14 lg:pt-24"
  );
});

test("Challenger M2-1 — 2. Hero Section Typography: Cairo Bold 64px Headline & Cairo Medium 25px max-w 693px Subhead", () => {
  const heroSrc = read(comp("HeroSection.tsx"));

  // Headline H1: Cairo Bold 64px
  // Must use font-sans (Cairo), font-bold, lg:text-[64px]
  assert.match(
    heroSrc,
    /<h1[^>]*className="[^"]*font-sans[^"]*lg:text-\[64px\][^"]*font-bold[^"]*"/,
    "Hero H1 must combine font-sans (Cairo), lg:text-[64px], and font-bold"
  );

  // Adversarial check: H1 must NOT use font-calligraphic (Qahwa is for section H2s, not Hero H1)
  assert.doesNotMatch(
    heroSrc,
    /<h1[^>]*font-calligraphic/,
    "Hero H1 must NOT use font-calligraphic; canonical spec requires Cairo Bold 64px"
  );

  // Spec check: No pill/tag badge above headline (Figma spec: 'No pill/tag above headline')
  assert.doesNotMatch(
    heroSrc,
    /<span[^>]*rounded-full[^>]*>[\s\S]*?<\/span>[\s\S]*?<h1/,
    "Hero section must NOT contain a pill/tag badge above the H1 headline"
  );

  // Subheadline P: Cairo Medium 25px, max-w 693px
  assert.match(
    heroSrc,
    /<p[^>]*className="[^"]*font-sans[^"]*lg:text-\[25px\][^"]*font-medium[^"]*max-w-\[693px\][^"]*"/,
    "Hero subheadline must declare font-sans, lg:text-[25px], font-medium, and max-w-[693px]"
  );
});

test("Challenger M2-1 — 3. Hero Section CTAs & Clean Re-export Alias", () => {
  const heroSrc = read(comp("HeroSection.tsx"));
  const heroAliasSrc = read(comp("Hero.tsx"));

  // Primary CTA to /booking
  assert.match(
    heroSrc,
    /<PublicButton[\s\S]*?href="\/booking"[\s\S]*?variant="primary"/,
    "Hero must provide primary PublicButton routing to /booking"
  );

  // Secondary CTA to /artists
  assert.match(
    heroSrc,
    /<PublicButton[\s\S]*?href="\/artists"[\s\S]*?variant="secondary"/,
    "Hero must provide secondary PublicButton routing to /artists"
  );

  // Gap between CTAs must be 32px (gap-8)
  assert.match(
    heroSrc,
    /gap-8/,
    "Hero CTAs container must maintain 32px gap (gap-8)"
  );

  // Hero.tsx re-export alias must exist and re-export HeroSection
  assert.match(
    heroAliasSrc,
    /export\s*{\s*HeroSection\s*as\s*Hero,\s*HeroSection/,
    "Hero.tsx must re-export HeroSection as Hero and HeroSection"
  );
});

test("Challenger M2-1 — 4. About Section Geometry: 879px Desktop Height Enforcement", () => {
  const aboutSrc = read(comp("AboutSection.tsx"));

  // Height: 879px
  assert.match(
    aboutSrc,
    /min-h-\[879px\]\s+lg:h-\[879px\]|lg:h-\[879px\]\s+min-h-\[879px\]/,
    "AboutSection must enforce canonical Figma height: min-h-[879px] lg:h-[879px]"
  );

  // Must not have contradictory heights
  assert.doesNotMatch(
    aboutSrc,
    /lg:h-\[(?!879px)\d+px\]/,
    "AboutSection must not declare desktop heights other than 879px"
  );
});

test("Challenger M2-1 — 5. About Section Surface Color: Warm Parchment #F9F7F0 Strictly Enforced", () => {
  const aboutSrc = read(comp("AboutSection.tsx"));

  // Must use #F9F7F0
  assert.match(
    aboutSrc,
    /bg-\[#F9F7F0\]/,
    "AboutSection must set background surface to verified warm parchment #F9F7F0"
  );

  // Adversarial check: Legacy unverified #F7F4EE must be strictly purged
  assert.doesNotMatch(
    aboutSrc,
    /#F7F4EE/i,
    "AboutSection must strictly purge legacy color #F7F4EE"
  );
});

test("Challenger M2-1 — 6. About Section Typography: Cairo Bold 61px Kicker & Qahwa 48px Statement", () => {
  const aboutSrc = read(comp("AboutSection.tsx"));

  // Kicker: Cairo Bold 61px in text-brand-primary ("من نحن")
  assert.match(
    aboutSrc,
    /<p[^>]*className="[^"]*font-sans[^"]*lg:text-\[61px\][^"]*font-bold[^"]*text-brand-primary[^"]*">\s*من نحن\s*<\/p>/,
    "AboutSection kicker must be Cairo Bold 61px ('lg:text-[61px] font-bold text-brand-primary') with text 'من نحن'"
  );

  // Adversarial check: Kicker must NOT be styled as a tiny pill badge
  assert.doesNotMatch(
    aboutSrc,
    /<p[^>]*rounded-full[^>]*>\s*من نحن/,
    "AboutSection kicker must be a prominent headline kicker, not a rounded-full pill badge"
  );

  // Statement: Qahwa Regular 48px font-calligraphic
  assert.match(
    aboutSrc,
    /<h2[^>]*className="[^"]*font-calligraphic[^"]*lg:text-\[48px\][^"]*font-normal[^"]*text-brand-espresso[^"]*"/,
    "AboutSection statement H2 must declare font-calligraphic, lg:text-[48px], font-normal (Qahwa Regular), text-brand-espresso"
  );

  // Body: Cairo Medium 25px
  assert.match(
    aboutSrc,
    /<p[^>]*className="[^"]*font-sans[^"]*lg:text-\[25px\][^"]*font-medium[^"]*text-brand-espresso\/85[^"]*"/,
    "AboutSection body copy must declare font-sans, lg:text-[25px], font-medium"
  );

  // Action link: "تعرّف على فنانينا" -> /artists
  assert.match(
    aboutSrc,
    /<Link[\s\S]*?href="\/artists"[\s\S]*?>[\s\S]*?تعرّف على فنانينا/,
    "AboutSection must include action link routing to /artists with text 'تعرّف على فنانينا'"
  );
});

test("Challenger M2-1 — 7. About Section Grid & Portrait Geometry (4:5 Aspect Ratio)", () => {
  const aboutSrc = read(comp("AboutSection.tsx"));

  // 12-column grid on desktop: 7 cols content + 5 cols visual
  assert.match(
    aboutSrc,
    /lg:grid-cols-12/,
    "AboutSection grid must declare 12 columns on desktop"
  );
  assert.match(
    aboutSrc,
    /lg:col-span-7/,
    "AboutSection content column must span 7 columns on desktop"
  );
  assert.match(
    aboutSrc,
    /lg:col-span-5/,
    "AboutSection visual column must span 5 columns on desktop"
  );

  // Studio portrait container aspect ratio: 4:5
  assert.match(
    aboutSrc,
    /aspect-\[4\/5\]/,
    "AboutSection studio portrait must declare aspect-[4/5]"
  );
  assert.match(
    aboutSrc,
    /rounded-3xl/,
    "AboutSection studio portrait container must declare rounded-3xl"
  );
});

test("Challenger M2-1 — 8. Featured Artists Geometry: 615px Desktop Height Enforcement", () => {
  const artistsSrc = read(comp("FeaturedArtists.tsx"));

  // Height: 615px
  assert.match(
    artistsSrc,
    /min-h-\[615px\]\s+lg:h-\[615px\]|lg:h-\[615px\]\s+min-h-\[615px\]/,
    "FeaturedArtists must enforce canonical Figma height: min-h-[615px] lg:h-[615px]"
  );

  // Must not have contradictory heights
  assert.doesNotMatch(
    artistsSrc,
    /lg:h-\[(?!615px)\d+px\]/,
    "FeaturedArtists must not declare desktop heights other than 615px"
  );
});

test("Challenger M2-1 — 9. Featured Artists Typography: Qahwa 64px Heading & Clean Frame 14 Layout", () => {
  const artistsSrc = read(comp("FeaturedArtists.tsx"));

  // Heading H2: Qahwa Regular 64px font-calligraphic
  assert.match(
    artistsSrc,
    /<h2[^>]*className="[^"]*font-calligraphic[^"]*lg:text-\[64px\][^"]*font-normal[^"]*text-brand-espresso[^"]*">\s*أصوات تصنع التاريخ\s*<\/h2>/,
    "FeaturedArtists H2 must declare font-calligraphic, lg:text-[64px], font-normal, text-brand-espresso with 'أصوات تصنع التاريخ'"
  );

  // Adversarial check: Frame 14 has no pill badge and no subtitle in header
  assert.doesNotMatch(
    artistsSrc,
    /<span[^>]*rounded-badge/,
    "FeaturedArtists section header must not contain category pill badge"
  );
  assert.doesNotMatch(
    artistsSrc,
    /<p[^>]*>[\s\S]*?<\/p>[\s\S]*?<div className="grid/,
    "FeaturedArtists header must not contain an unauthorized subtitle paragraph"
  );

  // Action link: "عرض جميع الفنانين" -> /artists
  assert.match(
    artistsSrc,
    /<Link[\s\S]*?href="\/artists"[\s\S]*?>[\s\S]*?عرض جميع الفنانين/,
    "FeaturedArtists must include action link routing to /artists with text 'عرض جميع الفنانين'"
  );
});

test("Challenger M2-1 — 10. Featured Artists Cards: Strict 4:5 Aspect Ratio & 24px Radius Enforcement", () => {
  const artistsSrc = read(comp("FeaturedArtists.tsx"));
  const cardSrc = read(comp("ArtistCard.tsx"));
  const cssSrc = read(path.join(root, "src/app/globals.css"));

  // 1. FeaturedArtists passes 24px radius explicitly
  assert.match(
    artistsSrc,
    /<ArtistCard[^>]*className="rounded-\[24px\]"[^>]*\/>/,
    "FeaturedArtists must explicitly pass className='rounded-[24px]' to ArtistCard instances"
  );

  // 2. ArtistCard visual container enforces aspect-[4/5]
  assert.match(
    cardSrc,
    /aspect-\[4\/5\]/,
    "ArtistCard portrait visual must enforce strict aspect-[4/5]"
  );

  // 3. ArtistCard root element uses rounded-card
  assert.match(
    cardSrc,
    /rounded-card/,
    "ArtistCard must declare rounded-card class"
  );

  // 4. Globals.css defines --radius-card as 24px
  assert.match(
    cssSrc,
    /--radius-card:\s*24px;/,
    "globals.css must define --radius-card as 24px"
  );

  // 5. Grid is 4 columns on desktop and capped at 4 items
  assert.match(
    artistsSrc,
    /lg:grid-cols-4/,
    "FeaturedArtists grid must declare lg:grid-cols-4 on desktop"
  );
  assert.match(
    artistsSrc,
    /artists\.slice\(0,\s*4\)/,
    "FeaturedArtists must cap cards to exactly 4 items"
  );
});

test("Challenger M2-1 — 11. Empty State Robustness Across Upper Stages", () => {
  const artistsSrc = read(comp("FeaturedArtists.tsx"));

  // FeaturedArtists must handle null or empty artist array safely
  assert.match(
    artistsSrc,
    /if\s*\(!artists\s*\|\|\s*artists\.length\s*===\s*0\)\s*{\s*return null;\s*}/,
    "FeaturedArtists must safely return null on empty or undefined artists array"
  );
});

test("Challenger M2-1 — 12. Upper Stages Vertical Order in Home Page (Stage 1 -> Stage 2 -> Stage 3)", () => {
  const pageSrc = read(pub("page.tsx"));

  const heroIdx = pageSrc.indexOf("<HeroSection");
  const aboutIdx = pageSrc.indexOf("<AboutSection");
  const artistsIdx = pageSrc.indexOf("<FeaturedArtists");

  assert.ok(heroIdx !== -1, "page.tsx must invoke <HeroSection />");
  assert.ok(aboutIdx !== -1, "page.tsx must invoke <AboutSection />");
  assert.ok(artistsIdx !== -1, "page.tsx must invoke <FeaturedArtists />");

  assert.ok(
    heroIdx < aboutIdx,
    "Stage 1 (HeroSection) must precede Stage 2 (AboutSection) in DOM order"
  );
  assert.ok(
    aboutIdx < artistsIdx,
    "Stage 2 (AboutSection) must precede Stage 3 (FeaturedArtists) in DOM order"
  );
});
