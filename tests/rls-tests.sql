-- Task 26 — RLS policy test matrix (TEST-ONLY, never a migration).
-- Run as superuser AFTER migrations 12–13. Each test is self-rolled-back.
-- Convention: positive tests print (test, actual, expected); negative tests
-- must print an ERROR (policy enforced). Results recorded in RLS_TEST_REPORT.md.

-- T00 meta: RLS forced everywhere; 53 policies (49 table + 4 storage).
SELECT 'T00' AS test, count(*) AS forced_tables, 11 AS expected FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname IN ('public','storage') AND c.relkind='r' AND c.relforcerowsecurity;
SELECT 'T00' AS test, count(*) AS policies, 53 AS expected FROM pg_policies WHERE schemaname IN ('public','storage');

-- T01 anon reads published artists only.
BEGIN; SET LOCAL ROLE anon;
SELECT 'T01' AS test, count(*) AS actual, 1 AS expected FROM artists;
ROLLBACK;

-- T02 anon tracks: published + published parent only (orphan + draft hidden).
BEGIN; SET LOCAL ROLE anon;
SELECT 'T02' AS test, count(*) AS actual, 1 AS expected FROM tracks;
ROLLBACK;

-- T03 anon releases: parent rule.
BEGIN; SET LOCAL ROLE anon;
SELECT 'T03' AS test, count(*) AS actual, 1 AS expected FROM releases;
ROLLBACK;

-- T04 anon events / academy / testimonials: published only.
BEGIN; SET LOCAL ROLE anon;
SELECT 'T04a' AS test, count(*) AS actual, 1 AS expected FROM events;
ROLLBACK;
BEGIN; SET LOCAL ROLE anon;
SELECT 'T04b' AS test, count(*) AS actual, 1 AS expected FROM academy_courses;
ROLLBACK;
BEGIN; SET LOCAL ROLE anon;
SELECT 'T04c' AS test, count(*) AS actual, 1 AS expected FROM testimonials;
ROLLBACK;

-- T05 anon articles: past-published only (future + draft hidden).
BEGIN; SET LOCAL ROLE anon;
SELECT 'T05' AS test, count(*) AS actual, 1 AS expected FROM articles;
ROLLBACK;

-- T06 anon site_settings readable.
BEGIN; SET LOCAL ROLE anon;
SELECT 'T06' AS test, count(*) AS actual, 1 AS expected FROM site_settings;
ROLLBACK;

-- T07 anon CRM reads blocked.
BEGIN; SET LOCAL ROLE anon;
SELECT 'T07a' AS test, count(*) AS actual, 0 AS expected FROM booking_requests;
ROLLBACK;
BEGIN; SET LOCAL ROLE anon;
SELECT 'T07b' AS test, count(*) AS actual, 0 AS expected FROM newsletter_subscribers;
ROLLBACK;

-- T08 anon booking insert pending (allowed).
BEGIN; SET LOCAL ROLE anon;
INSERT INTO booking_requests (full_name,email,event_type,event_date,message) VALUES ('T08','t08@example.com','hotel','2026-12-05','x');
ROLLBACK;

-- T09 anon booking insert status=confirmed (DENIED).
BEGIN; SET LOCAL ROLE anon;
INSERT INTO booking_requests (full_name,email,event_type,event_date,message,status) VALUES ('T09','t09@example.com','hotel','2026-12-05','x','confirmed');
ROLLBACK;

-- T10 anon booking insert with admin_notes (DENIED).
BEGIN; SET LOCAL ROLE anon;
INSERT INTO booking_requests (full_name,email,event_type,event_date,message,admin_notes) VALUES ('T10','t10@example.com','hotel','2026-12-05','x','sneaky');
ROLLBACK;

-- T11 anon newsletter subscribe (allowed).
BEGIN; SET LOCAL ROLE anon;
INSERT INTO newsletter_subscribers (email) VALUES ('t11@example.com');
ROLLBACK;

-- T12 anon newsletter status=unsubscribed (DENIED).
BEGIN; SET LOCAL ROLE anon;
INSERT INTO newsletter_subscribers (email,status) VALUES ('t12@example.com','unsubscribed');
ROLLBACK;

-- T13 anon mutations on content (all DENIED: UPDATE/DELETE with no matching
-- policy affect 0 rows silently; INSERT raises ERROR).
BEGIN; SET LOCAL ROLE anon;
UPDATE site_settings SET hero_headline = 'Hacked'; -- expect UPDATE 0
ROLLBACK;
BEGIN; SET LOCAL ROLE anon;
INSERT INTO artists (name,slug,category,genre_tag,city,quote,short_bio,full_bio,specialties,portrait_image_url) VALUES ('Hack','hack','oud','g','c','q','s','f','sp','u'); -- expect ERROR
ROLLBACK;
BEGIN; SET LOCAL ROLE anon;
DELETE FROM artists WHERE slug='layla-oud'; -- expect DELETE 0
ROLLBACK;

