-- Home section display and count controls on site_settings.
--
-- Allows administrators to control landing-page composition from /admin/settings:
-- how many featured artists, featured articles, and upcoming events the home page
-- shows (each bounded between 1 and 12), and whether the optional sections
-- (testimonials, editorial, events, booking banner) render at all.
-- Defaults match the Figma baseline: 6 artists, 4 articles, 3 events, all visible.

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS home_featured_artists_count SMALLINT NOT NULL DEFAULT 6,
  ADD COLUMN IF NOT EXISTS home_featured_articles_count SMALLINT NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS home_upcoming_events_count SMALLINT NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS show_testimonials BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_editorial BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_events BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_booking_banner BOOLEAN NOT NULL DEFAULT true;

-- Named CHECK constraints for home section item counts (1..12)
ALTER TABLE site_settings
  DROP CONSTRAINT IF EXISTS check_site_settings_home_featured_artists_count,
  ADD CONSTRAINT check_site_settings_home_featured_artists_count
    CHECK (home_featured_artists_count >= 1 AND home_featured_artists_count <= 12);

ALTER TABLE site_settings
  DROP CONSTRAINT IF EXISTS check_site_settings_home_featured_articles_count,
  ADD CONSTRAINT check_site_settings_home_featured_articles_count
    CHECK (home_featured_articles_count >= 1 AND home_featured_articles_count <= 12);

ALTER TABLE site_settings
  DROP CONSTRAINT IF EXISTS check_site_settings_home_upcoming_events_count,
  ADD CONSTRAINT check_site_settings_home_upcoming_events_count
    CHECK (home_upcoming_events_count >= 1 AND home_upcoming_events_count <= 12);

COMMENT ON COLUMN site_settings.home_featured_artists_count IS 'Number of featured artists displayed on the home page (1-12).';
COMMENT ON COLUMN site_settings.home_featured_articles_count IS 'Number of featured articles displayed on the home page (1-12).';
COMMENT ON COLUMN site_settings.home_upcoming_events_count IS 'Number of upcoming events displayed on the home page (1-12).';
COMMENT ON COLUMN site_settings.show_testimonials IS 'Controls whether the Testimonials section renders on the home page.';
COMMENT ON COLUMN site_settings.show_editorial IS 'Controls whether the Editorial feature section renders on the home page.';
COMMENT ON COLUMN site_settings.show_events IS 'Controls whether the Upcoming Events section renders on the home page.';
COMMENT ON COLUMN site_settings.show_booking_banner IS 'Controls whether the Booking CTA banner renders on the home page.';
