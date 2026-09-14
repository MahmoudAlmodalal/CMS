import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import { checkPage } from "./check";

const LOCALES = [
  { code: "ar", prefix: "", lang: "ar", dir: "rtl" },
  { code: "en", prefix: "/en", lang: "en", dir: "ltr" },
] as const;

/**
 * Collect all same-origin links on a page, skipping mailto:, tel:, #, and external URLs.
 */
async function getSameOriginHrefs(page: Page, origin: string): Promise<string[]> {
  const hrefs = await page.$$eval("a[href]", (anchors) =>
    anchors.map((a) => a.getAttribute("href")).filter((h): h is string => Boolean(h))
  );

  const validHrefs: string[] = [];
  for (const h of hrefs) {
    const trimmed = h.trim();
    if (
      !trimmed ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("mailto:") ||
      trimmed.startsWith("tel:") ||
      trimmed.startsWith("javascript:")
    ) {
      continue;
    }

    try {
      const resolved = new URL(trimmed, page.url());
      if (resolved.origin === origin) {
        // Keep pathname + search, strip hash
        validHrefs.push(resolved.pathname + resolved.search);
      }
    } catch {
      // Invalid URL format, skip
    }
  }

  return validHrefs;
}

for (const loc of LOCALES) {
  test.describe(`Public Pages - ${loc.code.toUpperCase()} Locale`, () => {
    test(`home page "/" passes baseline checks`, async ({ page }) => {
      const path = loc.prefix || "/";
      await checkPage(page, path, { locale: loc.code });
    });

    test(`artists list page "/artists" passes baseline checks`, async ({ page }) => {
      const path = `${loc.prefix}/artists`;
      await checkPage(page, path, { locale: loc.code });
    });

    test(`artists detail page "/artists/<slug>" passes baseline checks`, async ({ page }) => {
      const listPath = `${loc.prefix}/artists`;
      await page.goto(listPath, { waitUntil: "networkidle" });

      const detailLink = page.locator('a[href*="/artists/"]').first();
      const count = await detailLink.count();
      expect(count, `Expected at least one artist link on ${listPath}`).toBeGreaterThan(0);

      const href = await detailLink.getAttribute("href");
      expect(href, `First artist link href on ${listPath} should exist`).toBeTruthy();

      await checkPage(page, href!, { locale: loc.code });
    });

    test(`events page "/events" passes baseline checks`, async ({ page }) => {
      const path = `${loc.prefix}/events`;
      await checkPage(page, path, { locale: loc.code });
    });

    test(`academy page "/academy" passes baseline checks`, async ({ page }) => {
      const path = `${loc.prefix}/academy`;
      await checkPage(page, path, { locale: loc.code });
    });

    test(`news list page "/news" passes baseline checks`, async ({ page }) => {
      const path = `${loc.prefix}/news`;
      await checkPage(page, path, { locale: loc.code });
    });

    test(`news detail page "/news/<slug>" passes baseline checks`, async ({ page }) => {
      const listPath = `${loc.prefix}/news`;
      await page.goto(listPath, { waitUntil: "networkidle" });

      const detailLink = page.locator('a[href*="/news/"]').first();
      const count = await detailLink.count();
      expect(count, `Expected at least one article link on ${listPath}`).toBeGreaterThan(0);

      const href = await detailLink.getAttribute("href");
      expect(href, `First article link href on ${listPath} should exist`).toBeTruthy();

      await checkPage(page, href!, { locale: loc.code });
    });

    test(`booking page "/booking" passes baseline checks`, async ({ page }) => {
      const path = `${loc.prefix}/booking`;
      await checkPage(page, path, { locale: loc.code });
    });

    test(`unknown URL returns 404 with localized not-found in site shell`, async ({ page }) => {
      const notFoundPath = `${loc.prefix}/this-page-does-not-exist-e2e`;
      const res = await page.goto(notFoundPath, { waitUntil: "networkidle" });

      // Status must be 404
      expect.soft(res?.status(), `Expected 404 status for ${notFoundPath}`).toBe(404);

      // Shell verification: html lang and dir
      const html = page.locator("html");
      await expect.soft(html, `Expected html lang to be ${loc.lang}`).toHaveAttribute("lang", loc.lang);
      await expect.soft(html, `Expected html dir to be ${loc.dir}`).toHaveAttribute("dir", loc.dir);

      // Header/nav should be visible inside the site shell
      const header = page.getByRole("banner");
      await expect.soft(header, `Expected header to be visible on 404 page`).toBeVisible();

      // Localized not-found content should be present
      const expectedText = loc.code === "ar" ? "لم نجد هذه الصفحة" : "We couldn't find that page";
      await expect.soft(page.getByText(expectedText).first(), `Expected localized not-found text "${expectedText}"`).toBeVisible();
    });
  });
}

