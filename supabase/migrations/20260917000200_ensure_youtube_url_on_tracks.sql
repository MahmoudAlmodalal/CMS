-- Ensure the public music source column exists before the CMS writes it.
-- Depends on: 20260910000300_create_tracks.sql.
-- Idempotent: ADD COLUMN IF NOT EXISTS.
-- Rollback: ALTER TABLE tracks DROP COLUMN IF EXISTS youtube_url;

ALTER TABLE tracks
  ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500) NULL;

COMMENT ON COLUMN tracks.youtube_url IS
  'Optional YouTube source URL for music tracks; audio_file_url remains supported for legacy uploads.';
