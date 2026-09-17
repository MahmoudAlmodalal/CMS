import { test, expect } from "@playwright/test";
import { checkPage, ADMIN_STATE } from "./check";
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
