import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  toArabicDigits,
  toWesternDigits,
  formatCurrency,
  formatArabicDate,
  formatHijriDate,
  formatPhoneNumber,
  formatUrlForDisplay,
} from "../src/lib/formatters.ts";

test("RTL Foundation — 1. Arabic Characters and Typography", () => {
  const sampleArabic = "جادك الغيث إذا الغيث همى يا زمان الوصل بالأندلس";
  const arabicRegex = /^[\u0600-\u06FF\s]+$/;

  assert.ok(arabicRegex.test(sampleArabic), "Sample text should only contain valid Arabic unicode characters");
  assert.ok(sampleArabic.includes("الأندلس"), "Arabic ligatures (Lam-Alef) preserve proper encoding");

  // Verify Root Layout sets Arabic lang and RTL dir
  const layoutContent = fs.readFileSync(path.resolve("src/app/layout.tsx"), "utf-8");
  assert.ok(layoutContent.includes('lang="ar"'), 'Root HTML layout must declare lang="ar"');
  assert.ok(layoutContent.includes('dir="rtl"'), 'Root HTML layout must declare dir="rtl"');
  assert.ok(layoutContent.includes("Cairo"), "Layout must configure Cairo font for Arabic body typography");
  // Display titles use the --font-display stack (Qahwa Arabic, Cairo fallback) defined
  // in globals.css — Figma specifies Qahwa/Cairo, not a third calligraphic face.
  // (Aref_Ruqaa was removed: absent from Figma and broke the Turbopack build.)
  const cssContent = fs.readFileSync(path.resolve("src/app/globals.css"), "utf-8");
  assert.ok(cssContent.includes("--font-display"), "Theme must define --font-display for display titles");
  assert.ok(cssContent.includes("Qahwa Arabic"), "Display stack must prefer Qahwa Arabic per Figma");
  assert.ok(layoutContent.includes("DM_Mono"), "Layout must configure DM_Mono for dates and tabular numerals");
});

test("RTL Foundation — 2. Numbers & Numerical Localization", () => {
  // Digit conversions
  assert.strictEqual(toArabicDigits(1420), "١٤٢٠");
  assert.strictEqual(toArabicDigits("2026"), "٢٠٢٦");
  assert.strictEqual(toWesternDigits("٢٠٢٦"), "2026");
  assert.strictEqual(toWesternDigits("١٤٤٧"), "1447");

  // Currency placement
  const currencyWestern = formatCurrency(250, "د.أ", false);
  assert.ok(currencyWestern.includes("250"), "Currency formatting includes numerical amount");
  assert.ok(currencyWestern.includes("د.أ"), "Currency formatting includes Arabic dinar symbol");

  const currencyEastern = formatCurrency(250, "د.أ", true);
  assert.ok(currencyEastern.includes("٢٥٠"), "Eastern currency formatting includes Eastern Arabic digits");
});

test("RTL Foundation — 3. Dates (Gregorian & Hijri Calendars)", () => {
  const testDate = new Date("2026-09-10T12:00:00Z");

  // Gregorian in Arabic
  const gregorian = formatArabicDate(testDate);
  assert.ok(gregorian.includes("سبتمبر") || gregorian.includes("٩"), "Gregorian date formatted in Arabic");
  assert.ok(gregorian.includes("٢٠٢٦") || gregorian.includes("2026"), "Gregorian year present");

  // Hijri in Arabic
  const hijri = formatHijriDate(testDate);
  assert.ok(hijri.length > 0, "Hijri date formatted successfully");
  assert.ok(hijri.includes("١٤٤") || hijri.includes("144"), "Hijri century year present");
});

test("RTL Foundation — 4. Mixed Arabic/English Content & Bidi Isolation", () => {
  // Test phrase with Latin embedded inside Arabic
  const lead = "أقامت فرقة";
  const latin = "Andalusia Ensemble";
  const trail = "حفلاً موسيقياً في قصر الحمراء عام (2026).";

  // Check that Bidi.tsx exists and encapsulates bdi wrapper
  const bidiContent = fs.readFileSync(path.resolve("src/components/ui/Bidi.tsx"), "utf-8");
  assert.ok(bidiContent.includes("<bdi"), "Bidi component must utilize native <bdi> element");
  assert.ok(bidiContent.includes("unicodeBidi"), "Bidi component applies unicodeBidi: isolate");
  assert.ok(bidiContent.includes("MixedText"), "MixedText component handles Latin phrases safely");

  // Verify globals.css bdi helper
  const cssContent = fs.readFileSync(path.resolve("src/app/globals.css"), "utf-8");
  assert.ok(cssContent.includes("unicode-bidi: isolate;"), "globals.css enforces unicode-bidi isolate");
});

