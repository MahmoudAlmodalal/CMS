-- Task 26 — Migration 12/13: Row Level Security (table policies).
-- Canonical spec: RLS_DESIGN.md §§1–3 (49 policies, 10 tables).
-- Requires standard Supabase roles (anon, authenticated) and auth.jwt().
-- Default-deny: ENABLE + FORCE RLS on every table.
-- Idempotent: DROP POLICY IF EXISTS guards + CREATE OR REPLACE functions; safe to re-run.
-- Rollback (reverse order): DROP POLICY ... on each table, then
--   ALTER TABLE <t> NO FORCE ROW LEVEL SECURITY; ALTER TABLE <t> DISABLE ROW LEVEL SECURITY;
--   DROP FUNCTION IF EXISTS auth.has_role(TEXT[]); DROP FUNCTION IF EXISTS auth.is_admin();
-- Out of scope: storage.objects policies (migration 13), Auth screens, CMS pages.

-- ---------------------------------------------------------------------------
-- 2. Authentication helpers (RLS_DESIGN.md §2)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

CREATE OR REPLACE FUNCTION auth.has_role(required_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = ANY(required_roles),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- 3.1 site_settings (RLS_DESIGN.md §3.1)
-- ---------------------------------------------------------------------------
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_select_public" ON site_settings;
CREATE POLICY "site_settings_select_public"
  ON site_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "site_settings_insert_admin" ON site_settings;
CREATE POLICY "site_settings_insert_admin"
  ON site_settings FOR INSERT TO authenticated
  WITH CHECK (auth.is_admin() AND id = 'default');

DROP POLICY IF EXISTS "site_settings_update_admin" ON site_settings;
CREATE POLICY "site_settings_update_admin"
  ON site_settings FOR UPDATE TO authenticated
  USING (auth.is_admin()) WITH CHECK (auth.is_admin() AND id = 'default');

DROP POLICY IF EXISTS "site_settings_delete_nobody" ON site_settings;
CREATE POLICY "site_settings_delete_nobody"
  ON site_settings FOR DELETE TO anon, authenticated USING (false);

-- ---------------------------------------------------------------------------
-- 3.2 artists (RLS_DESIGN.md §3.2)
-- ---------------------------------------------------------------------------
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "artists_select_published" ON artists;
CREATE POLICY "artists_select_published"
  ON artists FOR SELECT TO anon USING (is_published = true);

DROP POLICY IF EXISTS "artists_select_admin" ON artists;
CREATE POLICY "artists_select_admin"
  ON artists FOR SELECT TO authenticated USING (auth.is_admin());

DROP POLICY IF EXISTS "artists_insert_admin" ON artists;
CREATE POLICY "artists_insert_admin"
  ON artists FOR INSERT TO authenticated WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "artists_update_admin" ON artists;
CREATE POLICY "artists_update_admin"
  ON artists FOR UPDATE TO authenticated
  USING (auth.is_admin()) WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "artists_delete_admin" ON artists;
CREATE POLICY "artists_delete_admin"
  ON artists FOR DELETE TO authenticated USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- 3.3 tracks (RLS_DESIGN.md §3.3)
-- ---------------------------------------------------------------------------
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tracks_select_published" ON tracks;
CREATE POLICY "tracks_select_published"
  ON tracks FOR SELECT TO anon
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM artists
      WHERE artists.id = tracks.artist_id
        AND artists.is_published = true
    )
  );

DROP POLICY IF EXISTS "tracks_select_admin" ON tracks;
CREATE POLICY "tracks_select_admin"
  ON tracks FOR SELECT TO authenticated USING (auth.is_admin());

DROP POLICY IF EXISTS "tracks_insert_admin" ON tracks;
CREATE POLICY "tracks_insert_admin"
  ON tracks FOR INSERT TO authenticated WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "tracks_update_admin" ON tracks;
CREATE POLICY "tracks_update_admin"
  ON tracks FOR UPDATE TO authenticated
  USING (auth.is_admin()) WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "tracks_delete_admin" ON tracks;
CREATE POLICY "tracks_delete_admin"
  ON tracks FOR DELETE TO authenticated USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- 3.4 releases (RLS_DESIGN.md §3.4)
-- ---------------------------------------------------------------------------
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "releases_select_published" ON releases;
CREATE POLICY "releases_select_published"
  ON releases FOR SELECT TO anon
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM artists
      WHERE artists.id = releases.artist_id
        AND artists.is_published = true
    )
  );

DROP POLICY IF EXISTS "releases_select_admin" ON releases;
CREATE POLICY "releases_select_admin"
  ON releases FOR SELECT TO authenticated USING (auth.is_admin());

DROP POLICY IF EXISTS "releases_insert_admin" ON releases;
CREATE POLICY "releases_insert_admin"
  ON releases FOR INSERT TO authenticated WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "releases_update_admin" ON releases;
CREATE POLICY "releases_update_admin"
  ON releases FOR UPDATE TO authenticated
  USING (auth.is_admin()) WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "releases_delete_admin" ON releases;
CREATE POLICY "releases_delete_admin"
  ON releases FOR DELETE TO authenticated USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- 3.5 events (RLS_DESIGN.md §3.5)
-- ---------------------------------------------------------------------------
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select_published" ON events;
CREATE POLICY "events_select_published"
  ON events FOR SELECT TO anon USING (is_published = true);

DROP POLICY IF EXISTS "events_select_admin" ON events;
CREATE POLICY "events_select_admin"
  ON events FOR SELECT TO authenticated USING (auth.is_admin());

DROP POLICY IF EXISTS "events_insert_admin" ON events;
CREATE POLICY "events_insert_admin"
  ON events FOR INSERT TO authenticated WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "events_update_admin" ON events;
