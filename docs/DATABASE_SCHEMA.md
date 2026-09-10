# Andalusia Music Platform — Minimal Supabase PostgreSQL Database Design

**Specification Reference:** `CONTENT_INVENTORY.md`, `CMS_SCOPE.md`, `CMS_MODULE_MATRIX.md`  
**Root Figma Reference:** `89:15216` (`الرئيسية`) & child routes (`/artists`, `/artists/[slug]`, `/events`, `/academy`, `/news`, `/news/[slug]`, `/booking`)  
**Target Engine:** PostgreSQL 15+ (Supabase Managed PostgreSQL)  
**Architectural Gate:** Design strictly validated. **DO NOT RUN MIGRATIONS YET. DO NOT IMPLEMENT SCHEMA.**

---

## 1. Schema Evaluation & Table-by-Table Justification

To adhere strictly to the objective of designing the **smallest normalized PostgreSQL schema necessary**, every candidate entity was evaluated against verified Figma nodes and content inventory requirements.

### 1.1 Evaluated & Approved Tables (10 Tables)

| # | Table Name | Cardinality / Nature | Figma Route / UI Evidence | Justification Verdict & Rationale |
| :- | :--- | :--- | :--- | :--- |
| 1 | `site_settings` | Singleton (1 row) | All 7 routes (`Footer.tsx`, `HeroSection.tsx`, `AboutSection.tsx`, `BookingBanner.tsx`) | **ACCEPTED.** Isolates global site-wide marketing copy, manifesto, official contacts, social handles, and footer metadata into a single manageable record without polluting dynamic content tables. |
| 2 | `artists` | Core Entity (~6–20 rows) | `/`, `/artists`, `/artists/[slug]`, `/booking` | **ACCEPTED.** Core domain entity representing ensemble musicians. Required for directory grid, profile pages, filter pills, and booking attribution. |
| 3 | `tracks` | Child of `artists` (1:N) | `/artists/[slug]` (`AudioPlayerWidget.tsx`) | **ACCEPTED.** Musician audio player requires streaming playlist items (`title`, `audio_file_url`, `duration_seconds`). Cannot be flattened into `artists` without violating 1NF. |
| 4 | `releases` | Child of `artists` (1:N) | `/artists/[slug]` (`ReleaseCard.tsx` discography) | **ACCEPTED.** Musician profile displays catalog of studio and live album releases with cover artwork, track counts, and release years. |
| 5 | `events` | Core Entity (~10–50 rows) | `/`, `/events`, `/booking` | **ACCEPTED.** Powers home upcoming events strip and full `/events` catalog with category filters, dates, locations, performer attribution, and booking links. |
| 6 | `academy_courses` | Curated Entity (3 rows) | `/academy` (`TrackCard.tsx`), `/booking` | **ACCEPTED.** Backs the 3 distinct educational curriculum tracks ("مدرسة العود", "فن الأداء", "الصوت والطرب") and course-specific booking routing. |
| 7 | `articles` | Core Entity (~10–100 rows) | `/`, `/news`, `/news/[slug]` | **ACCEPTED.** Powers cultural news stories, interviews, editorial hero banner, and full article markdown reading views. |
| 8 | `testimonials` | Collection (~5–15 rows) | `/` (`TestimonialsSlider.tsx` `Component 22`) | **ACCEPTED.** Powers client and critic social proof testimonials slider on the homepage. |
| 9 | `booking_requests` | CRM Inbound (Transactional) | `/booking` (`BookingForm.tsx`) | **ACCEPTED.** Ingests inbound private concert, wedding, and event booking leads. Write-only for public, admin-managed CRM triage. |
| 10 | `newsletter_subscribers` | CRM Inbound (Transactional) | `/academy` (`AcademyNewsletter.tsx`) | **ACCEPTED.** Ingests lead emails for the monthly cultural newsletter. Isolated single-purpose lead table. |

---

### 1.2 Evaluated & Rejected Candidate Entities (Zero Speculative Tables)

