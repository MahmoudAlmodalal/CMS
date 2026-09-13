/**
 * Report the rendered geometry of each manifest route against its Figma canvas.
 *
 * The pixel diff says a page is wrong; this says where. Pass CSS selectors as extra
 * arguments to print their boxes too:
 *   node scripts/measure-layout.mjs news-desktop "footer" "main > *"
 *
 * Each frame gets its own short-lived browser. A single long-lived one was both
 * serving stale pages from its HTTP cache across rebuilds and intermittently
 * failing to navigate, which showed up as a page measuring exactly one viewport.
 */
import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";

const [, , only, ...selectors] = process.argv;
const baseUrl = process.env.VISUAL_BASE_URL ?? "http://localhost:3000";
const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
const chromium = [
  process.env.CHROMIUM_BIN,
  ...(existsSync(base) ? readdirSync(base).filter((e) => e.startsWith("chromium-")).map((e) => `${base}/${e}/chrome-linux/chrome`) : []),
  "/usr/bin/chromium",
].filter(Boolean).find((c) => existsSync(c));

const frames = JSON.parse(readFileSync("docs/figma-reference-manifest.json", "utf8"))
  .referenceFrames.filter((f) => !only || f.name === only);

const probe = (selectors) => `(() => {
  const out = { height: document.documentElement.scrollHeight, boxes: [] };
  for (const sel of ${JSON.stringify(selectors)}) {
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      out.boxes.push({ sel, tag: el.tagName.toLowerCase(), cls: (el.className || "").toString().slice(0, 62),
        x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) });
    }
  }
  return JSON.stringify(out);
})()`;

async function cdp(ws, method, params = {}, sessionId) {
  return new Promise((resolve) => {
    const id = (cdp.n = (cdp.n ?? 0) + 1);
    const onMessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) { ws.removeEventListener("message", onMessage); resolve(msg); }
    };
    ws.addEventListener("message", onMessage);
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
}

async function measure(frame, port) {
  // Same locale pin as capture-visual.mjs: next-intl negotiates on the unprefixed
  // Arabic routes, so an en-US default would measure the English page.
  const locale = frame.locale ?? "ar";
  // min-h-screen on the public shell means a canvas-tall viewport stretches any
  // short page to exactly the frame height, hiding the very error we want.
  const height = process.env.MEASURE_AT_CANVAS ? frame.canvas[1] : frame.viewport[1];
  const child = spawn(chromium, ["--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
    `--accept-lang=${locale}`, `--remote-debugging-port=${port}`,
    `--window-size=${frame.canvas[0]},${height}`, "about:blank"], { stdio: "ignore" });
  try {
    let version;
    for (let i = 0; i < 80; i += 1) {
      try { version = await (await fetch(`http://localhost:${port}/json/version`)).json(); break; }
      catch { await new Promise((r) => setTimeout(r, 150)); }
    }
    const ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener("open", r));
    const { result: target } = await cdp(ws, "Target.createTarget", { url: "about:blank" });
    const { result: attached } = await cdp(ws, "Target.attachToTarget", { targetId: target.targetId, flatten: true });
    const sessionId = attached.sessionId;
    await cdp(ws, "Emulation.setDeviceMetricsOverride", { width: frame.canvas[0], height, deviceScaleFactor: 1, mobile: false }, sessionId);
    await cdp(ws, "Page.enable", {}, sessionId);
    // Same base URL and locale header as capture-visual.mjs, or we measure one server
    // and screenshot another — and read an Arabic frame's geometry off the English page.
    await cdp(ws, "Network.enable", {}, sessionId);
    await cdp(ws, "Network.setExtraHTTPHeaders", { headers: { "Accept-Language": frame.locale ?? "ar" } }, sessionId);
    await cdp(ws, "Page.navigate", { url: new URL(frame.route, baseUrl).toString() }, sessionId);
    for (let i = 0; i < 60; i += 1) {
      const { result } = await cdp(ws, "Runtime.evaluate", { expression: "document.readyState", returnByValue: true }, sessionId);
      if (result?.result?.value === "complete") break;
      await new Promise((r) => setTimeout(r, 250));
    }
    // Measure on the real faces, not the fallback. Every face is font-display: swap,
    // so probing inside the swap window reports line boxes for Cairo-substituted
    // text and reads back a scrollHeight the page never settles at. Same wait as
    // capture-visual.mjs, or the two tools disagree about the same page.
    for (let i = 0; i < 60; i += 1) {
      const { result } = await cdp(ws, "Runtime.evaluate",
        { expression: `document.fonts.status === "loaded"`, returnByValue: true }, sessionId);
      if (result?.result?.value === true) break;
      await new Promise((r) => setTimeout(r, 250));
    }
    await new Promise((r) => setTimeout(r, 600));
    const { result } = await cdp(ws, "Runtime.evaluate", { expression: probe(selectors), returnByValue: true }, sessionId);
    ws.close();
    return JSON.parse(result.result.value);
  } finally {
    child.kill();
  }
}

let port = 9400;
for (const frame of frames) {
  // A result no taller than the viewport means the navigation did not settle —
  // real pages here are all several viewports tall. Retry once before believing it.
  let data = await measure(frame, port++);
  if (data.height <= (process.env.MEASURE_AT_CANVAS ? frame.canvas[1] : frame.viewport[1])) {
    data = await measure(frame, port++);
  }
  const delta = data.height - frame.canvas[1];
  console.log(`${frame.name.padEnd(24)} figma ${String(frame.canvas[1]).padStart(5)}   actual ${String(data.height).padStart(5)}   ${delta > 0 ? "+" : ""}${delta}`);
  for (const b of data.boxes) {
    console.log(`    ${b.sel.padEnd(14)} ${b.tag.padEnd(8)} y=${String(b.y).padStart(5)} h=${String(b.h).padStart(5)} x=${String(b.x).padStart(4)} w=${String(b.w).padStart(5)}  ${b.cls}`);
  }
}