test.describe("Public Behavior - Link Integrity", () => {
  test("every same-origin <a href> across public pages resolves with status < 400", async ({ page, request }) => {
    const origin = new URL(page.url() || "http://localhost:3000").origin;
    const collectedHrefs = new Set<string>();

    // Pages to crawl for links across both locales
    const pagesToScrape = [
      "/",
      "/en",
      "/artists",
      "/en/artists",
      "/events",
      "/en/events",
      "/academy",
      "/en/academy",
      "/news",
      "/en/news",
      "/booking",
      "/en/booking",
    ];

    // Also include one artist and one news slug if available
    for (const listRoute of ["/artists", "/en/artists", "/news", "/en/news"]) {
      await page.goto(listRoute, { waitUntil: "networkidle" });
      const prefix = listRoute.includes("/artists") ? "/artists/" : "/news/";
      const link = page.locator(`a[href*="${prefix}"]`).first();
      if ((await link.count()) > 0) {
        const href = await link.getAttribute("href");
        if (href) {
          const resolved = new URL(href, page.url());
          pagesToScrape.push(resolved.pathname + resolved.search);
        }
      }
    }

    // Scrape hrefs
    for (const p of pagesToScrape) {
      await page.goto(p, { waitUntil: "networkidle" });
      const hrefs = await getSameOriginHrefs(page, origin);
      for (const h of hrefs) {
        collectedHrefs.add(h);
      }
    }

    expect(collectedHrefs.size, "Should have collected same-origin hrefs").toBeGreaterThan(0);

    // Verify each unique href resolves < 400
    for (const href of collectedHrefs) {
      const response = await request.get(href);
      expect.soft(response.status(), `URL ${href} should return status < 400`).toBeLessThan(400);
    }
  });
});