| Candidate Entity | Evaluation | Rejection Rationale & Evidence (YAGNI) |
| :--- | :---: | :--- |
| `artist_social_links` | **REJECTED** | **Zero UI presence in Figma.** Artist profile (`134:4420`) and cards contain NO individual artist social icons. The only social media handles on the platform belong to the ensemble brand (Instagram, TikTok), stored directly as a structured `JSONB` in `site_settings.social_links`. Creating a separate join/child table violates YAGNI. |
| `media_metadata` / `media` | **REJECTED** | **Native platform feature available.** Supabase Storage already manages file objects, MIME types, byte sizes, and timestamps inside `storage.objects`. Content tables store CDN URL strings directly. A custom metadata/attachments table introduces join overhead and orphan synchronization bugs. |
| `event_artists` (M:N) | **REJECTED** | **Unneeded join complexity.** Figma event cards attribute exactly one headline ensemble/performer name string (`performer_name`) and an optional single foreign key (`artist_id`). There is no festival multi-stage lineup schedule. |
| `categories` / `tags` / `taxonomies` | **REJECTED** | **Over-engineered abstraction.** Category sets in Figma are static, verified lists of 4–5 values (e.g., `'singing'`, `'oud'`, `'percussion'`, `'contemporary'`, `'heritage'`). Enforcing them via PostgreSQL native `CHECK` constraints on `VARCHAR` columns eliminates 4 redundant lookup tables and 4 join tables. |
| `pages` / `blocks` / `custom_fields` | **REJECTED** | **Generic CMS bloat strictly rejected.** The site has exactly 7 fixed routes with bespoke Arabic typography. Arbitrary page builders or EAV block schemas degrade TTFB, break RTL responsiveness, and introduce massive code bloat. |
| `curriculum_modules` / `lessons` | **REJECTED** | **No LMS in Figma.** Academy tracks are informational marketing cards directing to booking inquiries (`/booking?course=[slug]`). There are no video portals, student accounts, or lesson progressions. |

---

## 2. Table Specifications

### 2.1 `site_settings`
- **Purpose:** Singleton configuration row for global site copy, hero marketing text, about manifesto, official contact points, social links, and footer metadata.
- **Cardinality:** Exactly 1 row (`id = 'default'`).
- **Publication Status:** Always active (no draft toggle).
- **Ordering:** Not applicable.

| Column | PostgreSQL Type | Nullable | Default | Constraints & Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(50)` | NO | `'default'` | **PK.** `CHECK (id = 'default')` enforces strict singleton pattern. |
| `hero_headline` | `TEXT` | NO | — | Primary hero headline ("منصتك الأولى لاكتشاف ودعم...") |
| `hero_subheadline` | `TEXT` | NO | — | Hero narrative subtitle |
| `hero_image_url` | `VARCHAR(500)` | NO | — | High-res background stage photography (Supabase Storage `site/`) |
| `about_headline` | `VARCHAR(255)` | NO | — | Band manifesto headline ("نكتشف · نصل · نحتفي") |
| `about_body` | `TEXT` | NO | — | Multi-paragraph manifesto body text |
| `about_image_url` | `VARCHAR(500)` | NO | — | Musician portrait visual (Supabase Storage `site/`) |
| `booking_banner_title`| `VARCHAR(255)` | NO | — | Orange CTA banner title ("مناسبتك تستحق...") |
| `booking_banner_body` | `TEXT` | NO | — | Orange CTA banner pitch paragraph |
| `artists_subtitle` | `TEXT` | YES | `NULL` | Optional subtitle on `/artists` directory header |
| `events_subtitle` | `TEXT` | YES | `NULL` | Optional subtitle on `/events` catalog header |
| `academy_subtitle` | `TEXT` | YES | `NULL` | Optional subtitle on `/academy` curriculum header |
| `booking_subtitle` | `TEXT` | YES | `NULL` | Optional subtitle on `/booking` form header |
| `contact_email` | `VARCHAR(255)` | NO | — | Official inquiry email (`hello@andalusia.art`). Validated regex format. |
| `contact_phone` | `VARCHAR(50)` | NO | — | Official contact phone / WhatsApp channel |
| `social_links` | `JSONB` | NO | `'{"instagram": "", "tiktok": ""}'::jsonb` | Key-value store of official platform social URLs |
| `operational_regions`| `VARCHAR(255)` | NO | — | Footer presence string ("لبنان · المغرب · الخليج") |
| `footer_mission` | `TEXT` | NO | — | Footer brand mission narrative |
| `copyright_text` | `VARCHAR(255)` | NO | — | Legal copyright string ("© أندلسيا ٢٠٢٥ — جميع الحقوق محفوظة") |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | Auto-updated modification timestamp |

- **Indexes:** None (single row lookup via primary key `id = 'default'`).
- **Check Constraints:**
  - `check_singleton_id`: `CHECK (id = 'default')`
  - `check_valid_email`: `CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')`

---

