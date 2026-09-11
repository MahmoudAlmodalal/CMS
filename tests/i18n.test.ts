import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { loadMessages, flattenMessages } from "./helpers/i18n.ts";

const root = path.resolve(".");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf-8");

test("i18n — 1. Locale routing keeps Arabic canonical and adds English", () => {
  const routing = read("src/i18n/routing.ts");
  assert.match(routing, /locales = \["ar", "en"\]/, "Exactly two locales are supported: ar and en");
  assert.match(routing, /defaultLocale: "ar"/, "Arabic must stay the default locale");
  assert.match(
    routing,
    /localePrefix: "as-needed"/,
    "Arabic URLs must keep their existing unprefixed form; only English gets a /en prefix",
  );

  const navigation = read("src/i18n/navigation.ts");
  assert.match(navigation, /createNavigation\(routing\)/, "Navigation helpers must be locale-aware");

  const config = read("next.config.ts");
  assert.match(config, /createNextIntlPlugin\("\.\/src\/i18n\/request\.ts"\)/, "next.config must register the plugin");
});

test("i18n — 2. Message catalogs are complete in both locales", () => {
  const ar = flattenMessages(loadMessages("ar"));
  const en = flattenMessages(loadMessages("en"));

  const missingInEn = Object.keys(ar).filter((key) => !(key in en));
  const missingInAr = Object.keys(en).filter((key) => !(key in ar));

  assert.deepEqual(missingInEn, [], "Every Arabic message key must have an English counterpart");
  assert.deepEqual(missingInAr, [], "Every English message key must have an Arabic counterpart");

  const blank = Object.entries(ar)
    .concat(Object.entries(en))
    .filter(([, value]) => value.trim() === "")
    .map(([key]) => key);
  assert.deepEqual(blank, [], "No message may be empty");
});

test("i18n — 3. The panel and sign-in stay outside the localized site", () => {
  const middleware = read("src/middleware.ts");
  assert.match(middleware, /function isUnlocalized/, "Middleware must classify unlocalised routes");
  assert.match(
    middleware,
    /if \(!isUnlocalized\(request\.nextUrl\.pathname\)\) \{\s*return handleI18n\(request\);/,
    "Localised routes must be handed to the locale middleware before the auth guard",
  );

  assert.ok(fs.existsSync(path.join(root, "src/app/(admin)/layout.tsx")), "Admin needs its own document shell");
  assert.ok(fs.existsSync(path.join(root, "src/app/(auth)/layout.tsx")), "Sign-in needs its own document shell");
  assert.ok(
    !fs.existsSync(path.join(root, "src/app/layout.tsx")),
    "There must be no shared root layout — each shell owns its own <html> so lang/dir are correct",
  );
});

test("i18n — 4. Localized pages stay statically renderable", () => {
  const localeLayout = read("src/app/[locale]/layout.tsx");
  assert.match(localeLayout, /generateStaticParams/, "Both locales must be prerendered");
  assert.match(localeLayout, /setRequestLocale\(locale\)/, "Locale layout must opt into static rendering");
  assert.match(localeLayout, /notFound\(\)/, "An unknown locale must 404 rather than render Arabic silently");

  const publicLayout = read("src/app/[locale]/(public)/layout.tsx");
  assert.match(publicLayout, /setRequestLocale\(locale\)/, "Public shell must opt into static rendering");
});

test("i18n — 5. The language control switches locale rather than flipping direction", () => {
  const switcher = read("src/components/public/LocaleSwitcher.tsx");
  assert.match(switcher, /locale=\{other\}/, "Switcher must link to the same route in the other locale");
  assert.match(switcher, /usePathname/, "Switcher must preserve the current route");
  assert.match(switcher, /hrefLang/, "Switcher must expose hrefLang for crawlers");

  for (const rel of ["src/components/public/Navbar.tsx", "src/components/public/MobileDrawer.tsx"]) {
    const source = read(rel);
    assert.match(source, /LocaleSwitcher/, `${rel} must use the locale switcher`);
    assert.ok(!source.includes("toggleDirection"), `${rel} must not merely flip direction`);
  }
});
