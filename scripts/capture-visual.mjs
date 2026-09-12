/**
 * Capture each manifest frame from the running preview at its Figma canvas size.
 *
 * Driven over CDP rather than chromium's --screenshot flag, which fired its
 * readiness heuristic before the stylesheet applied often enough to write
 * unstyled pages into the baseline. One browser serves the whole run: launching
 * a fresh one per frame churned the machine enough that later frames began
 * failing to load outright.
 */
import { mkdir, mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const manifest = JSON.parse(await readFile(resolve(root, "docs/figma-reference-manifest.json"), "utf8"));
const baseUrl = process.env.VISUAL_BASE_URL ?? "http://localhost:3000";
const outputDir = resolve(root, process.env.VISUAL_OUTPUT_DIR ?? "artifacts/visual/current");
await mkdir(outputDir, { recursive: true });

const browsers = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
const chromium = [
  process.env.CHROMIUM_BIN,
  ...(existsSync(browsers) ? readdirSync(browsers).filter((e) => e.startsWith("chromium-")).map((e) => `${browsers}/${e}/chrome-linux/chrome`) : []),
  "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome",
].filter(Boolean).find((c) => existsSync(c));
if (!chromium) throw new Error("No Chromium binary found. Set CHROMIUM_BIN to override.");

function cdp(ws, method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = (cdp.n = (cdp.n ?? 0) + 1);
    const timer = setTimeout(() => { ws.removeEventListener("message", onMessage); reject(new Error(`${method} timed out`)); }, 60000);
    const onMessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) { clearTimeout(timer); ws.removeEventListener("message", onMessage); resolve(msg); }
    };
    ws.addEventListener("message", onMessage);
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
}

// Settled means: document complete, a stylesheet actually applied, fonts done and
// images decoded. Deliberately synchronous — evaluating a promise with awaitPromise
// blocks the CDP reply until it settles, and document.fonts.ready can simply never
// resolve in headless, which hung the entire run rather than failing it.
const SETTLED = `(() => {
  if (document.readyState !== "complete") return "loading";
  if (!document.styleSheets.length) return "unstyled";
  const bg = getComputedStyle(document.body).backgroundColor;
  if (bg === "rgba(0, 0, 0, 0)" || bg === "transparent") return "unstyled";
  if (document.fonts && document.fonts.status !== "loaded") return "fonts";
  return Array.from(document.images).every((img) => img.complete) ? "ready" : "images";
})()`;

// Chromium's own network-error page is styled and "complete", so it would be
// captured as a valid render scoring ~94% different. Assert the app is present.
const RENDERED = 'document.querySelector("#main-content") && document.documentElement.scrollHeight > 600 '
  + '? "ok" : document.body.innerText.slice(0, 80).replace(/\\s+/g, " ")';