### 2.2 `artists`
- **Purpose:** Ensemble musicians, profile biographies, genre disciplines, directory grid, and homepage featured strip.
- **Publication Status:** `is_published` (`BOOLEAN NOT NULL DEFAULT true`). Drafts (`is_published = false`) hidden from public routes.
- **Ordering:** Curated manual ordering via `display_order ASC`, secondary sort `name ASC`.

| Column | PostgreSQL Type | Nullable | Default | Constraints & Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK.** Unique artist identifier. |
| `name` | `VARCHAR(150)` | NO | — | Artist stage name (e.g. "سارة الصوت", "طارق العود") |
| `slug` | `VARCHAR(150)` | NO | — | **UNIQUE.** URL slug for `/artists/[slug]`. Alphanumeric + hyphens. |
| `category` | `VARCHAR(50)` | NO | — | Filter discipline: `'singing'`, `'oud'`, `'percussion'`, `'contemporary'`, `'heritage'` |
| `genre_tag` | `VARCHAR(100)` | NO | — | Display badge on card (e.g. "غناء عربي", "عزف العود") |
| `city` | `VARCHAR(100)` | NO | — | Musician base / origin city (e.g. "الدار البيضاء", "بيروت") |
| `quote` | `TEXT` | NO | — | Primary artistic quote ("الصوت هو المرآة الأصدق للروح.") |
| `spotlight_quote` | `TEXT` | YES | `NULL` | Optional spotlight quote override on profile hero |
| `short_bio` | `TEXT` | NO | — | Summary bio for profile hero teaser |
| `full_bio` | `TEXT` | NO | — | Full multi-paragraph markdown biography |
| `specialties` | `VARCHAR(255)` | NO | — | Disciplines summary ("الصوت • الغناء الأندلسي • الطرب الأصيل") |
| `portrait_image_url`| `VARCHAR(500)` | NO | — | High-res portrait visual (Supabase Storage `artists/`) |
| `is_featured` | `BOOLEAN` | NO | `false` | Pinned to Home featured artists strip (limit 4) |
| `is_published` | `BOOLEAN` | NO | `true` | Public visibility toggle |
| `display_order` | `INTEGER` | NO | `0` | Manual ordering index for directory grid |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | Auto-updated modification timestamp |

- **Foreign Keys:** None.
- **Unique Constraints:** `artists_slug_key` ON (`slug`).
- **Check Constraints:**
  - `check_artists_slug`: `CHECK (slug ~ '^[a-z0-9-]+$')`
  - `check_artists_category`: `CHECK (category IN ('singing', 'oud', 'percussion', 'contemporary', 'heritage'))`
- **Indexes:**
  - `idx_artists_slug`: Unique index on `slug` (enforced by constraint).
  - `idx_artists_published_order`: `ON artists (is_published, display_order ASC, name ASC)`
  - `idx_artists_featured`: `ON artists (is_featured, display_order ASC) WHERE is_featured = true AND is_published = true`
  - `idx_artists_category`: `ON artists (category) WHERE is_published = true`

---

### 2.3 `tracks`
- **Purpose:** Streamable audio sample recordings for the artist profile audio player widget.
- **Publication Status:** `is_published` (`BOOLEAN NOT NULL DEFAULT true`).
- **Ordering:** Playlist sequence via `display_order ASC`.

| Column | PostgreSQL Type | Nullable | Default | Constraints & Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK.** Track identifier. |
| `artist_id` | `UUID` | NO | — | **FK -> `artists(id)` ON DELETE CASCADE.** Artist owner. |
| `title` | `VARCHAR(200)` | NO | — | Track title (e.g. "تقاسيم على مقام البياتي") |
| `audio_file_url` | `VARCHAR(500)` | NO | — | Streamable `.mp3`/`.ogg` URL (Supabase Storage `audio/`) |
| `duration_seconds` | `INTEGER` | NO | — | Duration in seconds (for player timeline scrubber) |
| `cover_image_url` | `VARCHAR(500)` | YES | `NULL` | Optional track visual |
| `display_order` | `INTEGER` | NO | `0` | Playlist sequence order |
| `is_published` | `BOOLEAN` | NO | `true` | Visibility toggle |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Record creation timestamp |

- **Foreign Keys:** `fk_tracks_artist`: `artist_id REFERENCES artists(id) ON DELETE CASCADE`.
- **Check Constraints:**
  - `check_track_duration`: `CHECK (duration_seconds > 0)`
- **Indexes:**
  - `idx_tracks_artist_id`: `ON tracks (artist_id, display_order ASC) WHERE is_published = true`

---

