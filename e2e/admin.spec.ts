import { test, expect } from "@playwright/test";
import { checkPage, watch, ADMIN_STATE, TAG } from "./check";
import { CANONICAL_ADMIN_ROUTES } from "../src/components/admin/adminNavConfig";

test.skip(!process.env.E2E_ADMIN_EMAIL, "E2E_ADMIN_EMAIL unset");
test.use({ storageState: ADMIN_STATE });

for (const { href } of CANONICAL_ADMIN_ROUTES) {
  test(`admin page ${href} loads cleanly`, async ({ page }) => {
    await checkPage(page, href, { locale: "ar" });
    expect(new URL(page.url()).pathname, "session should not bounce to /login").toBe(href);
  });
}

test("sidebar links navigate to each section with matching breadcrumb", async ({ page }) => {
  await page.goto("/admin");
  for (const { href, title } of CANONICAL_ADMIN_ROUTES) {
    await page.getByRole("link", { name: title, exact: true }).first().click();
    await page.waitForURL((u) => u.pathname === href);
    if (href !== "/admin") await expect.soft(page.getByRole("link", { name: title, exact: true }).nth(0)).toBeVisible();
  }
});

// ponytail: full CRUD only on artists as the representative manager; the other six share ManagerKit and are covered by page-load checks.
test.describe.serial("artists CRUD", () => {
  const name = `${TAG} artist`;
  const slug = `e2e-test-${Date.now()}`;

  test("empty save is blocked by required-field validation", async ({ page }) => {
    await page.goto("/admin/artists");
    await page.getByRole("button", { name: /إضافة/ }).first().click();
    await page.getByRole("button", { name: "حفظ الفنان" }).click();
    expect(await page.locator("#artist-name").evaluate((el: HTMLInputElement) => el.checkValidity())).toBe(false);
    await expect(page.getByRole("row").filter({ hasText: TAG })).toHaveCount(0);
  });

  test("create → edit → publish shows on public site → unpublish hides → delete", async ({ page }) => {
    const problems = watch(page);
    page.on("dialog", (d) => d.accept());
    await page.goto("/admin/artists", { waitUntil: "networkidle" });

    // Borrow a portrait URL the schema already accepts from an existing artist.
    let portrait = "https://placehold.co/400x400.png";
    const anyEdit = page.getByRole("button", { name: "تعديل" }).first();
    if (await anyEdit.count()) {
      await anyEdit.click();
      portrait = (await page.locator('#artist-form input[placeholder="https://..."]').inputValue()) || portrait;
      await page.getByRole("button", { name: "إلغاء" }).click();
    }

    await page.getByRole("button", { name: /إضافة/ }).first().click();
    const form = page.locator("#artist-form");
    await form.locator("#artist-name").fill(name);
    await form.locator("#artist-slug").fill(slug);
    await form.locator("#artist-genre").fill("E2E genre");
    await form.locator("#artist-city").fill("E2E city");
    await form.locator('input[placeholder="https://..."]').fill(portrait);
    await form.locator("#artist-specialties").fill("E2E specialties");
    await form.locator("#artist-quote").fill("E2E quote");
    await form.locator("#artist-short-bio").fill("E2E short bio");
    await form.locator("#artist-full-bio").fill("E2E full bio");
    await page.getByRole("button", { name: "حفظ الفنان" }).click();

    const row = page.getByRole("row").filter({ hasText: name });
    await expect(row, "created artist appears in list").toBeVisible({ timeout: 20_000 });
    await page.reload();
    await expect(row, "created artist persists after reload").toBeVisible();

    // Edit + publish
    await row.getByRole("button", { name: "تعديل" }).click();
    await form.locator("#artist-city").fill("E2E city edited");
    await page.getByLabel("نشر الفنان فوراً").check();
    await page.getByRole("button", { name: "حفظ التعديلات" }).click();
    await expect(page.getByRole("status")).toBeVisible({ timeout: 20_000 });
    await page.reload();
    await expect.soft(row, "edit persists").toContainText("E2E city edited");
    await expect.soft(row, "published badge").toContainText("منشور");

    const pub = await page.request.get(`/artists/${slug}`);
    expect.soft(pub.status(), "published artist page is public").toBe(200);
    expect.soft(await pub.text(), "public page shows artist name").toContain(name);

    // Unpublish
    await row.getByRole("button", { name: "تعديل" }).click();
    await page.getByLabel("نشر الفنان فوراً").uncheck();
    await page.getByRole("button", { name: "حفظ التعديلات" }).click();
    await expect(page.getByRole("status")).toBeVisible({ timeout: 20_000 });
    expect.soft((await page.request.get(`/artists/${slug}`)).status(), "draft artist page is hidden").toBe(404);

    // Delete
    await row.getByRole("button", { name: "حذف" }).click();
    await expect(row, "deleted artist leaves list").toHaveCount(0, { timeout: 20_000 });
    await page.reload();
    await expect(row, "deletion persists").toHaveCount(0);

    expect.soft(problems, "console/network errors").toEqual([]);
  });
});
