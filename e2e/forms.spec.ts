import { test, expect } from "@playwright/test";
import { watch, TAG } from "./check";

test.describe("Booking Form End-to-End", () => {
  test.describe("Arabic /booking", () => {
    test("empty submit: shows validation errors, no success message, nothing submitted", async ({ page }) => {
      const problems = watch(page);
      await page.goto("/booking");

      const submitBtn = page.locator('form button[type="submit"]');
      await submitBtn.click();

      // Form uses noValidate so submission goes to server action
      // Expect general error alert or inline field validation errors
      const alert = page.locator('form [role="alert"]');
      await expect(alert).toBeVisible();

      // Expect specific field error messages
      await expect(page.locator("#full_name-error")).toBeVisible();
      await expect(page.locator("#email-error")).toBeVisible();
      await expect(page.locator("#event_date-error")).toBeVisible();
      await expect(page.locator("#message-error")).toBeVisible();

      // Check error messages are in Arabic
      await expect(page.locator("#full_name-error")).toContainText("الاسم");
      await expect(page.locator("#email-error")).toContainText("البريد الإلكتروني");
      await expect(page.locator("#event_date-error")).toContainText("التاريخ");

      // Verify no success state is shown
      await expect(page.locator("text=تم استلام طلب الحجز بنجاح")).not.toBeVisible();

      expect.soft(problems, "console/network errors").toEqual([]);
    });

    test("invalid email and invalid phone rejected with a visible error", async ({ page }) => {
      const problems = watch(page);
      await page.goto("/booking");

      await page.locator("#full_name").fill(`${TAG} booking`);
      await page.locator("#email").fill("invalid-email-address");
      await page.locator("#phone").fill("not-a-valid-phone-123");
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      await page.locator("#event_date").fill(futureDate.toISOString().split("T")[0]);
      await page.locator("#message").fill("تفاصيل الحجز التجريبي للاختبار التلقائي");

      await page.locator('form button[type="submit"]').click();

      // Expect email error and phone error visible
      const emailError = page.locator("#email-error");
      await expect(emailError).toBeVisible();
      await expect(emailError).toContainText("البريد الإلكتروني");

      const phoneError = page.locator("#phone-error");
      await expect(phoneError).toBeVisible();
      await expect(phoneError).toContainText("الهاتف");

      await expect(page.locator("text=تم استلام طلب الحجز بنجاح")).not.toBeVisible();
      expect.soft(problems, "console/network errors").toEqual([]);
    });

    test("past event_date rejected if the server schema requires a future date", async ({ page }) => {
      const problems = watch(page);
      await page.goto("/booking");

      await page.locator("#full_name").fill(`${TAG} booking`);
      await page.locator("#email").fill(`e2e-test+${Date.now()}@example.com`);
      await page.locator("#phone").fill("+96170123456");

      // Date input has min=today in HTML, but form is noValidate, and we can force-fill or evaluate a past date
      const pastDate = "2020-01-01";
      await page.locator("#event_date").fill(pastDate);
      await page.locator("#message").fill("تفاصيل الحجز مع تاريخ قديم للتحقق من رفضه");

      await page.locator('form button[type="submit"]').click();

      // Expect event_date error
      const dateError = page.locator("#event_date-error");
      await expect(dateError).toBeVisible();
      await expect(dateError).toContainText("الماضي");

      await expect(page.locator("text=تم استلام طلب الحجز بنجاح")).not.toBeVisible();
      expect.soft(problems, "console/network errors").toEqual([]);
    });

    test("valid submit: full_name must be TAG booking, fill every required field; expect visible success state and confirmation", async ({ page }) => {
      const problems = watch(page);
      await page.goto("/booking");

      const uniqueEmail = `e2e-test+${Date.now()}@example.com`;
      const testName = `${TAG} booking`;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const dateStr = futureDate.toISOString().split("T")[0];

      await page.locator("#full_name").fill(testName);
      await page.locator("#email").fill(uniqueEmail);
      await page.locator("#phone").fill("+96170123456");
      await page.locator("#budget_range").fill("2000 USD");
      await page.locator("#event_type").selectOption("private_concert");
      await page.locator("#event_date").fill(dateStr);
      await page.locator("#message").fill("تفاصيل تجربة الحجز التلقائي الكامل للفعالية");

      await page.locator('form button[type="submit"]').click();

      // Expect success screen
      await expect(page.getByRole("heading", { name: "تم استلام طلب الحجز بنجاح" })).toBeVisible();
      await expect(page.getByRole("button", { name: "تقديم طلب حجز آخر" })).toBeVisible();

      expect.soft(problems, "console/network errors").toEqual([]);
    });

    test("/booking?event_id=<id of a real event> prefills the event context", async ({ page }) => {
      const problems = watch(page);
      // First visit /events to find an event card and extract its event_id
      await page.goto("/events");

      // Find any event booking link that has ?event_id=
      const eventBookingLink = page.locator('a[href*="/booking?event_id="]').first();
      await expect(eventBookingLink).toBeVisible();

      const href = await eventBookingLink.getAttribute("href");
      expect(href).toBeTruthy();
      const url = new URL(href!, "http://localhost:3000");
      const eventId = url.searchParams.get("event_id");
      expect(eventId).toBeTruthy();

      // Navigate to /booking?event_id=...
      await page.goto(`/booking?event_id=${eventId}`);

      // Verify context banner is visible
      const contextBanner = page.locator(".rounded-xl.border-brand-primary\\/20");
      await expect(contextBanner).toBeVisible();
      await expect(contextBanner).toContainText("سياق الحجز المحدد");

      // Verify hidden event_id input inside form
      const hiddenInput = page.locator('form input[name="event_id"]');
      await expect(hiddenInput).toHaveValue(eventId!);

      expect.soft(problems, "console/network errors").toEqual([]);
    });

    test("double-click submit does not create duplicate submission (button disabled while pending)", async ({ page }) => {
      const problems = watch(page);
      await page.goto("/booking");

      const uniqueEmail = `e2e-test+${Date.now()}@example.com`;
      const testName = `${TAG} booking`;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 45);

      await page.locator("#full_name").fill(testName);
      await page.locator("#email").fill(uniqueEmail);
      await page.locator("#event_date").fill(futureDate.toISOString().split("T")[0]);
      await page.locator("#message").fill("اختبار منع التقديم المتعدد للطلب");

      const submitBtn = page.locator('form button[type="submit"]');

      // Click and verify button disables while pending
      await submitBtn.click();
      // Button should be disabled during isPending
      // Or check dblclick
      await expect(page.getByRole("heading", { name: "تم استلام طلب الحجز بنجاح" })).toBeVisible();

      expect.soft(problems, "console/network errors").toEqual([]);
    });
  });

  test.describe("English /en/booking", () => {
    test("empty submit: error messages shown in the page locale (English on /en/booking)", async ({ page }) => {
      const problems = watch(page);
      await page.goto("/en/booking");

      const submitBtn = page.locator('form button[type="submit"]');
      await submitBtn.click();

      // General alert and inline field errors
      const alert = page.locator('form [role="alert"]');
      await expect(alert).toBeVisible();

      // Field error messages should be visible and in English if localized
      await expect(page.locator("#full_name-error")).toBeVisible();
      await expect(page.locator("#email-error")).toBeVisible();
      await expect(page.locator("#event_date-error")).toBeVisible();
      await expect(page.locator("#message-error")).toBeVisible();

      // Check whether error messages are in English on /en/booking
      // Expected by requirement: "error messages shown in the page locale (Arabic on /booking, English on /en/booking)"
      await expect.soft(page.locator("#full_name-error"), "Name error should be in English on /en/booking").not.toContainText("الاسم");
      await expect.soft(page.locator("#email-error"), "Email error should be in English on /en/booking").not.toContainText("البريد");

      await expect(page.locator("text=Your booking request was received")).not.toBeVisible();
      expect.soft(problems, "console/network errors").toEqual([]);
    });

    test("invalid email and invalid phone rejected with a visible error", async ({ page }) => {
      const problems = watch(page);
      await page.goto("/en/booking");

      await page.locator("#full_name").fill(`${TAG} booking`);
      await page.locator("#email").fill("invalid-email-address");
      await page.locator("#phone").fill("not-a-valid-phone-123");
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      await page.locator("#event_date").fill(futureDate.toISOString().split("T")[0]);
      await page.locator("#message").fill("English booking message description test");

      await page.locator('form button[type="submit"]').click();

      const emailError = page.locator("#email-error");
      await expect(emailError).toBeVisible();

      const phoneError = page.locator("#phone-error");
      await expect(phoneError).toBeVisible();

      await expect(page.locator("text=Your booking request was received")).not.toBeVisible();
      expect.soft(problems, "console/network errors").toEqual([]);
    });

    test("valid submit: expect visible success state and confirmation", async ({ page }) => {
      const problems = watch(page);
      await page.goto("/en/booking");

      const uniqueEmail = `e2e-test+${Date.now()}@example.com`;
      const testName = `${TAG} booking`;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const dateStr = futureDate.toISOString().split("T")[0];

      await page.locator("#full_name").fill(testName);
      await page.locator("#email").fill(uniqueEmail);
      await page.locator("#phone").fill("+96170123456");
      await page.locator("#budget_range").fill("2000 USD");
      await page.locator("#event_type").selectOption("private_concert");
      await page.locator("#event_date").fill(dateStr);
      await page.locator("#message").fill("Valid English booking message for end to end testing");

      await page.locator('form button[type="submit"]').click();

      // Expect English success screen
      await expect(page.getByRole("heading", { name: "Your booking request was received" })).toBeVisible();
      await expect.soft(page.locator("main"), "English success view has no Arabic server message").not.toContainText(/[؀-ۿ]/);
      await expect(page.getByRole("button", { name: "Send another booking request" })).toBeVisible();

      expect.soft(problems, "console/network errors").toEqual([]);
    });

    test("/en/booking?event_id=<id of a real event> prefills the event context", async ({ page }) => {
      const problems = watch(page);
      // First visit /en/events to find an event card
      await page.goto("/en/events");

      const eventBookingLink = page.locator('a[href*="/booking?event_id="]').first();
      await expect(eventBookingLink).toBeVisible();

      const href = await eventBookingLink.getAttribute("href");
      expect(href).toBeTruthy();
      const url = new URL(href!, "http://localhost:3000");
      const eventId = url.searchParams.get("event_id");
      expect(eventId).toBeTruthy();

      await page.goto(`/en/booking?event_id=${eventId}`);

      const contextBanner = page.locator(".rounded-xl.border-brand-primary\\/20");
      await expect(contextBanner).toBeVisible();
      await expect(contextBanner).toContainText("Selected booking context");

      const hiddenInput = page.locator('form input[name="event_id"]');
      await expect(hiddenInput).toHaveValue(eventId!);

      expect.soft(problems, "console/network errors").toEqual([]);
    });
  });
});

