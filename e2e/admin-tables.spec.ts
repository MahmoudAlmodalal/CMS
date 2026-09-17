import { test, expect } from "@playwright/test";
import { watch, ADMIN_STATE } from "./check";
import { BUCKETS } from "../src/components/admin/media/MediaBucketTabs";

test.skip(!process.env.E2E_ADMIN_EMAIL, "E2E_ADMIN_EMAIL unset");
test.use({ storageState: ADMIN_STATE });

test.describe("bookings triage", () => {
  test("a booking's status and admin notes round-trip", async ({ page }) => {
    const problems = watch(page);
    await page.goto("/admin/bookings", { waitUntil: "networkidle" });

    const rows = page.getByRole("row");
    const count = await rows.count();
    test.skip(count <= 1, "no booking requests to triage — seed demo content first");

    // The desktop table and the mobile card list both render a status control;
    // the visible one belongs to whichever layout this project's viewport picked.
    const status = page.getByLabel("حالة طلب الحجز").first();
    await expect(status).toBeVisible();

    const notes = page.locator('textarea[id^="booking-notes-"], textarea[id^="mobile-booking-notes-"]').first();
    await expect(notes).toBeVisible();

    const original = await notes.inputValue();
    const changed = `e2e-test note ${Date.now()}`;
    await notes.fill(changed);
    await page.getByRole("button", { name: "حفظ الملاحظات" }).first().click();
    await expect(page.getByRole("status"), "saving notes reports success").toBeVisible({ timeout: 20_000 });

    await page.reload();
    await expect(
      page.locator('textarea[id^="booking-notes-"], textarea[id^="mobile-booking-notes-"]').first(),
      "the note persists",
    ).toHaveValue(changed);

    // Leave the row as it was: booking rows created outside this suite are real
    // data that global-teardown does not touch.
    await page.locator('textarea[id^="booking-notes-"], textarea[id^="mobile-booking-notes-"]').first().fill(original);
    await page.getByRole("button", { name: "حفظ الملاحظات" }).first().click();
    await expect(page.getByRole("status")).toBeVisible({ timeout: 20_000 });

    expect.soft(problems, "console/network errors").toEqual([]);
  });
});

test.describe("subscribers", () => {
  test("a subscriber can be unsubscribed and reactivated", async ({ page }) => {
    const problems = watch(page);
    await page.goto("/admin/subscribers", { waitUntil: "networkidle" });

    const toggle = page.getByRole("button", { name: /إلغاء الاشتراك|إعادة تفعيل/ }).first();
    test.skip(!(await toggle.count()), "no newsletter subscribers — seed demo content first");

    const before = (await toggle.innerText()).trim();
    await toggle.click();
    await expect(
      page.getByRole("button", { name: /إلغاء الاشتراك|إعادة تفعيل/ }).first(),
      "the control flips to the opposite action",
    ).not.toHaveText(before, { timeout: 20_000 });

    // Put the subscriber back the way it was found.
    await page.getByRole("button", { name: /إلغاء الاشتراك|إعادة تفعيل/ }).first().click();
    await expect(page.getByRole("button", { name: /إلغاء الاشتراك|إعادة تفعيل/ }).first())
      .toHaveText(before, { timeout: 20_000 });

    expect.soft(problems, "console/network errors").toEqual([]);
  });
});

test.describe("media library", () => {
  test("every storage bucket tab opens and lists without an error", async ({ page }) => {
    const problems = watch(page);
    await page.goto("/admin/media", { waitUntil: "networkidle" });

    const tablist = page.getByRole("tablist", { name: "حاويات التخزين" });
    await expect(tablist).toBeVisible();
    await expect(tablist.getByRole("tab")).toHaveCount(BUCKETS.length);

    for (const bucket of BUCKETS) {
      const tab = tablist.getByRole("tab").filter({ hasText: bucket.label }).first();
      await tab.click();
      await expect(tab, `${bucket.id} becomes the selected bucket`)
        .toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tabpanel")).toBeVisible();
      // A bucket that fails to list renders the error Notice rather than a grid.
      await expect(page.getByRole("alert"), `${bucket.id} lists without an error`).toHaveCount(0);
    }

    expect.soft(problems, "console/network errors").toEqual([]);
  });
});

test.describe("deployment diagnostics", () => {
  test("the check runs and reports a result", async ({ page }) => {
    const problems = watch(page);
    await page.goto("/admin/diagnostics", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: "إعادة تشغيل الفحص" }).click();
    await expect(page.getByRole("status").first(), "the run produces a verdict")
      .toBeVisible({ timeout: 30_000 });

    // A dry run must never write: it only lists what it would change.
    await page.getByRole("button", { name: "عرض ما سيتغيّر" }).click();
    await expect(page.getByRole("button", { name: "تطبيق الإصلاح" })).toBeVisible();

    expect.soft(problems, "console/network errors").toEqual([]);
  });
});
