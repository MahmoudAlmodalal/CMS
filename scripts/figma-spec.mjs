#!/usr/bin/env node
/**
 * Flattens the raw node trees under docs/figma/nodes into per-screen specs that
 * are actually readable while writing components: absolute geometry relative to
 * the frame, resolved hex fills, strokes, effects, radii, auto-layout and type.
 *
 * Output: docs/figma/spec/<frame>.json  and docs/figma/spec/<frame>.txt
 * The .txt is an indented outline meant for reading top-to-bottom next to the PNG.
 */
import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import { resolve, basename } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const NODES_DIR = resolve(ROOT, "docs/figma/nodes");
const SPEC_DIR = resolve(ROOT, "docs/figma/spec");

const round = (n) => (typeof n === "number" ? Math.round(n * 100) / 100 : n);

function toHex({ r, g, b }) {
  const part = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

function paint(p) {
  if (!p || p.visible === false) return null;
  const alpha = round((p.opacity ?? 1) * (p.color?.a ?? 1));
  if (p.type === "SOLID") return { type: "solid", hex: toHex(p.color), alpha };
  if (p.type === "IMAGE") return { type: "image", imageRef: p.imageRef, scaleMode: p.scaleMode };
  if (p.type?.startsWith("GRADIENT")) {
    return {
      type: p.type.toLowerCase(),
      alpha,
      stops: (p.gradientStops ?? []).map((s) => ({ position: round(s.position), hex: toHex(s.color), alpha: round(s.color.a ?? 1) })),
      handles: (p.gradientHandlePositions ?? []).map((h) => ({ x: round(h.x), y: round(h.y) })),
    };
  }
  return { type: p.type };
}

function effect(e) {
  if (!e || e.visible === false) return null;
  return {
    type: e.type,
    hex: e.color ? toHex(e.color) : undefined,
    alpha: e.color ? round(e.color.a ?? 1) : undefined,
    offset: e.offset ? { x: round(e.offset.x), y: round(e.offset.y) } : undefined,
    radius: round(e.radius),
    spread: round(e.spread),
  };
}

function describe(node, origin) {
  const box = node.absoluteBoundingBox;
  const spec = {
    id: node.id,
    name: node.name,
    type: node.type,
  };
  if (box) {
    spec.box = {
      x: round(box.x - origin.x),
      y: round(box.y - origin.y),
      w: round(box.width),
      h: round(box.height),
    };
  }
  if (node.opacity !== undefined && node.opacity !== 1) spec.opacity = round(node.opacity);
  const fills = (node.fills ?? []).map(paint).filter(Boolean);
  if (fills.length) spec.fills = fills;
  const strokes = (node.strokes ?? []).map(paint).filter(Boolean);
  if (strokes.length) spec.strokes = { paints: strokes, weight: round(node.strokeWeight), align: node.strokeAlign };
  const effects = (node.effects ?? []).map(effect).filter(Boolean);
  if (effects.length) spec.effects = effects;
  if (node.cornerRadius !== undefined) spec.radius = node.cornerRadius;
  if (node.rectangleCornerRadii) spec.radius = node.rectangleCornerRadii;
  if (node.layoutMode && node.layoutMode !== "NONE") {
    spec.layout = {
      mode: node.layoutMode,
      gap: round(node.itemSpacing),
      padding: [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft].map(round),
      primary: node.primaryAxisAlignItems,
      counter: node.counterAxisAlignItems,
      wrap: node.layoutWrap,
    };
  }
  if (node.type === "TEXT") {
    const s = node.style ?? {};
    spec.text = {
      characters: node.characters,
      font: s.fontFamily,
      weight: s.fontWeight,
      size: round(s.fontSize),
      lineHeight: round(s.lineHeightPx),
      letterSpacing: round(s.letterSpacing),
      align: s.textAlignHorizontal,
      verticalAlign: s.textAlignVertical,
      case: s.textCase,
      decoration: s.textDecoration,
    };
  }
  if (node.componentId) spec.componentId = node.componentId;
  return spec;
}

function flatten(document) {
  const origin = document.absoluteBoundingBox ?? { x: 0, y: 0 };
  const out = [];
  const visit = (node, depth) => {
    if (node.visible === false) return;
    out.push({ depth, ...describe(node, origin) });
    for (const child of node.children ?? []) visit(child, depth + 1);
  };
  visit(document, 0);
  return out;
}

function outline(nodes) {
  const lines = [];
  for (const n of nodes) {
    const pad = "  ".repeat(n.depth);
    const box = n.box ? `${n.box.w}x${n.box.h} @ ${n.box.x},${n.box.y}` : "";
    const fill = n.fills?.[0];
    const fillText = fill ? (fill.type === "solid" ? ` fill=${fill.hex}${fill.alpha !== 1 ? `/${fill.alpha}` : ""}` : ` fill=${fill.type}`) : "";
    const radius = n.radius !== undefined ? ` r=${Array.isArray(n.radius) ? n.radius.join("/") : n.radius}` : "";
    let layout = "";
    if (n.layout) {
      const parts = [n.layout.mode];
      if (n.layout.gap) parts.push(`gap=${n.layout.gap}`);
      if (n.layout.padding.some((v) => v)) parts.push(`pad=${n.layout.padding.map((v) => v ?? 0).join("/")}`);
      layout = ` [${parts.join(" ")}]`;
    }
    let line = `${pad}${n.name} (${n.type}) ${box}${fillText}${radius}${layout}`;
    if (n.text) {
      const t = n.text;
      line += `\n${pad}  ↳ ${t.font} ${t.weight} ${t.size}/${t.lineHeight} ls=${t.letterSpacing} ${t.align}`;
      line += `\n${pad}  ↳ "${(t.characters ?? "").replace(/\n/g, " ⏎ ")}"`;
    }
    lines.push(line);
  }
  return lines.join("\n");
}

await mkdir(SPEC_DIR, { recursive: true });
let files;
try {
  files = (await readdir(NODES_DIR)).filter((f) => f.endsWith(".json"));
} catch {
  console.error(`No node trees at ${NODES_DIR}. Run "npm run figma:sync" first.`);
  process.exit(1);
}
if (files.length === 0) {
  console.error(`No node trees at ${NODES_DIR}. Run "npm run figma:sync" first.`);
  process.exit(1);
}

for (const file of files) {
  const name = basename(file, ".json");
  const { document } = JSON.parse(await readFile(resolve(NODES_DIR, file), "utf8"));
  const nodes = flatten(document);
  await writeFile(resolve(SPEC_DIR, `${name}.json`), `${JSON.stringify({ frame: name, nodes }, null, 2)}\n`);
  await writeFile(resolve(SPEC_DIR, `${name}.txt`), `${outline(nodes)}\n`);
  console.log(`${name}: ${nodes.length} nodes`);
}