### 2.4 `releases`
- **Purpose:** Musician discography recordings (studio albums, live concert recordings) on `/artists/[slug]`.
- **Publication Status:** `is_published` (`BOOLEAN NOT NULL DEFAULT true`).
- **Ordering:** Chronological descending `release_year DESC`, secondary `display_order ASC`.

| Column | PostgreSQL Type | Nullable | Default | Constraints & Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK.** Release identifier. |
| `artist_id` | `UUID` | NO | — | **FK -> `artists(id)` ON DELETE CASCADE.** Artist owner. |
| `title` | `VARCHAR(200)` | NO | — | Album / recording title (e.g. "نسمة من الأندلس") |
| `release_type` | `VARCHAR(50)` | NO | — | Enum: `'studio'`, `'live'` |
| `track_count` | `INTEGER` | NO | — | Number of tracks in album |
| `release_year` | `INTEGER` | NO | — | 4-digit release year (1900–2100) |
| `cover_image_url` | `VARCHAR(500)` | NO | — | Album sleeve visual (Supabase Storage `releases/`) |
| `display_order` | `INTEGER` | NO | `0` | Sequence override |
| `is_published` | `BOOLEAN` | NO | `true` | Visibility toggle |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Record creation timestamp |

- **Foreign Keys:** `fk_releases_artist`: `artist_id REFERENCES artists(id) ON DELETE CASCADE`.
- **Check Constraints:**
  - `check_release_type`: `CHECK (release_type IN ('studio', 'live'))`
  - `check_track_count`: `CHECK (track_count > 0)`
  - `check_release_year`: `CHECK (release_year BETWEEN 1900 AND 2100)`
- **Indexes:**
  - `idx_releases_artist_id`: `ON releases (artist_id, release_year DESC, display_order ASC) WHERE is_published = true`

---

### 2.5 `events`
- **Purpose:** Live performances, concerts, festivals, musical evenings, and workshops across `/events` and homepage preview.
- **Publication Status:** `is_published` (`BOOLEAN NOT NULL DEFAULT true`).
- **Ordering:** Chronological ascending `event_date ASC` for upcoming events. `is_featured = true` prioritizes top highlight banner.

| Column | PostgreSQL Type | Nullable | Default | Constraints & Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK.** Event identifier. |
| `title` | `VARCHAR(200)` | NO | — | Event headline (e.g. "ليلة الطرب الأندلسي") |
| `slug` | `VARCHAR(200)` | NO | — | **UNIQUE.** Identifier for booking routing. |
| `category` | `VARCHAR(50)` | NO | — | Enum: `'concert'`, `'festival'`, `'evening'`, `'workshop'` |
| `event_date` | `TIMESTAMPTZ` | NO | — | Performance date and start time |
| `location` | `VARCHAR(200)` | NO | — | Venue & country string (e.g. "بيروت — لبنان") |
| `city` | `VARCHAR(100)` | NO | — | City name for card badge (e.g. "بيروت", "عمان") |
| `performer_name` | `VARCHAR(150)` | NO | — | Headline artist/ensemble attribution (e.g. "أحمد العود") |
| `artist_id` | `UUID` | YES | `NULL` | **FK -> `artists(id)` ON DELETE SET NULL.** Optional link to artist. |
| `description` | `TEXT` | YES | `NULL` | Event details, program notes, or schedule summary |
| `image_url` | `VARCHAR(500)` | NO | — | Event promotional poster (Supabase Storage `events/`) |
| `ticket_url` | `VARCHAR(500)` | YES | `NULL` | External ticketing URL (if null, routes to `/booking?event_id=[id]`) |
| `is_featured` | `BOOLEAN` | NO | `false` | Highlighted in "الفعالية الأبرز" banner on `/events` |
| `status` | `VARCHAR(50)` | NO | `'upcoming'` | Lifecycle: `'upcoming'`, `'ongoing'`, `'completed'`, `'cancelled'` |
| `is_published` | `BOOLEAN` | NO | `true` | Visibility toggle |
| `display_order` | `INTEGER` | NO | `0` | Sequence override index |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | Auto-updated modification timestamp |

- **Foreign Keys:** `fk_events_artist`: `artist_id REFERENCES artists(id) ON DELETE SET NULL`.
- **Unique Constraints:** `events_slug_key` ON (`slug`).
- **Check Constraints:**
  - `check_events_slug`: `CHECK (slug ~ '^[a-z0-9-]+$')`
  - `check_events_category`: `CHECK (category IN ('concert', 'festival', 'evening', 'workshop'))`
  - `check_events_status`: `CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled'))`
