import { expect, type Page } from "@playwright/test";

export const ADMIN_STATE = "e2e/.auth/admin.json";
export const TAG = `E2E-TEST ${Date.now()}`;

/** Start collecting console errors, page crashes and failed same-origin requests. Call before goto. */
export function watch(page: Page) {
  const problems: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") problems.push(`console: ${m.text()}`); });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    const url = new URL(r.url());
    if (r.status() >= 400 && url.origin === new URL(page.url() || r.url()).origin && !url.pathname.startsWith("/_next/webpack-hmr")) {
      problems.push(`http ${r.status()}: ${url.pathname}${url.search}`);
    }
  });
  return problems;
}

/**
 * Visit a page and soft-assert the baseline health of it, so one run surfaces every problem.
 * locale drives the expected <html lang/dir>; admin and /login are Arabic.
 */
export async function checkPage(page: Page, path: string, { locale = "ar", status = 200 }: { locale?: "ar" | "en"; status?: number } = {}) {
  const problems = watch(page);
  const res = await page.goto(path, { waitUntil: "networkidle" });
  expect.soft(res?.status(), `${path} status`).toBe(status);

  const html = page.locator("html");
  await expect.soft(html, `${path} lang`).toHaveAttribute("lang", locale);
  await expect.soft(html, `${path} dir`).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");

  // Scroll through once so lazy images actually load before judging them.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");

  const broken = await page.$$eval("img", (imgs) =>
    imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src")).map((i) => i.getAttribute("src")));
  expect.soft(broken, `${path} broken images`).toEqual([]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect.soft(overflow, `${path} horizontal overflow px`).toBeLessThanOrEqual(1);

  // A missing translation renders its key path, e.g. "home.hero.title".
  const rawKeys = (await page.locator("body").innerText()).match(/\b[a-z]+(?:\.[a-zA-Z]+){2,}\b/g)?.filter((k) => !/\.(com|org|net|art|co|io|app|dev|ai|png|jpg|webp|svg)$/.test(k)) ?? [];
  expect.soft(rawKeys, `${path} raw i18n keys`).toEqual([]);

  expect.soft(problems, `${path} console/network errors`).toEqual([]);
  return { res, problems };
}
