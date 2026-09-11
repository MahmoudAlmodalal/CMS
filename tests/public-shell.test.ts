import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { arMessages, enMessages } from "./helpers/i18n.ts";

const root = path.resolve(".");

/** Copy now lives in the message catalogs, so assert it there and assert the key's use in source. */
function assertLocalised(source: string, key: string, arabic: string, why: string) {
  assert.equal(arMessages[key], arabic, `${why} — ar catalog key "${key}" must hold the confirmed copy`);
  assert.ok(enMessages[key], `${why} — en catalog must define "${key}"`);
  const [, leaf] = key.split(".");
  assert.ok(source.includes(`"${leaf}"`), `${why} — component must render message key "${key}"`);
}

test("Task 31 — 1. Public Shell Component Architecture & Files", () => {
  const expectedFiles = [
    "src/components/public/Navbar.tsx",
    "src/components/public/MobileNavbar.tsx",
    "src/components/public/MobileDrawer.tsx",
    "src/components/public/Footer.tsx",
    "src/components/public/SkipToContent.tsx",
    "src/components/public/index.ts",
    "src/app/[locale]/(public)/layout.tsx",
  ];

  for (const rel of expectedFiles) {
    const fullPath = path.join(root, rel);
    assert.ok(fs.existsSync(fullPath), `Expected public shell file to exist: ${rel}`);
  }

  const barrelContent = fs.readFileSync(path.join(root, "src/components/public/index.ts"), "utf-8");
  assert.match(barrelContent, /export \{ Navbar/);
  assert.match(barrelContent, /export \{ MobileNavbar/);
  assert.match(barrelContent, /export \{ MobileDrawer/);
  assert.match(barrelContent, /export \{ Footer/);
  assert.match(barrelContent, /export \{ SkipToContent/);
  assert.match(barrelContent, /export \{ LocaleSwitcher/);
});

test("Task 31 — 2. Desktop Floating Navbar (Figma Frame 7: 1123x85, r=32)", () => {
  const content = fs.readFileSync(path.join(root, "src/components/public/Navbar.tsx"), "utf-8");

  // Floating pill dimensions & radius
  assert.match(content, /1123px/, "Navbar must enforce Figma confirmed width: 1123px");
  // Figma Node 20:4403 measures 1123x85 with a 32px radius — the earlier 56px/20px
  // "reconciliation" was not present in the design.
  assert.match(content, /85px|h-\[85px\]/, "Navbar must enforce Figma confirmed height: 85px");
  assert.match(content, /rounded-\[32px\]/, "Navbar must enforce Figma confirmed corner radius: 32px");
  assert.match(content, /#F2EEE0/, "Navbar must use Figma secondary-300 fill #F2EEE0");
  assert.match(content, /fixed top-6/, "Navbar must be floating at top on desktop");
  assert.match(content, /hidden lg:flex/, "Navbar must be desktop-only (hidden on mobile)");

  // Brand identity
  assert.equal(arMessages["site.brand"], "فرقة أندلسيا", "Catalog must carry the confirmed band name");
  assert.match(content, /href="\/"/, "Navbar brand logo must link to root route /");

  // 5 Confirmed Navigation links
  const expectedLinks = [
    { key: "nav.home", label: "الرئيسية", href: "/" },
    { key: "nav.academy", label: "الأكاديمية", href: "/academy" },
    { key: "nav.artists", label: "الفنانين", href: "/artists" },
    { key: "nav.news", label: "الأخبار", href: "/news" },
    { key: "nav.events", label: "الفعاليات", href: "/events" },
  ];

  for (const item of expectedLinks) {
    assert.equal(arMessages[item.key], item.label, `Navbar label "${item.label}" must live in the ar catalog`);
    assert.ok(enMessages[item.key], `Navbar label must have an English counterpart: ${item.key}`);
    assert.ok(content.includes(item.href), `Navbar must route to "${item.href}"`);
  }

  // CTA button
  assertLocalised(content, "nav.bookNow", "أحجز الآن", "Navbar CTA");
  assert.match(content, /href="\/booking"/, "Navbar CTA must direct to /booking");

  // Language switcher must change locale, not merely flip direction
  assert.match(content, /LocaleSwitcher/, "Navbar must include the locale switcher");
});

test("Task 31 — 3. Mobile Top Bar (Figma Component 17: 56px)", () => {
  const content = fs.readFileSync(path.join(root, "src/components/public/MobileNavbar.tsx"), "utf-8");

  assert.match(content, /lg:hidden/, "Mobile top bar must be mobile-only (hidden on desktop)");
  assert.match(content, /h-14|h-16/, "Mobile top bar must maintain 56px height specification");
  assert.match(content, /site\("brand"\)/, "Mobile top bar must display band name");
  assertLocalised(content, "nav.bookNow", "أحجز الآن", "Mobile top bar CTA");
  assert.match(content, /href="\/booking"/, "Mobile top bar CTA must link to /booking");
  assertLocalised(content, "a11y.openMenu", "فتح قائمة التنقل", "Mobile top bar trigger");
  assert.match(content, /<MobileDrawer/, "Mobile top bar must integrate MobileDrawer");
});

test("Task 31 — 4. Mobile Drawer Navigation (Figma 139:12368)", () => {
  const content = fs.readFileSync(path.join(root, "src/components/public/MobileDrawer.tsx"), "utf-8");

  // RTL Drawer behavior
  assert.match(content, /start-0/, "Drawer must slide from inline-start for RTL safety");
  assert.match(content, /Escape/, "Drawer must handle Escape key navigation");
  assert.match(content, /document\.body\.style\.overflow/, "Drawer must lock body scroll when open");

  // Drawer links
  assert.match(content, /CONFIRMED_NAV_ITEMS/, "Drawer must render confirmed navigation items");
  assertLocalised(content, "drawer.bookingCta", "ابدأ حجزك الآن ♪", "Drawer CTA");
  assert.match(content, /href="\/booking"/, "Drawer CTA must direct to /booking");

  // Contact info
  assert.equal(arMessages["footer.contactEmail"], "hello@andalusia.art", "Drawer must provide confirmed contact email");
  assert.match(content, /contactEmail/, "Drawer must render the contact email message");
  assert.equal(arMessages["footer.contactRegions"], "لبنان · المغرب · الخليج", "Drawer must state confirmed regional presence");
  assert.match(content, /contactRegions/, "Drawer must render the regions message");
});

test("Task 31 — 5. Global Footer (Figma Node 94:18289 / 186:2072)", () => {
  const content = fs.readFileSync(path.join(root, "src/components/public/Footer.tsx"), "utf-8");

  // Dimensions & colors
  assert.match(content, /1280px|1454px/, "Footer must have confirmed container width (1280px inner or 1454px outer)");
  assert.match(content, /bg-brand-espresso/, "Footer must have confirmed dark espresso background");
  assert.match(content, /text-brand-tint/, "Footer must have confirmed light tint text");
  assert.match(content, /da60c985|texture|pattern|svg/i, "Footer must integrate background pattern texture per Figma spec");

  // 4 Columns — copy asserted against the ar catalog, key usage against the component
  // Col 1: Brand & Mission
  assert.equal(arMessages["site.brand"], "فرقة أندلسيا", "Footer Col 1 must contain band name");
  assertLocalised(
    content,
    "footer.mission",
    "مجموعة فنانين يؤمنون أن الإبداع هو الحياة والموسيقى هي الشعلة.",
    "Footer Col 1 mission statement"
  );
  assertLocalised(content, "footer.motto", "♪ من رحم المعاناة ولدت الموسيقى", "Footer Col 1 tagline");

  // Col 2: Explore
  assertLocalised(content, "footer.exploreHeading", "استكشف", "Footer Col 2 header");
  assertLocalised(content, "footer.exploreArtists", "الفنانون", "Footer Col 2 artists link");
  assertLocalised(content, "footer.exploreEvents", "الفعاليات", "Footer Col 2 events link");
  assertLocalised(content, "footer.exploreNews", "الأخبار", "Footer Col 2 news link");
  assertLocalised(content, "footer.exploreAcademy", "الأكاديمية", "Footer Col 2 academy link");

  // Col 3: Contact & Presence
  assertLocalised(content, "footer.contactHeading", "تواصل", "Footer Col 3 header");
  assertLocalised(content, "footer.contactEmail", "hello@andalusia.art", "Footer Col 3 contact email");
  assertLocalised(content, "footer.contactSocial", "Instagram · TikTok", "Footer Col 3 social channels");
  assertLocalised(content, "footer.contactRegions", "لبنان · المغرب · الخليج", "Footer Col 3 regions");

  // Col 4: Booking Pitch
  assertLocalised(content, "footer.bookingHeading", "حفلتك القادمة تبدأ من هنا.", "Footer Col 4 pitch title");
  assertLocalised(
    content,
    "footer.bookingBody",
    "نتفاعل مع الجمهور، نبني شعوراً جديداً — موسيقى، فن، مشاعر، وحدة.",
    "Footer Col 4 pitch body"
  );
  assertLocalised(content, "footer.bookingCta", "ابدأ حجزك الآن ♪", "Footer Col 4 button text");

  // Bottom Bar
  assertLocalised(content, "footer.strapline", "موسيقى · ثقافة · قدرة", "Footer bottom bar motto");
  assertLocalised(content, "footer.copyright", "© أندلسيا ٢٠٢٥ — جميع الحقوق محفوظة", "Footer bottom bar copyright");
});

test("Task 31 — 6. Public Route Group Layout & Skip Link", () => {
  const layout = fs.readFileSync(path.join(root, "src/app/[locale]/(public)/layout.tsx"), "utf-8");

  assert.match(layout, /<SkipToContent/, "Public layout must render accessible skip link");
  assert.match(layout, /<Navbar/, "Public layout must render desktop floating Navbar");
  assert.match(layout, /<MobileNavbar/, "Public layout must render mobile Navbar");
  assert.match(layout, /<main[^>]*id="main-content"/, "Public layout main element must have id='main-content'");
  assert.match(layout, /<Footer/, "Public layout must render global Footer");

  const skip = fs.readFileSync(path.join(root, "src/components/public/SkipToContent.tsx"), "utf-8");
  assert.match(skip, /href="#main-content"/, "SkipToContent must target #main-content");
  assert.match(skip, /sr-only focus:not-sr-only/, "SkipToContent must be visually hidden until focused");
});

test("Task 31 — 7. All 8 Confirmed Public Routes Exist (NO /events/[slug])", () => {
  const requiredRoutes = [
    "src/app/[locale]/(public)/page.tsx",
    "src/app/[locale]/(public)/artists/page.tsx",
    "src/app/[locale]/(public)/artists/[slug]/page.tsx",
    "src/app/[locale]/(public)/events/page.tsx",
    "src/app/[locale]/(public)/academy/page.tsx",
    "src/app/[locale]/(public)/news/page.tsx",
    "src/app/[locale]/(public)/news/[slug]/page.tsx",
    "src/app/[locale]/(public)/booking/page.tsx",
  ];

  for (const route of requiredRoutes) {
    assert.ok(fs.existsSync(path.join(root, route)), `Route file must exist: ${route}`);
  }

  // Strict architectural requirement from user prompt: NO /events/[slug]
  const forbiddenRoute = path.join(root, "src/app/[locale]/(public)/events/[slug]");
  assert.ok(
    !fs.existsSync(forbiddenRoute),
    "Architecture strictly prohibits /events/[slug] route (all event actions route to /booking)"
  );
});
