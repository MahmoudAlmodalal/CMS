-- Page-hero images (20260914000000) are storage references too: without them in
-- the orphan view, images picked for /events, /artists and /academy heroes would
-- be offered for cleanup. Mirrors MEDIA_REFERENCES in src/lib/storage.ts.
-- Idempotent: CREATE OR REPLACE with the same output columns as 20260910001300.

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
