import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { FIGMA_TOKENS } from "../src/lib/tokens.ts";

const root = path.resolve(".");

test("Challenger 2 — 1. Token Parity: Strict Brand Primary Hover (#B34114, NOT #D16C45)", () => {
  const cssPath = path.join(root, "src/app/globals.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  // Verify --color-brand-primary-hover is strictly #B34114
  assert.match(
    css,
    /--color-brand-primary-hover:\s*#B34114;/i,
    "globals.css must define --color-brand-primary-hover as #B34114"
  );

  // Negative assertion: --color-brand-primary-hover MUST NOT be #D16C45
  assert.doesNotMatch(
    css,
    /--color-brand-primary-hover:\s*#D16C45;/i,
    "globals.css must NOT set --color-brand-primary-hover to legacy #D16C45"
  );

  // In tokens.ts
  assert.equal(
    FIGMA_TOKENS.colors.brand.primaryHover,
    "#B34114",
    "FIGMA_TOKENS.colors.brand.primaryHover must be #B34114"
  );
  assert.equal(
    FIGMA_TOKENS.colors.brand.primaryPressed,
    "#B34114",
    "FIGMA_TOKENS.colors.brand.primaryPressed must be #B34114"
  );
  assert.notEqual(
    FIGMA_TOKENS.colors.brand.primaryHover,
    "#D16C45",
    "FIGMA_TOKENS.colors.brand.primaryHover must not be #D16C45"
  );
});

test("Challenger 2 — 2. Token Parity: Gradscale 900 & Radius Card Parity", () => {
  const cssPath = path.join(root, "src/app/globals.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  // --color-gradscale-900 must be #1B1B1B (Figma Foundation/gradscale/gradscale-900)
  assert.match(
    css,
    /--color-gradscale-900:\s*#1B1B1B;/i,
    "globals.css must define --color-gradscale-900 as #1B1B1B"
  );
  assert.equal(
    FIGMA_TOKENS.colors.gradscale[900],
    "#1B1B1B",
    "FIGMA_TOKENS.colors.gradscale[900] must be #1B1B1B"
  );

  // --radius-card must be 24px
  assert.match(
    css,
    /--radius-card:\s*24px;/i,
    "globals.css must define --radius-card as 24px"
  );
  assert.equal(
    FIGMA_TOKENS.radii.card,
    "24px",
    "FIGMA_TOKENS.radii.card must be 24px"
  );
});

test("Challenger 2 — 3. Token Parity: Aref Ruqaa font strictly purged from CSS and tokens", () => {
  const cssPath = path.join(root, "src/app/globals.css");
  const css = fs.readFileSync(cssPath, "utf-8");
  const tokensPath = path.join(root, "src/lib/tokens.ts");
  const tokens = fs.readFileSync(tokensPath, "utf-8");

  // Ensure Aref Ruqaa does not appear in globals.css
  assert.ok(
    !css.includes("Aref Ruqaa"),
    "globals.css must not reference 'Aref Ruqaa' anywhere"
  );

  // Ensure Aref Ruqaa does not appear in tokens.ts font definitions
  assert.ok(
    !tokens.includes("Aref Ruqaa"),
    "tokens.ts must not reference 'Aref Ruqaa' anywhere"
  );
  assert.ok(
    !FIGMA_TOKENS.typography.fonts.calligraphic.includes("Aref Ruqaa"),
    "FIGMA_TOKENS calligraphic font stack must not include 'Aref Ruqaa'"
  );
  assert.ok(
    FIGMA_TOKENS.typography.fonts.calligraphic.includes("Qahwa Arabic"),
    "FIGMA_TOKENS calligraphic font stack must include 'Qahwa Arabic'"
  );
});

test("Challenger 2 — 4. Mobile Shell: MobileNavbar 390px viewport safety & no overflow", () => {
  const mobileNavPath = path.join(root, "src/components/public/MobileNavbar.tsx");
  const content = fs.readFileSync(mobileNavPath, "utf-8");

  // Figma's Component 17/Navigation is a floating pill inset 10px inline, not a
  // full-bleed bar, so the pill takes its width from the viewport via inset-x.
  assert.match(content, /fixed inset-x-2\.5 top-\[44px\]/, "Mobile pill must anchor via inset-x, not start-0/end-0");
  assert.match(content, /h-14/, "Mobile top bar must have fixed 56px height (h-14)");
  assert.match(content, /lg:hidden/, "Mobile top bar must be hidden on desktop (lg:hidden)");
  assert.match(content, /px-5/, "Mobile pill must use the 20px inline padding of Component 17");

  // Nothing inside the pill may be wide enough to overflow a 390px viewport. The
  // pill's own content box is 390 - 2*10 - 2*20 = 330px, so parse every hardcoded
  // pixel width rather than pattern-matching digit counts: w-[104px] is fine,
  // w-[400px] is not, and the old /\d{3,}/ regex could not tell them apart.
  const PILL_CONTENT_WIDTH = 330;
  for (const [, prop, value] of content.matchAll(/\b((?:min-)?w)-\[(\d+(?:\.\d+)?)px\]/g)) {
    assert.ok(
      Number(value) <= PILL_CONTENT_WIDTH,
      `Mobile navbar ${prop} of ${value}px overflows the ${PILL_CONTENT_WIDTH}px pill content box`
    );
  }

  // Accessible drawer trigger
  // The label moved into next-intl when the site gained an English locale, so assert
  // the accessible name is wired up rather than hardcoded in Arabic.
  assert.match(content, /aria-label=\{a11y\("openMenu"\)\}/);
  assert.match(content, /aria-expanded=\{drawerOpen\}/);
  assert.match(content, /aria-controls="mobile-navigation-drawer"/);
});

test("Challenger 2 — 5. Mobile Shell: MobileDrawer 390px constraints & modal bounds", () => {
  const drawerPath = path.join(root, "src/components/public/MobileDrawer.tsx");
  const content = fs.readFileSync(drawerPath, "utf-8");

  // Panel must be clamped to max-w-[370px] (< 390px viewport)
  assert.match(content, /max-w-\[370px\]/, "Mobile drawer panel must be clamped to max-w-[370px]");
  assert.match(content, /fixed inset-y-0 start-0/, "Mobile drawer panel must be fixed to start-0");
  assert.match(content, /rounded-e-2xl/, "Mobile drawer must use logical rounded-e-2xl for corner radius");

  // Scroll lock & Escape handling
  assert.match(content, /document\.body\.style\.overflow = "hidden"/, "Drawer must lock body scroll when open");
  assert.match(content, /document\.body\.style\.overflow = ""/, "Drawer must restore body scroll when closed");
  assert.match(content, /e\.key === "Escape"/, "Drawer must close on Escape key press");

  // Inner scroll area must prevent horizontal spillage
  assert.match(content, /overflow-y-auto/, "Drawer navigation body must allow vertical scrolling");
  assert.doesNotMatch(content, /overflow-x-scroll/, "Drawer navigation body must not scroll horizontally");
});

test("Challenger 2 — 6. Public Shell Layout Clearance Synchronization", () => {
  const layoutPath = path.join(root, "src/app/[locale]/(public)/layout.tsx");
  const content = fs.readFileSync(layoutPath, "utf-8");

  // The shell must NOT reserve clearance for the navbar. On every Figma frame —
  // desktop and mobile alike — the page opens on a full-bleed hero at y=0 and the
  // navbar floats over it (measured: the #F2EEE0 band starts at y=33..57 on desktop,
  // and mobile uses a rounded pill over the hero, not an opaque bar). Padding here
  // pushed every row below the fold out of alignment with the design.
  assert.doesNotMatch(content, /\bpt-14\b/, "Public layout main must not reserve mobile navbar clearance");
  assert.doesNotMatch(content, /\blg:pt-24\b/, "Public layout main must not reserve desktop navbar clearance");
});