- **Indexes:**
  - `idx_events_slug`: Unique index on `slug`.
  - `idx_events_date`: `ON events (event_date ASC) WHERE is_published = true`
  - `idx_events_category_date`: `ON events (category, event_date ASC) WHERE is_published = true`
  - `idx_events_featured`: `ON events (is_featured) WHERE is_featured = true AND is_published = true`
  - `idx_events_artist_id`: `ON events (artist_id)`

---

### 2.6 `academy_courses`
- **Purpose:** The 3 curated educational curriculum tracks ("ثلاثة مسارات، موهبة واحدة") presented on `/academy`.
- **Publication Status:** `is_published` (`BOOLEAN NOT NULL DEFAULT true`).
- **Ordering:** Fixed curriculum sequence via `display_order ASC` (1: مدرسة العود, 2: فن الأداء, 3: الصوت والطرب).

| Column | PostgreSQL Type | Nullable | Default | Constraints & Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK.** Course track identifier. |
| `title` | `VARCHAR(150)` | NO | — | Track title (e.g. "مدرسة العود") |
| `slug` | `VARCHAR(150)` | NO | — | **UNIQUE.** Routing identifier for `/booking?course=[slug]` |
| `track_category` | `VARCHAR(100)` | NO | — | Track discipline badge (e.g. "مدرسة التراث") |
| `description` | `TEXT` | NO | — | Curriculum overview paragraph |
| `instructor_name` | `VARCHAR(150)` | YES | `NULL` | Lead instructor display name |
| `instructor_id` | `UUID` | YES | `NULL` | **FK -> `artists(id)` ON DELETE SET NULL.** Optional link to artist. |
| `image_url` | `VARCHAR(500)` | YES | `NULL` | Track artwork visual (Supabase Storage `academy/`) |
| `display_order` | `INTEGER` | NO | `1` | Strict sequence index (1, 2, 3) |
| `is_published` | `BOOLEAN` | NO | `true` | Visibility toggle |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | Auto-updated modification timestamp |

- **Foreign Keys:** `fk_academy_courses_instructor`: `instructor_id REFERENCES artists(id) ON DELETE SET NULL`.
- **Unique Constraints:** `academy_courses_slug_key` ON (`slug`).
- **Check Constraints:**
  - `check_academy_slug`: `CHECK (slug ~ '^[a-z0-9-]+$')`
  - `check_academy_display_order`: `CHECK (display_order BETWEEN 1 AND 10)`
- **Indexes:**
  - `idx_academy_courses_slug`: Unique index on `slug`.
  - `idx_academy_courses_order`: `ON academy_courses (display_order ASC) WHERE is_published = true`
  - `idx_academy_courses_instructor`: `ON academy_courses (instructor_id)`

---

### 2.7 `articles`
- **Purpose:** Editorial cultural news, musician stories, interviews, and festival retrospectives on `/news` and `/`.
- **Publication Status:** `is_published` (`BOOLEAN NOT NULL DEFAULT true`) + `published_at <= now()`.
- **Ordering:** Reverse chronological `published_at DESC`. `is_featured = true` prioritizes the hero article.

| Column | PostgreSQL Type | Nullable | Default | Constraints & Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK.** Article identifier. |
| `title` | `VARCHAR(250)` | NO | — | Article headline (e.g. "الموسيقى تعبر الحدود") |
| `slug` | `VARCHAR(250)` | NO | — | **UNIQUE.** Identifier for `/news/[slug]` |
| `category` | `VARCHAR(100)` | NO | — | Enum: `'culture'`, `'artists'`, `'academy'`, `'events'` |
| `excerpt` | `TEXT` | NO | — | Brief article teaser (max 350 chars) |
| `content` | `TEXT` | NO | — | Full article body in Markdown format |
| `cover_image_url` | `VARCHAR(500)` | NO | — | Editorial header photograph (Supabase Storage `articles/`) |
| `author_name` | `VARCHAR(150)` | NO | — | Writer attribution (e.g. "هيئة التحرير") |
| `featured_artist_id`| `UUID` | YES | `NULL` | **FK -> `artists(id)` ON DELETE SET NULL.** Optional related artist. |
| `published_at` | `TIMESTAMPTZ` | NO | `now()` | Public release timestamp (supports scheduled publishing) |
| `is_featured` | `BOOLEAN` | NO | `false` | Pinned to `/news` hero story & homepage editorial strip |
| `is_published` | `BOOLEAN` | NO | `true` | Admin visibility toggle |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | Auto-updated modification timestamp |

