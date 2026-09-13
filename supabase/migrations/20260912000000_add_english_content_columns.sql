-- English content columns for the bilingual public site.
--
-- The Figma file carries English screens alongside the Arabic ones, but every
-- content table stored a single Arabic string per field. Rather than duplicate
-- every row, each translatable field gains a nullable `_en` sibling: Arabic stays
-- the authored source of truth, English is optional, and the application falls
-- back to Arabic wherever a translation has not been written yet (see
-- pickLocalized in src/lib/utils). Nullable columns mean existing rows, RLS
-- policies and admin inserts keep working untouched.

-- Artists -------------------------------------------------------------------
ALTER TABLE artists
  ADD COLUMN IF NOT EXISTS name_en VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS genre_tag_en VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS city_en VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS quote_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS spotlight_quote_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS short_bio_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS full_bio_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS specialties_en VARCHAR(255) NULL;

-- Events --------------------------------------------------------------------
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(200) NULL,
  ADD COLUMN IF NOT EXISTS location_en VARCHAR(200) NULL,
  ADD COLUMN IF NOT EXISTS city_en VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS performer_name_en VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS description_en TEXT NULL;

-- Academy courses -----------------------------------------------------------
ALTER TABLE academy_courses
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS track_category_en VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS description_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS instructor_name_en VARCHAR(150) NULL;

-- Articles ------------------------------------------------------------------
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(250) NULL,
  ADD COLUMN IF NOT EXISTS excerpt_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS content_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS author_name_en VARCHAR(150) NULL;

-- Testimonials --------------------------------------------------------------
ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS quote_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS author_name_en VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS author_role_en VARCHAR(150) NULL;

-- Releases ------------------------------------------------------------------
ALTER TABLE releases
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(200) NULL;

-- Tracks --------------------------------------------------------------------
ALTER TABLE tracks
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(200) NULL;

-- Site settings -------------------------------------------------------------
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS hero_headline_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS hero_subheadline_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS about_headline_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS about_body_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS booking_banner_title_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS booking_banner_body_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS artists_subtitle_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS events_subtitle_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS academy_subtitle_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS booking_subtitle_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS operational_regions_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS footer_mission_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS copyright_text_en VARCHAR(255) NULL;

COMMENT ON COLUMN artists.name_en IS 'Optional English translation; falls back to the Arabic column when null.';
COMMENT ON COLUMN events.title_en IS 'Optional English translation; falls back to the Arabic column when null.';
COMMENT ON COLUMN academy_courses.title_en IS 'Optional English translation; falls back to the Arabic column when null.';
COMMENT ON COLUMN articles.title_en IS 'Optional English translation; falls back to the Arabic column when null.';
COMMENT ON COLUMN testimonials.quote_en IS 'Optional English translation; falls back to the Arabic column when null.';
COMMENT ON COLUMN site_settings.hero_headline_en IS 'Optional English translation; falls back to the Arabic column when null.';
