import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { CANONICAL_ADMIN_ROUTES, ADMIN_NAV_SECTIONS, getAdminBreadcrumbs } from "../src/components/admin/adminNavConfig.ts";

test("Task 41 — 1. Canonical Admin Routes & Page Files Existence", () => {
  const expectedRoutes = [
    { path: "src/app/(admin)/admin/page.tsx", canonicalHref: "/admin", title: "الرئيسية" },
    { path: "src/app/(admin)/admin/artists/page.tsx", canonicalHref: "/admin/artists", title: "الفنانون" },
    { path: "src/app/(admin)/admin/tracks/page.tsx", canonicalHref: "/admin/tracks", title: "المقاطع الموسيقية" },
    { path: "src/app/(admin)/admin/releases/page.tsx", canonicalHref: "/admin/releases", title: "الإصدارات" },
    { path: "src/app/(admin)/admin/events/page.tsx", canonicalHref: "/admin/events", title: "الفعاليات" },
    { path: "src/app/(admin)/admin/academy/page.tsx", canonicalHref: "/admin/academy", title: "الأكاديمية" },
    { path: "src/app/(admin)/admin/articles/page.tsx", canonicalHref: "/admin/articles", title: "المقالات والأخبار" },
    { path: "src/app/(admin)/admin/testimonials/page.tsx", canonicalHref: "/admin/testimonials", title: "الآراء والشهادات" },
    { path: "src/app/(admin)/admin/bookings/page.tsx", canonicalHref: "/admin/bookings", title: "طلبات الحجز" },
    { path: "src/app/(admin)/admin/subscribers/page.tsx", canonicalHref: "/admin/subscribers", title: "القائمة البريدية" },
    { path: "src/app/(admin)/admin/media/page.tsx", canonicalHref: "/admin/media", title: "مكتبة الوسائط" },
    { path: "src/app/(admin)/admin/settings/page.tsx", canonicalHref: "/admin/settings", title: "إعدادات الموقع" },
  ];

  assert.strictEqual(expectedRoutes.length, 12, "Must specify exactly 12 canonical admin routes");

  for (const route of expectedRoutes) {
    const fullPath = path.resolve(route.path);
    assert.ok(fs.existsSync(fullPath), `Canonical admin route file must exist: ${route.path}`);

    const fileContent = fs.readFileSync(fullPath, "utf-8");
    assert.ok(
      fileContent.includes("export default function") || fileContent.includes("export default async function"),
      `Page must export default function component: ${route.path}`
    );
  }
});

test("Task 41 — 2. Layer 2 Security Guard in Admin Layout", () => {
  const layoutPath = path.resolve("src/app/(admin)/admin/layout.tsx");
  assert.ok(fs.existsSync(layoutPath), "Admin layout must exist");

  const layoutContent = fs.readFileSync(layoutPath, "utf-8");

  // Server-side auth guard assertions
  assert.ok(layoutContent.includes("createClient()"), "Admin layout must use cookie-aware createClient");
  assert.ok(layoutContent.includes("supabase.auth.getUser()"), "Admin layout must verify user via getUser()");
  assert.ok(!layoutContent.includes(".getSession()"), "Admin layout must never invoke unverified .getSession()");
  assert.ok(layoutContent.includes("user.app_metadata?.role !== \"admin\""), "Admin layout must verify admin role claim");
  assert.ok(layoutContent.includes("redirect(\"/login\")"), "Admin layout must redirect unauthorized users to /login");

  // Metadata assertions
  assert.ok(layoutContent.includes("index: false"), "Admin layout must enforce robots noindex");
  assert.ok(layoutContent.includes("follow: false"), "Admin layout must enforce robots nofollow");
  assert.ok(layoutContent.includes("AdminShell"), "Admin layout must render AdminShell component");
});

test("Task 41 — 3. Admin Navigation Config & Section Grouping", () => {
  assert.strictEqual(CANONICAL_ADMIN_ROUTES.length, 12, "CANONICAL_ADMIN_ROUTES must have 12 entries");

  // Verify all sections exist
  const sectionTitles = ADMIN_NAV_SECTIONS.map((s) => s.title);
  assert.ok(sectionTitles.includes("نظرة عامة"), "Must include overview section");
  assert.ok(sectionTitles.includes("المحتوى الفني"), "Must include artistic content section");
  assert.ok(sectionTitles.includes("الأنشطة والتعليم"), "Must include activities/education section");
  assert.ok(sectionTitles.includes("التواصل والجمهور"), "Must include audience/CRM section");
  assert.ok(sectionTitles.includes("النظام والإعدادات"), "Must include system/settings section");

  // Verify total navigation items in sections match canonical routes
  const totalItems = ADMIN_NAV_SECTIONS.reduce((acc, s) => acc + s.items.length, 0);
  assert.strictEqual(totalItems, 12, "Sections must collectively contain all 12 canonical routes");
});