test("RTL Foundation — 5. URL Display Safety", () => {
  const url = "https://andalusia-band.com/ar/concerts/granada-night-2026?token=vip#booking";
  const parsed = formatUrlForDisplay(url);

  assert.strictEqual(parsed.domain, "andalusia-band.com");
  assert.strictEqual(parsed.full, url);

  const bidiContent = fs.readFileSync(path.resolve("src/components/ui/Bidi.tsx"), "utf-8");
  assert.ok(bidiContent.includes('dir="ltr"'), 'UrlDisplay explicitly enforces dir="ltr"');
});

test("RTL Foundation — 6. Phone Numbers Formatting & Bidi Stability", () => {
  const phone = "+962 7 9123 4567";
  const formatted = formatPhoneNumber(phone);

  assert.strictEqual(formatted.display, phone);
  assert.ok(formatted.ltrHtml.includes('dir="ltr"'), "Phone HTML must enforce dir=ltr to prevent plus-sign inversion");

  const formContent = fs.readFileSync(path.resolve("src/components/ui/Form.tsx"), "utf-8");
  assert.ok(formContent.includes("PhoneInput"), "PhoneInput component exists for safe telephone entry");
  assert.ok(formContent.includes('dir="ltr"'), "PhoneInput isolates digits in LTR context");
});

test("RTL Foundation — 7. Logical CSS Properties & No Manual Reversal Hacks", () => {
  // Verify UI components use logical CSS properties (ps-, pe-, ms-, me-, start-, end-)
  const formContent = fs.readFileSync(path.resolve("src/components/ui/Form.tsx"), "utf-8");
  assert.ok(formContent.includes("start-0") || formContent.includes("inset-y-0 start-0"), "Form inputs position icons with start-0");
  assert.ok(formContent.includes("end-0"), "Form inputs position icons with end-0");
  assert.ok(formContent.includes("ps-") && formContent.includes("pe-"), "Form inputs use logical padding ps- and pe-");
  assert.ok(formContent.includes("border-e"), "PhoneInput uses logical border-e for prefix separation");

  const cardContent = fs.readFileSync(path.resolve("src/components/ui/Card.tsx"), "utf-8");
  assert.ok(cardContent.includes("start-4") || cardContent.includes("end-4"), "Card badges use logical positioning start-4 / end-4");
  assert.ok(cardContent.includes("text-start"), "Card components default to logical text-start alignment");

  const drawerContent = fs.readFileSync(path.resolve("src/components/ui/Drawer.tsx"), "utf-8");
  assert.ok(drawerContent.includes("start-0") || drawerContent.includes("end-0"), "Drawer uses logical positioning start-0 / end-0");

  const tableContent = fs.readFileSync(path.resolve("src/components/ui/Table.tsx"), "utf-8");
  assert.ok(tableContent.includes("text-start"), "Table cells default to logical text-start alignment");

  // Verify Directional Icons mirror while Universal Icons do not
  const iconsContent = fs.readFileSync(path.resolve("src/components/ui/Icons.tsx"), "utf-8");
  assert.ok(iconsContent.includes("rtl:-scale-x-100"), "Directional icons mirror horizontally with rtl:-scale-x-100");
  assert.ok(iconsContent.includes("ArrowEndIcon"), "ArrowEndIcon exists");
  assert.ok(iconsContent.includes("ArrowStartIcon"), "ArrowStartIcon exists");
  assert.ok(iconsContent.includes("ChevronEndIcon"), "ChevronEndIcon exists");
  assert.ok(iconsContent.includes("ChevronStartIcon"), "ChevronStartIcon exists");
  assert.ok(iconsContent.includes("UndoIcon"), "UndoIcon exists");
});

test("RTL Foundation — 8. English LTR Extensibility Architecture", () => {
  const dirContent = fs.readFileSync(path.resolve("src/lib/direction.tsx"), "utf-8");
  assert.ok(dirContent.includes("DirectionProvider"), "DirectionProvider manages document direction");
  assert.ok(dirContent.includes("useDirection"), "useDirection hook exposes direction and toggle capability");
  assert.ok(dirContent.includes('document.documentElement.setAttribute("dir"'), "Provider synchronizes HTML dir attribute dynamically");
});
