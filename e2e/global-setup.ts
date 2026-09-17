import { chromium, type FullConfig } from "@playwright/test";
import { ADMIN_STATE } from "./check";
import { browserChannel } from "../playwright.config";

/** Pages whose specs need at least one published row to assert anything. */
const FIXTURES: { path: string; needs: string; label: string }[] = [
  { path: "/artists", needs: 'a[href*="/artists/"]', label: "a published artist" },
  { path: "/news", needs: 'a[href*="/news/"]', label: "a published article" },
  { path: "/academy", needs: 'a[href*="/academy/"]', label: "a published course" },
  { path: "/events", needs: 'a[href*="/booking?event_id="]', label: "a published event" },
];

/** Log in once and share the session with admin specs. Skipped when no credentials are set. */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL!;
  const browser = await chromium.launch({ channel: browserChannel });

  try {
    // Detail-page specs navigate from a listing. Without demo content they fail
    // one by one as "expected at least one link", which reads like a product
    // bug — so say plainly, once, what is actually missing.
    const probe = await browser.newPage({ baseURL });
    const missing: string[] = [];
    for (const fixture of FIXTURES) {
      await probe.goto(fixture.path, { waitUntil: "networkidle" });
      if ((await probe.locator(fixture.needs).count()) === 0) {
        missing.push(`${fixture.path} has no ${fixture.label}`);
      }
    }
    await probe.close();
    if (missing.length) {
      throw new Error(
        `E2E fixtures missing:\n  ${missing.join("\n  ")}\n` +
          "Seed the demo content first: node scripts/seed-demo-content.mjs --seed",
      );
    }

    const { E2E_ADMIN_EMAIL: email, E2E_ADMIN_PASSWORD: password } = process.env;
    if (!email || !password) {
      console.warn("E2E_ADMIN_EMAIL/PASSWORD unset: admin specs will skip");
      return;
    }

    const page = await browser.newPage({ baseURL });
    await page.goto("/login");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL((url) => url.pathname.startsWith("/admin"), { timeout: 60_000 });
    await page.context().storageState({ path: ADMIN_STATE });
  } finally {
    await browser.close();
  }
}
