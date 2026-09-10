import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".");
const pub = (...segs: string[]) => path.join(root, "src/app/(public)", ...segs);
const read = (p: string) => fs.readFileSync(p, "utf-8");

test("Task 40 — 1. Route map: 8 canonical routes, no /events/[slug]", () => {
  const routes = [
    "page.tsx",
    "artists/page.tsx",
    "artists/[slug]/page.tsx",
    "events/page.tsx",
    "academy/page.tsx",
    "news/page.tsx",
    "news/[slug]/page.tsx",
    "booking/page.tsx",
  ];
  for (const r of routes) {
    assert.ok(fs.existsSync(pub(r)), `Public route must exist: ${r}`);
  }
  assert.ok(
    !fs.existsSync(pub("events/[slug]/page.tsx")),
    "Speculative /events/[slug] must NOT exist — event cards link to /booking?event_id=..."
  );
});

test("Task 40 — 2. Every route reads published content via its DAL", () => {
  const wiring: [string, string[]][] = [
    ["page.tsx", ["getSiteSettings", "getFeaturedArtists", "getPublishedTestimonials", "getFeaturedArticles", "getUpcomingEvents"]],
    ["artists/page.tsx", ["getPublishedArtists", "getSiteSettings"]],
    ["artists/[slug]/page.tsx", ["getArtistBySlug", "getPublishedArtists"]],
    ["events/page.tsx", ["getPublishedEvents", "getFeaturedEvent", "getEventsSubtitle"]],
    ["academy/page.tsx", ["getSiteSettings", "getPublishedAcademyCourses"]],
    ["news/page.tsx", ["getPublishedArticles", "getFeaturedArticles"]],
    ["news/[slug]/page.tsx", ["getArticleBySlug", "getRelatedArticles", "getAllPublishedArticleSlugs"]],
    ["booking/page.tsx", ["getBookingPageData"]],
  ];
  for (const [route, fns] of wiring) {
    const src = read(pub(route));
    for (const fn of fns) {
      assert.match(src, new RegExp(`\\b${fn}\\b`), `${route} must call DAL ${fn}`);
    }
  }
});

test("Task 40 — 3. No draft leakage: all public DALs enforce published-only", () => {
  const dalDir = path.join(root, "src/lib/dal");
  const publicDals = [
    "artists.ts",
    "articles.ts",
    "events.ts",
    "academy.ts",
    "testimonials.ts",
    "booking.ts",
  ];
  for (const f of publicDals) {
    const src = read(path.join(dalDir, f));
    assert.match(
      src,
      /\.eq\("is_published", true\)|is_published \&\&/,
      `${f} must gate reads on is_published`
    );
  }
  // Temporal gating for time-published content
  const articles = read(path.join(dalDir, "articles.ts"));
  assert.match(articles, /\.lte\("published_at", nowIso\)/);

  // Detail lookups return null (→ 404) for drafts, never throw them public
  for (const f of ["artists.ts", "articles.ts"]) {
    const src = read(path.join(dalDir, f));
    assert.match(src, /return .* \|\| null/, `${f} detail lookup must resolve missing/draft to null`);
  }
});

test("Task 40 — 4. Cache contract matches APPLICATION_ARCHITECTURE.md", () => {
  assert.match(read(pub("page.tsx")), /export const revalidate\s*=\s*3600;/);
  assert.match(read(pub("artists/page.tsx")), /export const revalidate\s*=\s*3600;/);
  assert.match(read(pub("events/page.tsx")), /export const revalidate\s*=\s*1800;/);
  assert.match(read(pub("news/page.tsx")), /export const revalidate\s*=\s*1800;/);
  assert.match(read(pub("news/[slug]/page.tsx")), /export const revalidate\s*=\s*1800;/);
  assert.match(
    read(pub("academy/page.tsx")),
    /export const dynamic\s*=\s*"force-static";/,
    "/academy is Static per architecture (no searchParams/cookies)"
  );
  // Detail routes pre-render published slugs only
  for (const r of ["artists/[slug]/page.tsx", "news/[slug]/page.tsx"]) {
    assert.match(
      read(pub(r)),
      /export async function generateStaticParams\(/,
      `${r} must export generateStaticParams`
    );
  }
  // Booking stays dynamic (reads searchParams for ?event_id=/artist=/course=)
  assert.match(read(pub("booking/page.tsx")), /searchParams/);
});

test("Task 40 — 5. Detail routes 404 on missing/unpublished + canonical URLs", () => {
  for (const r of ["artists/[slug]/page.tsx", "news/[slug]/page.tsx"]) {
    const src = read(pub(r));
    assert.match(src, /notFound\(\)/, `${r} must 404 when content is missing`);
    assert.match(
      src,
      /from\s*["']next\/navigation["']/,
      `${r} must import notFound from next/navigation`
    );
    assert.match(src, /export async function generateMetadata\(/, `${r} must export metadata`);
    assert.match(src, /canonical/, `${r} must declare a canonical URL`);
  }
});

test("Task 40 — 6. Empty states, missing-asset fallbacks, event booking links", () => {
  const comp = (...segs: string[]) =>
    read(path.join(root, "src/components/public", ...segs));

  // Empty states
  assert.match(comp("ArtistsGrid.tsx"), /ArtistsEmptyState|empty|لا يوجد|لا توجد/);
  assert.match(comp("NewsGrid.tsx"), /empty|لا يوجد|لا توجد|Empty/);
  assert.match(comp("events/EventsCatalogView.tsx"), /empty|لا يوجد|لا توجد|Empty/);
  assert.match(comp("academy/AcademyTracks.tsx"), /empty|لا يوجد|لا توجد|Empty/);
  assert.match(comp("FeaturedArtists.tsx"), /length === 0/);
  assert.match(comp("HomeEvents.tsx"), /length === 0/);

  // Missing-asset fallbacks (no broken images)
  assert.match(comp("ArtistCard.tsx"), /fallback|onError/);
  assert.match(comp("ArticleCard.tsx"), /default-article/);
  assert.match(comp("EventCard.tsx"), /default-event/);

  // Event actions route to booking context or external tickets — never a detail page
  const cards = comp("events/EventCard.tsx") + comp("events/FeaturedEventBanner.tsx");
  assert.match(cards, /\/booking\?event_id=/);
  assert.match(cards, /ticket_url/);
});

test("Task 40 — 7. Booking privacy: submissions never publicly queryable", () => {
  const bookingPage = read(pub("booking/page.tsx"));
  assert.doesNotMatch(
    bookingPage,
    /getAdminBookingRequests/,
    "Public booking page must never use the admin bookings reader"
  );
  assert.doesNotMatch(
    bookingPage,
    /from\("booking_requests"\)/,
    "Public booking page must never query booking_requests directly"
  );
  const adminDal = read(path.join(root, "src/lib/dal/bookings.ts"));
  assert.match(
    adminDal,
    /getAdminBookingRequests/,
    "Admin-only bookings reader must exist for Task 49 (admin CMS)"
  );
});
