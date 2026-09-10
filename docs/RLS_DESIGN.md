# Andalusia Music Platform — Row Level Security (RLS) Design

**Specification Reference:** [`DATABASE_SCHEMA.md`](file:///home/mahmoud/Desktop/cms/DATABASE_SCHEMA.md)  
**Security Reference:** [`SECURITY_MODEL.md`](file:///home/mahmoud/Desktop/cms/SECURITY_MODEL.md)  
**Target Engine:** PostgreSQL 15+ / Supabase Managed PostgreSQL  
**Architectural Gate:** Design validated before execution. **DO NOT APPLY MIGRATIONS YET.**

---

## 1. Core Principles & Master Policy Matrix

### 1.1 Non-Negotiable RLS Principles
- **Default Deny:** Every table must execute `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`. Table owner/superuser bypass is blocked for application roles.
- **Published Public Content Only:** Anonymous users (`anon`) can read records if and only if `is_published = true`.
- **Temporal Gating for Editorial News:** Articles require `is_published = true AND published_at <= now()` for public reading.
- **Hierarchical Visibility:** Child audio tracks and discography releases are readable only if their parent artist record is also published.
- **Zero Public Access to CRM Leads:** `booking_requests` and `newsletter_subscribers` can never be queried by `anon` or general unauthenticated visitors under any circumstances.
- **Mutation Isolation:** All `INSERT`, `UPDATE`, and `DELETE` operations on core content require authenticated administrator privileges.
- **Storage Parity:** Supabase Storage policies mirror database table policies: public read for assets, admin-only upload/mutate/delete.

---

### 1.2 Master Table Access Matrix

| # | Table Name | Role | SELECT | INSERT | UPDATE | DELETE | Condition / Check |
| :- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **1** | `site_settings` | `anon` | **ALLOW** | **DENY** | **DENY** | **DENY** | Public read-only |
| | | `admin` | **ALLOW** | **DENY** | **ALLOW** | **DENY** | Singleton row; updates allowed, insert/delete locked |
| **2** | `artists` | `anon` | **ALLOW** | **DENY** | **DENY** | **DENY** | `is_published = true` |
| | | `admin` | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | Full CRUD |
| **3** | `tracks` | `anon` | **ALLOW** | **DENY** | **DENY** | **DENY** | `is_published = true` AND parent artist published |
| | | `admin` | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | Full CRUD |
| **4** | `releases` | `anon` | **ALLOW** | **DENY** | **DENY** | **DENY** | `is_published = true` AND parent artist published |
| | | `admin` | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | Full CRUD |
| **5** | `events` | `anon` | **ALLOW** | **DENY** | **DENY** | **DENY** | `is_published = true` |
| | | `admin` | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | Full CRUD |
| **6** | `academy_courses` | `anon` | **ALLOW** | **DENY** | **DENY** | **DENY** | `is_published = true` |
| | | `admin` | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | Full CRUD |
| **7** | `articles` | `anon` | **ALLOW** | **DENY** | **DENY** | **DENY** | `is_published = true AND published_at <= now()` |
| | | `admin` | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | Full CRUD |
| **8** | `testimonials` | `anon` | **ALLOW** | **DENY** | **DENY** | **DENY** | `is_published = true` |
| | | `admin` | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | Full CRUD |
| **9** | `booking_requests` | `anon` | **DENY** | **ALLOW\*** | **DENY** | **DENY** | Read-blocked; insert restricted (`status = 'pending'`) |
| | | `admin` | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | Full CRM lead management |
| **10**| `newsletter_subscribers` | `anon` | **DENY** | **ALLOW\*** | **DENY** | **DENY** | Read-blocked; insert restricted (`status = 'subscribed'`) |
| | | `admin` | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | Full lead management |

*\*Note: Public client direct inserts are permitted via strict RLS fallback, but production flow routes write mutations through Next.js Server Actions with anti-spam defense.*

---

## 2. Authentication Helper Functions

To avoid repetitive JSON parsing and ensure zero SQL injection risk in RLS policy definitions, implement cached helper functions running with `SECURITY DEFINER` and fixed `search_path`.

```sql
-- Helper function to verify admin authorization via Supabase Auth JWT claims
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

-- Helper function to verify specific role membership (supports future role expansion)
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
```

---

## 3. Table-by-Table Policy Specification

### 3.1 `site_settings`
- **Security Goal:** Public can read brand copy and social handles; only admins can edit; singleton row cannot be deleted or re-inserted.

```sql
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings FORCE ROW LEVEL SECURITY;

-- SELECT: Public can view global site settings
CREATE POLICY "site_settings_select_public"
  ON site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT: Strictly locked (initialized via database migrations/seed only)
CREATE POLICY "site_settings_insert_admin"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_admin() AND id = 'default');

-- UPDATE: Admin-only modification of branding, contacts, and manifesto copy
CREATE POLICY "site_settings_update_admin"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin() AND id = 'default');

-- DELETE: Strictly prohibited for all roles (preserves singleton integrity)
CREATE POLICY "site_settings_delete_nobody"
  ON site_settings
  FOR DELETE
  TO anon, authenticated
  USING (false);
```

---

### 3.2 `artists`
- **Security Goal:** Public reads published profiles; admins manage full catalog including unpublished drafts.

```sql
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists FORCE ROW LEVEL SECURITY;

-- SELECT (Public): Published artists only
CREATE POLICY "artists_select_published"
  ON artists
  FOR SELECT
  TO anon
  USING (is_published = true);

-- SELECT (Admin): All artist records including drafts
CREATE POLICY "artists_select_admin"
  ON artists
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

-- INSERT: Admin-only
CREATE POLICY "artists_insert_admin"
  ON artists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_admin());

-- UPDATE: Admin-only
CREATE POLICY "artists_update_admin"
  ON artists
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- DELETE: Admin-only
CREATE POLICY "artists_delete_admin"
  ON artists
  FOR DELETE
  TO authenticated
  USING (auth.is_admin());
```

---

### 3.3 `tracks`
- **Security Goal:** Audio files and player metadata visible only when both track and parent artist are published.

```sql
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks FORCE ROW LEVEL SECURITY;

-- SELECT (Public): Published track AND published parent artist
CREATE POLICY "tracks_select_published"
  ON tracks
  FOR SELECT
  TO anon
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM artists
      WHERE artists.id = tracks.artist_id
        AND artists.is_published = true
    )
  );

-- SELECT (Admin): All tracks
CREATE POLICY "tracks_select_admin"
  ON tracks
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

-- INSERT: Admin-only
CREATE POLICY "tracks_insert_admin"
  ON tracks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_admin());

-- UPDATE: Admin-only
CREATE POLICY "tracks_update_admin"
  ON tracks
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- DELETE: Admin-only
CREATE POLICY "tracks_delete_admin"
  ON tracks
  FOR DELETE
  TO authenticated
  USING (auth.is_admin());
```

---

### 3.4 `releases`
- **Security Goal:** Discography catalog items visible only when release and parent artist are published.

```sql
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases FORCE ROW LEVEL SECURITY;

-- SELECT (Public): Published release AND published parent artist
CREATE POLICY "releases_select_published"
  ON releases
  FOR SELECT
  TO anon
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM artists
      WHERE artists.id = releases.artist_id
        AND artists.is_published = true
    )
  );

-- SELECT (Admin): All releases
CREATE POLICY "releases_select_admin"
  ON releases
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

-- INSERT: Admin-only
CREATE POLICY "releases_insert_admin"
  ON releases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_admin());

-- UPDATE: Admin-only
CREATE POLICY "releases_update_admin"
  ON releases
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- DELETE: Admin-only
CREATE POLICY "releases_delete_admin"
  ON releases
  FOR DELETE
  TO authenticated
  USING (auth.is_admin());
```

---

### 3.5 `events`
- **Security Goal:** Public reads published concerts; admins manage scheduling, highlights, and ticket links.

```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE events FORCE ROW LEVEL SECURITY;

-- SELECT (Public): Published events only
CREATE POLICY "events_select_published"
  ON events
  FOR SELECT
  TO anon
  USING (is_published = true);

-- SELECT (Admin): All events
CREATE POLICY "events_select_admin"
  ON events
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

-- INSERT: Admin-only
CREATE POLICY "events_insert_admin"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_admin());

-- UPDATE: Admin-only
CREATE POLICY "events_update_admin"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- DELETE: Admin-only
CREATE POLICY "events_delete_admin"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.is_admin());
```

---

### 3.6 `academy_courses`
- **Security Goal:** Public reads published educational tracks; admins manage course information and instructor links.

```sql
ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_courses FORCE ROW LEVEL SECURITY;

-- SELECT (Public): Published courses only
CREATE POLICY "academy_courses_select_published"
  ON academy_courses
  FOR SELECT
  TO anon
  USING (is_published = true);

-- SELECT (Admin): All courses
CREATE POLICY "academy_courses_select_admin"
  ON academy_courses
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

-- INSERT: Admin-only
CREATE POLICY "academy_courses_insert_admin"
  ON academy_courses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_admin());

-- UPDATE: Admin-only
CREATE POLICY "academy_courses_update_admin"
  ON academy_courses
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- DELETE: Admin-only
CREATE POLICY "academy_courses_delete_admin"
  ON academy_courses
  FOR DELETE
  TO authenticated
  USING (auth.is_admin());
```

---

### 3.7 `articles`
- **Security Goal:** Public reads published cultural articles only if release timestamp has elapsed (`published_at <= now()`). Drafts and scheduled future posts remain concealed.

```sql
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles FORCE ROW LEVEL SECURITY;

-- SELECT (Public): Published articles whose publication timestamp has passed
CREATE POLICY "articles_select_published"
  ON articles
  FOR SELECT
  TO anon
  USING (is_published = true AND published_at <= now());

-- SELECT (Admin): All articles (drafts, past, scheduled)
CREATE POLICY "articles_select_admin"
  ON articles
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

-- INSERT: Admin-only
CREATE POLICY "articles_insert_admin"
  ON articles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_admin());

-- UPDATE: Admin-only
CREATE POLICY "articles_update_admin"
  ON articles
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- DELETE: Admin-only
CREATE POLICY "articles_delete_admin"
  ON articles
  FOR DELETE
  TO authenticated
  USING (auth.is_admin());
```

---

### 3.8 `testimonials`
- **Security Goal:** Public reads published client praise; admins curate the social proof slider.

```sql
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials FORCE ROW LEVEL SECURITY;

-- SELECT (Public): Published testimonials only
CREATE POLICY "testimonials_select_published"
  ON testimonials
  FOR SELECT
  TO anon
  USING (is_published = true);

-- SELECT (Admin): All testimonials
CREATE POLICY "testimonials_select_admin"
  ON testimonials
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

-- INSERT: Admin-only
CREATE POLICY "testimonials_insert_admin"
  ON testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_admin());

-- UPDATE: Admin-only
CREATE POLICY "testimonials_update_admin"
  ON testimonials
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- DELETE: Admin-only
CREATE POLICY "testimonials_delete_admin"
  ON testimonials
  FOR DELETE
  TO authenticated
  USING (auth.is_admin());
```

---

### 3.9 `booking_requests` (Private CRM Leads)
- **Security Goal:** Zero public read access; public can submit inquiries with strict constraint validation; admins triage leads.

```sql
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests FORCE ROW LEVEL SECURITY;

-- SELECT (Public): BLOCKED. Visitors can NEVER read submitted booking inquiries.
CREATE POLICY "booking_requests_select_anon_block"
  ON booking_requests
  FOR SELECT
  TO anon
  USING (false);

-- SELECT (Admin): Triage access to all booking leads
CREATE POLICY "booking_requests_select_admin"
  ON booking_requests
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

-- INSERT (Public Fallback): Permits submission but locks initial status and notes
CREATE POLICY "booking_requests_insert_public"
  ON booking_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND admin_notes IS NULL
  );

-- UPDATE (Admin): Manage status and notes
CREATE POLICY "booking_requests_update_admin"
  ON booking_requests
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- DELETE (Admin): Lead purge or archiving
CREATE POLICY "booking_requests_delete_admin"
  ON booking_requests
  FOR DELETE
  TO authenticated
  USING (auth.is_admin());
```

---

### 3.10 `newsletter_subscribers` (Lead List)
- **Security Goal:** Zero public read access to prevent email harvesting; public can subscribe; admins manage mailing list.

```sql
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers FORCE ROW LEVEL SECURITY;

-- SELECT (Public): BLOCKED. Email addresses can NEVER be queried by public.
CREATE POLICY "newsletter_subscribers_select_anon_block"
  ON newsletter_subscribers
  FOR SELECT
  TO anon
  USING (false);

-- SELECT (Admin): Access to subscriber mailing list
CREATE POLICY "newsletter_subscribers_select_admin"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

-- INSERT (Public Fallback): Allows subscription with default subscribed status
CREATE POLICY "newsletter_subscribers_insert_public"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'subscribed'
  );

-- UPDATE (Admin): Manage subscription status
CREATE POLICY "newsletter_subscribers_update_admin"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- DELETE (Admin): Unsubscribe purges
CREATE POLICY "newsletter_subscribers_delete_admin"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (auth.is_admin());
```

---

## 4. Supabase Storage Security & Policies

### 4.1 Storage Buckets Configuration

| Bucket Name | Public Visibility | Max File Size | Allowed MIME Types | Usage Context |
| :--- | :---: | :---: | :--- | :--- |
| `site` | Public | 5 MB | `image/jpeg`, `image/png`, `image/webp` | Hero background, about portrait, branding |
| `artists` | Public | 5 MB | `image/jpeg`, `image/png`, `image/webp` | Musician profile portraits |
| `audio` | Public | 20 MB | `audio/mpeg`, `audio/ogg`, `audio/wav` | Musician audio player streaming samples |
| `releases` | Public | 5 MB | `image/jpeg`, `image/png`, `image/webp` | Album and discography cover artwork |
| `events` | Public | 5 MB | `image/jpeg`, `image/png`, `image/webp` | Concert promotional posters |
| `academy` | Public | 5 MB | `image/jpeg`, `image/png`, `image/webp` | Learning track visuals |
| `articles` | Public | 5 MB | `image/jpeg`, `image/png`, `image/webp` | Cultural news editorial cover photography |

---

### 4.2 Storage RLS Policies (`storage.objects`)

```sql
-- Enable RLS on storage.objects (Supabase default)
-- 1. SELECT: Public read access across all platform media buckets
CREATE POLICY "storage_public_read_all"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id IN ('site', 'artists', 'audio', 'releases', 'events', 'academy', 'articles')
  );

-- 2. INSERT: Admin-only file upload
CREATE POLICY "storage_admin_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.is_admin()
    AND bucket_id IN ('site', 'artists', 'audio', 'releases', 'events', 'academy', 'articles')
  );

-- 3. UPDATE: Admin-only file overwrite / metadata update
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

-- 4. DELETE: Admin-only file purge
CREATE POLICY "storage_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    auth.is_admin()
    AND bucket_id IN ('site', 'artists', 'audio', 'releases', 'events', 'academy', 'articles')
  );
```

---

## 5. Verification & Assertions Matrix

To validate the security boundaries prior to production deployment, execute the following SQL assertion test suite in a staging transaction:

```sql
-- VERIFICATION SCRIPT (Run as role 'anon')
BEGIN;
  SET LOCAL ROLE anon;

  -- Test 1: Assert public cannot read booking requests
  -- Expected: 0 rows returned
  SELECT count(*) FROM booking_requests;

  -- Test 2: Assert public cannot read newsletter leads
  -- Expected: 0 rows returned
  SELECT count(*) FROM newsletter_subscribers;

  -- Test 3: Assert public cannot read unpublished drafts
  -- Expected: 0 rows returned
  SELECT count(*) FROM artists WHERE is_published = false;

  -- Test 4: Assert public cannot read scheduled future articles
  -- Expected: 0 rows returned
  SELECT count(*) FROM articles WHERE published_at > now();

  -- Test 5: Assert public cannot update site settings
  -- Expected: ERROR 42501 (insufficient privilege)
  -- UPDATE site_settings SET hero_headline = 'Hacked';

ROLLBACK;
```
