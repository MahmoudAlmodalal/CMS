-- Admin page controls: home section toggles, CTA links, section images, the
-- booking page title/SEO, and site-wide default SEO + share image.
-- Nullable text/url columns: null/blank = fall back to built-in copy/asset.
-- Idempotent.

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS show_hero boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_about boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_featured_artists boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS home_hero_primary_href text NULL,
  ADD COLUMN IF NOT EXISTS home_hero_secondary_href text NULL,
  ADD COLUMN IF NOT EXISTS home_about_href text NULL,
  ADD COLUMN IF NOT EXISTS home_artists_href text NULL,
  ADD COLUMN IF NOT EXISTS home_events_href text NULL,
  ADD COLUMN IF NOT EXISTS booking_cta_href text NULL,
  ADD COLUMN IF NOT EXISTS home_about_heading text NULL,
  ADD COLUMN IF NOT EXISTS home_about_heading_en text NULL,
  ADD COLUMN IF NOT EXISTS home_events_image_url text NULL,
  ADD COLUMN IF NOT EXISTS booking_banner_image_url text NULL,
  ADD COLUMN IF NOT EXISTS artist_hero_image_url text NULL,
  ADD COLUMN IF NOT EXISTS booking_title text NULL,
  ADD COLUMN IF NOT EXISTS booking_title_en text NULL,
  ADD COLUMN IF NOT EXISTS seo_booking_title text NULL,
  ADD COLUMN IF NOT EXISTS seo_booking_title_en text NULL,
  ADD COLUMN IF NOT EXISTS seo_booking_description text NULL,
  ADD COLUMN IF NOT EXISTS seo_booking_description_en text NULL,
  ADD COLUMN IF NOT EXISTS seo_default_title text NULL,
  ADD COLUMN IF NOT EXISTS seo_default_title_en text NULL,
  ADD COLUMN IF NOT EXISTS seo_default_description text NULL,
  ADD COLUMN IF NOT EXISTS seo_default_description_en text NULL,
  ADD COLUMN IF NOT EXISTS seo_og_image_url text NULL;

-- The new image columns are storage references: keep them out of orphan cleanup.
-- Mirrors MEDIA_REFERENCES in src/lib/storage.ts.
CREATE OR REPLACE VIEW storage_orphan_candidates AS
WITH active_db_urls AS (
  SELECT hero_image_url AS url FROM public.site_settings WHERE hero_image_url IS NOT NULL
  UNION ALL
  SELECT about_image_url FROM public.site_settings WHERE about_image_url IS NOT NULL
  UNION ALL
  SELECT events_hero_image_url FROM public.site_settings WHERE events_hero_image_url IS NOT NULL
  UNION ALL
  SELECT artists_hero_image_url FROM public.site_settings WHERE artists_hero_image_url IS NOT NULL
  UNION ALL
  SELECT academy_hero_image_url FROM public.site_settings WHERE academy_hero_image_url IS NOT NULL
  UNION ALL
  SELECT home_events_image_url FROM public.site_settings WHERE home_events_image_url IS NOT NULL
  UNION ALL
  SELECT booking_banner_image_url FROM public.site_settings WHERE booking_banner_image_url IS NOT NULL
  UNION ALL
  SELECT artist_hero_image_url FROM public.site_settings WHERE artist_hero_image_url IS NOT NULL
  UNION ALL
  SELECT seo_og_image_url FROM public.site_settings WHERE seo_og_image_url IS NOT NULL
  UNION ALL
  SELECT portrait_image_url FROM public.artists WHERE portrait_image_url IS NOT NULL
  UNION ALL
  SELECT cover_image_url FROM public.releases WHERE cover_image_url IS NOT NULL
  UNION ALL
  SELECT image_url FROM public.events WHERE image_url IS NOT NULL
  UNION ALL
  SELECT image_url FROM public.academy_courses WHERE image_url IS NOT NULL
  UNION ALL
  SELECT cover_image_url FROM public.articles WHERE cover_image_url IS NOT NULL
  UNION ALL
  SELECT avatar_image_url FROM public.testimonials WHERE avatar_image_url IS NOT NULL
  UNION ALL
  SELECT audio_file_url FROM public.tracks WHERE audio_file_url IS NOT NULL
  UNION ALL
  SELECT cover_image_url FROM public.tracks WHERE cover_image_url IS NOT NULL
)
SELECT
  o.id,
  o.bucket_id,
  o.name AS object_path,
  o.created_at,
  ROUND((o.metadata->>'size')::numeric / 1024 / 1024, 2) AS size_mb
FROM storage.objects o
WHERE o.bucket_id IN ('site','artists','releases','events','academy','articles','audio')
  AND o.created_at < now() - INTERVAL '24 hours'
  AND NOT EXISTS (
    SELECT 1 FROM active_db_urls u
    WHERE u.url LIKE '%' || o.name
  );