test("Task 41 — 4. Dynamic Breadcrumbs Resolution Logic", () => {
  // Test root /admin
  const rootCrumbs = getAdminBreadcrumbs("/admin");
  assert.strictEqual(rootCrumbs.length, 1);
  assert.strictEqual(rootCrumbs[0].label, "لوحة التحكم");

  // Test child routes
  const artistsCrumbs = getAdminBreadcrumbs("/admin/artists");
  assert.strictEqual(artistsCrumbs.length, 2);
  assert.strictEqual(artistsCrumbs[0].label, "لوحة التحكم");
  assert.strictEqual(artistsCrumbs[0].href, "/admin");
  assert.strictEqual(artistsCrumbs[1].label, "الفنانون");
  assert.strictEqual(artistsCrumbs[1].href, "/admin/artists");

  const bookingsCrumbs = getAdminBreadcrumbs("/admin/bookings");
  assert.strictEqual(bookingsCrumbs.length, 2);
  assert.strictEqual(bookingsCrumbs[1].label, "طلبات الحجز");

  const mediaCrumbs = getAdminBreadcrumbs("/admin/media");
  assert.strictEqual(mediaCrumbs.length, 2);
  assert.strictEqual(mediaCrumbs[1].label, "مكتبة الوسائط");

  // Test subpath
  const subpathCrumbs = getAdminBreadcrumbs("/admin/artists/new");
  assert.strictEqual(subpathCrumbs.length, 2);
  assert.strictEqual(subpathCrumbs[1].label, "الفنانون");
});

test("Task 41 — 5. Admin Shell, Sidebar & Header Component Architecture", () => {
  const sidebarPath = path.resolve("src/components/admin/AdminSidebar.tsx");
  const headerPath = path.resolve("src/components/admin/AdminHeader.tsx");
  const shellPath = path.resolve("src/components/admin/AdminShell.tsx");
  const breadcrumbsPath = path.resolve("src/components/admin/AdminBreadcrumbs.tsx");

  assert.ok(fs.existsSync(sidebarPath), "AdminSidebar must exist");
  assert.ok(fs.existsSync(headerPath), "AdminHeader must exist");
  assert.ok(fs.existsSync(shellPath), "AdminShell must exist");
  assert.ok(fs.existsSync(breadcrumbsPath), "AdminBreadcrumbs must exist");

  const sidebarSrc = fs.readFileSync(sidebarPath, "utf-8");
  assert.ok(sidebarSrc.includes("<aside"), "Sidebar must use semantic <aside> element");
  assert.ok(sidebarSrc.includes("usePathname"), "Sidebar must detect active routes via usePathname");
  assert.ok(sidebarSrc.includes("عرض الموقع العام"), "Sidebar must include link to public site");
  assert.ok(sidebarSrc.includes('href="/"'), "Public site link must target '/'");

  const headerSrc = fs.readFileSync(headerPath, "utf-8");
  assert.ok(headerSrc.includes("<header"), "Header must use semantic <header> element");
  assert.ok(headerSrc.includes("AdminBreadcrumbs"), "Header must embed AdminBreadcrumbs");
  assert.ok(headerSrc.includes("LogoutButton"), "Header must embed LogoutButton");
  assert.ok(headerSrc.includes("مدير النظام"), "Header must display admin role badge");

  const shellSrc = fs.readFileSync(shellPath, "utf-8");
  assert.ok(shellSrc.includes("<main"), "Shell must contain semantic <main> element");
  assert.ok(shellSrc.includes('dir="rtl"'), "Shell must enforce RTL direction");
  assert.ok(shellSrc.includes("AdminSidebar"), "Shell must embed AdminSidebar");
  assert.ok(shellSrc.includes("AdminHeader"), "Shell must embed AdminHeader");
});

test("Task 41 — 6. Loading States, Error Boundary & Unauthorized Fallbacks", () => {
  const loadingPath = path.resolve("src/app/(admin)/admin/loading.tsx");
  const errorPath = path.resolve("src/app/(admin)/admin/error.tsx");
  const unauthorizedPath = path.resolve("src/app/(admin)/admin/unauthorized.tsx");

  assert.ok(fs.existsSync(loadingPath), "Admin loading.tsx must exist");
  assert.ok(fs.existsSync(errorPath), "Admin error.tsx must exist");
  assert.ok(fs.existsSync(unauthorizedPath), "Admin unauthorized.tsx must exist");

  const loadingSrc = fs.readFileSync(loadingPath, "utf-8");
  assert.ok(loadingSrc.includes("animate-pulse"), "Loading state must include skeleton pulse animation");
  assert.ok(loadingSrc.includes('aria-busy="true"'), "Loading state must include accessible aria-busy attribute");

  const errorSrc = fs.readFileSync(errorPath, "utf-8");
  assert.ok(errorSrc.includes("'use client'") || errorSrc.includes('"use client"'), "Error boundary must be a Client Component");
  assert.ok(errorSrc.includes("reset"), "Error boundary must provide retry mechanism via reset callback");
  assert.ok(errorSrc.includes("حدث خطأ غير متوقع"), "Error boundary must display friendly Arabic error message");

  const unauthorizedSrc = fs.readFileSync(unauthorizedPath, "utf-8");
  assert.ok(unauthorizedSrc.includes("غير مصرح لك بالوصول"), "Unauthorized page must display clear Arabic message");
});
