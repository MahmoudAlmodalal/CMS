-- Task 26 — RLS test harness (TEST-ONLY, never a migration).
-- Run as superuser AFTER base migrations 01–11 and BEFORE 12–13.
-- Provides: Supabase-equivalent roles, table grants, mock auth.jwt(),
-- minimal storage.objects mock, and fixture rows covering every policy path.
-- Reusable in Task 53 (Authorization and RLS QA).

-- 1. Roles (Supabase defaults) + grants so RLS — not GRANTs — decides.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- 2. Mock auth.jwt(): reads session claim injected per-test via test.jwt.
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('test.jwt', true), '')::jsonb;
$$;

-- 3. Minimal storage.objects mock (platform provisions the real one; Task 29).
CREATE SCHEMA IF NOT EXISTS storage;
CREATE TABLE IF NOT EXISTS storage.objects (bucket_id text NOT NULL, name text NOT NULL);
-- Platform parity: Supabase ships storage.objects with RLS forced on; mirror that.
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects FORCE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO anon, authenticated;

-- 4. Fixtures (owner insert, pre-RLS).
INSERT INTO artists (id,name,slug,category,genre_tag,city,quote,short_bio,full_bio,specialties,portrait_image_url,is_published) VALUES
  ('11111111-1111-1111-1111-111111111111','Layla Oud','layla-oud','oud','maqam','Beirut','q','short','full','oud','https://x/p.jpg',true),
  ('22222222-2222-2222-2222-222222222222','Draft Singer','draft-singer','singing','pop','Cairo','q','short','full','voice','https://x/d.jpg',false);

INSERT INTO tracks (artist_id,title,audio_file_url,duration_seconds,is_published) VALUES
  ('11111111-1111-1111-1111-111111111111','Mawwal','https://x/a.mp3',180,true),
  ('22222222-2222-2222-2222-222222222222','Orphan Song','https://x/b.mp3',200,true),
  ('11111111-1111-1111-1111-111111111111','Draft Take','https://x/c.mp3',150,false);

INSERT INTO releases (artist_id,title,release_type,track_count,release_year,cover_image_url,is_published) VALUES
  ('11111111-1111-1111-1111-111111111111','Debut','studio',8,2024,'https://x/r.jpg',true),
  ('22222222-2222-2222-2222-222222222222','Orphan LP','live',5,2023,'https://x/r2.jpg',true);

INSERT INTO events (title,slug,category,event_date,location,city,performer_name,image_url,is_published) VALUES
  ('Spring Concert','spring-concert','concert','2026-12-01T20:00:00Z','Hall','Beirut','Layla','https://x/e.jpg',true),
  ('Draft Gig','draft-gig','evening','2026-12-02T20:00:00Z','Club','Cairo','Draft','https://x/e2.jpg',false);

INSERT INTO academy_courses (title,slug,track_category,description,display_order,is_published) VALUES
  ('Oud Basics','oud-basics','oud','learn',1,true),
  ('Draft Course','draft-course','singing','learn',2,false);

INSERT INTO articles (title,slug,category,excerpt,content,cover_image_url,author_name,published_at,is_published) VALUES
  ('Past Story','past-story','culture','ex','body','https://x/n.jpg','Editor',now() - interval '1 day',true),
  ('Future Story','future-story','events','ex','body','https://x/n2.jpg','Editor',now() + interval '1 day',true),
  ('Draft Story','draft-story','artists','ex','body','https://x/n3.jpg','Editor',now() - interval '1 day',false);

INSERT INTO testimonials (quote,author_name,author_role,is_published) VALUES
  ('Bravo','Fan One','Attendee',true),
  ('Draft praise','Fan Two','Attendee',false);

INSERT INTO booking_requests (full_name,email,event_type,event_date,message) VALUES
  ('Lead One','lead1@example.com','wedding','2026-12-01','hello');

INSERT INTO newsletter_subscribers (email) VALUES ('sub1@example.com');

INSERT INTO storage.objects (bucket_id,name) VALUES ('audio','samples/t1.mp3');
