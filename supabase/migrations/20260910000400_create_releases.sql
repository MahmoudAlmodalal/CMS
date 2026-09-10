-- Task 25 — Migration 05/11: releases table.
-- Canonical spec: DATABASE_SCHEMA.md §4. Child of artists (ON DELETE CASCADE).
-- Depends on: 03 (artists). Idempotent: IF NOT EXISTS guards; safe to re-run.
-- Rollback: DROP TABLE IF EXISTS releases;

CREATE TABLE IF NOT EXISTS releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  release_type VARCHAR(50) NOT NULL CHECK (release_type IN ('studio', 'live')),
  track_count INTEGER NOT NULL CHECK (track_count > 0),
  release_year INTEGER NOT NULL CHECK (release_year BETWEEN 1900 AND 2100),
  cover_image_url VARCHAR(500) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_releases_artist_id ON releases (artist_id, release_year DESC, display_order ASC) WHERE is_published = true;