- **Foreign Keys:** `fk_articles_artist`: `featured_artist_id REFERENCES artists(id) ON DELETE SET NULL`.
- **Unique Constraints:** `articles_slug_key` ON (`slug`).
- **Check Constraints:**
  - `check_articles_slug`: `CHECK (slug ~ '^[a-z0-9-]+$')`
  - `check_articles_category`: `CHECK (category IN ('culture', 'artists', 'academy', 'events'))`
- **Indexes:**
  - `idx_articles_slug`: Unique index on `slug`.
  - `idx_articles_feed`: `ON articles (published_at DESC) WHERE is_published = true`
  - `idx_articles_category`: `ON articles (category, published_at DESC) WHERE is_published = true`
  - `idx_articles_featured`: `ON articles (is_featured, published_at DESC) WHERE is_featured = true AND is_published = true`
  - `idx_articles_artist`: `ON articles (featured_artist_id)`

---

### 2.8 `testimonials`
- **Purpose:** Endorsement quotes, critic reviews, and attendee praise for homepage testimonials carousel (`Component 22`).
- **Publication Status:** `is_published` (`BOOLEAN NOT NULL DEFAULT true`).
- **Ordering:** Carousel sequence via `display_order ASC`.

| Column | PostgreSQL Type | Nullable | Default | Constraints & Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK.** Testimonial identifier. |
| `quote` | `TEXT` | NO | — | Quotation text ("أندلسيا ليست مجرد منصة...") |
| `author_name` | `VARCHAR(150)` | NO | — | Reviewer full name (e.g. "عمر الحاج") |
| `author_role` | `VARCHAR(150)` | NO | — | Professional affiliation (e.g. "ناقد موسيقي") |
| `avatar_image_url` | `VARCHAR(500)` | YES | `NULL` | Optional headshot (Supabase Storage `site/avatars/`) |
| `display_order` | `INTEGER` | NO | `0` | Slide sequence order |
| `is_published` | `BOOLEAN` | NO | `true` | Visibility toggle |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Record creation timestamp |

- **Foreign Keys:** None.
- **Check Constraints:** None (lengths bounded by `VARCHAR`).
- **Indexes:**
  - `idx_testimonials_order`: `ON testimonials (display_order ASC) WHERE is_published = true`

---

### 2.9 `booking_requests` (CRM Leads)
- **Purpose:** User-submitted booking inquiries from `/booking`. Private, write-only for visitors, managed by staff.
- **Publication Status:** Not applicable (Private CRM records; never rendered publicly).
- **Ordering:** Reverse chronological `created_at DESC`.

| Column | PostgreSQL Type | Nullable | Default | Constraints & Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK.** Inquiry identifier. |
| `full_name` | `VARCHAR(150)` | NO | — | Client full name |
| `email` | `VARCHAR(255)` | NO | — | Client contact email |
| `phone` | `VARCHAR(50)` | YES | `NULL` | Optional international contact phone / WhatsApp |
| `budget_range` | `VARCHAR(100)` | YES | `NULL` | Approximate budget (e.g. "١٠٠٠ - ٥٠٠٠ دولار") |
| `event_type` | `VARCHAR(100)` | NO | — | Enum: `'private_concert'`, `'wedding'`, `'festival'`, `'hotel'`, `'other'` |
| `event_date` | `DATE` | NO | — | Target engagement date |
| `preferred_artist` | `VARCHAR(150)` | YES | `NULL` | Captured text name of requested artist |
| `artist_id` | `UUID` | YES | `NULL` | **FK -> `artists(id)` ON DELETE SET NULL.** Linked artist if selected. |
| `event_id` | `UUID` | YES | `NULL` | **FK -> `events(id)` ON DELETE SET NULL.** Linked event if booked via card. |
| `message` | `TEXT` | NO | — | Inquiry description and requirements |
| `status` | `VARCHAR(50)` | NO | `'pending'` | Triage status: `'pending'`, `'contacted'`, `'confirmed'`, `'archived'` |
| `admin_notes` | `TEXT` | YES | `NULL` | Staff internal follow-up notes |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Ingestion timestamp |

- **Foreign Keys:**
  - `fk_booking_artist`: `artist_id REFERENCES artists(id) ON DELETE SET NULL`
  - `fk_booking_event`: `event_id REFERENCES events(id) ON DELETE SET NULL`
- **Check Constraints:**
  - `check_booking_email`: `CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')`
  - `check_booking_event_type`: `CHECK (event_type IN ('private_concert', 'wedding', 'festival', 'hotel', 'other'))`
  - `check_booking_status`: `CHECK (status IN ('pending', 'contacted', 'confirmed', 'archived'))`
