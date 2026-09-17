import { defineConfig, devices } from "@playwright/test";

// Teardown needs SUPABASE_SERVICE_ROLE_KEY; Playwright does not read .env itself.
try { process.loadEnvFile(".env"); } catch {}

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

// Google Chrome is not installed in CI or in the container images this runs in,
// and `channel: "chrome"` fails outright rather than falling back — so the whole
// suite could not start. Undefined means Playwright's own bundled Chromium.
// Set E2E_BROWSER_CHANNEL=chrome to test against real Chrome locally.
export const browserChannel = process.env.E2E_BROWSER_CHANNEL || undefined;

export default defineConfig({
  testDir: "e2e",
  outputDir: "artifacts/e2e/results",
  timeout: 60_000,
  // Dev server compiles each route on first hit; parallel workers thrash it.
  workers: 2,
  reporter: [
    ["list"],
    ["html", { outputFolder: "artifacts/e2e/report", open: "never" }],
    ["json", { outputFile: "artifacts/e2e/results.json" }],
  ],
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  // System Chrome: no browser download needed.
  use: { baseURL, channel: browserChannel, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", testMatch: /public\.spec\.ts/, use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  ],
  webServer: { command: "npm run dev", url: baseURL, reuseExistingServer: true, timeout: 180_000 },
});
