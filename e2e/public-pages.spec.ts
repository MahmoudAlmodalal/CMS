import { test, expect } from "@playwright/test";
import { checkPage, watch } from "./check";
import { LOCALES, LOCALE_PREFIX, t, plain, type Locale } from "./messages";

/**
 * Coverage for the public pages and widgets public.spec.ts does not reach:
 * the academy course detail route (which had none at all), the events filter,
 * news pagination, and the artist-detail sections.
 *
 * Selectors resolve through the message catalog rather than hardcoded Arabic,
 * so each assertion holds in both locales and a copy edit does not silently
 * turn a test into one that matches nothing.
 */

async function firstHref(page: import("@playwright/test").Page, selector: string): Promise<string> {
  const link = page.locator(selector).first();
  await expect(link, `expected at least one ${selector}`).toHaveCount(1);
  const href = await link.getAttribute("href");
  expect(href, `${selector} must carry an href`).toBeTruthy();
  return href!;
}

for (const locale of LOCALES) {
  const prefix = LOCALE_PREFIX[locale as Locale];

  test.describe(`Academy course detail — ${locale.toUpperCase()}`, () => {
    test("a course card leads to a detail page that passes baseline checks", async ({ page }) => {
      await page.goto(`${prefix}/academy`, { waitUntil: "networkidle" });

      // TrackCard links to /academy/<slug> and labels itself from the catalog.
      const href = await firstHref(page, `a[href*="${prefix}/academy/"]`);
      await checkPage(page, href, { locale: locale as Locale });

      // The detail page must actually render course content, not just 200.
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });

    test("an unknown course slug is a 404, not a blank page", async ({ page }) => {
      const res = await page.goto(`${prefix}/academy/e2e-test-no-such-course`, {
        waitUntil: "networkidle",
      });
      expect(res?.status(), "a missing course is a 404").toBe(404);
      await expect(page.getByRole("banner"), "the 404 keeps the site shell").toBeVisible();
    });
  });

  test.describe(`Events filtering — ${locale.toUpperCase()}`, () => {
    test("the category tabs filter and mark the active tab", async ({ page }) => {
      const problems = watch(page);
      await page.goto(`${prefix}/events`, { waitUntil: "networkidle" });

      const tabs = page.getByRole("tablist", { name: t(locale as Locale, "events.filterTabs") });
      await expect(tabs, "the events filter is mounted").toBeVisible();

      const options = tabs.getByRole("tab");
      const count = await options.count();
      expect(count, "there is more than the all-events tab").toBeGreaterThan(1);

      const target = options.nth(1);
      await target.click();
      await expect(target, "the clicked tab becomes selected").toHaveAttribute("aria-selected", "true");

      const first = options.first();
      await first.click();
      await expect(first, "the all-events tab resets the filter").toHaveAttribute("aria-selected", "true");

      expect.soft(problems, "console/network errors").toEqual([]);
    });
  });
}

test.describe("News pagination", () => {
  test("paging forward changes the page and the listing", async ({ page }) => {
    const problems = watch(page);
    await page.goto("/news", { waitUntil: "networkidle" });

    const pagination = page.getByRole("navigation", { name: t("ar", "news.pagination") });
    test.skip(!(await pagination.count()), "only one page of articles — seed more demo content");

    const next = pagination.getByLabel(t("ar", "news.nextPage")).first();
    await next.click();
    await page.waitForFunction(() => new URLSearchParams(window.location.search).get("page") === "2");

    await expect(page.getByRole("heading", { level: 1 }), "page 2 renders the listing").toBeVisible();

    const previous = page.getByLabel(t("ar", "news.previousPage")).first();
    await previous.click();
    await page.waitForFunction(() => !new URLSearchParams(window.location.search).get("page")
      || new URLSearchParams(window.location.search).get("page") === "1");

    expect.soft(problems, "console/network errors").toEqual([]);
  });
});

test.describe("Artist detail sections", () => {
  test("the works region renders and its player control responds", async ({ page }) => {
    const problems = watch(page);
    await page.goto("/artists", { waitUntil: "networkidle" });
    const href = await firstHref(page, 'a[href*="/artists/"]');
    await page.goto(href, { waitUntil: "networkidle" });

    // These regions are the artist page's reason to exist. An artist with no
    // works does not render one, so this asserts on the page as a whole rather
    // than skipping: a detail page with neither works nor a gallery is a bug.
    const works = page.getByRole("region", { name: t("ar", "artist.worksRegion") });
    const gallery = page.getByRole("region", { name: t("ar", "artist.galleryRegion") });
    const regions = (await works.count()) + (await gallery.count());
    expect(regions, "an artist page shows its works or its gallery").toBeGreaterThan(0);

    if (await works.count()) {
      // A YouTube-backed work renders a play control; clicking it must not throw.
      const play = works.getByRole("button", { name: t("ar", "artist.workPlay") }).first();
      if (await play.count()) {
        await play.click();
        await expect(works.locator("iframe[src*='youtube']").first(), "the embed mounts on play")
          .toBeVisible({ timeout: 15_000 });
      }
    }

    expect.soft(problems, "console/network errors").toEqual([]);
  });

  test("the artist page heading carries the artist's name", async ({ page }) => {
    await page.goto("/artists", { waitUntil: "networkidle" });
    const card = page.locator('a[href*="/artists/"]').first();
    const href = await card.getAttribute("href");
    await page.goto(href!, { waitUntil: "networkidle" });

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    expect((await heading.innerText()).trim().length, "the h1 is not empty").toBeGreaterThan(0);
  });
});

test.describe("Home widgets", () => {
  test("the testimonials slider advances through its entries", async ({ page }) => {
    const problems = watch(page);
    await page.goto("/", { waitUntil: "networkidle" });

    const region = page.getByRole("region", { name: plain("ar", "testimonials.region") });
    test.skip(!(await region.count()), "the testimonials section is switched off in site settings");

    const indicators = region.getByRole("tab");
    const total = await indicators.count();
    expect(total, "a slider needs entries to slide through").toBeGreaterThan(0);

    if (total > 1) {
      await region.getByRole("button", { name: t("ar", "testimonials.next") }).first().click();
      await expect(indicators.nth(1), "the next control advances the active entry")
        .toHaveAttribute("aria-selected", "true");

      await region.getByRole("button", { name: t("ar", "testimonials.previous") }).first().click();
      await expect(indicators.nth(0), "the previous control goes back")
        .toHaveAttribute("aria-selected", "true");
    }

    expect.soft(problems, "console/network errors").toEqual([]);
  });
});