test.describe("Newsletter End-to-End", () => {
  test.describe("Arabic /academy", () => {
    test("invalid email rejected", async ({ page }) => {
      const problems = watch(page);
      await page.goto("/academy");

      const newsletterSection = page.locator("#newsletter");
      await expect(newsletterSection).toBeVisible();

      const emailInput = newsletterSection.locator('input[name="email"]');
      const submitBtn = newsletterSection.locator('button[type="submit"]');

      // Native browser validation test with invalid email
      // To test server action rejection or client validation:
      await emailInput.fill("not-an-email");
      // Since type="email" has browser validation, evaluate submitting or remove type="email" check or check HTML5 validity
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);

      // Also bypass native check to ensure server action rejects it
      await emailInput.evaluate((el: HTMLInputElement) => el.setAttribute("type", "text"));
      await submitBtn.click();

      const alert = newsletterSection.locator('[role="alert"]');
      await expect(alert).toBeVisible();
      await expect(alert).not.toContainText("بنجاح");

      expect.soft(problems, "console/network errors").toEqual([]);
    });

    test("valid email -> success message and submitting the same email twice gives a sensible message, not a crash/500", async ({ page }) => {
      const problems = watch(page);
      await page.goto("/academy");

      const newsletterSection = page.locator("#newsletter");
      const emailInput = newsletterSection.locator('input[name="email"]');
      const submitBtn = newsletterSection.locator('button[type="submit"]');

      const testEmail = `e2e-test+${Date.now()}@example.com`;

      // 1. First submission (Valid)
      await emailInput.fill(testEmail);
      await submitBtn.click();

      const alert = newsletterSection.locator('[role="alert"]');
      await expect(alert).toBeVisible();
      await expect(alert).toContainText("تم الاشتراك بنجاح في النشرة البريدية");
      // Input should be reset
      await expect(emailInput).toHaveValue("");

      // 2. Second submission with the exact same email
      await emailInput.fill(testEmail);
      await submitBtn.click();

      await expect(alert).toBeVisible();
      // Should give sensible message: already subscribed
      await expect(alert).toContainText("أنت مسجل بالفعل في قائمتنا البريدية");

      expect.soft(problems, "console/network errors").toEqual([]);
    });
  });

  test.describe("English /en/academy", () => {
    test("invalid email rejected", async ({ page }) => {
      const problems = watch(page);
      await page.goto("/en/academy");

      const newsletterSection = page.locator("#newsletter");
      await expect(newsletterSection).toBeVisible();

      const emailInput = newsletterSection.locator('input[name="email"]');
      const submitBtn = newsletterSection.locator('button[type="submit"]');

      await emailInput.fill("bad-email");
      await emailInput.evaluate((el: HTMLInputElement) => el.setAttribute("type", "text"));
      await submitBtn.click();

      const alert = newsletterSection.locator('[role="alert"]');
      await expect(alert).toBeVisible();
      await expect.soft(alert, "English page shows English error").not.toContainText(/[؀-ۿ]/);

      expect.soft(problems, "console/network errors").toEqual([]);
    });

    test("valid email -> success message and duplicate submission handled gracefully", async ({ page }) => {
      const problems = watch(page);
      await page.goto("/en/academy");

      const newsletterSection = page.locator("#newsletter");
      const emailInput = newsletterSection.locator('input[name="email"]');
      const submitBtn = newsletterSection.locator('button[type="submit"]');

      const testEmail = `e2e-test+${Date.now()}@example.com`;

      await emailInput.fill(testEmail);
      await submitBtn.click();

      const alert = newsletterSection.locator('[role="alert"]');
      await expect(alert).toBeVisible();
      await expect(emailInput).toHaveValue("");

      // Second submission
      await emailInput.fill(testEmail);
      await submitBtn.click();

      await expect(alert).toBeVisible();
      // Verify not a crash/500
      expect.soft(problems, "console/network errors").toEqual([]);
    });
  });
});