- **Indexes:**
  - `idx_booking_requests_status_created`: `ON booking_requests (status, created_at DESC)`
  - `idx_booking_requests_artist`: `ON booking_requests (artist_id)`
  - `idx_booking_requests_event`: `ON booking_requests (event_id)`

---

### 2.10 `newsletter_subscribers` (Lead List)
- **Purpose:** Email subscriber leads collected from `/academy` lead form ("رسالة واحدة في الشهر").
- **Publication Status:** Not applicable (Private CRM records).
- **Ordering:** Reverse chronological `created_at DESC`.

| Column | PostgreSQL Type | Nullable | Default | Constraints & Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | **PK.** Subscriber identifier. |
| `email` | `VARCHAR(255)` | NO | — | **UNIQUE.** Subscriber email address. |
| `status` | `VARCHAR(50)` | NO | `'subscribed'` | Enum: `'subscribed'`, `'unsubscribed'` |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Subscription timestamp |

- **Foreign Keys:** None.
- **Unique Constraints:** `newsletter_subscribers_email_key` ON (`email`).
- **Check Constraints:**
  - `check_newsletter_email`: `CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')`
  - `check_newsletter_status`: `CHECK (status IN ('subscribed', 'unsubscribed'))`
- **Indexes:**
  - `idx_newsletter_email`: Unique index on `email`.
  - `idx_newsletter_status_created`: `ON newsletter_subscribers (status, created_at DESC)`

---

## 3. Future English / Multi-Language Compatibility Strategy

To maintain the **smallest normalized schema** without speculative duplication, the schema avoids creating duplicate tables (`artists_en`, `tracks_en`, etc.) or generic EAV translation tables.

### 3.1 Architectural Principles for Localization
1. **Zero Table Duplication:** No parallel `_en` tables. Relational integrity and foreign keys remain anchored to the single canonical entity `id`.
2. **Zero Immediate Overhead:** Do not add speculative empty English columns today while copy is Arabic-only.
3. **Additive Non-Destructive Migration:** PostgreSQL supports adding nullable columns in $O(1)$ constant time without table locks or data rewrites:
   ```sql
   -- When English translation copy is approved post-launch:
   ALTER TABLE artists 
     ADD COLUMN name_en VARCHAR(150),
     ADD COLUMN quote_en TEXT,
     ADD COLUMN short_bio_en TEXT,
     ADD COLUMN full_bio_en TEXT,
     ADD COLUMN specialties_en VARCHAR(255);
   ```
4. **Fallback Query Pattern:**
   In Next.js data fetching layers:
   ```sql
   SELECT 
     id,
     COALESCE(name_en, name) AS name,
     COALESCE(short_bio_en, short_bio) AS short_bio
   FROM artists
   WHERE is_published = true;
   ```
   This guarantees 100% backward compatibility with zero downtime.

---

## 4. DDL Specification Reference (DO NOT EXECUTE)

The following PostgreSQL DDL is provided strictly as an architectural specification.