-- T14 authenticated non-admin: sees nothing, writes nothing.
BEGIN; SET LOCAL ROLE authenticated;
SELECT 'T14a' AS test, count(*) AS actual, 0 AS expected FROM artists;
ROLLBACK;
BEGIN; SET LOCAL ROLE authenticated;
INSERT INTO artists (name,slug,category,genre_tag,city,quote,short_bio,full_bio,specialties,portrait_image_url) VALUES ('Hack2','hack2','oud','g','c','q','s','f','sp','u');
ROLLBACK;

-- T15 authenticated admin: full read (incl. drafts, future, CRM).
BEGIN; SET LOCAL ROLE authenticated; SET LOCAL test.jwt = '{"app_metadata":{"role":"admin"}}';
SELECT 'T15a' AS test, count(*) AS actual, 2 AS expected FROM artists;
ROLLBACK;
BEGIN; SET LOCAL ROLE authenticated; SET LOCAL test.jwt = '{"app_metadata":{"role":"admin"}}';
SELECT 'T15b' AS test, count(*) AS actual, 3 AS expected FROM tracks;
ROLLBACK;
BEGIN; SET LOCAL ROLE authenticated; SET LOCAL test.jwt = '{"app_metadata":{"role":"admin"}}';
SELECT 'T15c' AS test, count(*) AS actual, 3 AS expected FROM articles;
ROLLBACK;
BEGIN; SET LOCAL ROLE authenticated; SET LOCAL test.jwt = '{"app_metadata":{"role":"admin"}}';
SELECT 'T15d' AS test, count(*) AS actual, 1 AS expected FROM booking_requests;
ROLLBACK;
BEGIN; SET LOCAL ROLE authenticated; SET LOCAL test.jwt = '{"app_metadata":{"role":"admin"}}';
SELECT 'T15e' AS test, count(*) AS actual, 1 AS expected FROM newsletter_subscribers;
ROLLBACK;

-- T16 admin mutations (allowed).
BEGIN; SET LOCAL ROLE authenticated; SET LOCAL test.jwt = '{"app_metadata":{"role":"admin"}}';
UPDATE booking_requests SET status='contacted' WHERE email='lead1@example.com';
ROLLBACK;
BEGIN; SET LOCAL ROLE authenticated; SET LOCAL test.jwt = '{"app_metadata":{"role":"admin"}}';
UPDATE site_settings SET hero_headline = 'Admin Edit' WHERE id='default';
ROLLBACK;
BEGIN; SET LOCAL ROLE authenticated; SET LOCAL test.jwt = '{"app_metadata":{"role":"admin"}}';
INSERT INTO artists (name,slug,category,genre_tag,city,quote,short_bio,full_bio,specialties,portrait_image_url) VALUES ('Admin Add','admin-add','oud','g','c','q','s','f','sp','u');
ROLLBACK;
BEGIN; SET LOCAL ROLE authenticated; SET LOCAL test.jwt = '{"app_metadata":{"role":"admin"}}';
DELETE FROM testimonials WHERE author_name='Fan Two';
ROLLBACK;

-- T17 admin site_settings delete (DENIED — singleton preserved; expect DELETE 0).
BEGIN; SET LOCAL ROLE authenticated; SET LOCAL test.jwt = '{"app_metadata":{"role":"admin"}}';
DELETE FROM site_settings WHERE id='default';
ROLLBACK;

-- T18 storage.objects: anon read OK / anon write DENIED / admin write OK.
-- (Requires RLS enabled on storage.objects — platform default; harness mirrors it.)
BEGIN; SET LOCAL ROLE anon;
SELECT 'T18a' AS test, count(*) AS actual, 1 AS expected FROM storage.objects;
ROLLBACK;
BEGIN; SET LOCAL ROLE anon;
INSERT INTO storage.objects (bucket_id,name) VALUES ('audio','samples/hack.mp3');
ROLLBACK;
BEGIN; SET LOCAL ROLE authenticated; SET LOCAL test.jwt = '{"app_metadata":{"role":"admin"}}';
INSERT INTO storage.objects (bucket_id,name) VALUES ('audio','samples/admin.mp3');
ROLLBACK;
BEGIN; SET LOCAL ROLE authenticated; SET LOCAL test.jwt = '{"app_metadata":{"role":"admin"}}';
DELETE FROM storage.objects WHERE name='samples/t1.mp3';
ROLLBACK;
BEGIN; SET LOCAL ROLE authenticated; SET LOCAL test.jwt = '{"app_metadata":{"role":"admin"}}';
INSERT INTO storage.objects (bucket_id,name) VALUES ('evil-bucket','x.mp3');
ROLLBACK;

-- T19 admin direct booking insert with notes (DENIED per spec: no admin INSERT
-- policy exists — only the public pending/notes-NULL fallback; see OBS-1 in
-- RLS_TEST_REPORT.md. Privileged admin writes use the service_role path, Task 28).
BEGIN; SET LOCAL ROLE authenticated; SET LOCAL test.jwt = '{"app_metadata":{"role":"admin"}}';
INSERT INTO booking_requests (full_name,email,event_type,event_date,message,status,admin_notes) VALUES ('T19','t19@example.com','other','2026-12-06','x','confirmed','vip'); -- expect ERROR
ROLLBACK;
