import test from "node:test";
import assert from "node:assert/strict";
import { FIGMA_TOKENS } from "../src/lib/tokens.ts";
import fs from "node:fs";
import path from "node:path";

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
  assert.equal(FIGMA_TOKENS.radii.card, "24px");
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

  // Verify Ruqaa font purge per FIGMA_DESIGN_AUDIT_PLAN §3.2
  assert.ok(
    !FIGMA_TOKENS.typography.fonts.calligraphic.includes("Aref Ruqaa"),
    "Aref Ruqaa font must be purged per FIGMA_DESIGN_AUDIT_PLAN §3.2"
  );
  assert.ok(
    FIGMA_TOKENS.typography.fonts.calligraphic.includes("Qahwa Arabic"),
    "Calligraphic font stack must prefer Qahwa Arabic"
  );
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
  assert.ok(css.includes("--color-brand-primary-hover: #B34114;"));
  assert.ok(css.includes("--color-brand-espresso: #2B1D14;"));
  assert.ok(css.includes("--color-brand-cream: #F9F7F0;"));
  assert.ok(css.includes("--color-brand-tint: #F9EDE8;"));
  assert.ok(css.includes("--color-gradscale-900: #1B1B1B;"));
  assert.ok(css.includes("--radius-button: 12px;"));
  assert.ok(css.includes("--radius-card: 24px;"));
  assert.ok(css.includes("--radius-input: 16px;"));
  assert.ok(css.includes("--shadow-card:"));
  assert.ok(css.includes("--shadow-card-hover:"));
});

test("UI Foundation — Reconciled Token Values (#C54716, #B34114, #F9F7F0, #2B1D14)", () => {
  const css = fs.readFileSync("src/app/globals.css", "utf-8");

  // 1. Primary Terracotta #C54716
  assert.equal(FIGMA_TOKENS.colors.brand.primary, "#C54716");
  assert.equal(FIGMA_TOKENS.colors.primary[500], "#C54716");
  assert.ok(css.includes("--color-brand-primary: #C54716;"));

  // 2. Primary Hover & Pressed #B34114
  assert.equal(FIGMA_TOKENS.colors.primary[600], "#B34114");
  assert.ok(css.includes("--color-brand-primary-hover: #B34114;"));
  assert.ok(css.includes("--color-brand-primary-pressed: #B34114;"));

  // 3. Warm Parchment Canvas Surface #F9F7F0
  assert.equal(FIGMA_TOKENS.colors.brand.cream, "#F9F7F0");
  assert.equal(FIGMA_TOKENS.colors.secondary[100], "#F9F7F0");
  assert.ok(css.includes("--color-brand-cream: #F9F7F0;"));
  assert.ok(css.includes("--background: #F9F7F0;"));

  // 4. Dark Espresso #2B1D14
  assert.equal(FIGMA_TOKENS.colors.brand.espresso, "#2B1D14");
  assert.ok(css.includes("--color-brand-espresso: #2B1D14;"));
  assert.ok(css.includes("--foreground: #2B1D14;"));

  // 5. Secondary Border & Tint #F9EDE8
  assert.equal(FIGMA_TOKENS.colors.brand.tint, "#F9EDE8");
  assert.equal(FIGMA_TOKENS.colors.primary[50], "#F9EDE8");
  assert.ok(css.includes("--color-brand-tint: #F9EDE8;"));
});

test("UI Foundation — Universal PublicButton Geometry & Mechanics (Figma 115:1080 / 115:2176)", () => {
  const buttonPath = path.resolve("src/components/public/PublicButton.tsx");
  assert.ok(fs.existsSync(buttonPath), "PublicButton.tsx must exist in src/components/public/");

  const content = fs.readFileSync(buttonPath, "utf-8");

  // 12px corner radius (rounded-xl / rounded-button)
  assert.match(content, /rounded-xl|rounded-button/, "PublicButton must enforce 12px corner radius");

  // 48px default height (h-12)
  assert.match(content, /h-12/, "PublicButton must enforce default 48px height (h-12)");

  // 48px -> 56px hover expansion (+8px)
  assert.match(content, /hover:h-14|group-hover:h-14/, "PublicButton must expand to 56px (+8px) on hover");

  // Primary variant matching Figma Node 115:1080 (#C54716 default, #B34114 hover)
  assert.match(content, /bg-brand-primary/, "PublicButton primary must use bg-brand-primary (#C54716)");
  assert.match(content, /hover:bg-brand-primary-hover/, "PublicButton primary hover must use hover:bg-brand-primary-hover (#B34114)");

  // Secondary variant matching Figma Node 115:2176 (#F9EDE8 border, transparent bg)
  assert.match(content, /border-brand-tint/, "PublicButton secondary must use border-brand-tint (#F9EDE8)");
  assert.match(content, /bg-transparent/, "PublicButton secondary must have transparent background");

  // Polymorphic Link/Button rendering support
  assert.match(content, /href/, "PublicButton must support href for polymorphic Link navigation");
  assert.match(content, /<Link/, "PublicButton must render Next.js Link when href is provided");
});
