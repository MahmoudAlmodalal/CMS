import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".");

test("Task 31 — 1. Public Shell Component Architecture & Files", () => {
  const expectedFiles = [
    "src/components/public/Navbar.tsx",
    "src/components/public/MobileNavbar.tsx",
    "src/components/public/MobileDrawer.tsx",
    "src/components/public/Footer.tsx",
    "src/components/public/SkipToContent.tsx",
    "src/components/public/index.ts",
    "src/app/(public)/layout.tsx",
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
});

test("Task 31 — 2. Desktop Floating Navbar (Figma Frame 7: 1123x85, r=32)", () => {
  const content = fs.readFileSync(path.join(root, "src/components/public/Navbar.tsx"), "utf-8");

  // Floating pill dimensions & radius
  assert.match(content, /1123px/, "Navbar must enforce Figma confirmed width: 1123px");
  assert.match(content, /85px/, "Navbar must enforce Figma confirmed height: 85px");
  assert.match(content, /rounded-\[32px\]/, "Navbar must enforce Figma confirmed corner radius: 32px");
  assert.match(content, /fixed top-6/, "Navbar must be floating at top on desktop");
  assert.match(content, /hidden lg:flex/, "Navbar must be desktop-only (hidden on mobile)");

  // Brand identity
  assert.match(content, /فرقة أندلسيا/, "Navbar must display confirmed band name");
  assert.match(content, /href="\/"/, "Navbar brand logo must link to root route /");

  // 5 Confirmed Navigation links
  const expectedLinks = [
    { label: "الرئيسية", href: "/" },
    { label: "الأكاديمية", href: "/academy" },
    { label: "الفنانين", href: "/artists" },
    { label: "الأخبار", href: "/news" },
    { label: "الفعاليات", href: "/events" },
  ];

  for (const item of expectedLinks) {
    assert.ok(content.includes(item.label), `Navbar must include link label "${item.label}"`);
    assert.ok(content.includes(item.href), `Navbar must route to "${item.href}"`);
  }

  // CTA button
  assert.match(content, /أحجز الآن/, "Navbar must include confirmed CTA label 'أحجز الآن'");
  assert.match(content, /href="\/booking"/, "Navbar CTA must direct to /booking");

  // Direction / Language Switcher
  assert.match(content, /toggleDirection/, "Navbar must include direction toggle for RTL/LTR support");
});

test("Task 31 — 3. Mobile Top Bar (Figma Component 17: 56px)", () => {
  const content = fs.readFileSync(path.join(root, "src/components/public/MobileNavbar.tsx"), "utf-8");

  assert.match(content, /lg:hidden/, "Mobile top bar must be mobile-only (hidden on desktop)");
  assert.match(content, /h-14|h-16/, "Mobile top bar must maintain 56px height specification");
  assert.match(content, /فرقة أندلسيا/, "Mobile top bar must display band name");
  assert.match(content, /احجز الآن/, "Mobile top bar must include quick booking CTA");
  assert.match(content, /href="\/booking"/, "Mobile top bar CTA must link to /booking");
  assert.match(content, /aria-label="فتح القائمة الرئيسية"/, "Mobile top bar must include accessible trigger");
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
  assert.match(content, /ابدأ حجزك الآن ♪/, "Drawer must contain confirmed full-width CTA 'ابدأ حجزك الآن ♪'");
  assert.match(content, /href="\/booking"/, "Drawer CTA must direct to /booking");

  // Contact info
  assert.match(content, /hello@andalusia\.art/, "Drawer must provide confirmed contact email");
  assert.match(content, /لبنان · المغرب · الخليج/, "Drawer must state confirmed regional presence");
});

test("Task 31 — 5. Global Footer (Figma Node 94:18289 / 186:2072)", () => {
  const content = fs.readFileSync(path.join(root, "src/components/public/Footer.tsx"), "utf-8");

  // Dimensions & colors
  assert.match(content, /1280px/, "Footer must have 1280px inner container");
  assert.match(content, /bg-brand-espresso/, "Footer must have confirmed dark espresso background");
  assert.match(content, /text-brand-tint/, "Footer must have confirmed light tint text");

  // 4 Columns
  // Col 1: Brand & Mission
  assert.match(content, /فرقة أندلسيا/, "Footer Col 1 must contain band name");
  assert.match(
    content,
    /مجموعة فنانين يؤمنون أن الإبداع هو الحياة والموسيقى هي الشعلة/,
    "Footer Col 1 must contain confirmed mission statement"
  );
  assert.match(content, /♪ من رحم المعاناة ولدت الموسيقى/, "Footer Col 1 must contain confirmed tagline");

  // Col 2: Explore
  assert.match(content, /استكشف/, "Footer Col 2 must contain 'استكشف' header");
  assert.match(content, /الفنانون/, "Footer Col 2 must link to artists");
  assert.match(content, /الفعاليات/, "Footer Col 2 must link to events");
  assert.match(content, /الأخبار/, "Footer Col 2 must link to news");
  assert.match(content, /الأكاديمية/, "Footer Col 2 must link to academy");

  // Col 3: Contact & Presence
  assert.match(content, /تواصل/, "Footer Col 3 must contain 'تواصل' header");
  assert.match(content, /hello@andalusia\.art/, "Footer Col 3 must display confirmed contact email");
  assert.match(content, /Instagram · TikTok/, "Footer Col 3 must list confirmed social channels");
  assert.match(content, /لبنان · المغرب · الخليج/, "Footer Col 3 must display confirmed regions");

  // Col 4: Booking Pitch
  assert.match(content, /حفلتك القادمة تبدأ من هنا\./, "Footer Col 4 must contain confirmed pitch title");
  assert.match(
    content,
    /نتفاعل مع الجمهور، نبني شعوراً جديداً/,
    "Footer Col 4 must contain confirmed pitch body"
  );
  assert.match(content, /ابدأ حجزك الآن ♪/, "Footer Col 4 must contain confirmed button text");

  // Bottom Bar
  assert.match(content, /موسيقى · ثقافة · قدرة/, "Footer bottom bar must contain confirmed motto");
  assert.match(content, /© أندلسيا ٢٠٢٥ — جميع الحقوق محفوظة/, "Footer bottom bar must contain copyright");
});

test("Task 31 — 6. Public Route Group Layout & Skip Link", () => {
  const layout = fs.readFileSync(path.join(root, "src/app/(public)/layout.tsx"), "utf-8");

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
    "src/app/(public)/page.tsx",
    "src/app/(public)/artists/page.tsx",
    "src/app/(public)/artists/[slug]/page.tsx",
    "src/app/(public)/events/page.tsx",
    "src/app/(public)/academy/page.tsx",
    "src/app/(public)/news/page.tsx",
    "src/app/(public)/news/[slug]/page.tsx",
    "src/app/(public)/booking/page.tsx",
  ];

  for (const route of requiredRoutes) {
    assert.ok(fs.existsSync(path.join(root, route)), `Route file must exist: ${route}`);
  }

  // Strict architectural requirement from user prompt: NO /events/[slug]
  const forbiddenRoute = path.join(root, "src/app/(public)/events/[slug]");
  assert.ok(
    !fs.existsSync(forbiddenRoute),
    "Architecture strictly prohibits /events/[slug] route (all event actions route to /booking)"
  );
});
