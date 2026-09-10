# Andalusia Music Platform — Production CMS Scope Definition

**Specification Reference:** `CONTENT_INVENTORY.md`, `CMS_MODULE_MATRIX.md`, `DATA_RELATIONSHIP_MAP.md` (Task 11)  
**Root Figma Reference:** `89:15216` (`الرئيسية`) & child screens (`/artists`, `/events`, `/academy`, `/news`, `/booking`)  
**Target Architecture:** Next.js 15 App Router + Supabase PostgreSQL & Storage  
**Audit Principle:** Smallest production-quality CMS required by actual website needs. Zero speculative abstractions.

---

## 1. Executive Summary & Verification Matrix

All candidate modules from Task 11 were cross-checked against Figma canvas nodes and the verified content inventory. Each module is justified by explicit front-end components.

| Module | Justification Reference | Main Entity | Public Routes | Status |
| :--- | :--- | :--- | :--- | :---: |
| **1. Site Settings** | Task 11 §3, §4, §5, §7, §8, §10 | `site_settings` | All 7 routes | **CONFIRMED** |
| **2. Artists** | Task 11 §4, §5, §6 | `artists` | `/`, `/artists`, `/artists/[slug]` | **CONFIRMED** |
| **3. Tracks & Discography** | Task 11 §6, §12 | `tracks`, `releases` | `/artists/[slug]` | **CONFIRMED** |
| **4. Events & Concerts** | Task 11 §4, §7 | `events` | `/`, `/events` | **CONFIRMED** |
| **5. Academy Tracks** | Task 11 §8 | `academy_courses` | `/academy` | **CONFIRMED** |
| **6. News & Stories** | Task 11 §4, §9 | `articles` | `/`, `/news`, `/news/[slug]` | **CONFIRMED** |
| **7. Testimonials** | Task 11 §4, §11 | `testimonials` | `/` | **CONFIRMED** |
| **8. Booking & Leads CRM** | Task 11 §8, §10 | `booking_requests`, `newsletter_subscribers` | `/booking`, `/academy` (Ingestion) | **CONFIRMED** |
| **9. Media Asset Manager** | Task 11 §13 | Supabase Storage Buckets | Global asset management | **CONFIRMED** |

---

## 2. IN SCOPE: Detailed Module Specifications

### Module 1: Site Settings & Global Shell
- **Purpose:** Manage singleton platform configuration, hero marketing copy, brand manifesto text, contact channels, social media handles, and footer metadata.
- **Entity:** `site_settings` (Singleton row, primary key `id = 'default'`).
- **Fields:**
  - `id` (`VARCHAR(50)`, PK, fixed `'default'`)
  - `hero_headline` (`TEXT`, required) — Home hero title
  - `hero_subheadline` (`TEXT`, required) — Home hero narrative subtitle
  - `hero_image_url` (`VARCHAR(500)`, required) — High-res stage photography visual
  - `about_headline` (`VARCHAR(255)`, required) — Band manifesto heading
  - `about_body` (`TEXT`, required) — Manifesto multi-paragraph narrative
  - `about_image_url` (`VARCHAR(500)`, required) — Musician studio portrait
  - `booking_banner_title` (`VARCHAR(255)`, required) — Orange banner CTA heading
  - `booking_banner_body` (`TEXT`, required) — Orange banner pitch copy
  - `artists_subtitle` (`TEXT`, optional) — Subtitle on `/artists` directory
  - `events_subtitle` (`TEXT`, optional) — Subtitle on `/events` catalog
  - `academy_subtitle` (`TEXT`, optional) — Subtitle on `/academy` page
  - `booking_subtitle` (`TEXT`, optional) — Subtitle on `/booking` form
  - `contact_email` (`VARCHAR(255)`, required) — `hello@andalusia.art`
  - `contact_phone` (`VARCHAR(50)`, required) — Official inquiry phone / WhatsApp
  - `social_links` (`JSONB`, required) — `{ "instagram": "url", "tiktok": "url" }`
  - `operational_regions` (`VARCHAR(255)`, required) — "لبنان · المغرب · الخليج"
  - `footer_mission` (`TEXT`, required) — Footer narrative paragraph
  - `copyright_text` (`VARCHAR(255)`, required) — "© أندلسيا ٢٠٢٥ — جميع الحقوق محفوظة"
  - `updated_at` (`TIMESTAMPTZ`, auto-managed)
