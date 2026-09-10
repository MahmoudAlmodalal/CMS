import test from "node:test";
import assert from "node:assert/strict";
import { FIGMA_TOKENS } from "../src/lib/tokens.ts";
import fs from "node:fs";

test("UI Foundation — Color Tokens Verification against Figma values", () => {
  // Brand Core
  assert.equal(FIGMA_TOKENS.colors.brand.primary, "#C54716");
  assert.equal(FIGMA_TOKENS.colors.brand.espresso, "#2B1D14");
  assert.equal(FIGMA_TOKENS.colors.brand.cream, "#F9F7F0");
  assert.equal(FIGMA_TOKENS.colors.brand.surface, "#ECE6D0");
  assert.equal(FIGMA_TOKENS.colors.brand.tint, "#F9EDE8");
  assert.equal(FIGMA_TOKENS.colors.brand.gold, "#FFD900");

  // Primary Palette
  assert.equal(FIGMA_TOKENS.colors.primary[50], "#F9EDE8");
  assert.equal(FIGMA_TOKENS.colors.primary[500], "#C54716");
  assert.equal(FIGMA_TOKENS.colors.primary[600], "#B34114");

  // Secondary Palette
  assert.equal(FIGMA_TOKENS.colors.secondary[100], "#F9F7F0");
  assert.equal(FIGMA_TOKENS.colors.secondary[500], "#EBE6D0");

  // Gradscale Palette
  assert.equal(FIGMA_TOKENS.colors.gradscale[400], "#666666");
  assert.equal(FIGMA_TOKENS.colors.gradscale[900], "#1B1B1B");
});

test("UI Foundation — Spacing Tokens Verification", () => {
  assert.equal(FIGMA_TOKENS.spacing[1], "8px");
  assert.equal(FIGMA_TOKENS.spacing[2], "16px");
  assert.equal(FIGMA_TOKENS.spacing[3], "24px");
  assert.equal(FIGMA_TOKENS.spacing[4], "32px");
  assert.equal(FIGMA_TOKENS.spacing[8], "64px");
  assert.equal(FIGMA_TOKENS.spacing[12], "96px");
});

test("UI Foundation — Radii Tokens Verification", () => {
  assert.equal(FIGMA_TOKENS.radii.button, "12px");
  assert.equal(FIGMA_TOKENS.radii.card, "16px");
  assert.equal(FIGMA_TOKENS.radii.input, "16px");
  assert.equal(FIGMA_TOKENS.radii.badge, "16px");
  assert.equal(FIGMA_TOKENS.radii.drawer, "20px");
  assert.equal(FIGMA_TOKENS.radii.full, "9999px");
});

test("UI Foundation — Shadows Verification", () => {
  assert.ok(FIGMA_TOKENS.shadows.card.includes("0px 4px 12px"));
  assert.ok(FIGMA_TOKENS.shadows.cardHover.includes("57px"));
  assert.ok(FIGMA_TOKENS.shadows.nav.includes("0px 4px 12px"));
});

test("UI Foundation — Typography Scale Verification", () => {
  assert.equal(FIGMA_TOKENS.typography.scale.display.size, "64px");
  assert.equal(FIGMA_TOKENS.typography.scale.h1.size, "48px");
  assert.equal(FIGMA_TOKENS.typography.scale.h2.size, "31px");
  assert.equal(FIGMA_TOKENS.typography.scale.h3.size, "20px");
  assert.equal(FIGMA_TOKENS.typography.scale.body.size, "16px");
  assert.equal(FIGMA_TOKENS.typography.scale.caption.size, "12px");
});

test("UI Foundation — Container & Grid Specs Verification", () => {
  assert.equal(FIGMA_TOKENS.containers.desktop.maxWidth, "1280px");
  assert.equal(FIGMA_TOKENS.containers.desktop.columns, 12);
  assert.equal(FIGMA_TOKENS.containers.desktop.gutter, "32px");

  assert.equal(FIGMA_TOKENS.containers.mobile.maxWidth, "390px");
  assert.equal(FIGMA_TOKENS.containers.mobile.columns, 4);
  assert.equal(FIGMA_TOKENS.containers.mobile.gutter, "24px");
});

test("UI Foundation — Globals.css contains all Figma Theme Variables", () => {
  const css = fs.readFileSync("src/app/globals.css", "utf-8");
  assert.ok(css.includes("--color-brand-primary: #C54716;"));
  assert.ok(css.includes("--color-brand-espresso: #2B1D14;"));
  assert.ok(css.includes("--radius-button: 12px;"));
  assert.ok(css.includes("--radius-card: 16px;"));
  assert.ok(css.includes("--radius-input: 16px;"));
  assert.ok(css.includes("--shadow-card:"));
  assert.ok(css.includes("--shadow-card-hover:"));
});
