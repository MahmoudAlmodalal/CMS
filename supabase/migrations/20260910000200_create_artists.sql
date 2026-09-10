-- Task 25 — Migration 03/11: artists table.
-- Canonical spec: DATABASE_SCHEMA.md §2. Parent of tracks, releases, events,
-- academy_courses, articles, booking_requests (all ON DELETE CASCADE / SET NULL).
-- Depends on: 01 (pgcrypto). Idempotent: IF NOT EXISTS guards; safe to re-run.
-- Rollback: DROP TABLE IF EXISTS artists CASCADE; (after dropping dependents 04–10 first).

CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  category VARCHAR(50) NOT NULL CHECK (category IN ('singing', 'oud', 'percussion', 'contemporary', 'heritage')),
  genre_tag VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  quote TEXT NOT NULL,
  spotlight_quote TEXT NULL,
  short_bio TEXT NOT NULL,
  full_bio TEXT NOT NULL,
  specialties VARCHAR(255) NOT NULL,
  portrait_image_url VARCHAR(500) NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artists_published_order ON artists (is_published, display_order ASC, name ASC);
CREATE INDEX IF NOT EXISTS idx_artists_featured ON artists (is_featured, display_order ASC) WHERE is_featured = true AND is_published = true;
CREATE INDEX IF NOT EXISTS idx_artists_category ON artists (category) WHERE is_published = true;
