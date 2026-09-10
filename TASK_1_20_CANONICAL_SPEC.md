# TASK 1–20 CANONICAL SPEC (single authoritative definitions — apply to unblock)
Status: PROPOSED (resolves all FAILs; adopts ARCHITECTURE_APPROVAL_REPORT prescription + current-APPLICATION fixes).

## 1. Public routes (8, not "7")
`/`, `/artists`, `/artists/[slug]`, `/events`, `/academy`, `/news`, `/news/[slug]`, `/booking` (+ query variants `?event_id=[id]`, `?artist=[slug]`, `?course=[slug]`). NO `/events/[slug]`. Fix wording "7 routes" → "8 routes" (CMS_SCOPE.md:16/60/306, MATRIX:30).

## 2. Admin routes + login (ONE architecture)
- Login URL `/login`, file `src/app/(auth)/login/page.tsx`, middleware matcher `['/admin/:path*','/login']`, unauth → `/login?next=<path>`, auth-hit-login → `/admin`.
- Admin: `/admin` (dashboard), `/admin/artists`, `/admin/tracks` (or nested under artists), `/admin/releases`, `/admin/events`, `/admin/academy` (NOT courses), `/admin/articles`, `/admin/testimonials`, `/admin/bookings` (NOT inquiries/leads), `/admin/subscribers` (separate, NOT grouped under leads), `/admin/settings`. 4 layers: middleware → `admin/layout.tsx` (`getUser` + `app_metadata.role==='admin'`) → Server Actions `requireAdminSession()` → `auth.is_admin()`. No public registration. Rewrite AUTH_ARCHITECTURE.md §§143–294 to match; update DEPENDENCY :324 (`/admin/leads` → `/admin/bookings` + `/admin/subscribers`).

## 3. CMS modules (9)
Site Settings (`site_settings`) | Artists (`artists`) | Tracks & Discography (`tracks`,`releases` — merged, MATRIX rows 2+3 fold in) | Events & Concerts (`events`) | Academy Tracks (`academy_courses`) | News & Stories (`articles`) | Testimonials (`testimonials`) | Booking & Leads CRM (`booking_requests`,`newsletter_subscribers`) | Media Asset Manager (Storage buckets). No page builder/drag-drop (REJECTED).

## 4. Roles
`anon` (public read published-only, write-only CRM inserts) | `authenticated-admin` (`app_metadata.role==='admin'`, full CRUD via `auth.is_admin()`) | `service_role` (migrations/seeds only, server-only). No other roles.

## 5. Tables + key fields
`site_settings(id='default' singleton)`, `artists(slug UNIQUE, is_published, category)`, `tracks(artist_id CASCADE, audio_file_url, duration_seconds, is_published)`, `releases(artist_id CASCADE, release_year, track_count)`, `events(slug UNIQUE?, performer_name, artist_id SET NULL, event_date, ticket_url NULL→defaults /booking?event_id=, is_published)`, `academy_courses(slug UNIQUE, instructor_id SET NULL, is_published)`, `articles(slug UNIQUE, content md, published_at<=now(), featured_artist_id SET NULL, category EN codes)`, `testimonials(quote, author_role REQUIRED, avatar_image_url)`, `booking_requests(status pending/contacted/confirmed/archived DEFAULT pending, admin_notes NULL-on-insert, artist_id UUID NULL + preferred_artist VARCHAR(150) NULL — keep BOTH, dropdown writes artist_id, free-text writes preferred_artist; event_type EN codes + 'other')`, `newsletter_subscribers(email UNIQUE, status subscribed/unsubscribed DEFAULT subscribed — canonical, DROP subscribed_at/is_active variant)`. Timestamps `created_at/updated_at` all; indexes on slug/is_published/FKs.

## 6. Storage buckets (7, public read / admin write)
`site,artists,releases,events,academy,articles` = 5 MB (`5242880`); `audio` = **30 MB (`31457280`)** canonical. MIME: images `jpeg/png/webp` + `avif` (all 6) + `svg+xml` (`site` only); audio `mpeg/ogg/wav` + `mp4/aac`. Paths: `site/avatars/` allowed inside `site/` (not an 8th bucket); testimonial avatar guidance 2 MB app-level, 5 MB bucket-enforced. Policy names canonical: `storage_public_read_access`, `storage_admin_insert_access`, `storage_admin_update_access`, `storage_admin_delete_access`. RLS_DESIGN §4.1 + SECURITY_MODEL §5 to 30 MB/MIME/names.

## 7. Auth/RLS/responsive/RTL/env/stack
- RLS: ENABLE+FORCE, default-deny; anon SELECT published-only (tracks/releases add parent-published EXISTS; articles add `published_at<=now()`); booking/newsletter `SELECT USING(false)`, INSERT guarded; `site_settings` admin UPDATE allowed + guarded INSERT `(id='default')` allowed (fix matrix DENY→ALLOW w/ note).
- Responsive: desktop 1440 / mobile 390 (Figma-confirmed); tablet = engineering (single-column ≥768, drawer <1024); breakpoints `640/768/1024/1280`; RTL-first; drawer <1024; footer stacks. Label ENGINEERING vs FIGMA-CONFIRMED.
- RTL: ar-first, `dir=rtl`, Cairo/Qahwa, Latin numerals + dates/LTR phone isolation, direction-flip icons, EN deferred (schema-ready `_ar/_en` or JSONB, NO `_ar/_en` columns now).
- Env: public `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY/SITE_URL` (+opt STORAGE_URL/LOCALE/TURNSTILE_SITE) ; server-only `SUPABASE_SERVICE_ROLE_KEY/DATABASE_URL/RESEND_API_KEY/NOTIFICATION_* /TURNSTILE_SECRET/CRON_SECRET`. service_role never browser.
- Stack: Next.js 15+ App Router + TS + Tailwind v4 + Supabase PG/Auth/Storage (+@supabase/ssr, Resend opt, Turnstile opt). NO FastAPI/Express/Mongo/Redis/K8s/Docker. Server/Client boundary: Server Components default, Client for player/forms/drawer/carousel, Server Actions validated, Route Handlers for cron/webhooks, ISR news + `force-dynamic` admin.

## 8. Smallest safe patch list (unblock, docs-only, no migrations yet)
1. AUTH_ARCHITECTURE.md: `/admin/login`→`/login`, `admin/login/page`→`(auth)/login/page`, matcher +`'/login'`, `?redirect=`→`?next=`, subpaths → §2 list.
2. RLS_DESIGN.md:570: `audio` 20 MB→30 MB (`31457280`); MIME += avif/site-svg/mp4/aac; matrix `site_settings` INSERT DENY→ALLOW (guarded `id='default'`); policy names → §6.
3. SECURITY_MODEL.md:166: 20 MB→30 MB; MIME → §6.
4. CMS_SCOPE.md: audio 25 MB→30 MB; "7 routes"→"8"; Media/avatar note (§6); booking fields keep both w/ semantics (§5); newsletter `status` canonical; enums EN-code tables.
5. APPLICATION_ARCHITECTURE.md: login block → §2 (already buckets-7/audio-30/events/[slug]-removed ✓ — keep).
6. DEPENDENCY :324: `/admin/leads` → `/admin/bookings` + `/admin/subscribers`.
7. All docs: `figma_audit_master_specification.md (external)` → `figma_full_inventory.json` (in-repo); mark colors/tokens/0-1 UNVERIFIED.
