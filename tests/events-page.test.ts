import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { arMessages, enMessages } from "./helpers/i18n.ts";
import {
  CATEGORY_MAP,
  CATEGORY_TABS,
  type EventItem,
} from "../src/lib/types/events.ts";

const root = path.resolve(".");

test("Task 35 — 1. Events Page Architecture & Component Files", () => {
  const expectedFiles = [
    "src/app/[locale]/(public)/events/page.tsx",
    "src/components/public/events/EventsFilterTabs.tsx",
    "src/components/public/events/FeaturedEventBanner.tsx",
    "src/components/public/events/EventCard.tsx",
    "src/components/public/events/EventsCatalogView.tsx",
    "src/components/public/events/index.ts",
    "src/lib/dal/events.ts",
    "src/lib/types/events.ts",
  ];

  for (const rel of expectedFiles) {
    const fullPath = path.join(root, rel);
    assert.ok(fs.existsSync(fullPath), `Expected events file to exist: ${rel}`);
  }

  const barrelContent = fs.readFileSync(
    path.join(root, "src/components/public/events/index.ts"),
    "utf-8"
  );
  assert.match(barrelContent, /export \{ EventsFilterTabs/);
  assert.match(barrelContent, /export \{ FeaturedEventBanner/);
  assert.match(barrelContent, /export \{ EventCard/);
  assert.match(barrelContent, /export \{ EventsCatalogView/);
});

test("Task 35 — 2. Strict Architectural Prohibition: NO /events/[slug]", () => {
  const forbiddenDynamicRoute = path.join(root, "src/app/[locale]/(public)/events/[slug]");
  assert.ok(
    !fs.existsSync(forbiddenDynamicRoute),
    "Architecture strictly prohibits /events/[slug] detail route (all bookings route to /booking?event_id=...)"
  );

  const pageContent = fs.readFileSync(
    path.join(root, "src/app/[locale]/(public)/events/page.tsx"),
    "utf-8"
  );
  assert.doesNotMatch(
    pageContent,
    /\/events\/\[slug\]/,
    "Events page must not reference or link to /events/[slug]"
  );
});

test("Task 35 — 3. Confirmed Category Filter Tabs Mapping (Figma 186:1781-186:1769)", () => {
  const expectedTabs = [
    { id: "all", label: "الكل" },
    { id: "concert", label: "حفلات" },
    { id: "festival", label: "مهرجانات" },
    { id: "evening", label: "أمسيات" },
    { id: "workshop", label: "ورش" },
  ];

  assert.deepEqual(
    CATEGORY_TABS,
    expectedTabs,
    "CATEGORY_TABS must exactly match confirmed Figma filter categories"
  );

  assert.equal(CATEGORY_MAP.concert, "حفلات");
  assert.equal(CATEGORY_MAP.festival, "مهرجانات");
  assert.equal(CATEGORY_MAP.evening, "أمسيات");
  assert.equal(CATEGORY_MAP.workshop, "ورش");

  const tabsContent = fs.readFileSync(
    path.join(root, "src/components/public/events/EventsFilterTabs.tsx"),
    "utf-8"
  );
  assert.match(tabsContent, /role="tablist"/, "Tabs container must use role='tablist'");
  assert.match(tabsContent, /role="tab"/, "Tab items must use role='tab'");
  assert.match(tabsContent, /aria-selected/, "Tab items must reflect aria-selected state");

  // Node 91:16930 — a 415x53.12 secondary-50 pill, 14px gaps, 62-wide idle tabs
  // and a 75-wide primary-500 active tab, all at Cairo Bold 14.08/21.12.
  assert.match(tabsContent, /lg:w-\[415px\]/, "Filter bar is 415 wide on the frame");
  assert.match(tabsContent, /bg-secondary-50/, "Filter bar sits on secondary-50");
  assert.match(tabsContent, /gap-\[14px\]/, "Tabs are 14px apart");
  assert.match(tabsContent, /text-\[14\.08px\]/, "Tab labels are Cairo Bold 14.08");
  assert.match(tabsContent, /w-\[75px\] bg-primary-500/, "Active tab is 75 wide on primary-500");
  assert.match(tabsContent, /w-\[62px\]/, "Idle tabs are 62 wide");
  assert.match(tabsContent, /rounded-badge/, "Tabs use the 16px badge radius");
});

test("Task 35 — 4. Featured Event Panel (Figma 91:16914)", () => {
  const bannerContent = fs.readFileSync(
    path.join(root, "src/components/public/events/FeaturedEventBanner.tsx"),
    "utf-8"
  );

  // Copy lives in the catalogue; the component carries the frame's geometry.
  assert.equal(
    arMessages["events.featuredBadge"],
    "الفعالية الأبرز",
    "The panel's eyebrow is confirmed by node 91:16919"
  );
  assert.equal(
    arMessages["events.bookNow"],
    "أحجز الآن",
    "The panel's button carries the frame's own spelling (I91:16963;2:1537)"
  );

  assert.match(bannerContent, /lg:h-\[669px\] lg:w-\[503px\]/, "Panel is 503x669");
  assert.match(bannerContent, /rounded-card/, "Panel uses the 24px card radius");
  assert.match(bannerContent, /bg-brand-espresso/, "Panel sits on espresso");
  assert.match(bannerContent, /lg:h-\[397px\]/, "Cover is 397 tall");
  assert.match(bannerContent, /text-\[9\.92px\][\s\S]*?tracking-\[1\.3888px\]/, "Eyebrow is 9.92 with 1.3888 tracking");
  assert.match(bannerContent, /text-\[20px\] font-bold leading-\[27px\]/, "Title is Cairo Bold 20/27");
  assert.match(bannerContent, /text-\[13\.6px\] leading-\[20\.4px\]/, "Performer is Cairo 13.6/20.4");
  assert.match(bannerContent, /text-\[13\.12px\] leading-\[19\.68px\]/, "Date line is Cairo 13.12/19.68");
  assert.match(bannerContent, /h-11 w-full max-w-\[341px\]/, "Button is 341x44");

  assert.match(bannerContent, /event\.title/, "Panel must render the event title");
  assert.match(bannerContent, /event\.performer_name/, "Panel must render performer attribution");
  assert.match(bannerContent, /dateLocationString/, "Panel must format date and place");
  assert.match(
    bannerContent,
    /\/booking\?event_id=/,
    "Panel CTA must link internal booking to /booking?event_id=[id]"
  );
});

test("Task 35 — 5. Event Row (Figma 91:16794)", () => {
  const cardContent = fs.readFileSync(
    path.join(root, "src/components/public/events/EventCard.tsx"),
    "utf-8"
  );

  assert.equal(arMessages["events.book"], "احجز", "The row's link label is confirmed by node 91:16814");

  // Row shell and the three blocks the frame places on it.
  assert.match(cardContent, /lg:h-\[150\.135px\]/, "Row is 150.135 tall");
  assert.match(cardContent, /border-\[0\.667px\] border-brand-espresso\/10/, "Row hairline is 10% espresso");
  assert.match(cardContent, /lg:end-0 lg:top-0 lg:h-\[148\.802px\] lg:w-\[110px\]/, "Date block is 110 wide at the inline end");
  assert.match(cardContent, /lg:end-\[110\.33px\] lg:top-\[14\.33px\]/, "Text block starts 110.33 in, 14.33 down");
  assert.match(cardContent, /lg:start-\[21px\] lg:top-\[24\.33px\]/, "Thumbnail is 21 in from the inline start");

  // Date chip 91:16807 — Cairo Black 24/24 over Cairo SemiBold 9.6/14.4.
  assert.match(cardContent, /dayArabic/, "Date day is formatted for the locale");
  assert.match(cardContent, /monthArabic/, "Date month is formatted for the locale");
  assert.match(cardContent, /timeZone: "UTC"/, "Dates are formatted in UTC so the day cannot slide");
  assert.match(cardContent, /text-\[24px\] font-black leading-\[24px\]/, "Day is Cairo Black 24/24");
  assert.match(cardContent, /text-\[9\.6px\] font-semibold/, "Month is Cairo SemiBold 9.6");

  // Category pill 91:16799 — a 2px radius, not a badge.
  assert.match(cardContent, /categoryLabel/, "Row must display the category label");
  assert.match(cardContent, /rounded-\[2px\] border-\[0\.667px\] border-primary-500\/25/, "Category pill is a 2px box");

  assert.match(cardContent, /event\.title/, "Row must render the title");
  assert.match(cardContent, /performerCityString/, "Row must format 'performer · place'");
  assert.match(
    cardContent,
    /\/booking\?event_id=/,
    "Row link must route to /booking?event_id=[id]"
  );
});

test("Task 35 — 6. Hero Band & Subtitle Integration (Figma 91:16746)", () => {
  const pageContent = fs.readFileSync(
    path.join(root, "src/app/[locale]/(public)/events/page.tsx"),
    "utf-8"
  );

  assert.ok(
    !fs.existsSync(path.join(root, "src/components/public/events/EventsHeader.tsx")),
    "The frame draws no separate events header; the band is the shared PageHero"
  );

  assert.match(pageContent, /<PageHero/, "Events opens on the shared hero band");
  assert.match(pageContent, /height=\{611\}/, "Hero band is 611 tall");
  assert.match(pageContent, /contentTop=\{247\}/, "Headline sits 247 down");
  assert.match(pageContent, /titleSize=\{64\}/, "Headline is 64px on this frame");
  assert.match(pageContent, /titleTone="text-brand-tint"/, "Uncoloured run is primary-50, not secondary-400");
  assert.doesNotMatch(pageContent, /eyebrow=/, "This frame draws no eyebrow pill");
  assert.match(pageContent, /t\.rich\("title"/, "Headline colours its first word");
  assert.match(pageContent, /subtitle=\{subtitle\}/, "Standfirst comes from site_settings");

  assert.equal(
    arMessages["events.title"],
    "<em>مواعيد</em> تترك أثراً جميلاً.",
    "Arabic events headline is confirmed by node 91:16748"
  );
  assert.ok(enMessages["events.title"], "The events headline must exist in English too");
});

test("Task 35 — 7. Events Data Access Layer (DAL)", () => {
  const dalContent = fs.readFileSync(
    path.join(root, "src/lib/dal/events.ts"),
    "utf-8"
  );

  assert.match(
    dalContent,
    /export async function getPublishedEvents/,
    "DAL must export getPublishedEvents function"
  );
  assert.match(
    dalContent,
    /export async function getFeaturedEvent/,
    "DAL must export getFeaturedEvent function"
  );
  assert.match(
    dalContent,
    /export async function getEventsSubtitle/,
    "DAL must export getEventsSubtitle function"
  );
  assert.match(
    dalContent,
    /\.eq\(["']is_published["'],\s*true\)/,
    "DAL must filter strictly by is_published = true"
  );
  assert.match(
    dalContent,
    /\.order\(["']event_date["'],\s*\{\s*ascending:\s*true\s*\}\)/,
    "DAL must order chronologically by event_date ASC"
  );
});

test("Task 35 — 8. Events Page Route & ISR Caching", () => {
  const pageContent = fs.readFileSync(
    path.join(root, "src/app/[locale]/(public)/events/page.tsx"),
    "utf-8"
  );

  assert.match(
    pageContent,
    /export const revalidate = 1800;/,
    "Events page must enforce 1800s (30m) ISR revalidation as locked in architecture"
  );
  assert.match(
    pageContent,
    /export async function generateMetadata[\s\S]*?Promise<Metadata>/,
    "Events page must export typed, locale-aware Next.js metadata"
  );
  assert.ok(arMessages["meta.eventsTitle"], "Events metadata title must exist in Arabic");
  assert.ok(enMessages["meta.eventsTitle"], "Events metadata title must exist in English");
  assert.match(
    pageContent,
    /<Suspense/,
    "Events catalog must be wrapped in Suspense boundary for useSearchParams"
  );
});

test("Task 35 — 9. Type Consistency and Mock Event Data Verification", () => {
  const mockEvent: EventItem = {
    id: "e1000000-0000-0000-0000-000000000001",
    title: "ليلة الطرب الأندلسي",
    slug: "laylat-al-tarab",
    category: "concert",
    event_date: "2026-04-15T20:00:00Z",
    location: "مسرح المدينة — بيروت",
    city: "بيروت",
    performer_name: "أحمد العود",
    artist_id: null,
    description: "أمسية طربية استثنائية من روائع الموشحات الأندلسية.",
    image_url: "https://example.com/poster.webp",
    ticket_url: null,
    is_featured: true,
    status: "upcoming",
    is_published: true,
    display_order: 1,
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  };

  assert.equal(mockEvent.category, "concert");
  assert.equal(mockEvent.is_published, true);
  assert.equal(mockEvent.is_featured, true);
  assert.ok(mockEvent.id.length > 0);
});

/**
 * الفعاليات on the 390 frame — 144:19902.
 *
 * Every section of this frame is reproducible and pinned below. Its total height is
 * not: `Frame 39` holds three rows whose third duplicates the first
 * («مهرجان الربيع الموسيقي» appears twice), so the 491 that box measures encodes a
 * three-row mock rather than a designed row count — the desktop frame draws five,
 * and matches our five fixtures exactly. So this frame is gated section by section.
 */
test("الفعاليات — the 390 frame's sections", () => {
  const strip = (s: string) =>
    s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
  const read = (rel: string) => strip(fs.readFileSync(path.join(root, rel), "utf-8"));

  const page = read("src/app/[locale]/(public)/events/page.tsx");
  const view = read("src/components/public/events/EventsCatalogView.tsx");
  const tabs = read("src/components/public/events/EventsFilterTabs.tsx");
  const card = read("src/components/public/events/EventCard.tsx");

  // Band 0-678, filter bar at 716, list at 808, featured slot at 1337, footer 2007.
  // Every gap on the frame is 38 and it closes on 84.
  assert.match(page, /mobileHeight=\{678\}/, "The band is 678 on the 390 frame");
  assert.match(page, /pb-\[84px\] pt-\[38px\]/, "38 opens the catalogue band and 84 closes it");
  assert.match(view, /mt-\[38px\] flex flex-col gap-\[38px\]/, "38 between the filter bar, the list and the featured slot");

  // Component 8 is 376x54 flush to the inline start. It scrolled at 104 when it wrapped.
  assert.match(tabs, /h-\[54px\] w-\[376px\]/, "The filter bar is 376x54");
  assert.match(tabs, /overflow-x-auto/, "It scrolls rather than wrapping");
  assert.doesNotMatch(tabs, /flex-wrap/, "Wrapping is what made it 104 tall");

  // Frame 39 is 390.33 wide, 10px padded, rows 10 apart.
  assert.match(view, /gap-\[10px\] p-\[10px\]/, "The list is 10px padded with 10 between rows");
  assert.match(view, /lg:gap-4 lg:p-0/, "Desktop keeps its own 16px rhythm and no padding");

  // 144:19982 reserves 349x586 at x=21 and draws nothing inside it.
  assert.match(view, /ms-5 h-\[586px\] w-\[349px\]/, "The featured slot is the reserved 349x586 box");
  assert.match(view, /lg:ms-0 lg:h-auto lg:w-\[503px\]/, "Desktop keeps the 503 panel");

  // 144:19913 is 370.33x150.33 on 8.667 of padding, 19 between three centred blocks:
  // the 93x105 thumbnail at the inline start, the 144x120 text, the 78x149 date.
  assert.match(card, /h-\[150\.333px\] w-full flex-row-reverse items-center gap-\[19px\]/, "The row is 150.33 with 19 between blocks, reversed so the thumbnail leads");
  assert.match(card, /p-\[8\.667px\]/, "8.667 of padding holds the blocks inside 370.33");
  assert.match(card, /h-\[149px\] w-\[78px\]/, "The date block is 78x149");
  assert.match(card, /h-\[120px\] w-\[144px\]/, "The text block is 144x120");
  assert.match(card, /h-\[105px\] w-\[93px\]/, "The thumbnail is 93x105, against 140 wide on desktop");
  assert.match(card, /w-\[54px\] rounded-\[8px\]/, "The date chip is 54 wide, against 70 on desktop");
  assert.doesNotMatch(card, /sm:h-\[105px\]|sm:w-\[140px\]/, "The invented tablet thumbnail is gone");
});