- **Create / Edit / Delete:** Edit only. Pre-seeded singleton record. Creation disabled; deletion disabled.
- **Archive:** Not applicable.
- **Publish / Unpublish:** Not applicable (Always active).
- **Ordering:** Not applicable (Single row).
- **Media:** Direct upload picker for `hero_image_url` and `about_image_url` (Supabase Storage `site/` bucket).
- **Validation:** Non-empty string checks; valid email pattern for `contact_email`; valid absolute URL / path for image assets; valid JSON object for `social_links`.
- **Public Routes Affected:** All routes (`/`, `/artists`, `/artists/[slug]`, `/events`, `/academy`, `/news`, `/news/[slug]`, `/booking`).

---

### Module 2: Artists
- **Purpose:** Manage ensemble musicians, profile bios, performance specialties, featured homepage highlights, and directory sorting.
- **Entity:** `artists`
- **Fields:**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `name` (`VARCHAR(150)`, required) — Artist full stage name
  - `slug` (`VARCHAR(150)`, required, unique) — URL identifier for `/artists/[slug]`
  - `category` (`VARCHAR(50)`, required) — Enum: `'singing'`, `'oud'`, `'percussion'`, `'contemporary'`, `'heritage'`
  - `genre_tag` (`VARCHAR(100)`, required) — Visual badge text (e.g. "غناء عربي")
  - `city` (`VARCHAR(100)`, required) — Artist base city (e.g. "الدار البيضاء")
  - `quote` (`TEXT`, required) — Primary artist philosophy quote
  - `spotlight_quote` (`TEXT`, optional) — Spotlight section quote override
  - `short_bio` (`TEXT`, required) — Hero summary bio
  - `full_bio` (`TEXT`, required) — Full multi-paragraph markdown biography
  - `specialties` (`VARCHAR(255)`, required) — Disciplines string (e.g. "الصوت • الغناء الأندلسي")
  - `portrait_image_url` (`VARCHAR(500)`, required) — Musician portrait photograph
  - `is_featured` (`BOOLEAN`, default `false`) — Pinned to Home featured artists strip
  - `is_published` (`BOOLEAN`, default `true`) — Public visibility toggle
  - `display_order` (`INTEGER`, default `0`) — Directory grid manual sequence
  - `created_at` (`TIMESTAMPTZ`, default `now()`)
  - `updated_at` (`TIMESTAMPTZ`, auto-managed)
- **Create / Edit / Delete:** Full CRUD support. Hard deletion restricted if referenced by child `tracks`, `releases`, or `events` (cascade requires explicit confirmation).
- **Archive:** Soft archive via `is_published = false`.
- **Publish / Unpublish:** Yes (`is_published` boolean flag).
- **Ordering:** Manual sequencing via `display_order ASC`, secondary sort by `name ASC`.
- **Media:** Portrait headshot upload (`artists/` bucket, WebP 800×1000 recommended).
- **Validation:** `name` 2–150 chars; `slug` unique lowercase regex `^[a-z0-9-]+$`; `category` restricted to verified enum values; `portrait_image_url` required.
- **Public Routes Affected:** `/` (Featured strip, max 4), `/artists` (Directory grid & filter tabs), `/artists/[slug]` (Full profile), `/booking` (Artist selection dropdown).

---

### Module 3: Tracks & Discography Releases
- **Purpose:** Manage streamable audio recordings for the artist profile audio player widget and studio/live discography releases.
- **Entities:**
  1. `tracks` (Audio stream items)
  2. `releases` (Discography recordings)
