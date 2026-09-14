import { test, expect } from "@playwright/test";
import { checkPage, ADMIN_STATE } from "./check";
import { AUTH_ERRORS } from "../src/lib/auth-utils";

test.describe("Admin Authentication", () => {
  // Fresh unauthenticated context for basic login tests
  test("login page passes baseline health checks", async ({ page }) => {
    await checkPage(page, "/login", { locale: "ar" });
  });

  const adminRoutes = [
    "/admin",
    "/admin/academy",
    "/admin/articles",
    "/admin/artists",
    "/admin/bookings",
    "/admin/events",
    "/admin/media",
    "/admin/pages",
    "/admin/releases",
    "/admin/settings",
    "/admin/subscribers",
    "/admin/testimonials",
    "/admin/tracks",
  ];

  for (const route of adminRoutes) {
    test(`unauthenticated visit to ${route} redirects to /login?next=${encodeURIComponent(route)}`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response).not.toBeNull();
      // Should have been redirected to /login with next query parameter
      const url = new URL(page.url());
      expect(url.pathname).toBe("/login");
      expect(url.searchParams.get("next")).toBe(route);
    });
  }

  test("wrong password displays role=alert error, stays on /login, does not crash", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("البريد الإلكتروني").fill("admin@andalusia.art");
    await page.getByLabel("كلمة المرور").fill("WrongPassword123!");
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    const alert = page.locator('form [role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText(AUTH_ERRORS.INVALID_CREDENTIALS);

    expect(new URL(page.url()).pathname).toBe("/login");
  });

  test("empty fields block submit via browser/native validation", async ({ page }) => {
    await page.goto("/login");

    const emailInput = page.getByLabel("البريد الإلكتروني");
    const passwordInput = page.getByLabel("كلمة المرور");
    const submitButton = page.getByRole("button", { name: "تسجيل الدخول" });

    // Both empty: submit should be blocked by email required validation
    await submitButton.click();
    let emailValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(emailValid).toBe(false);

    // Email filled, password empty: submit should be blocked by password required validation
    await emailInput.fill("admin@andalusia.art");
    await submitButton.click();
    let passwordValid = await passwordInput.evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(passwordValid).toBe(false);

    // URL remains /login and no alert is displayed because form submission was prevented
    expect(new URL(page.url()).pathname).toBe("/login");
    await expect(page.locator('form [role="alert"]')).toHaveCount(0);
  });

  test("open-redirect attack with https:// evil URL does not leave site after successful login", async ({ page }) => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    test.skip(!email || !password, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set");

    await page.goto(`/login?next=${encodeURIComponent("https://evil.example.com")}`);
    await page.getByLabel("البريد الإلكتروني").fill(email!);
    await page.getByLabel("كلمة المرور").fill(password!);
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });

    const currentUrl = new URL(page.url());
    expect(currentUrl.hostname).not.toContain("evil.example.com");
    expect(currentUrl.pathname).toBe("/admin");
  });

  test("open-redirect attack with protocol-relative // evil URL does not leave site after successful login", async ({ page }) => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    test.skip(!email || !password, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set");

    await page.goto(`/login?next=${encodeURIComponent("//evil.example.com")}`);
    await page.getByLabel("البريد الإلكتروني").fill(email!);
    await page.getByLabel("كلمة المرور").fill(password!);
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 });

    const currentUrl = new URL(page.url());
    expect(currentUrl.hostname).not.toContain("evil.example.com");
    expect(currentUrl.pathname).toBe("/admin");
  });

  test("valid login lands on /admin", async ({ page }) => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    test.skip(!email || !password, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set");

    await page.goto("/login");
    await page.getByLabel("البريد الإلكتروني").fill(email!);
    await page.getByLabel("كلمة المرور").fill(password!);
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    await page.waitForURL((url) => url.pathname.startsWith("/admin"), { timeout: 30_000 });
    expect(new URL(page.url()).pathname).toBe("/admin");
  });

  test("valid login honours next=/admin/events", async ({ page }) => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    test.skip(!email || !password, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set");

    await page.goto("/login?next=/admin/events");
    await page.getByLabel("البريد الإلكتروني").fill(email!);
    await page.getByLabel("كلمة المرور").fill(password!);
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    await page.waitForURL((url) => url.pathname === "/admin/events", { timeout: 30_000 });
    expect(new URL(page.url()).pathname).toBe("/admin/events");
  });

  test("already-logged-in user visiting /login is sent to /admin", async ({ browser }) => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    test.skip(!email || !password, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set");

    const context = await browser.newContext({ storageState: ADMIN_STATE });
    const page = await context.newPage();

    await page.goto("/login");
    await page.waitForURL((url) => url.pathname === "/admin", { timeout: 15_000 });
    expect(new URL(page.url()).pathname).toBe("/admin");

    await context.close();
  });

  test("direct request to /admin/bookings without session redirects and does not leak booking data", async ({ request, baseURL }) => {
    // Perform GET request with redirect manual to verify redirect response and no leaked data
    const response = await request.get("/admin/bookings", {
      maxRedirects: 0,
    });

    // Should be redirected to /login?next=/admin/bookings (307 or 302 or 303)
    const status = response.status();
    expect.soft([301, 302, 303, 307, 308]).toContain(status);
    const location = response.headers()["location"] || "";
    expect.soft(location).toContain("/login");
    expect.soft(location).toContain("next=");

    const text = await response.text();
    // Verify no booking table data or customer data is returned
    expect.soft(text).not.toContain("BookingsTable");
    expect.soft(text).not.toContain("booking_requests");
  });
});

// Run logout tests last in serial mode using a fresh isolated login so ADMIN_STATE is preserved
test.describe.serial("Admin Logout Flow", () => {
  test("logout button redirects to /login and clears session", async ({ browser }) => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    test.skip(!email || !password, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set");

    // Create a dedicated fresh browser context for logging in and logging out
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Log in fresh
    await page.goto("/login");
    await page.getByLabel("البريد الإلكتروني").fill(email!);
    await page.getByLabel("كلمة المرور").fill(password!);
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    await page.waitForURL((url) => url.pathname.startsWith("/admin"), { timeout: 30_000 });
    expect(new URL(page.url()).pathname).toBe("/admin");

    // 2. Click logout button
    const logoutBtn = page.getByRole("button", { name: "تسجيل الخروج" });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // 3. Should be redirected to /login
    await page.waitForURL((url) => url.pathname === "/login", { timeout: 15_000 });
    expect(new URL(page.url()).pathname).toBe("/login");

    // 4. Session cleared: navigating back to /admin must redirect to /login again
    await page.goto("/admin");
    await page.waitForURL((url) => url.pathname === "/login", { timeout: 15_000 });
    const finalUrl = new URL(page.url());
    expect(finalUrl.pathname).toBe("/login");
    expect(finalUrl.searchParams.get("next")).toBe("/admin");

    await context.close();
  });
});
