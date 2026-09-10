-- Task 25 — Migration 04/11: tracks table.
-- Canonical spec: DATABASE_SCHEMA.md §3. Child of artists (ON DELETE CASCADE).
-- Depends on: 03 (artists). Idempotent: IF NOT EXISTS guards; safe to re-run.
-- Rollback: DROP TABLE IF EXISTS tracks;

CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  audio_file_url VARCHAR(500) NOT NULL,
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
  cover_image_url VARCHAR(500) NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks (artist_id, display_order ASC) WHERE is_published = true;