- **Fields (`tracks`):**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `artist_id` (`UUID`, FK -> `artists.id`, required, ON DELETE CASCADE)
  - `title` (`VARCHAR(200)`, required) — Track title
  - `audio_file_url` (`VARCHAR(500)`, required) — Direct streamable audio file URL
  - `duration_seconds` (`INTEGER`, required, min 1) — Track duration in seconds
  - `cover_image_url` (`VARCHAR(500)`, optional) — Track cover visual
  - `display_order` (`INTEGER`, default `0`) — Playlist sequence index
  - `is_published` (`BOOLEAN`, default `true`) — Visibility toggle
  - `created_at` (`TIMESTAMPTZ`, default `now()`)
- **Fields (`releases`):**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `artist_id` (`UUID`, FK -> `artists.id`, required, ON DELETE CASCADE)
  - `title` (`VARCHAR(200)`, required) — Album / release name
  - `release_type` (`VARCHAR(50)`, required) — Enum: `'studio'`, `'live'`
  - `track_count` (`INTEGER`, required, min 1) — Number of tracks
  - `release_year` (`INTEGER`, required) — Release year (1900–2100)
  - `cover_image_url` (`VARCHAR(500)`, required) — Album cover artwork
  - `display_order` (`INTEGER`, default `0`) — Sequence order
  - `is_published` (`BOOLEAN`, default `true`) — Visibility toggle
  - `created_at` (`TIMESTAMPTZ`, default `now()`)
- **Create / Edit / Delete:** Full CRUD support. Managed as sub-resources under an artist profile or via dedicated catalog tables.
- **Archive:** Soft archive via `is_published = false`.
- **Publish / Unpublish:** Yes (`is_published` boolean flag).
- **Ordering:** `tracks` ordered by `display_order ASC`; `releases` ordered by `release_year DESC, display_order ASC`.
- **Media:** Audio uploads (`audio/` bucket, `.mp3` / `.ogg`, max 30MB); Album artwork (`releases/` bucket, WebP 600×600).
- **Validation:** `duration_seconds` > 0; `track_count` >= 1; `release_year` valid 4-digit year; valid audio MIME types (`audio/mpeg`, `audio/ogg`).
- **Public Routes Affected:** `/artists/[slug]` (Audio Player Widget, Discography tabs).

---

### Module 4: Events & Concerts
- **Purpose:** Schedule and publish live concerts, festival appearances, musical evenings, and workshops with location, date, performer attribution, and ticket links.
- **Entity:** `events`
- **Fields:**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `title` (`VARCHAR(200)`, required) — Event headline (e.g. "ليلة الطرب الأندلسي")
  - `slug` (`VARCHAR(200)`, required, unique) — URL identifier
  - `category` (`VARCHAR(50)`, required) — Enum: `'concert'`, `'festival'`, `'evening'`, `'workshop'`
  - `event_date` (`TIMESTAMPTZ`, required) — Date & start time
  - `location` (`VARCHAR(200)`, required) — Venue & country (e.g. "بيروت — لبنان")
  - `city` (`VARCHAR(100)`, required) — City string for card badges
  - `performer_name` (`VARCHAR(150)`, required) — Headline artist/ensemble attribution
  - `artist_id` (`UUID`, FK -> `artists.id`, optional, nullable) — Optional link to internal artist
  - `description` (`TEXT`, optional) — Event details / program summary
  - `image_url` (`VARCHAR(500)`, required) — Event poster / stage visual
  - `ticket_url` (`VARCHAR(500)`, optional, nullable) — External ticket link (if null, defaults to `/booking?event_id=[id]`)
  - `is_featured` (`BOOLEAN`, default `false`) — Pinned to "الفعالية الأبرز" banner on `/events`
  - `status` (`VARCHAR(50)`, default `'upcoming'`) — Enum: `'upcoming'`, `'ongoing'`, `'completed'`, `'cancelled'`
  - `is_published` (`BOOLEAN`, default `true`) — Visibility toggle
  - `display_order` (`INTEGER`, default `0`) — Sorting override index
  - `created_at` (`TIMESTAMPTZ`, default `now()`)
  - `updated_at` (`TIMESTAMPTZ`, auto-managed)
