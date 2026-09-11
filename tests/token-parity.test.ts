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
 */
const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

function themeValue(name: string): string | undefined {
  const match = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return match?.[1].trim();
}

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

test("every colour in FIGMA_TOKENS matches its @theme counterpart", () => {
  const mismatches: string[] = [];

  const check = (token: string, expected: string) => {
    const actual = themeValue(token);
    if (actual === undefined) {
      mismatches.push(`--${token} is missing from globals.css`);
    } else if (normalise(actual) !== normalise(expected)) {
      mismatches.push(`--${token}: globals.css has ${actual}, tokens.ts has ${expected}`);
    }
  };

  for (const [scale, ramp] of Object.entries(FIGMA_TOKENS.colors)) {
    if (scale === "brand") continue; // brand aliases use their own naming
    for (const [step, value] of Object.entries(ramp as Record<string, string>)) {
      if (typeof value !== "string" || !value.startsWith("#")) continue;
      check(`color-${scale}-${step}`, value);
    }
  }

  assert.deepEqual(mismatches, [], `token drift:\n  ${mismatches.join("\n  ")}`);
});

test("the editorial palette read from Figma is defined", () => {
  // Colours the design uses directly (nodes 91:17296, 94:18289) that had no token,
  // so components were substituting brand-primary/brand-espresso and missing the hue.
  const expected: Record<string, string> = {
    "color-eyebrow": "#9F3600",
    "color-eyebrow-muted": "#625E51",
    "color-ink-heading": "#251915",
    "color-ink-body": "#58423A",
    "color-tint-hero": "#FFF1EC",
  };
  for (const [token, value] of Object.entries(expected)) {
    assert.equal(normalise(themeValue(token) ?? ""), normalise(value), `--${token}`);
  }
});

test("gradscale-900 is the Figma foundation value", () => {
  // Figma variable Foundation/gradscale/gradscale-900 = #1B1B1B, which is also what
  // Input.tsx and Badge.tsx have always documented.
  assert.equal(normalise(themeValue("color-gradscale-900") ?? ""), "#1b1b1b");
  assert.equal(FIGMA_TOKENS.colors.gradscale[900], "#1B1B1B");
});
