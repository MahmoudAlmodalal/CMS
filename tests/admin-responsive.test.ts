import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf-8");

test("Responsive Admin — 1. Navigation & Shell Layout", () => {
  const shell = read("src/components/admin/AdminShell.tsx");
  const header = read("src/components/admin/AdminHeader.tsx");
  const sidebar = read("src/components/admin/AdminSidebar.tsx");

  // Mobile drawer takes w-[85vw] max-w-xs with safe-area inset pb-safe
  assert.match(shell, /w-\[85vw\]\s+max-w-xs/);
  assert.match(shell, /pb-safe/);
  assert.match(shell, /min-h-\[44px\]\s+min-w-\[44px\]/);

  // Header truncates breadcrumbs on narrow viewports
  assert.match(header, /max-w-\[160px\]\s+sm:max-w-none\s+truncate/);
  assert.match(header, /min-h-\[44px\]\s+min-w-\[44px\]/);

  // Sidebar supports responsive tablet icon-only variant
  assert.match(sidebar, /variant\?: "full" \| "responsive"/);
  assert.match(sidebar, /w-16\s+lg:w-64/);
});

test("Responsive Admin — 2. Dashboard Stat Cards & Action Grid", () => {
  const page = read("src/app/(admin)/admin/page.tsx");

  // Stat cards scale down padding and numerical digits on mobile
  assert.match(page, /p-4\s+sm:p-5/);
  assert.match(page, /text-2xl\s+sm:text-3xl/);
  assert.match(page, /grid-cols-1\s+sm:grid-cols-2\s+lg:grid-cols-3\s+xl:grid-cols-5/);

  // Quick actions stack in 2-column compact grid on mobile
  assert.match(page, /grid-cols-2\s+sm:grid-cols-2\s+lg:grid-cols-3/);
});

test("Responsive Admin — 3. Data Tables & List Views", () => {
  const table = read("src/components/ui/Table.tsx");
  const bookings = read("src/components/admin/BookingsTable.tsx");
  const subscribers = read("src/components/admin/SubscribersTable.tsx");

  // Table has table-scrollbar and gradient edge mask
  assert.match(table, /table-scrollbar/);
  assert.match(table, /mask-image:linear-gradient/);

  // BookingsTable has mobile card view (<640px) and desktop table (>=640px)
  assert.match(bookings, /block\s+sm:hidden/);
  assert.match(bookings, /hidden\s+sm:block/);
  assert.match(bookings, /<Table>/);

  // SubscribersTable has mobile card view (<640px) and desktop table (>=640px)
  assert.match(subscribers, /block\s+sm:hidden/);
  assert.match(subscribers, /hidden\s+sm:block/);
});

test("Responsive Admin — 4. Modal Dialogs & Form Editors", () => {
  const kit = read("src/components/admin/ManagerKit.tsx");
  const artists = read("src/components/admin/ArtistsManager.tsx");

  // ModalShell adjusts to full screen sheet on mobile
  assert.match(kit, /w-full\s+sm:w-\[calc\(100vw-2rem\)\]/);
  assert.match(kit, /rounded-none\s+sm:rounded-2xl/);
  assert.match(kit, /max-h-screen\s+sm:max-h-\[90vh\]/);

  // ModalActions component exists and is sticky on mobile
  assert.match(kit, /export function ModalActions/);
  assert.match(kit, /sticky\s+bottom-0/);

  // BilingualField stacks on small screens
  assert.match(kit, /grid-cols-1\s+md:grid-cols-2/);

  // ArtistsManager uses ModalActions
  assert.match(artists, /<ModalActions>/);
});

test("Responsive Admin — 5. Split-View Editors & Live Previews", () => {
  const pages = read("src/components/admin/pages/PagesEditor.tsx");
  const settings = read("src/components/admin/SiteSettingsForm.tsx");

  // PagesEditor tab bar scrolls horizontally on mobile
  assert.match(pages, /flex-nowrap\s+overflow-x-auto\s+no-scrollbar/);

  // PagesEditor floating preview button and mobile drawer
  assert.match(pages, /عرض المعاينة/);
  assert.match(pages, /fixed bottom-6 end-6/);
  assert.match(pages, /mobilePreviewOpen/);

  // SiteSettingsForm floating preview button and mobile drawer
  assert.match(settings, /عرض المعاينة/);
  assert.match(settings, /previewOpen/);
});

test("Responsive Admin — 6. Media Library Grid & Upload Zones", () => {
  const grid = read("src/components/admin/media/MediaFileGrid.tsx");
  const upload = read("src/components/admin/media/MediaUploadZone.tsx");

  // MediaFileGrid 6-column scale
  assert.match(grid, /grid-cols-2\s+sm:grid-cols-3\s+md:grid-cols-4\s+lg:grid-cols-5\s+xl:grid-cols-6\s+gap-3/);

  // Upload zone reduced padding on mobile
  assert.match(upload, /py-6\s+sm:py-12\s+px-4\s+sm:px-8/);
});

test("Responsive Admin — 7. Touch Targets & RTL Layout", () => {
  const css = read("src/app/globals.css");
  const shell = read("src/components/admin/AdminShell.tsx");

  // RTL drawer animation in CSS
  assert.match(css, /@keyframes drawer-slide-in-rtl/);
  assert.match(css, /\[dir="rtl"\]\s+\.slide-in-from-start/);
  assert.match(css, /\.pb-safe/);
  assert.match(css, /\.table-scrollbar/);

  // Shell uses dir="rtl"
  assert.match(shell, /dir="rtl"/);
  assert.match(shell, /start-0/);
});