- **Create / Edit / Delete:** Full CRUD support.
- **Archive:** Status-based archive (`status = 'completed'` or `is_published = false`).
- **Publish / Unpublish:** Yes (`is_published` boolean flag).
- **Ordering:** Chronological sorting (`event_date ASC` for upcoming events); `is_featured` flag prioritizes the top hero banner.
- **Media:** Event poster / promotional photograph (`events/` bucket, WebP 1200×800).
- **Validation:** `title` required; `event_date` valid timestamp; `category` matches allowed enum; `image_url` required; `ticket_url` must be valid URL if provided.
- **Public Routes Affected:** `/` (Upcoming Events Preview strip, limit 3), `/events` (Featured Event Banner & Catalog Grid), `/booking` (Pre-fills event context).

---

### Module 5: Academy Tracks
- **Purpose:** Manage the 3 curated educational curriculum tracks ("ثلاثة مسارات، موهبة واحدة") presented on `/academy` (Oud School, Performance Arts, Vocal Arts).
- **Entity:** `academy_courses`
- **Fields:**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `title` (`VARCHAR(150)`, required) — Track name (e.g. "مدرسة العود")
  - `slug` (`VARCHAR(150)`, required, unique) — Identifier for booking routing (`/booking?course=[slug]`)
  - `track_category` (`VARCHAR(100)`, required) — Discipline tag (e.g. "مدرسة التراث")
  - `description` (`TEXT`, required) — Curriculum overview paragraph
  - `instructor_name` (`VARCHAR(150)`, optional) — Lead instructor name
  - `instructor_id` (`UUID`, FK -> `artists.id`, optional, nullable) — Optional relation to artist profile
  - `image_url` (`VARCHAR(500)`, optional) — Program visual artwork
  - `display_order` (`INTEGER`, required, default `1`) — Sequence index (1, 2, 3)
  - `is_published` (`BOOLEAN`, default `true`) — Visibility toggle
  - `created_at` (`TIMESTAMPTZ`, default `now()`)
  - `updated_at` (`TIMESTAMPTZ`, auto-managed)
- **Create / Edit / Delete:** Full CRUD support (scoped to verified tracks; no LMS features).
- **Archive:** Soft archive via `is_published = false`.
- **Publish / Unpublish:** Yes (`is_published` boolean flag).
- **Ordering:** Explicit sequence via `display_order ASC` (1: مدرسة العود, 2: فن الأداء, 3: الصوت والطرب).
- **Media:** Program artwork upload (`academy/` bucket, WebP 800×600).
- **Validation:** `title`, `track_category`, `description` required; `display_order` between 1 and 10.
- **Public Routes Affected:** `/academy` (Tracks Section cards), `/booking` (Registration inquiry route parameter).

---

### Module 6: Cultural News & Stories
- **Purpose:** Publish editorial cultural articles, band stories, musician interviews, and event retrospectives.
- **Entity:** `articles`
- **Fields:**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `title` (`VARCHAR(250)`, required) — Article headline
  - `slug` (`VARCHAR(250)`, required, unique) — URL identifier for `/news/[slug]`
  - `category` (`VARCHAR(100)`, required) — Enum: `'culture'`, `'artists'`, `'academy'`, `'events'`
  - `excerpt` (`TEXT`, required) — Brief introductory teaser (max 300 chars)
  - `content` (`TEXT`, required) — Full article body in Markdown format
  - `cover_image_url` (`VARCHAR(500)`, required) — Editorial header photo
  - `author_name` (`VARCHAR(150)`, required) — Writer attribution
  - `featured_artist_id` (`UUID`, FK -> `artists.id`, optional, nullable) — Related artist link
  - `published_at` (`TIMESTAMPTZ`, required, default `now()`) — Publication date
  - `is_featured` (`BOOLEAN`, default `false`) — Pinned to `/news` hero story & homepage editorial strip
  - `is_published` (`BOOLEAN`, default `true`) — Visibility toggle
  - `created_at` (`TIMESTAMPTZ`, default `now()`)
  - `updated_at` (`TIMESTAMPTZ`, auto-managed)
