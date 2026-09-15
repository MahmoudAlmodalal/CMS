-- Migration: reconcile the `site` storage bucket with the app's own allowlist.
--
-- BUCKET_ALLOWED_MIMES.site in src/lib/storage.ts accepts video/mp4|webm|ogg|
-- quicktime and VIDEO_MAX_BYTES is 50 MB, but the bucket row created by
-- 20260910001300_storage_buckets.sql allows images only at 5 MB — so every
-- VideoUploadField upload passed local validation and was then rejected by the
-- Storage API. The app-side limit for images stays 5 MB (validateUploadFile
-- enforces IMAGE_MAX_BYTES per MIME), so widening the bucket row does not
-- loosen the image ceiling an editor can actually hit.
--
-- Depends on: 20260910001300 (buckets). Idempotent: ON CONFLICT DO UPDATE.
-- Rollback: re-run 20260910001300_storage_buckets.sql (it converges the row).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site', 'site', true, 52428800,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