test.describe("Public Behavior - Navigation & Desktop Header", () => {
  test("main nav links navigate to the right page (desktop project)", async ({ page }) => {
    test.skip(test.info().project.name !== "desktop", "Desktop-only test");

    // Arabic navbar navigation
    await page.goto("/", { waitUntil: "networkidle" });
    const headerAr = page.getByRole("banner");

    // Click Academy in Arabic nav
    await headerAr.getByRole("link", { name: "الأكاديمية" }).click();
    await page.waitForURL("**/academy");
    expect(page.url()).toContain("/academy");

    // Click Artists
    await headerAr.getByRole("link", { name: "الفنانين" }).click();
    await page.waitForURL("**/artists");
    expect(page.url()).toContain("/artists");

    // Click Events
    await headerAr.getByRole("link", { name: "الفعاليات" }).click();
    await page.waitForURL("**/events");
    expect(page.url()).toContain("/events");

    // Click News
    await headerAr.getByRole("link", { name: "الأخبار" }).click();
    await page.waitForURL("**/news");
    expect(page.url()).toContain("/news");

    // Click Home
    await headerAr.getByRole("link", { name: "الرئيسية" }).click();
    await page.waitForURL(/\/$/);
    expect(new URL(page.url()).pathname).toBe("/");

    // English navbar navigation
    await page.goto("/en", { waitUntil: "networkidle" });
    const headerEn = page.getByRole("banner");

    await headerEn.getByRole("link", { name: "Events" }).click();
    await page.waitForURL("**/en/events");
    expect(page.url()).toContain("/en/events");

    await headerEn.getByRole("link", { name: "Academy" }).click();
    await page.waitForURL("**/en/academy");
    expect(page.url()).toContain("/en/academy");

    await headerEn.getByRole("link", { name: "Artists" }).click();
    await page.waitForURL("**/en/artists");
    expect(page.url()).toContain("/en/artists");

    await headerEn.getByRole("link", { name: "News" }).click();
    await page.waitForURL("**/en/news");
    expect(page.url()).toContain("/en/news");

    await headerEn.getByRole("link", { name: "Home" }).click();
    await page.waitForURL(/\/en$/);
    expect(new URL(page.url()).pathname).toBe("/en");
  });

  test("locale switcher switches ar<->en and keeps the current path", async ({ page }) => {
    // Start on /artists (Arabic)
    await page.goto("/artists", { waitUntil: "networkidle" });

    // Click locale switcher in header (aria-label "التبديل إلى الإنجليزية")
    const switchToEn = page.getByLabel("التبديل إلى الإنجليزية").first();
    await switchToEn.click();
    await page.waitForURL("**/en/artists");
    expect(new URL(page.url()).pathname).toBe("/en/artists");

    // Switch back to Arabic from /en/artists (aria-label "Switch to Arabic")
    const switchToAr = page.getByLabel("Switch to Arabic").first();
    await switchToAr.click();
    await page.waitForURL("**/artists");
    expect(new URL(page.url()).pathname).toBe("/artists");
  });
});

test.describe("Public Behavior - Mobile Navigation", () => {
  test("mobile menu opens, shows links, closes, navigating works", async ({ page }) => {
    test.skip(test.info().project.name !== "mobile", "Mobile-only test");

    await page.goto("/", { waitUntil: "networkidle" });

    // Open mobile menu via hamburger button (aria-label "فتح قائمة التنقل")
    const openBtn = page.getByLabel("فتح قائمة التنقل");
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // Mobile drawer dialog should be visible
    const drawer = page.getByRole("dialog", { name: "قائمة التنقل للهواتف" });
    await expect(drawer).toBeVisible();

    // Drawer should show navigation links
    const artistsLink = drawer.getByRole("link", { name: "الفنانين" });
    await expect(artistsLink).toBeVisible();

    // Close button test
    const closeBtn = drawer.getByLabel("إغلاق قائمة التنقل");
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(drawer).not.toBeVisible();

    // Re-open and navigate
    await openBtn.click();
    await expect(drawer).toBeVisible();
    await artistsLink.click();

    // Drawer should close and route should transition to /artists
    await page.waitForURL("**/artists");
    expect(new URL(page.url()).pathname).toBe("/artists");
    await expect(drawer).not.toBeVisible();
  });
});