```sql
-- ============================================================================
-- ANDALUSIA MUSIC PLATFORM — SPECIFICATION DDL
-- DO NOT RUN AS MIGRATION YET. SPECIFICATION REFERENCE ONLY.
-- ============================================================================

-- 1. Site Settings (Singleton)
CREATE TABLE site_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  hero_headline TEXT NOT NULL,
  hero_subheadline TEXT NOT NULL,
  hero_image_url VARCHAR(500) NOT NULL,
  about_headline VARCHAR(255) NOT NULL,
  about_body TEXT NOT NULL,
  about_image_url VARCHAR(500) NOT NULL,
  booking_banner_title VARCHAR(255) NOT NULL,
  booking_banner_body TEXT NOT NULL,
  artists_subtitle TEXT NULL,
  events_subtitle TEXT NULL,
  academy_subtitle TEXT NULL,
  booking_subtitle TEXT NULL,
  contact_email VARCHAR(255) NOT NULL CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  contact_phone VARCHAR(50) NOT NULL,
  social_links JSONB NOT NULL DEFAULT '{"instagram": "", "tiktok": ""}'::jsonb,
  operational_regions VARCHAR(255) NOT NULL,
  footer_mission TEXT NOT NULL,
  copyright_text VARCHAR(255) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Artists
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  category VARCHAR(50) NOT NULL CHECK (category IN ('singing', 'oud', 'percussion', 'contemporary', 'heritage')),
  genre_tag VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  quote TEXT NOT NULL,
  spotlight_quote TEXT NULL,
  short_bio TEXT NOT NULL,
  full_bio TEXT NOT NULL,
  specialties VARCHAR(255) NOT NULL,
  portrait_image_url VARCHAR(500) NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_artists_published_order ON artists (is_published, display_order ASC, name ASC);
CREATE INDEX idx_artists_featured ON artists (is_featured, display_order ASC) WHERE is_featured = true AND is_published = true;
CREATE INDEX idx_artists_category ON artists (category) WHERE is_published = true;

-- 3. Tracks
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  audio_file_url VARCHAR(500) NOT NULL,
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
  cover_image_url VARCHAR(500) NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracks_artist_id ON tracks (artist_id, display_order ASC) WHERE is_published = true;

-- 4. Releases
CREATE TABLE releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  release_type VARCHAR(50) NOT NULL CHECK (release_type IN ('studio', 'live')),
  track_count INTEGER NOT NULL CHECK (track_count > 0),
  release_year INTEGER NOT NULL CHECK (release_year BETWEEN 1900 AND 2100),
  cover_image_url VARCHAR(500) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_releases_artist_id ON releases (artist_id, release_year DESC, display_order ASC) WHERE is_published = true;

-- 5. Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  category VARCHAR(50) NOT NULL CHECK (category IN ('concert', 'festival', 'evening', 'workshop')),
  event_date TIMESTAMPTZ NOT NULL,
  location VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  performer_name VARCHAR(150) NOT NULL,
  artist_id UUID NULL REFERENCES artists(id) ON DELETE SET NULL,
  description TEXT NULL,
  image_url VARCHAR(500) NOT NULL,
  ticket_url VARCHAR(500) NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(50) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_date ON events (event_date ASC) WHERE is_published = true;
CREATE INDEX idx_events_category_date ON events (category, event_date ASC) WHERE is_published = true;
CREATE INDEX idx_events_featured ON events (is_featured) WHERE is_featured = true AND is_published = true;
CREATE INDEX idx_events_artist_id ON events (artist_id);

-- 6. Academy Courses
CREATE TABLE academy_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  track_category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  instructor_name VARCHAR(150) NULL,
  instructor_id UUID NULL REFERENCES artists(id) ON DELETE SET NULL,
  image_url VARCHAR(500) NULL,
  display_order INTEGER NOT NULL DEFAULT 1 CHECK (display_order BETWEEN 1 AND 10),
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_academy_courses_order ON academy_courses (display_order ASC) WHERE is_published = true;
CREATE INDEX idx_academy_courses_instructor ON academy_courses (instructor_id);

-- 7. Articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(250) NOT NULL,
  slug VARCHAR(250) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  category VARCHAR(100) NOT NULL CHECK (category IN ('culture', 'artists', 'academy', 'events')),
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url VARCHAR(500) NOT NULL,
  author_name VARCHAR(150) NOT NULL,
  featured_artist_id UUID NULL REFERENCES artists(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_articles_feed ON articles (published_at DESC) WHERE is_published = true;
CREATE INDEX idx_articles_category ON articles (category, published_at DESC) WHERE is_published = true;
CREATE INDEX idx_articles_featured ON articles (is_featured, published_at DESC) WHERE is_featured = true AND is_published = true;
CREATE INDEX idx_articles_artist ON articles (featured_artist_id);

-- 8. Testimonials
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  author_name VARCHAR(150) NOT NULL,
  author_role VARCHAR(150) NOT NULL,
  avatar_image_url VARCHAR(500) NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_testimonials_order ON testimonials (display_order ASC) WHERE is_published = true;

-- 9. Booking Requests (CRM Leads)
CREATE TABLE booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone VARCHAR(50) NULL,
  budget_range VARCHAR(100) NULL,
  event_type VARCHAR(100) NOT NULL CHECK (event_type IN ('private_concert', 'wedding', 'festival', 'hotel', 'other')),
  event_date DATE NOT NULL,
  preferred_artist VARCHAR(150) NULL,
  artist_id UUID NULL REFERENCES artists(id) ON DELETE SET NULL,
  event_id UUID NULL REFERENCES events(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'archived')),
  admin_notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_requests_status_created ON booking_requests (status, created_at DESC);
CREATE INDEX idx_booking_requests_artist ON booking_requests (artist_id);
CREATE INDEX idx_booking_requests_event ON booking_requests (event_id);

-- 10. Newsletter Subscribers
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  status VARCHAR(50) NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_newsletter_status_created ON newsletter_subscribers (status, created_at DESC);
```