CREATE POLICY "events_update_admin"
  ON events FOR UPDATE TO authenticated
  USING (auth.is_admin()) WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "events_delete_admin" ON events;
CREATE POLICY "events_delete_admin"
  ON events FOR DELETE TO authenticated USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- 3.6 academy_courses (RLS_DESIGN.md §3.6)
-- ---------------------------------------------------------------------------
ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_courses FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "academy_courses_select_published" ON academy_courses;
CREATE POLICY "academy_courses_select_published"
  ON academy_courses FOR SELECT TO anon USING (is_published = true);

DROP POLICY IF EXISTS "academy_courses_select_admin" ON academy_courses;
CREATE POLICY "academy_courses_select_admin"
  ON academy_courses FOR SELECT TO authenticated USING (auth.is_admin());

DROP POLICY IF EXISTS "academy_courses_insert_admin" ON academy_courses;
CREATE POLICY "academy_courses_insert_admin"
  ON academy_courses FOR INSERT TO authenticated WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "academy_courses_update_admin" ON academy_courses;
CREATE POLICY "academy_courses_update_admin"
  ON academy_courses FOR UPDATE TO authenticated
  USING (auth.is_admin()) WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "academy_courses_delete_admin" ON academy_courses;
CREATE POLICY "academy_courses_delete_admin"
  ON academy_courses FOR DELETE TO authenticated USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- 3.7 articles (RLS_DESIGN.md §3.7)
-- ---------------------------------------------------------------------------
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "articles_select_published" ON articles;
CREATE POLICY "articles_select_published"
  ON articles FOR SELECT TO anon
  USING (is_published = true AND published_at <= now());

DROP POLICY IF EXISTS "articles_select_admin" ON articles;
CREATE POLICY "articles_select_admin"
  ON articles FOR SELECT TO authenticated USING (auth.is_admin());

DROP POLICY IF EXISTS "articles_insert_admin" ON articles;
CREATE POLICY "articles_insert_admin"
  ON articles FOR INSERT TO authenticated WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "articles_update_admin" ON articles;
CREATE POLICY "articles_update_admin"
  ON articles FOR UPDATE TO authenticated
  USING (auth.is_admin()) WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "articles_delete_admin" ON articles;
CREATE POLICY "articles_delete_admin"
  ON articles FOR DELETE TO authenticated USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- 3.8 testimonials (RLS_DESIGN.md §3.8)
-- ---------------------------------------------------------------------------
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "testimonials_select_published" ON testimonials;
CREATE POLICY "testimonials_select_published"
  ON testimonials FOR SELECT TO anon USING (is_published = true);

DROP POLICY IF EXISTS "testimonials_select_admin" ON testimonials;
CREATE POLICY "testimonials_select_admin"
  ON testimonials FOR SELECT TO authenticated USING (auth.is_admin());

DROP POLICY IF EXISTS "testimonials_insert_admin" ON testimonials;
CREATE POLICY "testimonials_insert_admin"
  ON testimonials FOR INSERT TO authenticated WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "testimonials_update_admin" ON testimonials;
CREATE POLICY "testimonials_update_admin"
  ON testimonials FOR UPDATE TO authenticated
  USING (auth.is_admin()) WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "testimonials_delete_admin" ON testimonials;
CREATE POLICY "testimonials_delete_admin"
  ON testimonials FOR DELETE TO authenticated USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- 3.9 booking_requests (RLS_DESIGN.md §3.9)
-- ---------------------------------------------------------------------------
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "booking_requests_select_anon_block" ON booking_requests;
CREATE POLICY "booking_requests_select_anon_block"
  ON booking_requests FOR SELECT TO anon USING (false);

DROP POLICY IF EXISTS "booking_requests_select_admin" ON booking_requests;
CREATE POLICY "booking_requests_select_admin"
  ON booking_requests FOR SELECT TO authenticated USING (auth.is_admin());

DROP POLICY IF EXISTS "booking_requests_insert_public" ON booking_requests;
CREATE POLICY "booking_requests_insert_public"
  ON booking_requests FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND admin_notes IS NULL);

DROP POLICY IF EXISTS "booking_requests_update_admin" ON booking_requests;
CREATE POLICY "booking_requests_update_admin"
  ON booking_requests FOR UPDATE TO authenticated
  USING (auth.is_admin()) WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "booking_requests_delete_admin" ON booking_requests;
CREATE POLICY "booking_requests_delete_admin"
  ON booking_requests FOR DELETE TO authenticated USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- 3.10 newsletter_subscribers (RLS_DESIGN.md §3.10)
-- ---------------------------------------------------------------------------
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_subscribers_select_anon_block" ON newsletter_subscribers;
CREATE POLICY "newsletter_subscribers_select_anon_block"
  ON newsletter_subscribers FOR SELECT TO anon USING (false);

DROP POLICY IF EXISTS "newsletter_subscribers_select_admin" ON newsletter_subscribers;
CREATE POLICY "newsletter_subscribers_select_admin"
  ON newsletter_subscribers FOR SELECT TO authenticated USING (auth.is_admin());

DROP POLICY IF EXISTS "newsletter_subscribers_insert_public" ON newsletter_subscribers;
CREATE POLICY "newsletter_subscribers_insert_public"
  ON newsletter_subscribers FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'subscribed');

DROP POLICY IF EXISTS "newsletter_subscribers_update_admin" ON newsletter_subscribers;
CREATE POLICY "newsletter_subscribers_update_admin"
  ON newsletter_subscribers FOR UPDATE TO authenticated
  USING (auth.is_admin()) WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "newsletter_subscribers_delete_admin" ON newsletter_subscribers;
CREATE POLICY "newsletter_subscribers_delete_admin"
  ON newsletter_subscribers FOR DELETE TO authenticated USING (auth.is_admin());