async function capture(ws, frame) {
  const [width, height] = frame.canvas;
  const viewportHeight = frame.viewport[1];
  const pageUrl = new URL(frame.route, baseUrl).toString();
  const { result: target } = await cdp(ws, "Target.createTarget", { url: "about:blank" });
  const failures = [];
  let onNetwork = () => {};
  try {
    const { result: attached } = await cdp(ws, "Target.attachToTarget", { targetId: target.targetId, flatten: true });
    const sessionId = attached.sessionId;

    // next-intl negotiates a locale on the unprefixed Arabic routes, so leaving
    // Chromium's en-US default would answer 307 to /en and capture the English page.
    // Surface failed sub-resources: a page can report complete and styled while a
    // dynamically imported chunk 404s, which shows up only as a blank error page.
    onNetwork = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.sessionId !== sessionId) return;
      if (msg.method === "Network.loadingFailed") failures.push(`failed ${msg.params.errorText}`);
      if (msg.method === "Network.responseReceived" && msg.params.response.status >= 400) {
        failures.push(`${msg.params.response.status} ${msg.params.response.url.replace(baseUrl, "")}`);
      }
    };
    ws.addEventListener("message", onNetwork);
    await cdp(ws, "Network.enable", {}, sessionId);
    await cdp(ws, "Network.setExtraHTTPHeaders", { headers: { "Accept-Language": frame.locale ?? "ar" } }, sessionId);
    // Render at a realistic viewport and let captureBeyondViewport extend the shot
    // to the full canvas. Sizing the window to the canvas makes tall frames (home
    // is 5165px) crawl, and stretches any short page to exactly the frame height
    // through min-h-screen, hiding the very error the diff is meant to surface.
    await cdp(ws, "Emulation.setDeviceMetricsOverride", { width, height: viewportHeight, deviceScaleFactor: 1, mobile: false }, sessionId);
    await cdp(ws, "Page.enable", {}, sessionId);

    let rendered = false;
    let diagnosis = "";
    for (let attempt = 0; attempt < 4 && !rendered; attempt += 1) {
      await cdp(ws, "Page.navigate", { url: pageUrl }, sessionId);
      for (let i = 0; i < 60; i += 1) {
        const { result } = await cdp(ws, "Runtime.evaluate", { expression: SETTLED, returnByValue: true }, sessionId);
        if (result?.result?.value === "ready") break;
        await new Promise((r) => setTimeout(r, 250));
      }
      const { result: app } = await cdp(ws, "Runtime.evaluate", { expression: RENDERED, returnByValue: true }, sessionId);
      rendered = app?.result?.value === "ok";
      if (!rendered) { diagnosis = String(app?.result?.value ?? "no response"); await new Promise((r) => setTimeout(r, 2000)); }
    }
    if (!rendered) {
      const detail = failures.length ? `\n  failed requests: ${[...new Set(failures)].slice(0, 6).join("\n                   ")}` : "";
      throw new Error(`${frame.name}: page never rendered (${pageUrl}) — last state: ${diagnosis}${detail}`);
    }

    // next/image lazy-loads anything below the fold, and Chromium only fires that
    // for content near the viewport. captureBeyondViewport extends the shot without
    // ever bringing the lower bands into view, so on a 5165px page every photograph
    // past roughly 2000px stayed blank and scored as a full-area difference against
    // the reference — the editorial covers and the الفعاليات photograph among them.
    // Walk the page down a viewport at a time to put each band in view, return to
    // the top, and wait for the loads that started along the way.
    const { result: docHeight } = await cdp(ws, "Runtime.evaluate",
      { expression: "document.documentElement.scrollHeight", returnByValue: true }, sessionId);
    const pageHeight = Number(docHeight?.result?.value) || height;
    for (let y = 0; y < pageHeight; y += viewportHeight) {
      await cdp(ws, "Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` }, sessionId);
      await new Promise((r) => setTimeout(r, 150));
    }
    await cdp(ws, "Runtime.evaluate", { expression: "window.scrollTo(0, 0)" }, sessionId);
    // An image that never started loading also reports complete, so require pixels.
    // A genuinely broken one keeps naturalWidth at 0 and simply spends the timeout.
    const DECODED = `Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0)`;
    for (let i = 0; i < 60; i += 1) {
      const { result } = await cdp(ws, "Runtime.evaluate", { expression: DECODED, returnByValue: true }, sessionId);
      if (result?.result?.value === true) break;
      await new Promise((r) => setTimeout(r, 250));
    }

    // Wait for the paint to settle. CSS background-image has no load event to
    // await and the hero art is the slowest thing on every page, so settling is
    // observed rather than predicted. Only the hero band is polled: re-shooting a
    // 5165px page a dozen times costs minutes and nothing below it settles later.
    const shoot = async (clip) => {
      const { result } = await cdp(ws, "Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip }, sessionId);
      return result.data;
    };
    const probeClip = { x: 0, y: 0, width, height: Math.min(700, viewportHeight), scale: 0.25 };
    let previous = await shoot(probeClip);
    for (let i = 0; i < 16; i += 1) {
      await new Promise((r) => setTimeout(r, 400));
      const next = await shoot(probeClip);
      if (next === previous) break;
      previous = next;
    }

    // Re-assert before the real shot. A ChunkLoadError fires asynchronously after
    // hydration, so a page can pass the render check and then replace itself with
    // Chromium's error screen while we are waiting for the paint to settle.
    const { result: still } = await cdp(ws, "Runtime.evaluate", { expression: RENDERED, returnByValue: true }, sessionId);
    if (still?.result?.value !== "ok") {
      const detail = failures.length ? ` — failed: ${[...new Set(failures)].slice(0, 4).join(", ")}` : "";
      throw new Error(`${frame.name}: page broke after loading${detail}`);
    }

    const data = await shoot({ x: 0, y: 0, width, height, scale: 1 });
    const output = resolve(outputDir, `${frame.name}.png`);
    await writeFile(output, Buffer.from(data, "base64"));
    return output;
  } finally {
    ws.removeEventListener("message", onNetwork);
    await cdp(ws, "Target.closeTarget", { targetId: target.targetId }).catch(() => {});
  }
}

// A private profile: sharing the default user-data-dir means sharing one on-disk
// HTTP cache, so a browser can serve itself a page from a previous build whose JS
// chunks no longer exist — surfacing as ChunkLoadError, not as the site.
const profile = await mkdtemp(`${tmpdir()}/figma-capture-`);
const port = Number(process.env.CDP_PORT ?? 9600);
const child = spawn(chromium, ["--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
  "--disable-dev-shm-usage", "--force-device-scale-factor=1", `--user-data-dir=${profile}`,
  `--remote-debugging-port=${port}`, "--window-size=1440,900", "about:blank"],
  // Own process group, so the whole browser tree is reaped: child.kill() alone
  // leaves zombie renderers that accumulate until pages stop loading.
  { stdio: "ignore", detached: true });

try {
  let version;
  for (let i = 0; i < 120; i += 1) {
    try { version = await (await fetch(`http://localhost:${port}/json/version`)).json(); break; }
    catch { await new Promise((r) => setTimeout(r, 150)); }
  }
  if (!version) throw new Error("Chromium never exposed its debugging port");
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  for (const frame of manifest.referenceFrames) {
    console.log(`${frame.name}: ${await capture(ws, frame)}`);
  }
  ws.close();
} finally {
  try { process.kill(-child.pid, "SIGKILL"); } catch { child.kill("SIGKILL"); }
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
