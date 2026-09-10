import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  CATEGORY_MAP,
  CATEGORY_TABS,
  type EventItem,
} from "../src/lib/types/events.ts";

const root = path.resolve(".");

test("Task 35 — 1. Events Page Architecture & Component Files", () => {
  const expectedFiles = [
    "src/app/(public)/events/page.tsx",
    "src/components/public/events/EventsHeader.tsx",
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
  assert.match(barrelContent, /export \{ EventsHeader/);
  assert.match(barrelContent, /export \{ EventsFilterTabs/);
  assert.match(barrelContent, /export \{ FeaturedEventBanner/);
  assert.match(barrelContent, /export \{ EventCard/);
  assert.match(barrelContent, /export \{ EventsCatalogView/);
});

test("Task 35 — 2. Strict Architectural Prohibition: NO /events/[slug]", () => {
  const forbiddenDynamicRoute = path.join(root, "src/app/(public)/events/[slug]");
  assert.ok(
    !fs.existsSync(forbiddenDynamicRoute),
    "Architecture strictly prohibits /events/[slug] detail route (all bookings route to /booking?event_id=...)"
  );

  const pageContent = fs.readFileSync(
    path.join(root, "src/app/(public)/events/page.tsx"),
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
  assert.match(tabsContent, /bg-primary-500/, "Active tab must use primary-500 token");
  assert.match(tabsContent, /rounded-badge/, "Tabs must use rounded-badge token");
});

test("Task 35 — 4. Featured Event Banner Specification (Figma 91:16919-91:16925)", () => {
  const bannerContent = fs.readFileSync(
    path.join(root, "src/components/public/events/FeaturedEventBanner.tsx"),
    "utf-8"
  );

  assert.match(
    bannerContent,
    /الفعالية الأبرز/,
    "Featured banner must display confirmed kicker badge 'الفعالية الأبرز'"
  );
  assert.match(bannerContent, /event\.title/, "Banner must render event title");
  assert.match(bannerContent, /event\.performer_name/, "Banner must render performer attribution");
  assert.match(bannerContent, /dateLocationString/, "Banner must format date and location string");
  assert.match(
    bannerContent,
    /\/booking\?event_id=/,
    "Banner CTA must link internal booking to /booking?event_id=[id]"
  );
  assert.match(
    bannerContent,
    /احجز الآن/,
    "Banner button must display confirmed label 'احجز الآن'"
  );
});

test("Task 35 — 5. Event Card Specification (Figma 91:16800-91:16814 & Component 16)", () => {
  const cardContent = fs.readFileSync(
    path.join(root, "src/components/public/events/EventCard.tsx"),
    "utf-8"
  );

  // Category badge
  assert.match(cardContent, /categoryLabel/, "Event card must display category badge");
  assert.match(cardContent, /rounded-badge/, "Category badge must use rounded-badge token");

  // Date block
  assert.match(cardContent, /font-mono/, "Date day must use DM Mono font");
  assert.match(cardContent, /dayArabic/, "Date day must format Arabic digits");
  assert.match(cardContent, /monthArabic/, "Date month must use Cairo Arabic month");

  // Performer & City string
  assert.match(cardContent, /performerCityString/, "Event card must format 'performer · city' string");

  // Title & Location
  assert.match(cardContent, /event\.title/, "Event card must render title");
  assert.match(cardContent, /event\.location/, "Event card must render location");

  // Action Button
  assert.match(
    cardContent,
    /\/booking\?event_id=/,
    "Event card action button must route to /booking?event_id=[id]"
  );
  assert.match(
    cardContent,
    /["']احجز["']/,
    "Event card action button must display confirmed label 'احجز'"
  );
});

test("Task 35 — 6. Events Header & Subtitle Integration", () => {
  const headerContent = fs.readFileSync(
    path.join(root, "src/components/public/events/EventsHeader.tsx"),
    "utf-8"
  );

  assert.match(
    headerContent,
    /مواعيد تترك أثراً جميلاً\./,
    "Events header must use confirmed title 'مواعيد تترك أثراً جميلاً.'"
  );
  assert.match(headerContent, /subtitle/, "Events header must accept subtitle from site_settings");
  assert.match(headerContent, /font-calligraphic/, "Events title must use calligraphic font");
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
    path.join(root, "src/app/(public)/events/page.tsx"),
    "utf-8"
  );

  assert.match(
    pageContent,
    /export const revalidate = 1800;/,
    "Events page must enforce 1800s (30m) ISR revalidation as locked in architecture"
  );
  assert.match(
    pageContent,
    /metadata:\s*Metadata/,
    "Events page must export typed Next.js metadata"
  );
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
