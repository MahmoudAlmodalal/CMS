-- ============================================================================
-- Task 29 — Supabase Storage buckets (STORAGE_ARCHITECTURE.md §4.1, Task 20A)
-- 7 public buckets, byte quotas, canonical MIME allowlists (admin-write enforced
-- by RLS migration 20260910001200_storage_policies.sql).
-- Idempotent: re-running converges limits/MIME lists via ON CONFLICT DO UPDATE.
-- Rollback: DELETE FROM storage.buckets WHERE id IN (...); DROP VIEW
--   storage_orphan_candidates; (only after confirming no objects remain).
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('site',     'site',     true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/avif','image/svg+xml']),
  ('artists',  'artists',  true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/avif']),
  ('releases', 'releases', true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/avif']),
  ('events',   'events',   true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/avif']),
  ('academy',  'academy',  true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/avif']),
  ('articles', 'articles', true, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/avif']),
  ('audio',    'audio',    true, 31457280, ARRAY['audio/mpeg','audio/ogg','audio/wav','audio/mp4','audio/aac'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Orphan discovery view (STORAGE_ARCHITECTURE.md §6.3): storage objects older
-- than 24h that no approved table column references. Read-only; consumed by
-- the Task 29 orphan cleanup action (dry-run by default).
CREATE OR REPLACE VIEW storage_orphan_candidates AS
WITH active_db_urls AS (
  SELECT hero_image_url AS url FROM public.site_settings WHERE hero_image_url IS NOT NULL
  UNION ALL
  SELECT about_image_url FROM public.site_settings WHERE about_image_url IS NOT NULL
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
