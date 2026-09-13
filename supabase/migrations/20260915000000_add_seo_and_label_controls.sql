-- SEO-meta and label override controls on site_settings.
--
-- Gives /admin/settings full control over SEO metadata (title and description)
-- across /, /events, /news, /artists, and /academy, as well as category filter
-- labels and the booking CTA label.
--
-- All columns are NULLABLE: NULL means "fall back to the built-in Figma/i18n
-- copy" (see DEFAULT_SITE_SETTINGS in src/lib/dal/site-settings.ts), so existing
-- rows, RLS policies and admin inserts keep working untouched. English `_en`
-- siblings follow the same convention as 20260912000000: Arabic is the source of
-- truth, English falls back to Arabic when empty.
-- Idempotent: every column uses IF NOT EXISTS.

-- Home SEO meta --------------------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS seo_home_title VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS seo_home_title_en VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS seo_home_description VARCHAR(320) NULL,
  ADD COLUMN IF NOT EXISTS seo_home_description_en VARCHAR(320) NULL;

-- Events SEO meta ------------------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS seo_events_title VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS seo_events_title_en VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS seo_events_description VARCHAR(320) NULL,
  ADD COLUMN IF NOT EXISTS seo_events_description_en VARCHAR(320) NULL;

-- News SEO meta --------------------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS seo_news_title VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS seo_news_title_en VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS seo_news_description VARCHAR(320) NULL,
  ADD COLUMN IF NOT EXISTS seo_news_description_en VARCHAR(320) NULL;

-- Artists SEO meta -----------------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS seo_artists_title VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS seo_artists_title_en VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS seo_artists_description VARCHAR(320) NULL,
  ADD COLUMN IF NOT EXISTS seo_artists_description_en VARCHAR(320) NULL;

-- Academy SEO meta -----------------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS seo_academy_title VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS seo_academy_title_en VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS seo_academy_description VARCHAR(320) NULL,
  ADD COLUMN IF NOT EXISTS seo_academy_description_en VARCHAR(320) NULL;

-- Filter label overrides -----------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS events_filter_all_label VARCHAR(60) NULL,
  ADD COLUMN IF NOT EXISTS events_filter_all_label_en VARCHAR(60) NULL,
  ADD COLUMN IF NOT EXISTS artists_filter_all_label VARCHAR(60) NULL,
  ADD COLUMN IF NOT EXISTS artists_filter_all_label_en VARCHAR(60) NULL;

-- Booking CTA label override -------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS booking_cta_label VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS booking_cta_label_en VARCHAR(100) NULL;

COMMENT ON COLUMN site_settings.seo_home_title IS 'Admin override for home page SEO title. NULL falls back to built-in copy.';
COMMENT ON COLUMN site_settings.events_filter_all_label IS 'Admin override for events filter "all" label. NULL falls back to built-in copy.';
