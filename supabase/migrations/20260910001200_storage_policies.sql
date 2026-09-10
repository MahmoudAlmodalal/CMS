-- Task 26 — Migration 13/13: Row Level Security (storage.objects policies).
-- Canonical spec: RLS_DESIGN.md §4.2 (4 policies, 7 buckets).
-- Platform note: applies on Supabase where the storage schema is provisioned
-- (buckets themselves are created in Task 29). No-op safeguard: none — this
-- migration targets Supabase only and is NOT applied to bare PostgreSQL.
-- Idempotent: DROP POLICY IF EXISTS guards; safe to re-run.
-- Rollback: DROP POLICY "storage_public_read_all" ON storage.objects;
--   DROP POLICY "storage_admin_insert" ON storage.objects;
--   DROP POLICY "storage_admin_update" ON storage.objects;
--   DROP POLICY "storage_admin_delete" ON storage.objects;

DROP POLICY IF EXISTS "storage_public_read_all" ON storage.objects;
CREATE POLICY "storage_public_read_all"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id IN ('site', 'artists', 'audio', 'releases', 'events', 'academy', 'articles')
  );

DROP POLICY IF EXISTS "storage_admin_insert" ON storage.objects;
CREATE POLICY "storage_admin_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.is_admin()
    AND bucket_id IN ('site', 'artists', 'audio', 'releases', 'events', 'academy', 'articles')
  );

DROP POLICY IF EXISTS "storage_admin_update" ON storage.objects;
CREATE POLICY "storage_admin_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    auth.is_admin()
    AND bucket_id IN ('site', 'artists', 'audio', 'releases', 'events', 'academy', 'articles')
  )
  WITH CHECK (
    auth.is_admin()
    AND bucket_id IN ('site', 'artists', 'audio', 'releases', 'events', 'academy', 'articles')
  );

DROP POLICY IF EXISTS "storage_admin_delete" ON storage.objects;
CREATE POLICY "storage_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    auth.is_admin()
    AND bucket_id IN ('site', 'artists', 'audio', 'releases', 'events', 'academy', 'articles')
  );
