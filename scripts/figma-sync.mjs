#!/usr/bin/env node
/**
 * Pulls everything we need from the canonical Figma file:
 *
 *   docs/figma/file.json          full document tree
 *   docs/figma/frames.json        the 28 screen frames, resolved to routes
 *   docs/figma/nodes/*.json       per-frame node tree (fills, type, geometry, text)
 *   docs/figma/styles.json        published styles
 *   docs/figma-reference/*.png    reference render per frame, at 1:1 so pixel diffs line up
 *   public/assets/figma/*         original raster fills used by the design
 *   public/assets/icons/*.svg     vector layers exported as SVG
 *
 * Usage: FIGMA_TOKEN=figd_... npm run figma:sync [-- --only=file,frames,nodes,images,fills,svg,styles]
 */
// Node's built-in fetch only honours HTTPS_PROXY when this is set (Node >= 22.21).
process.env.NODE_USE_ENV_PROXY ??= "1";

import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { figmaGet, requireFileKey, requireToken, chunk, sleep } from "./lib/figma-api.mjs";
import { collectFrames } from "./lib/figma-frames.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const FIGMA_DIR = resolve(ROOT, "docs/figma");
const NODES_DIR = resolve(FIGMA_DIR, "nodes");
const REFERENCE_DIR = resolve(ROOT, "docs/figma-reference");
const RASTER_DIR = resolve(ROOT, "public/assets/figma");
const ICON_DIR = resolve(ROOT, "public/assets/icons");

const only = process.argv
  .find((arg) => arg.startsWith("--only="))
  ?.slice("--only=".length)
  .split(",");
const wants = (step) => !only || only.includes(step);

const fileKey = requireFileKey();
const token = requireToken();

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
  return path;
}

async function download(url, path) {
  await mkdir(dirname(path), { recursive: true });
  const response = await fetch(url);
  if (!response.ok) throw new Error(`download ${path} failed: ${response.status}`);
  await writeFile(path, Buffer.from(await response.arrayBuffer()));
  return path;
}

/** Walk every node in a Figma subtree. */
function* walk(node, ancestors = []) {
  yield { node, ancestors };
  for (const child of node.children ?? []) yield* walk(child, [...ancestors, node]);
}

function slugify(value) {
  return (value || "asset")
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60) || "asset";
}

// --- 1. full file tree -------------------------------------------------------
const filePath = resolve(FIGMA_DIR, "file.json");
let file;
if (wants("file") || !existsSync(filePath)) {
  console.log("· fetching document tree");
  file = await figmaGet(`/v1/files/${fileKey}?geometry=paths`, { token });
  await writeJson(filePath, file);
} else {
  file = JSON.parse(await readFile(filePath, "utf8"));
}
console.log(`  file "${file.name}" version ${file.version}`);

// --- 2. resolve screen frames ------------------------------------------------
const overridePath = resolve(FIGMA_DIR, "frame-overrides.json");
const overrides = existsSync(overridePath) ? JSON.parse(await readFile(overridePath, "utf8")) : {};
const frames = collectFrames(file, overrides).filter((f) => !f.missing);
await writeJson(resolve(FIGMA_DIR, "frames.json"), { fileKey, version: file.version, frames });
const ambiguous = frames.filter((f) => f.ambiguous);
console.log(`  ${frames.length} screen frames (${ambiguous.length} unresolved)`);
if (ambiguous.length) {
  console.log("  unresolved frames — open their PNG and add id -> slug to docs/figma/frame-overrides.json:");
  for (const f of ambiguous) console.log(`    ${f.id}  "${f.figmaName}"  ${f.locale}/${f.viewport}  ${f.canvas.join("x")}`);
}

// --- 3. per-frame node trees -------------------------------------------------
if (wants("nodes")) {
  for (const batch of chunk(frames, 5)) {
    const ids = batch.map((f) => f.id).join(",");
    console.log(`· nodes ${batch.map((f) => f.name).join(", ")}`);
    const payload = await figmaGet(`/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}&geometry=paths`, { token });
    for (const frame of batch) {
      const entry = payload.nodes?.[frame.id];
      if (!entry) {
        console.warn(`  ! no node payload for ${frame.id}`);
        continue;
      }
      await writeJson(resolve(NODES_DIR, `${frame.name}.json`), entry);
    }
    await sleep(500);
  }
}