- **Create / Edit / Delete:** Full CRUD support with rich Markdown editor.
- **Archive:** Soft archive via `is_published = false`.
- **Publish / Unpublish:** Yes (`is_published` boolean flag + future scheduling via `published_at`).
- **Ordering:** Reverse chronological (`published_at DESC`); `is_featured = true` takes priority for hero display.
- **Media:** Editorial cover photograph (`articles/` bucket, WebP 1200×800).
- **Validation:** `title` 5–250 chars; `slug` unique lowercase regex; `excerpt` max 300 chars; `content` non-empty markdown; `cover_image_url` required.
- **Public Routes Affected:** `/` (Editorial Feature cards x3), `/news` (Hero story, side highlights, news grid), `/news/[slug]` (Full article page).

---

### Module 7: Testimonials
- **Purpose:** Manage attendee reviews, critic praise, and client endorsements featured in the Home page testimonial carousel.
- **Entity:** `testimonials`
- **Fields:**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `quote` (`TEXT`, required) — Endorsement statement
  - `author_name` (`VARCHAR(150)`, required) — Reviewer full name (e.g. "عمر الحاج")
  - `author_role` (`VARCHAR(150)`, required) — Role / affiliation (e.g. "ناقد موسيقي")
  - `avatar_image_url` (`VARCHAR(500)`, optional, nullable) — Reviewer avatar / headshot
  - `display_order` (`INTEGER`, default `0`) — Carousel slide sequence
  - `is_published` (`BOOLEAN`, default `true`) — Visibility toggle
  - `created_at` (`TIMESTAMPTZ`, default `now()`)
- **Create / Edit / Delete:** Full CRUD support.
- **Archive:** Soft archive via `is_published = false`.
- **Publish / Unpublish:** Yes (`is_published` boolean flag).
- **Ordering:** Manual slide sequence via `display_order ASC`.
- **Media:** Optional reviewer avatar visual (`site/avatars/` bucket, WebP 200×200).
- **Validation:** `quote` 10–500 chars; `author_name` 2–150 chars; `author_role` required.
- **Public Routes Affected:** `/` (Testimonials Carousel Slider `Component 22`).

---

### Module 8: Booking & Inquiries CRM
- **Purpose:** Provide administrative triage for inbound booking requests submitted via `/booking` and newsletter subscriptions submitted via `/academy`.
- **Entities:**
  1. `booking_requests` (Private event & engagement inquiries)
  2. `newsletter_subscribers` (Lead generation list)
- **Fields (`booking_requests`):**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `full_name` (`VARCHAR(150)`, required, immutable) — Client name
  - `email` (`VARCHAR(255)`, required, immutable) — Contact email
  - `phone` (`VARCHAR(50)`, optional, immutable) — Contact phone
  - `budget_range` (`VARCHAR(100)`, optional, immutable) — e.g. "١٠٠٠ - ٥٠٠٠ دولار"
  - `event_type` (`VARCHAR(100)`, required, immutable) — Enum: `'private_concert'`, `'wedding'`, `'festival'`, `'hotel'`, `'other'`
  - `event_date` (`DATE`, required, immutable) — Target performance date
  - `preferred_artist` (`VARCHAR(150)`, optional, immutable) — Artist text name
  - `artist_id` (`UUID`, FK -> `artists.id`, optional, nullable) — Linked artist ID
  - `event_id` (`UUID`, FK -> `events.id`, optional, nullable) — Linked event ID
  - `message` (`TEXT`, required, immutable) — Inquiry details
  - `status` (`VARCHAR(50)`, required, default `'pending'`) — Enum: `'pending'`, `'contacted'`, `'confirmed'`, `'archived'` (Admin editable)
  - `admin_notes` (`TEXT`, optional, nullable) — Internal staff follow-up notes (Admin editable)
  - `created_at` (`TIMESTAMPTZ`, default `now()`, immutable)
- **Fields (`newsletter_subscribers`):**
  - `id` (`UUID`, PK, default `gen_random_uuid()`)
  - `email` (`VARCHAR(255)`, required, unique, immutable) — Subscriber email
  - `status` (`VARCHAR(50)`, default `'subscribed'`) — Enum: `'subscribed'`, `'unsubscribed'`
  - `created_at` (`TIMESTAMPTZ`, default `now()`, immutable)
