import { chromium, type FullConfig } from "@playwright/test";
import { ADMIN_STATE } from "./check";

/** Log in once and share the session with admin specs. Skipped when no credentials are set. */
export default async function globalSetup(config: FullConfig) {
  const { E2E_ADMIN_EMAIL: email, E2E_ADMIN_PASSWORD: password } = process.env;
  if (!email || !password) { console.warn("E2E_ADMIN_EMAIL/PASSWORD unset: admin specs will skip"); return; }

  const baseURL = config.projects[0].use.baseURL!;
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ baseURL });
  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL((url) => url.pathname.startsWith("/admin"), { timeout: 60_000 });
  await page.context().storageState({ path: ADMIN_STATE });
  await browser.close();
}
