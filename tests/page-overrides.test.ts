import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf-8");

/**
 * Extract generateMetadata function source code from a page file.
 */
function getGenerateMetadataSource(fileContent: string): string {
  const startIdx = fileContent.indexOf("export async function generateMetadata");
  assert.ok(startIdx !== -1, "generateMetadata function must be exported");
  const rest = fileContent.slice(startIdx);
  const nextExportIdx = rest.indexOf("export default");
  return nextExportIdx !== -1 ? rest.slice(0, nextExportIdx) : rest;
}

test("1. SEO overrides in generateMetadata across 5 public pages", () => {
  const pages = [
    {
      path: "src/app/[locale]/(public)/page.tsx",
      titleField: "seo_home_title",
      descField: "seo_home_description",
      fallbackTitleKey: "homeTitle",
      fallbackDescKey: "homeDescription",
    },
    {
      path: "src/app/[locale]/(public)/events/page.tsx",
      titleField: "seo_events_title",
      descField: "seo_events_description",
      fallbackTitleKey: "eventsTitle",
      fallbackDescKey: "eventsDescription",
    },
    {
      path: "src/app/[locale]/(public)/news/page.tsx",
      titleField: "seo_news_title",
      descField: "seo_news_description",
      fallbackTitleKey: "newsTitle",
      fallbackDescKey: "newsDescription",
    },
    {
      path: "src/app/[locale]/(public)/artists/page.tsx",
      titleField: "seo_artists_title",
      descField: "seo_artists_description",
      fallbackTitleKey: "artistsTitle",
      fallbackDescKey: "artistsDescription",
    },
    {
      path: "src/app/[locale]/(public)/academy/page.tsx",
      titleField: "seo_academy_title",
      descField: "seo_academy_description",
      fallbackTitleKey: "academyTitle",
      fallbackDescKey: "academyDescription",
    },
  ];

  for (const page of pages) {
    const src = read(page.path);
    const metaFn = getGenerateMetadataSource(src);

    // Must call setRequestLocale(locale) so getContentLocale resolves in RSC / static build
    assert.match(
      metaFn,
      /setRequestLocale\(locale\)/,
      `${page.path} generateMetadata must call setRequestLocale(locale)`
    );

    // Must call getSiteSettings
    assert.match(
      metaFn,
      /getSiteSettings\(\)/,
      `${page.path} generateMetadata must call getSiteSettings()`
    );

    // References matching seo_*_title and seo_*_description
    assert.match(
      metaFn,
      new RegExp(`\\b${page.titleField}\\b`),
      `${page.path} generateMetadata must reference ${page.titleField}`
    );
    assert.match(
      metaFn,
      new RegExp(`\\b${page.descField}\\b`),
      `${page.path} generateMetadata must reference ${page.descField}`
    );

    // Still references i18n fallback translations
    assert.match(
      metaFn,
      new RegExp(`t\\(["']${page.fallbackTitleKey}["']\\)`),
      `${page.path} generateMetadata must reference i18n fallback title "${page.fallbackTitleKey}"`
    );
    assert.match(
      metaFn,
      new RegExp(`t\\(["']${page.fallbackDescKey}["']\\)`),
      `${page.path} generateMetadata must reference i18n fallback description "${page.fallbackDescKey}"`
    );
  }
});

test("2. Filter 'all' label overrides and prop threading", () => {
  // EventsFilterTabs component accepts allLabel
  const eventsTabs = read("src/components/public/events/EventsFilterTabs.tsx");
  assert.match(
    eventsTabs,
    /allLabel\?: string \| null/,
    "EventsFilterTabsProps must declare optional allLabel?: string | null"
  );
  assert.match(
    eventsTabs,
    /allLabel/,
    "EventsFilterTabs component must accept allLabel"
  );
  assert.match(
    eventsTabs,
    /tab\.id === ["']all["']\s*&&\s*allLabel\?\.trim\(\)/,
    "EventsFilterTabs must use trimmed allLabel only when id is 'all' and value is non-blank"
  );

  // EventsCatalogView threads allLabel
  const eventsCatalog = read("src/components/public/events/EventsCatalogView.tsx");
  assert.match(
    eventsCatalog,
    /allLabel\?: string \| null/,
    "EventsCatalogViewProps must declare optional allLabel?: string | null"
  );
  assert.match(
    eventsCatalog,
    /<EventsFilterTabs[\s\S]*?allLabel=\{allLabel\}/,
    "EventsCatalogView must pass allLabel to EventsFilterTabs"
  );

  // events/page.tsx passes settings.events_filter_all_label
  const eventsPage = read("src/app/[locale]/(public)/events/page.tsx");
  assert.match(
    eventsPage,
    /<EventsCatalogView[\s\S]*?allLabel=\{settings\.events_filter_all_label\}/,
    "events/page.tsx must pass settings.events_filter_all_label to EventsCatalogView"
  );

  // ArtistFilterTabs component accepts allLabel
  const artistTabs = read("src/components/public/ArtistFilterTabs.tsx");
  assert.match(
    artistTabs,
    /allLabel\?: string \| null/,
    "ArtistFilterTabsProps must declare optional allLabel?: string | null"
  );
  assert.match(
    artistTabs,
    /allLabel/,
    "ArtistFilterTabs component must accept allLabel"
  );
  assert.match(
    artistTabs,
    /cat\.id === ["']all["']\s*&&\s*allLabel\?\.trim\(\)/,
    "ArtistFilterTabs must use trimmed allLabel only when id is 'all' and value is non-blank"
  );

  // ArtistsDirectoryClient threads allLabel
  const artistClient = read("src/components/public/ArtistsDirectoryClient.tsx");
  assert.match(
    artistClient,
    /allLabel\?: string \| null/,
    "ArtistsDirectoryClientProps must declare optional allLabel?: string | null"
  );
  assert.match(
    artistClient,
    /<ArtistFilterTabs[\s\S]*?allLabel=\{allLabel\}/,
    "ArtistsDirectoryClient must pass allLabel to ArtistFilterTabs"
  );

  // artists/page.tsx passes settings.artists_filter_all_label
  const artistsPage = read("src/app/[locale]/(public)/artists/page.tsx");
  assert.match(
    artistsPage,
    /<ArtistsDirectoryClient[\s\S]*?allLabel=\{settings\.artists_filter_all_label\}/,
    "artists/page.tsx must pass settings.artists_filter_all_label to ArtistsDirectoryClient"
  );
});

test("3. Booking CTA override and prop threading on BookingBanner", () => {
  const bookingBanner = read("src/components/public/BookingBanner.tsx");

  // BookingBanner accepts ctaLabel prop
  assert.match(
    bookingBanner,
    /ctaLabel\?: string \| null/,
    "BookingBannerProps must declare optional ctaLabel?: string | null"
  );
  assert.match(
    bookingBanner,
    /ctaLabel/,
    "BookingBanner component must accept ctaLabel parameter"
  );

  // Fallback to current t("bookingCta")
  assert.match(
    bookingBanner,
    /t\(["']bookingCta["']\)/,
    "BookingBanner must still fall back to t('bookingCta')"
  );

  // Home page passes settings.booking_cta_label
  const homePage = read("src/app/[locale]/(public)/page.tsx");
  assert.match(
    homePage,
    /<BookingBanner[\s\S]*?ctaLabel=\{settings\.booking_cta_label\}/,
    "HomePage must pass ctaLabel={settings.booking_cta_label} to BookingBanner"
  );
});