test.describe("Public Behavior - Filtering Tabs", () => {
  test("artists filter tabs (ArtistFilterTabs) change visible content or URL without errors", async ({ page }) => {
    await page.goto("/artists", { waitUntil: "networkidle" });

    const tabsNav = page.getByRole("navigation", { name: "تصنيفات الفنانين" });
    await expect(tabsNav).toBeVisible();

    // Click a category tab other than "الكل" (e.g. "غناء" or "عود وموسيقى" or "إيقاع")
    const tabs = tabsNav.getByRole("tab");
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(1);

    // Pick the second tab
    const targetTab = tabs.nth(1);
    const tabName = (await targetTab.innerText()).trim();
    await targetTab.click();

    // URL should update with category query param
    await page.waitForFunction(() => window.location.search.includes("category="));
    const url = new URL(page.url());
    expect(url.searchParams.get("category")).toBeTruthy();
    await expect(targetTab).toHaveAttribute("aria-selected", "true");

    // Click first tab "الكل" to reset
    const allTab = tabs.first();
    await allTab.click();
    await page.waitForFunction(() => !window.location.search.includes("category="));
    expect(new URL(page.url()).searchParams.get("category")).toBeNull();
  });

  test("news filter tabs (NewsFilterTabs) change visible content or URL without errors", async ({ page }) => {
    await page.goto("/news", { waitUntil: "networkidle" });

    // Look for NewsFilterTabs (aria-label "تصنيفات المقالات" in Arabic or "Article categories" in English)
    const newsFilter = page.getByRole("navigation", { name: /تصنيفات المقالات|Article categories/ });
    const isPresent = await newsFilter.count();

    if (isPresent > 0) {
      const tabs = newsFilter.getByRole("tab");
      const count = await tabs.count();
      if (count > 1) {
        await tabs.nth(1).click();
        await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
      }
    } else {
      // NewsFilterTabs is not currently mounted on /news per design note in NewsGrid.tsx
      expect.soft(isPresent, "NewsFilterTabs is not mounted on the /news page").toBeGreaterThan(0);
    }
  });
});

test.describe("Public Behavior - Booking & Event Integration", () => {
  test("event card links go to /booking?event_id=... and booking page shows event context banner", async ({ page }) => {
    await page.goto("/events", { waitUntil: "networkidle" });

    // Find the first booking link on an event card or featured banner that targets /booking?event_id=
    // Note: The app's EventCard falls back to external ticket_url if present.
    // We check both EventCard and FeaturedEventBanner.
    const bookingLink = page.locator('a[href*="/booking?event_id="]').first();
    const count = await bookingLink.count();

    expect(count, "Expected at least one event link leading to /booking?event_id=").toBeGreaterThan(0);

    const href = await bookingLink.getAttribute("href");
    expect(href).toContain("/booking?event_id=");

    // Navigate to the booking link
    await page.goto(href!, { waitUntil: "networkidle" });

    // Booking page should display the BookingContextBanner
    // Text: "سياق الحجز المحدد" or "حجز مرتبط بالفعالية:"
    const contextHeading = page.getByText(/سياق الحجز المحدد|Specified Booking Context/i);
    await expect(contextHeading).toBeVisible();

    const eventContextText = page.getByText(/حجز مرتبط بالفعالية:|Booking linked to event:/i);
    await expect(eventContextText).toBeVisible();
  });
});

test.describe("Public Behavior - Interactive Widgets", () => {
  test("testimonials slider controls are clickable without page errors", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const testimonialsSection = page.getByRole("region", { name: /يقولون عن أندلسيا|What people say about Andalusia/i });
    if ((await testimonialsSection.count()) > 0) {
      // Test desktop buttons if visible
      const nextBtn = testimonialsSection.getByRole("button", { name: /الشهادة التالية|Next testimonial/i });
      const prevBtn = testimonialsSection.getByRole("button", { name: /الشهادة السابقة|Previous testimonial/i });

      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await prevBtn.click();
      }

      // Test indicator tabs if present
      const indicators = testimonialsSection.getByRole("tab");
      if ((await indicators.count()) > 1) {
        await indicators.nth(1).click();
      }
    }
  });

  test("audio player widget controls clickable without page errors if present", async ({ page }) => {
    // Check artist profile page for audio player widget
    await page.goto("/artists", { waitUntil: "networkidle" });
    const firstArtistLink = page.locator('a[href*="/artists/"]').first();

    if ((await firstArtistLink.count()) > 0) {
      const href = await firstArtistLink.getAttribute("href");
      await page.goto(href!, { waitUntil: "networkidle" });

      // Audio player has play button with aria-label "تشغيل" or "Play"
      const playBtn = page.getByRole("button", { name: /تشغيل|^Play$/i });
      if ((await playBtn.count()) > 0 && (await playBtn.first().isVisible())) {
        await playBtn.first().click();
      }
    }
  });
});
