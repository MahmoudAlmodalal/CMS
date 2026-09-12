#!/usr/bin/env node
/**
 * Regenerates docs/figma-reference-manifest.json from the frames resolved by
 * figma-sync, so the visual pipeline always covers every screen in the design
 * rather than a hand-maintained subset.
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const framesPath = resolve(ROOT, "docs/figma/frames.json");

let payload;
try {
  payload = JSON.parse(await readFile(framesPath, "utf8"));
} catch {
  console.error(`No ${framesPath}. Run "npm run figma:sync" first.`);
  process.exit(1);
}

const VIEWPORTS = { desktop: [1440, 900], mobile: [390, 844] };

const referenceFrames = payload.frames
  .filter((frame) => frame.route)
  .map((frame) => {
    // A frame with no exported PNG carries referenceImage: null, which visual-diff.py
    // already reports as "no-baseline". Pointing it at a file that is not there would
    // instead read as a failure, and the Figma asset CDN is blocked in some
    // environments, so most frames legitimately have no baseline yet.
    const referenceImage = `docs/figma-reference/${frame.name}.png`;
    return {
      name: frame.name,
      nodeId: frame.id,
      // Arabic is the default locale and carries no prefix; English lives under /en.
      route: frame.locale === "en" ? `/en${frame.route === "/" ? "" : frame.route}` : frame.route,
      locale: frame.locale,
      viewport: VIEWPORTS[frame.viewport],
      canvas: frame.canvas,
      referenceImage: existsSync(resolve(ROOT, referenceImage)) ? referenceImage : null,
    };
  });

const unresolved = payload.frames.filter((frame) => !frame.route);
if (unresolved.length) {
  console.warn(`${unresolved.length} frame(s) left out — resolve them in docs/figma/frame-overrides.json:`);
  for (const frame of unresolved) console.warn(`  ${frame.id} "${frame.figmaName}" ${frame.locale}/${frame.viewport}`);
}

await writeFile(
  resolve(ROOT, "docs/figma-reference-manifest.json"),
  `${JSON.stringify({ fileKey: payload.fileKey, version: payload.version, referenceFrames }, null, 2)}\n`,
);
console.log(`wrote ${referenceFrames.length} reference frames`);
