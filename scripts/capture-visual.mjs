import { mkdir, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const manifest = JSON.parse(await readFile(resolve(root, "docs/figma-reference-manifest.json"), "utf8"));
const baseUrl = process.env.VISUAL_BASE_URL ?? "http://localhost:3000";
const outputDir = resolve(root, process.env.VISUAL_OUTPUT_DIR ?? "artifacts/visual/current");
await mkdir(outputDir, { recursive: true });
const chromium = process.env.CHROMIUM_BIN ?? "/usr/bin/chromium";

function capture(frame) {
  const output = resolve(outputDir, `${frame.name}.png`);
  const url = new URL(frame.route, baseUrl).toString();
  const args = ["--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--run-all-compositor-stages-before-draw", `--window-size=${frame.canvas[0]},${frame.canvas[1]}`, `--screenshot=${output}`, url];
  return new Promise((resolveJob, rejectJob) => {
    const child = spawn(chromium, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", rejectJob);
    child.on("close", (code) => code === 0 ? resolveJob(output) : rejectJob(new Error(`${frame.name} failed with ${code}: ${stderr}`)));
  });
}

for (const frame of manifest.referenceFrames) console.log(`${frame.name}: ${await capture(frame)}`);