// --- 4. rendered reference images -------------------------------------------
if (wants("images")) {
  for (const batch of chunk(frames, 8)) {
    const ids = batch.map((f) => f.id).join(",");
    console.log(`· rendering ${batch.length} frames`);
    const payload = await figmaGet(`/v1/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=1`, { token });
    for (const frame of batch) {
      const url = payload.images?.[frame.id];
      if (!url) {
        console.warn(`  ! no render for ${frame.name}`);
        continue;
      }
      await download(url, resolve(REFERENCE_DIR, `${frame.name}.png`));
    }
    await sleep(1000);
  }
}

// --- 5. original raster fills -----------------------------------------------
if (wants("fills")) {
  console.log("· fetching image fill map");
  const { meta } = await figmaGet(`/v1/files/${fileKey}/images`, { token });
  const urls = meta?.images ?? {};
  // Name each file after the node that uses it, so components can be wired up by hand.
  const used = new Map();
  for (const frame of frames) {
    const nodePath = resolve(NODES_DIR, `${frame.name}.json`);
    if (!existsSync(nodePath)) continue;
    const { document } = JSON.parse(await readFile(nodePath, "utf8"));
    for (const { node } of walk(document)) {
      for (const fill of node.fills ?? []) {
        if (fill.type !== "IMAGE" || !fill.imageRef) continue;
        if (!used.has(fill.imageRef)) used.set(fill.imageRef, { frames: new Set(), names: new Set() });
        const entry = used.get(fill.imageRef);
        entry.frames.add(frame.slug ?? frame.name);
        entry.names.add(node.name);
      }
    }
  }
  const manifest = [];
  for (const [ref, entry] of used) {
    const url = urls[ref];
    if (!url) {
      console.warn(`  ! no URL for imageRef ${ref}`);
      continue;
    }
    const label = `${[...entry.frames][0]}-${slugify([...entry.names][0])}`;
    const file = `${label}-${ref.slice(0, 8)}.png`;
    await download(url, resolve(RASTER_DIR, file));
    manifest.push({ imageRef: ref, file: `public/assets/figma/${file}`, frames: [...entry.frames], layers: [...entry.names] });
  }
  await writeJson(resolve(FIGMA_DIR, "image-fills.json"), manifest);
  console.log(`  downloaded ${manifest.length} raster fills`);
}

// --- 6. vector layers as SVG -------------------------------------------------
if (wants("svg")) {
  const vectorTypes = new Set(["VECTOR", "BOOLEAN_OPERATION", "STAR", "ELLIPSE", "REGULAR_POLYGON", "LINE"]);
  const isPureVector = (node) => {
    if (vectorTypes.has(node.type)) return true;
    if (!node.children?.length) return false;
    return node.children.every(isPureVector);
  };
  const candidates = new Map();
  // Walk top-down and stop at the first all-vector node, so we export whole icons
  // rather than each of the hundreds of 6x6 dot fragments inside them.
  const collect = (node) => {
    const box = node.absoluteBoundingBox;
    if (box && box.width >= 8 && box.height >= 8 && box.width <= 240 && box.height <= 240 && isPureVector(node)) {
      const key = `${slugify(node.name)}-${Math.round(box.width)}x${Math.round(box.height)}`;
      if (!candidates.has(key)) candidates.set(key, node.id);
      return;
    }
    for (const child of node.children ?? []) collect(child);
  };
  for (const frame of frames) {
    const nodePath = resolve(NODES_DIR, `${frame.name}.json`);
    if (!existsSync(nodePath)) continue;
    const { document } = JSON.parse(await readFile(nodePath, "utf8"));
    collect(document);
  }
  const entries = [...candidates.entries()];
  console.log(`· exporting ${entries.length} vector layers as SVG`);
  for (const batch of chunk(entries, 20)) {
    const ids = batch.map(([, id]) => id).join(",");
    const payload = await figmaGet(`/v1/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=svg`, { token });
    for (const [key, id] of batch) {
      const url = payload.images?.[id];
      if (url) await download(url, resolve(ICON_DIR, `${key}.svg`));
    }
    await sleep(1000);
  }
}

// --- 7. published styles -----------------------------------------------------
if (wants("styles")) {
  console.log("· fetching published styles");
  const styles = await figmaGet(`/v1/files/${fileKey}/styles`, { token });
  await writeJson(resolve(FIGMA_DIR, "styles.json"), styles);
}

console.log("done");
