import { test, expect } from "@playwright/test";
import { watch, ADMIN_STATE, TAG } from "./check";

test.skip(!process.env.E2E_ADMIN_EMAIL, "E2E_ADMIN_EMAIL unset");
test.use({ storageState: ADMIN_STATE });

/** The six tabs of /admin/pages, as PagesEditor declares them. */
const PAGE_TABS = [
  { key: "home",    label: "الرئيسية",  route: "/" },
  { key: "events",  label: "الفعاليات", route: "/events" },
  { key: "news",    label: "الأخبار",   route: "/news" },
  { key: "artists", label: "الفنانون",  route: "/artists" },
  { key: "academy", label: "الأكاديمية", route: "/academy" },
  { key: "booking", label: "الحجز",     route: "/booking" },
] as const;

test.describe.serial("site settings", () => {
  test("saving the settings form reports success and survives a reload", async ({ page }) => {
    const problems = watch(page);
    await page.goto("/admin/settings", { waitUntil: "networkidle" });

    const form = page.getByLabel("نموذج إعدادات الموقع");
    await expect(form).toBeVisible();

    // contact_email round-trips through the same schema the public footer reads.
    const email = page.locator("#contact_email");
    const original = await email.inputValue();
    const changed = `e2e-test+settings@example.com`;

    await email.fill(changed);
    await page.getByRole("button", { name: "حفظ الإعدادات" }).click();
    await expect(page.getByRole("status"), "a save reports success, not an error")
      .toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("alert")).toHaveCount(0);

    await page.reload();
    await expect(page.locator("#contact_email"), "the saved value persists").toHaveValue(changed);

    // Put the real value back so the suite leaves settings as it found them —
    // site_settings is a singleton, so global-teardown cannot clean this up.
    await page.locator("#contact_email").fill(original);
    await page.getByRole("button", { name: "حفظ الإعدادات" }).click();
    await expect(page.getByRole("status")).toBeVisible({ timeout: 20_000 });
    await page.reload();
    await expect(page.locator("#contact_email"), "the original value is restored").toHaveValue(original);

    expect.soft(problems, "console/network errors").toEqual([]);
  });

  test("the preview panel opens and closes without errors", async ({ page }) => {
    const problems = watch(page);
    // The floating preview button only exists below the xl breakpoint.
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto("/admin/settings", { waitUntil: "networkidle" });

    await page.getByLabel("عرض المعاينة").click();
    const close = page.getByLabel("إغلاق المعاينة");
    await expect(close).toBeVisible();
    await close.click();
    await expect(close).toBeHidden();

    expect.soft(problems, "console/network errors").toEqual([]);
  });
});

test.describe.serial("page content editor", () => {
  test("every tab opens and keeps the tab in the URL", async ({ page }) => {
    const problems = watch(page);
    await page.goto("/admin/pages", { waitUntil: "networkidle" });

    const tablist = page.getByRole("tablist", { name: "أقسام صفحات الموقع" });
    await expect(tablist).toBeVisible();
    await expect(tablist.getByRole("tab")).toHaveCount(PAGE_TABS.length);

    for (const tab of PAGE_TABS) {
      const control = tablist.getByRole("tab").filter({ hasText: tab.label }).first();
      await control.click();
      await expect(control, `${tab.label} becomes the selected tab`)
        .toHaveAttribute("aria-selected", "true");
      await page.waitForFunction(
        (key) => new URLSearchParams(window.location.search).get("tab") === key,
        tab.key,
      );
      // Its panel is what the tab points at, and it must actually render.
      await expect(page.locator(`#tabpanel-${tab.key}`)).toBeVisible();
    }

    expect.soft(problems, "console/network errors").toEqual([]);
  });

  test("a saved override reaches the public page it edits", async ({ page }) => {
    const problems = watch(page);
    page.on("dialog", (d) => d.accept());
    await page.goto("/admin/pages?tab=artists", { waitUntil: "networkidle" });

    const heading = page.locator("#artists_title");
    const original = await heading.inputValue();
    const changed = `${TAG} artists heading`;

    await heading.fill(changed);
    await page.getByRole("button", { name: "حفظ كل التغييرات" }).click();
    await expect(page.getByRole("status")).toBeVisible({ timeout: 20_000 });

    const published = await page.request.get("/artists");
    expect.soft(published.status()).toBe(200);
    expect.soft(await published.text(), "the public artists page shows the saved heading")
      .toContain(changed);

    await page.reload();
    await page.locator("#artists_title").fill(original);
    await page.getByRole("button", { name: "حفظ كل التغييرات" }).click();
    await expect(page.getByRole("status")).toBeVisible({ timeout: 20_000 });

    expect.soft(problems, "console/network errors").toEqual([]);
  });
});
