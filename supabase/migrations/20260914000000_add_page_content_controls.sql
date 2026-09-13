-- Page hero + home/academy section copy controls on site_settings.
--
-- Gives /admin/settings full control over the content of /, /events, /news,
-- /artists and /academy: page-hero titles/kickers/images, home section headings
-- and CTAs, and the academy value-props + newsletter bands.
--
-- All columns are NULLABLE: NULL means "fall back to the built-in Figma/i18n
-- copy" (see DEFAULT_SITE_SETTINGS in src/lib/dal/site-settings.ts), so existing
-- rows, RLS policies and admin inserts keep working untouched. English `_en`
-- siblings follow the same convention as 20260912000000: Arabic is the source of
-- truth, English falls back to Arabic when empty.
-- Idempotent: every column uses IF NOT EXISTS.

-- Events page hero ----------------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS events_title TEXT NULL,
  ADD COLUMN IF NOT EXISTS events_title_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS events_hero_image_url VARCHAR(500) NULL;

-- Artists page hero ---------------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS artists_title TEXT NULL,
  ADD COLUMN IF NOT EXISTS artists_title_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS artists_hero_image_url VARCHAR(500) NULL;

-- Academy page hero ---------------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS academy_title TEXT NULL,
  ADD COLUMN IF NOT EXISTS academy_title_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS academy_kicker VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS academy_kicker_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS academy_hero_image_url VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS academy_tracks_heading TEXT NULL,
  ADD COLUMN IF NOT EXISTS academy_tracks_heading_en TEXT NULL;

-- News page header ----------------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS news_title TEXT NULL,
  ADD COLUMN IF NOT EXISTS news_title_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS news_subtitle TEXT NULL,
  ADD COLUMN IF NOT EXISTS news_subtitle_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS news_kicker VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS news_kicker_en VARCHAR(255) NULL;

-- Home hero CTAs + about CTA -----------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS home_hero_primary_cta VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS home_hero_primary_cta_en VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS home_hero_secondary_cta VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS home_hero_secondary_cta_en VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS home_about_cta VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS home_about_cta_en VARCHAR(255) NULL;

-- Home section headings + CTAs ----------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS home_artists_heading TEXT NULL,
  ADD COLUMN IF NOT EXISTS home_artists_heading_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS home_artists_cta VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS home_artists_cta_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS home_testimonials_heading TEXT NULL,
  ADD COLUMN IF NOT EXISTS home_testimonials_heading_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS home_editorial_heading TEXT NULL,
  ADD COLUMN IF NOT EXISTS home_editorial_heading_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS home_events_heading TEXT NULL,
  ADD COLUMN IF NOT EXISTS home_events_heading_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS home_events_cta VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS home_events_cta_en VARCHAR(255) NULL;

-- Academy value-props band ---------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS academy_values_heading TEXT NULL,
  ADD COLUMN IF NOT EXISTS academy_values_heading_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS academy_value1_title VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS academy_value1_title_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS academy_value1_body TEXT NULL,
  ADD COLUMN IF NOT EXISTS academy_value1_body_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS academy_value2_title VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS academy_value2_title_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS academy_value2_body TEXT NULL,
  ADD COLUMN IF NOT EXISTS academy_value2_body_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS academy_value3_title VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS academy_value3_title_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS academy_value3_body TEXT NULL,
  ADD COLUMN IF NOT EXISTS academy_value3_body_en TEXT NULL;

-- Academy newsletter band ----------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS academy_newsletter_heading TEXT NULL,
  ADD COLUMN IF NOT EXISTS academy_newsletter_heading_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS academy_newsletter_tagline TEXT NULL,
  ADD COLUMN IF NOT EXISTS academy_newsletter_tagline_en TEXT NULL;

COMMENT ON COLUMN site_settings.events_title IS 'Admin override for the /events hero headline. NULL falls back to built-in copy.';
COMMENT ON COLUMN site_settings.news_title IS 'Admin override for the /news header title. NULL falls back to built-in copy.';
COMMENT ON COLUMN site_settings.home_artists_heading IS 'Admin override for the home featured-artists heading. NULL falls back to built-in copy.';
COMMENT ON COLUMN site_settings.academy_values_heading IS 'Admin override for the academy value-props band heading. NULL falls back to built-in copy.';
