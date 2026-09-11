import { mkdir, readFile } from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const manifest = JSON.parse(await readFile(resolve(root, "docs/figma-reference-manifest.json"), "utf8"));
const baseUrl = process.env.VISUAL_BASE_URL ?? "http://localhost:3000";
const outputDir = resolve(root, process.env.VISUAL_OUTPUT_DIR ?? "artifacts/visual/current");
await mkdir(outputDir, { recursive: true });
// Resolve a Chromium binary: explicit override, then the Playwright bundle this
// environment ships (its directory carries a build number that changes), then a
// system install.
function bundledChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!existsSync(base)) return [];
  return readdirSync(base)
    .filter((entry) => entry.startsWith("chromium-"))
    .map((entry) => `${base}/${entry}/chrome-linux/chrome`);
}

const chromiumCandidates = [
  process.env.CHROMIUM_BIN,
  ...bundledChromium(),
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
].filter(Boolean);
const chromium = chromiumCandidates.find((candidate) => existsSync(candidate));
if (!chromium) {
  throw new Error(`No Chromium binary found. Tried:\n  ${chromiumCandidates.join("\n  ")}\nSet CHROMIUM_BIN to override.`);
}

function capture(frame) {
  const output = resolve(outputDir, `${frame.name}.png`);
  const url = new URL(frame.route, baseUrl).toString();
  // Pin Accept-Language. next-intl runs locale negotiation on the unprefixed
  // Arabic routes, so Chromium's default en-US silently 307s "/" to "/en" and
  // every Arabic frame would be captured from the English page.
  const locale = frame.locale ?? "ar";
  const args = ["--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--run-all-compositor-stages-before-draw", `--accept-lang=${locale}`, `--window-size=${frame.canvas[0]},${frame.canvas[1]}`, `--screenshot=${output}`, url];
  return new Promise((resolveJob, rejectJob) => {
    const child = spawn(chromium, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", rejectJob);
    child.on("close", (code) => code === 0 ? resolveJob(output) : rejectJob(new Error(`${frame.name} failed with ${code}: ${stderr}`)));
  });
}

for (const frame of manifest.referenceFrames) console.log(`${frame.name}: ${await capture(frame)}`);
