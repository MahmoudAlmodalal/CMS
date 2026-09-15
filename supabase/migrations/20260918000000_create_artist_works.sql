-- Migration: artist_works table (أعمال الفنان).
-- Per-artist portfolio of YouTube-hosted works — the section the artist profile
-- page had no reader for. Child of artists (ON DELETE CASCADE), same shape as
-- tracks/releases so the admin managers and the publish toggle reuse their path.
-- Depends on: 20260910000000 (pgcrypto), 20260910000200 (artists).
-- Idempotent: IF NOT EXISTS + DROP POLICY IF EXISTS guards; safe to re-run.
-- Rollback: DROP TABLE IF EXISTS artist_works;

CREATE TABLE IF NOT EXISTS artist_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NULL,
  work_type VARCHAR(50) NOT NULL DEFAULT 'song'
    CHECK (work_type IN ('song', 'concert', 'interview', 'documentary')),
  youtube_url VARCHAR(500) NOT NULL,
  description TEXT NULL,
  description_en TEXT NULL,
  -- Optional override; the public section falls back to YouTube's own thumbnail.
  thumbnail_image_url VARCHAR(500) NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  -- Draft by default, matching 20260913000000_default_new_content_to_draft.
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artist_works_artist_id
  ON artist_works (artist_id, display_order ASC) WHERE is_published = true;

-- ---------------------------------------------------------------------------
-- Row Level Security — mirrors the tracks block of 20260910001100_enable_rls.
-- ---------------------------------------------------------------------------
ALTER TABLE artist_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_works FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "artist_works_select_published" ON artist_works;
CREATE POLICY "artist_works_select_published"
  ON artist_works FOR SELECT TO anon
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM artists
      WHERE artists.id = artist_works.artist_id
        AND artists.is_published = true
    )
  );

DROP POLICY IF EXISTS "artist_works_select_admin" ON artist_works;
CREATE POLICY "artist_works_select_admin"
  ON artist_works FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "artist_works_insert_admin" ON artist_works;
CREATE POLICY "artist_works_insert_admin"
  ON artist_works FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "artist_works_update_admin" ON artist_works;
CREATE POLICY "artist_works_update_admin"
  ON artist_works FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "artist_works_delete_admin" ON artist_works;
CREATE POLICY "artist_works_delete_admin"
  ON artist_works FOR DELETE TO authenticated USING (public.is_admin());
