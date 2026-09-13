import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { FIGMA_TOKENS } from "../src/lib/tokens.ts";

/**
 * globals.css is the single source of truth: it is what Tailwind compiles.
 * src/lib/tokens.ts is a typed mirror for tests and for code that needs a value
 * at runtime. The two silently drifted before (gradscale-900 carried #130F26
 * while Figma and every component docblock said #1B1B1B), so this asserts they
 * agree rather than trusting anyone to update both.
 *
 * Both directions are checked. Forward alone (mirror -> CSS) cannot see a token
 * that exists only in CSS, which is how the whole editorial palette sat outside
 * every check for as long as it existed.
 */
const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

/** The @theme block only — :root and the element rules below it are not tokens. */
const theme = (() => {
  const start = css.indexOf("@theme {");
  assert.ok(start >= 0, "globals.css must declare an @theme block");
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(start, i);
    }
  }
  throw new Error("unterminated @theme block");
})();

function themeValue(name: string): string | undefined {
  const match = theme.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return match?.[1].trim();
}

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

const kebab = (key: string) => key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/**
 * The brand group uses product names rather than a ramp, so its CSS spelling is
 * listed rather than derived. Anything here that is not in the group, or in the
 * group but not here, fails the round-trip test below.
 */
const BRAND_TOKEN_NAMES: Record<string, string> = {
  primary: "color-brand-primary",
  primaryHover: "color-brand-primary-hover",
  primaryPressed: "color-brand-primary-pressed",
  primaryDisabled: "color-brand-primary-disabled",
  espresso: "color-brand-espresso",
  espressoSubtle: "color-brand-espresso-subtle",
  cream: "color-brand-cream",
  surface: "color-brand-surface",
  tint: "color-brand-tint",
  borderSecondary: "color-border-secondary",
  borderGrey: "color-border-grey",
  gold: "color-brand-gold",
  goldSoft: "color-brand-gold-soft",
  alertError: "color-alert-error",
  alertSuccess: "color-alert-success",
  // Plain white and black are CSS keywords, not design tokens, so they carry no
  // custom property and are deliberately absent from @theme.
  white: "",
  black: "",
};

/** Every token the mirror claims, as CSS name -> expected value. */
function expectedTokens(): Map<string, string> {
  const out = new Map<string, string>();

  for (const [scale, group] of Object.entries(FIGMA_TOKENS.colors)) {
    for (const [key, value] of Object.entries(group as Record<string, string>)) {
      if (scale === "brand") {
        const name = BRAND_TOKEN_NAMES[key];
        assert.ok(name !== undefined, `colors.brand.${key} has no entry in BRAND_TOKEN_NAMES`);
        if (name) out.set(name, value);
      } else if (scale === "editorial") {
        out.set(`color-${kebab(key)}`, value);
      } else {
        out.set(`color-${scale}-${key}`, value);
      }
    }
  }

  for (const [key, value] of Object.entries(FIGMA_TOKENS.radii)) out.set(`radius-${kebab(key)}`, value);
  for (const [key, value] of Object.entries(FIGMA_TOKENS.shadows)) out.set(`shadow-${kebab(key)}`, value);
  for (const [step, value] of Object.entries(FIGMA_TOKENS.spacing)) out.set(`spacing-grid-${step}`, value);

  out.set("container-desktop", FIGMA_TOKENS.containers.desktop.maxWidth);
  out.set("container-mobile", FIGMA_TOKENS.containers.mobile.maxWidth);

  return out;
}

test("every token in FIGMA_TOKENS matches its @theme counterpart", () => {
  const mismatches: string[] = [];

  for (const [name, expected] of expectedTokens()) {
    const actual = themeValue(name);
    if (actual === undefined) mismatches.push(`--${name} is missing from globals.css`);
    else if (normalise(actual) !== normalise(expected)) {
      mismatches.push(`--${name}: globals.css has ${actual}, tokens.ts has ${expected}`);
    }
  }

  assert.deepEqual(mismatches, [], `token drift:\n  ${mismatches.join("\n  ")}`);
});

test("every @theme token is mirrored in FIGMA_TOKENS", () => {
  // The reverse direction. --font-* is excluded on purpose: those are fallback
  // stacks wrapping next/font's generated var(), so the CSS value and the mirror's
  // plain family list cannot be compared literally.
  const expected = expectedTokens();
  const orphans: string[] = [];

  for (const [, name] of theme.matchAll(/--((?:color|radius|shadow|spacing|container)-[a-z0-9-]+):/g)) {
    if (!expected.has(name)) orphans.push(`--${name}`);
  }

  assert.deepEqual(
    orphans,
    [],
    `defined in globals.css but absent from src/lib/tokens.ts:\n  ${orphans.join("\n  ")}`
  );
});

test("the Figma grid scale is published under a namespace that cannot rescale Tailwind", () => {
  // Writing --spacing-1 … --spacing-13 would override Tailwind v4's dynamic spacing
  // scale, so p-1/gap-3/p-4 would silently stop meaning 4px/12px/16px. The grid
  // steps must therefore stay namespaced.
  assert.doesNotMatch(theme, /--spacing-\d+\s*:/, "bare --spacing-<n> would rescale every p-/gap- utility");

  // Figma defines thirteen steps and jumps 40 -> 56; 48 is not a grid value.
  const steps = Object.keys(FIGMA_TOKENS.spacing).map(Number).sort((a, b) => a - b);
  assert.deepEqual(steps, [8, 16, 24, 32, 40, 56, 64, 72, 84, 88, 96, 104, 112]);
  assert.equal(themeValue("spacing-grid-48"), undefined, "48 is not a Figma grid step");
});

test("gradscale-900 is the Figma foundation value", () => {
  // Figma variable Foundation/gradscale/gradscale-900 = #1B1B1B, which is also what
  // Input.tsx and Badge.tsx have always documented.
  assert.equal(normalise(themeValue("color-gradscale-900") ?? ""), "#1b1b1b");
  assert.equal(FIGMA_TOKENS.colors.gradscale[900], "#1B1B1B");
});