- **Create / Edit / Delete:** Public creation via Next.js Server Actions with write-only Row Level Security (RLS). In CMS dashboard: Read list/detail, update `status` and `admin_notes`, soft-archive. Hard delete reserved for admin data purging.
- **Archive:** Status update (`status = 'archived'`).
- **Publish / Unpublish:** Not applicable (Private CRM records; never rendered publicly).
- **Ordering:** Reverse chronological (`created_at DESC`).
- **Media:** Not applicable.
- **Validation:** Public inputs validated by Zod schemas (RFC email, non-empty text, valid date); Admin updates restricted to status enum.
- **Public Routes Affected:** `/booking` (Form ingestion endpoint), `/academy` (Newsletter ingestion endpoint).

---

### Module 9: Media Asset Management
- **Purpose:** Centralized asset library providing file upload, inspection, preview, and deletion across Supabase Storage buckets.
- **Entity:** Supabase Storage Objects (`storage.objects`) across 6 designated buckets:
  - `artists/` — Musician portraits and headshots
  - `events/` — Concert promotional posters
  - `articles/` — Editorial story cover imagery
  - `academy/` — Course track artwork visuals
  - `audio/` — Streamable sample audio files (`.mp3`, `.ogg`)
  - `site/` — Hero stage visual, about section portrait, avatars
- **Fields (Object Metadata):**
  - `name` (`TEXT`, PK / path) — Stored asset file path
  - `bucket_id` (`TEXT`, required) — Target storage bucket
  - `public_url` (`TEXT`, computed) — CDN delivery URL
  - `content_type` (`TEXT`, required) — MIME type
  - `size_bytes` (`BIGINT`, required) — File size
  - `created_at` (`TIMESTAMPTZ`, default `now()`)
- **Create / Edit / Delete:** Direct file upload (Create), file metadata view (Read), file deletion (Delete).
- **Archive:** Not applicable (Direct object lifecycle).
- **Publish / Unpublish:** Not applicable (Uploaded assets are public CDN resources).
- **Ordering:** Reverse chronological by `created_at DESC`.
- **Media:** File type constraints: Images (`image/webp`, `image/jpeg`, `image/png`, `image/svg+xml`, max 5MB); Audio (`audio/mpeg`, `audio/ogg`, max 30MB).
- **Validation:** Strict MIME validation on upload; maximum file size enforcement; filename sanitization.
- **Public Routes Affected:** Indirectly serves all visual and audio media rendered across the entire website.

---

## 3. OUT OF SCOPE: Explicit Exclusions

The following capabilities are **explicitly excluded** from the CMS scope. None are present in the approved Figma audit or Task 11 content inventory, and introducing them would violate the requirement to build the smallest production-quality CMS.

