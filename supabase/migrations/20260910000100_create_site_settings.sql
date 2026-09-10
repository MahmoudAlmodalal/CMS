-- Task 25 — Migration 02/11: site_settings singleton table + seed row.
-- Canonical spec: DATABASE_SCHEMA.md §1 (singleton, id='default' CHECK).
-- Seed row uses placeholder copy; real content is managed in Task 43 (Site Settings CMS).
-- Depends on: none. Idempotent: IF NOT EXISTS + ON CONFLICT DO NOTHING.
-- Rollback: DELETE FROM site_settings WHERE id = 'default'; then DROP TABLE IF EXISTS site_settings;

CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  hero_headline TEXT NOT NULL,
  hero_subheadline TEXT NOT NULL,
  hero_image_url VARCHAR(500) NOT NULL,
  about_headline VARCHAR(255) NOT NULL,
  about_body TEXT NOT NULL,
  about_image_url VARCHAR(500) NOT NULL,
  booking_banner_title VARCHAR(255) NOT NULL,
  booking_banner_body TEXT NOT NULL,
  artists_subtitle TEXT NULL,
  events_subtitle TEXT NULL,
  academy_subtitle TEXT NULL,
  booking_subtitle TEXT NULL,
  contact_email VARCHAR(255) NOT NULL CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  contact_phone VARCHAR(50) NOT NULL,
  social_links JSONB NOT NULL DEFAULT '{"instagram": "", "tiktok": ""}'::jsonb,
  operational_regions VARCHAR(255) NOT NULL,
  footer_mission TEXT NOT NULL,
  copyright_text VARCHAR(255) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Singleton seed: placeholder copy only (Task 43 replaces with real content).
INSERT INTO site_settings (
  id, hero_headline, hero_subheadline, hero_image_url,
  about_headline, about_body, about_image_url,
  booking_banner_title, booking_banner_body,
  contact_email, contact_phone, operational_regions,
  footer_mission, copyright_text
) VALUES (
  'default', '', '', '', '', '', '', '', '',
  'contact@example.com', '', '', '', ''
)
ON CONFLICT (id) DO NOTHING;
