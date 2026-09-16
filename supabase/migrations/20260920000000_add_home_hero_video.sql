-- Home hero backdrop video (YouTube link).
--
-- The hero band has always drawn `hero_image_url`, playing it as a <video> when
-- the URL looked like a media file. Editors asked for a YouTube link instead,
-- shown as a silent moving backdrop that does not read as an embed, with the
-- existing image kept as the fallback. One column cannot hold both, so the link
-- gets its own nullable column: null/blank means "fall back to hero_image_url",
-- which is exactly what every row does today.
--
-- Not a storage reference (the video lives on YouTube, not in the `site`
-- bucket), so it is deliberately absent from storage_orphan_candidates and from
-- MEDIA_REFERENCES in src/lib/storage.ts.
--
-- Depends on: 20260910000100_create_site_settings.sql
-- Idempotent: ADD COLUMN IF NOT EXISTS; safe to re-run.
-- Rollback: ALTER TABLE site_settings DROP COLUMN IF EXISTS hero_video_url;

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS hero_video_url TEXT NULL;

COMMENT ON COLUMN site_settings.hero_video_url IS
  'Optional YouTube link played muted and looping as the hero backdrop. NULL/blank falls back to hero_image_url.';