| Excluded Feature | Architectural Verdict | Detailed Rationale & Figma Audit Evidence |
| :--- | :---: | :--- |
| **1. Drag-and-Drop Page Builder** | **REJECTED** | Figma provides fixed, tailored layouts for all 7 routes (`/`, `/artists`, `/artists/[slug]`, `/events`, `/academy`, `/news`, `/news/[slug]`, `/booking`). A page builder destroys RTL typography hierarchy, compromises TTFB, and introduces unnecessary schema complexity. |
| **2. Arbitrary Page Creation** | **REJECTED** | The site architecture consists strictly of the 7 defined routes. The platform has no need for marketing landing page generators or arbitrary URL path creation. |
| **3. Arbitrary Section Reordering** | **REJECTED** | Screen layouts follow an intentional editorial rhythm established in Figma (e.g., Hero → Events Preview → About Manifesto → Booking Banner → Featured Artists → Editorial Feature → Testimonials → Footer). Dynamic reordering would break visual pacing. |
| **4. Layout Builder / Grid Editor** | **REJECTED** | All layout grids (12-column desktop, 6-column tablet, 4-column mobile) are hardcoded in Tailwind CSS components adhering to the verified design system. |
| **5. Plugin / Extension Architecture** | **REJECTED** | Custom plugin hooks or third-party extension runtimes introduce security vulnerabilities and maintenance overhead without providing any value to the band portfolio. |
| **6. Multi-Tenancy** | **REJECTED** | Andalusia is a dedicated single-tenant music platform for one ensemble/label. Multi-tenant database partitioning, subdomains, and tenant isolation layers are completely unwarranted. |
| **7. Complex Workflow Engine** | **REJECTED** | Editorial teams require a straightforward binary `is_published` toggle. Multi-stage approvals, legal review pipelines, and drafting states are unnecessary overhead for this scale. |
| **8. Hierarchical RBAC** | **REJECTED** | Access control requires only two tiers: Public Visitor (read-only content, write-only inquiries) and Authenticated Staff/Admin (full CMS management). No fine-grained role trees are needed. |
| **9. E-Commerce & Shopping Cart** | **REJECTED** | Figma contains zero shopping carts, checkout flows, or inventory counters. All bookings and tickets are routed through inquiries or external ticketing links. |
| **10. Payment Gateways** | **REJECTED** | No Stripe, PayPal, or payment processor integration is required. Engagements are negotiated directly by management via `/booking`. |
| **11. User / Fan Accounts** | **REJECTED** | The public website is a public cultural portfolio. There are no public login, profile settings, or member dashboards in the design. |
| **12. Course Enrollment & LMS Engine** | **REJECTED** | Academy tracks (`91:16119`) are informational cards describing curriculum tracks. Registration directs to `/booking?course=[slug]`. There are no student portals, video gating, or quiz engines. |
| **13. Generic Form Builder** | **REJECTED** | The platform has exactly two inbound forms: Booking Request (`/booking`) and Newsletter Signup (`/academy`). Both are hardcoded with dedicated Zod validation schemas. Dynamic form builders are unneeded. |

---

## 4. OPTIONAL / FUTURE CONSIDERATIONS

These capabilities are deferred to post-launch milestones and do not block the core production CMS:

1. **Bilingual Content Sync (`_ar` / `_en`):**
   - *Status:* Schema-ready (can add parallel columns or JSONB localized fields when English content is translated).
   - *Trigger:* Stakeholder sign-off on English copy.
2. **Automated Transactional Email Dispatch:**
   - *Status:* Next.js Server Action hook ready (e.g. Resend API integration on `booking_requests` insertion).
   - *Trigger:* Provisioning of official domain SMTP credentials.
3. **External Ticketing Provider Deep-Linking:**
   - *Status:* Nullable `ticket_url` column implemented in `events` table.
   - *Trigger:* Partnerships with regional ticketing platforms (Platinumlist, Virgin Megastore).
4. **Automated WebP Transcoding / CDN Optimization:**
   - *Status:* Storage bucket rules accept WebP. Automated server-side compression can be added via Supabase Storage Image Transformation or Cloudflare Images.
5. **Audit Logging & Activity History:**
   - *Status:* Deferred. Can be implemented using Supabase PostgreSQL triggers on CMS mutations if multi-staff auditing becomes necessary.

---

## 5. ARCHITECTURAL RATIONALE

### Why This is the Smallest Production-Quality CMS

1. **Strict Fidelity to Approved Design (Task 11):**
   Every module, entity, and field originates directly from a confirmed element in `CONTENT_INVENTORY.md` and `CMS_MODULE_MATRIX.md`. No speculative tables, unneeded relations, or placeholder features exist.

2. **Maximum Performance & RTL Stability:**
   By classifying navigation bars, typography headers, decorative vectors, and layouts as **Static UI**, the public Next.js application leverages Static Site Generation (SSG) and Incremental Static Regeneration (ISR). This guarantees sub-100ms TTFB and prevents layout shifts in Arabic typography.

3. **Security & Data Isolation:**
   Public submissions (`booking_requests`, `newsletter_subscribers`) are strictly isolated from editorial CMS entities. Visitors have write-only access enforced by PostgreSQL Row Level Security (RLS), preventing lead exposure while giving administrators complete triage capabilities.

4. **Maintainability & Zero Bloat:**
   By rejecting page builders, LMS engines, and ecommerce frameworks, the codebase remains clean, maintainable, and cost-effective, running entirely on standard Next.js Server Actions and Supabase PostgreSQL.
