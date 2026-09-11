/**
 * Report the rendered geometry of each manifest route against its Figma canvas.
 *
 * The pixel diff says a page is wrong; this says *where*. It drives Chromium over
 * CDP, so it reports the same numbers the capture will produce. Pass selectors as
 * extra arguments to also print their boxes, e.g.
 *   node scripts/measure-layout.mjs news-desktop "footer" "main > *"
 */
import { readFileSync } from "node:fs";


const [, , only, ...selectors] = process.argv;
const frames = JSON.parse(readFileSync("docs/figma-reference-manifest.json", "utf8")).referenceFrames
  .filter((f) => !only || f.name === only);

const version = await (await fetch("http://localhost:9222/json/version")).json();
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));

let id = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve) => { const n = ++id; pending.set(n, resolve); ws.send(JSON.stringify({ id: n, method, params, sessionId })); });

const expression = (selectors) => `(() => {
  const out = { height: document.documentElement.scrollHeight, width: document.documentElement.scrollWidth, boxes: [] };
  for (const sel of ${JSON.stringify(selectors)}) {
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      out.boxes.push({ sel, tag: el.tagName.toLowerCase(), cls: (el.className || "").toString().slice(0, 60),
        x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) });
    }
  }
  return JSON.stringify(out);
})()`;

for (const frame of frames) {
  const { result: target } = await send("Target.createTarget", { url: "about:blank" });
  const { result: attached } = await send("Target.attachToTarget", { targetId: target.targetId, flatten: true });
  const sessionId = attached.sessionId;
  // Measure at a realistic viewport, not the canvas height: the public shell is
  // min-h-screen, so a canvas-tall window stretches any page shorter than the frame
  // to exactly the frame height and hides the error we are looking for.
  await send("Emulation.setDeviceMetricsOverride", { width: frame.viewport[0], height: frame.viewport[1], deviceScaleFactor: 1, mobile: false }, sessionId);
  await send("Network.enable", {}, sessionId);
  // Same reason as capture-visual.mjs: without this the unprefixed Arabic routes
  // negotiate to English and every measurement describes the wrong page.
  await send("Network.setExtraHTTPHeaders", { headers: { "Accept-Language": frame.locale ?? "ar" } }, sessionId);
  await send("Page.enable", {}, sessionId);
  await send("Page.navigate", { url: new URL(frame.route, "http://localhost:3000").toString() }, sessionId);
  await new Promise((r) => setTimeout(r, 2500));
  const { result } = await send("Runtime.evaluate", { expression: expression(selectors), returnByValue: true }, sessionId);
  const data = JSON.parse(result.result.value);
  const delta = data.height - frame.canvas[1];
  const sign = delta > 0 ? "+" : "";
  console.log(`${frame.name.padEnd(24)} figma ${String(frame.canvas[1]).padStart(5)}   actual ${String(data.height).padStart(5)}   ${sign}${delta}`);
  for (const b of data.boxes) console.log(`    ${b.sel.padEnd(16)} ${b.tag.padEnd(8)} y=${String(b.y).padStart(5)} h=${String(b.h).padStart(5)} x=${String(b.x).padStart(4)} w=${String(b.w).padStart(5)}  ${b.cls}`);
  await send("Target.closeTarget", { targetId: target.targetId });
}
ws.close();
