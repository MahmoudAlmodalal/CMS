# Andalusia Music Band — Custom English Task Roadmap

This is the implementation roadmap customized for the Andalusia Music Band platform. Each task is independently actionable and can be given to a coding agent one at a time. Do not move to the next task until the current task has been implemented, verified, and reported.

## 1. Product Context

Andalusia is an Arabic-first website and lightweight CMS for a music band and cultural platform. The public website presents artists, music, events, academy tracks, news, testimonials, and booking/contact flows. The private admin workspace manages the approved content and incoming leads.

The goal is a small production-quality CMS that matches the verified Figma design. It is not a generic page builder or a broad business-management platform.

## 2. Canonical Architecture Decisions

These decisions are fixed for all implementation tasks:

- Product: Arabic RTL-first public website plus a protected admin CMS for Andalusia.
- Stack: Next.js App Router, TypeScript, Tailwind CSS, Supabase PostgreSQL, Supabase Auth, and Supabase Storage.
- Public language: Arabic first. English is deferred, but the component and data architecture must remain localization-ready.
- Public routes: `/`, `/artists`, `/artists/[slug]`, `/events`, `/academy`, `/news`, `/news/[slug]`, and `/booking`.
- There is no `/events/[slug]`. Event cards link to `/booking?event_id=...` or to an external `ticket_url`.
- Login route: `/login`, implemented at `src/app/(auth)/login/page.tsx`.
- Admin routes: `/admin`, `/admin/artists`, `/admin/tracks`, `/admin/releases`, `/admin/events`, `/admin/academy`, `/admin/articles`, `/admin/testimonials`, `/admin/bookings`, `/admin/subscribers`, `/admin/settings`, and `/admin/media`.
- Database tables: `site_settings`, `artists`, `tracks`, `releases`, `events`, `academy_courses`, `articles`, `testimonials`, `booking_requests`, and `newsletter_subscribers`.
- Storage buckets: `site`, `artists`, `releases`, `events`, `academy`, `articles`, and `audio`.
- Storage limits: 5 MB for image/content buckets and 30 MB (`31457280` bytes) for audio.
- Roles: anonymous/public user, authenticated admin, and server-only `service_role`.
- No public registration, page builder, ecommerce, payments, student enrollment system, community features, analytics platform, or separate backend service.
- Server Components are the default. Client Components are used only where interaction requires them, such as the audio player, forms, drawer, and filters.

## 3. Current Progress

- **Tasks 1–10:** Figma inventory, responsive review, RTL direction, and initial product audit completed.
- **Tasks 11–19:** Content inventory, CMS scope, database schema, RLS design, authentication architecture, storage architecture, application architecture, environment/secrets, and dependency plan documented.
- **Task 20:** The first architecture approval gate was correctly marked **BLOCKED** because the documents contradicted one another.
- **Task 20A:** The reconciliation pass resolved the conflicts and approved the architecture.
- **Tasks 21–26:** Implemented in the repository: Next.js foundation, UI tokens/components, RTL foundation, typed Supabase clients, database migrations, and RLS policies.
- **Current implementation point:** **Task 26 is complete.**
- **Next task:** **Task 27 — Admin Authentication.**
- **Remaining implementation scope:** Tasks 27–60.

### Current repository evidence

The implemented foundation currently includes:

- `src/app/layout.tsx` with Arabic language, RTL direction, and Cairo/Aref Ruqaa/DM Mono fonts.
- `src/app/globals.css` with Andalusia color, typography, radius, spacing, and shadow tokens.
- `src/components/ui/` with reusable buttons, cards, forms, tables, navigation, drawer, icons, and bidi helpers.
- `src/lib/direction.tsx` and `src/lib/formatters.ts` for RTL/LTR switching and Arabic-safe formatting.
- `src/lib/supabase/client.ts` for the browser client.
- `src/lib/supabase/server.ts` for the cookie-aware server client.
- `src/lib/supabase/admin.ts` for the server-only service-role client.
- `src/lib/supabase/types.ts` for typed database access.

The following have not been implemented yet:

- RLS SQL policies.
- Authentication middleware and login page.
- Storage upload actions and policies.
- Production public routes.
- Admin routes and CMS screens.

### Current verification results

- `npm test`: 8 RTL foundation tests passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run lint`: 0 errors and 11 warnings remain to clean up later.

The current `/` page is still a foundation/demo page for validating RTL and UI behavior. It is not yet the final production homepage; that belongs to Task 32.

## Tasks 1–10 — Figma and Product Definition

### Task 1 — Lock the Andalusia Product Scope

Confirm the product name, Arabic-first audience, eight public routes, and protected admin scope. Reject any feature that is not supported by the verified Figma design or a concrete operational requirement.

**Done when:** the product scope and exclusions are written down and no implementation task depends on an unapproved feature.

### Task 2 — Lock the Figma Source of Truth

Use `figma_full_inventory.json` as the repository-local source of truth. Mark every design claim as confirmed, inferred, or unknown. Do not depend on the missing external `figma_audit_master_specification.md` file.

**Done when:** every later design reference can be traced to an in-repository artifact.

### Task 3 — Inventory the Figma Screens

Verify the Arabic desktop/mobile screens and English counterparts. Map each verified screen to its public route and record the relevant node IDs.

**Done when:** the screen inventory contains the home, artists, artist profile, events, academy, news, booking, and their responsive counterparts.

### Task 4 — Lock the Route Map

Use the eight canonical public routes. Explicitly document that `/events/[slug]` is not part of the product. Preserve query variants such as `?event_id=...` where the design requires them.

**Done when:** no architecture or implementation document introduces a ninth speculative event route.

### Task 5 — Lock Responsive Behavior

Use 1440px desktop and 390px mobile as the Figma-confirmed reference sizes. Treat tablet behavior as an engineering decision and document the chosen breakpoints instead of presenting it as Figma evidence.

**Done when:** responsive rules exist for navigation, grids, forms, footer, audio controls, and cards.

### Task 6 — Extract the Design Tokens

Confirm the colors, fonts, spacing, radii, shadows, containers, and typography used by the Andalusia interface. Mark uncertain values as inferred rather than inventing them silently.

**Done when:** tokens can be consumed from one shared source by public and admin UI.

### Task 7 — Inventory the Assets

Map logos, artist portraits, event images, article covers, gallery images, thumbnails, and audio files to their source, intended component, and final storage location.

**Done when:** every dynamic asset has an ownership rule and a storage path convention.

### Task 8 — Document Interactions

Document the mobile drawer, category filters, audio player, booking form, newsletter form, links, loading states, empty states, and error states. Separate behavior confirmed by Figma from behavior inferred for implementation.

**Done when:** each interactive element has a state model and keyboard/accessibility expectation.

### Task 9 — Map Figma to Code

Create a `Figma node → React component → route` mapping for each screen. Do not create a component, route, or CMS field without a documented reason.

**Done when:** the mapping can be used as a review checklist during visual QA.

### Task 10 — Figma Audit Gate

Issue the final Figma audit report and verify that content, routes, responsive behavior, assets, interactions, and design tokens are sufficiently defined before implementation continues.

**Done when:** the Figma gate is approved and no unresolved design question can change the product scope.

## Tasks 11–20A — Content and Architecture

### Task 11 — Content Inventory

Classify Andalusia content into four groups: static UI, CMS-managed content, system settings, and user-submitted data.

Map artists, tracks, releases, events, academy courses, articles, testimonials, booking requests, and newsletter subscriptions to:

`Figma element → node ID → public component → CMS field → database entity → database field → public route`.

**Important:** booking requests and newsletter subscriptions are submissions, not ordinary public CMS content.

**Done when:** every dynamic element has a field owner and every static element remains static unless editing is genuinely required.

### Task 12 — CMS Scope

Define the smallest useful admin CMS for site settings, artists, tracks/releases, events, academy courses, articles/news, testimonials, booking requests/newsletter subscribers, and media assets.

For each module define fields, validation, create/edit/delete, publish/unpublish, ordering, media, and affected public routes.

**Done when:** the CMS contains no generic page builder, arbitrary layout blocks, plugin system, ecommerce, payment flow, enrollment engine, or unnecessary role hierarchy.

### Task 13 — Database Schema

Design the ten canonical PostgreSQL tables with columns, types, nullability, defaults, primary keys, foreign keys, unique constraints, check constraints, indexes, publication state, ordering, and timestamps.

Use single canonical entities; do not create duplicate language tables or generic CMS tables. Preserve the approved relationship behavior, including artist-to-track, artist-to-release, instructor-to-course, article references, and booking links.

**Done when:** every table and field is justified by the content inventory or an unavoidable implementation requirement.

### Task 14 — RLS Design

Design default-deny, forced RLS for every table and define `SELECT`, `INSERT`, `UPDATE`, and `DELETE` behavior for anonymous users, admins, and server-side privileged operations.

Required principles:

- Public users read published content only.
- Draft content is never publicly readable.
- Booking and newsletter records are never publicly readable.
- Public submissions are write-only and constrained to safe initial values.
- Admin mutations are authorized server-side and reinforced by RLS.

**Done when:** the policy matrix and SQL behavior agree with the canonical schema.

### Task 15 — Authentication Architecture

Define the admin login flow at `/login`, session persistence, cookie handling, logout, expired sessions, invalid credentials, middleware protection, admin layout checks, Server Action checks, and RLS authorization.

Use four layers: middleware route protection, admin layout session/role verification, `requireAdminSession()` in privileged Server Actions, and database-side `auth.is_admin()` with RLS.

**Done when:** no protected operation depends only on client-side UI or middleware.

### Task 16 — Storage Architecture

Define the seven Supabase Storage buckets, public/private behavior, path conventions, MIME allowlists, replacement rules, deletion rules, caching, database references, orphan cleanup, and authorization.

Canonical limits:

- Content/image buckets: 5 MB (`5242880` bytes).
- Audio bucket: 30 MB (`31457280` bytes).
- Audio MIME types: MPEG, OGG, WAV, MP4, and AAC according to the final implementation allowlist.

Static application icons that belong to the codebase remain under `/public/assets`.

### Task 17 — Application Architecture

Define the folder structure and boundaries for public routes, admin routes, Server Components, Client Components, Server Actions, Route Handlers, data access, validation, authentication, CMS modules, media, caching, and error handling.

Do not introduce FastAPI, Express, NestJS, MongoDB, Redis, microservices, Kubernetes, Docker, or another backend service without a new concrete requirement.

### Task 18 — Environment and Secrets

Separate public variables from server-only secrets. Public variables may include Supabase URL, anon key, site URL, locale, and optional public Turnstile configuration. Server-only variables may include service-role key, database URL, Resend key, notification settings, Turnstile secret, and CRON secret.

Search the repository for hardcoded credentials and verify that the service-role key never starts with `NEXT_PUBLIC_` and never enters a client bundle.

### Task 19 — Implementation Dependency Plan

Lock the implementation order:

`Figma audit → content inventory → CMS scope → architecture → database → RLS → Auth → Storage → foundation → public website → CMS → integration → QA → deployment`.

For every step document prerequisites, outputs, validation, and blockers.

### Task 20 — Architecture Approval Gate

Audit content-to-Figma consistency, minimal CMS scope, database alignment, RLS alignment, authentication, storage, routes, stack choices, security, and speculative functionality.

**Rule:** do not begin implementation while the architecture is internally inconsistent.

### Task 20A — Reconciliation Gate

Apply the canonical definitions whenever historical documents disagree. The reconciliation pass must produce one authoritative answer for login, admin routes, buckets, MIME types, audio size, policy names, schema edge cases, and Figma references.

The original Task 20 report remains a historical **BLOCKED** report. The later reconciliation report is the current **APPROVED** gate record.

## Tasks 21–30 — Foundation and Backend

### Task 21 — Next.js Initialization `[COMPLETED]`

Verify Next.js App Router, TypeScript strict mode, Tailwind CSS, ESLint, package scripts, and a clean production build. Preserve project history and avoid unnecessary dependencies.

**Current result:** the repository is initialized and builds successfully.

### Task 22 — Andalusia UI Foundation `[COMPLETED]`

Implement the confirmed Andalusia design foundation: colors, typography, spacing, radii, shadows, containers, buttons, badges, cards, inputs, tables, and layout primitives.

Use Cairo for Arabic body text, Aref Ruqaa for calligraphic/editorial headings, and DM Mono for dates and numeric values where appropriate.

**Current result:** shared UI components and tokens are present under `src/components/ui` and `src/lib/tokens.ts`.

### Task 23 — Arabic RTL Foundation `[COMPLETED]`

Implement `lang="ar"`, `dir="rtl"`, logical CSS properties, direction-aware icons, Bidi isolation, Arabic and Western digit formatting, date formatting, phone number isolation, and safe mixed Arabic/English rendering.

**Current result:** RTL foundation tests pass and the root layout is Arabic RTL by default.

### Task 24 — Supabase Clients `[COMPLETED]`

Implement typed browser, server, and privileged admin clients. The browser client uses the public anon key and remains RLS-enforced; the server client reads/writes Supabase session cookies; the admin client is protected by `server-only` and uses the service-role key only for explicitly authorized server operations.

Centralize database types in `src/lib/supabase/types.ts`.

**Current result:** all three client layers exist. No migrations or RLS policies have been implemented yet.

### Task 25 — Database Migrations `[COMPLETED]`

Create Supabase migrations for the ten approved tables only. Include the singleton `site_settings` row strategy, foreign keys, unique slugs/emails, check constraints, publication fields, ordering, timestamps, and required indexes.

**Current result:** `supabase/migrations/` holds 11 ordered, idempotent migrations (pgcrypto + 10 tables). Applied to a clean PostgreSQL 17 database: 10 tables, 20 explicit indexes, all check/unique/FK behaviors verified, reapply safe. No RLS, Auth, Storage, or CMS work included.

Required verification (all satisfied — see report):

- Apply all migrations to a clean database.
- Reapply migrations safely where supported.
- Verify every table and constraint exists.
- Confirm no speculative table or field was introduced.
- Record migration order and rollback considerations.

Do not implement RLS, Auth screens, Storage actions, or CMS pages in this task.

### Task 26 — RLS Implementation `[COMPLETED]`

Implemented only the approved policies from Task 14: `supabase/migrations/20260910001100_enable_rls.sql` (helpers `auth.is_admin()`/`auth.has_role()` + 49 policies, ENABLE + FORCE RLS on all 10 tables) and `20260910001200_storage_policies.sql` (4 `storage.objects` policies, 7 buckets).

**Current result:** verified on clean PostgreSQL 17 — 27/27 pass (`RLS_TEST_REPORT.md`): anon published-only reads, draft isolation, track/release parent rules, article date gating, CRM read-blocked + write-only constrained inserts, non-admin sees/writes nothing, admin full CRUD, singleton delete-blocked, storage public-read/admin-write. One spec observation recorded (OBS-1: no admin INSERT policy on CRM tables — privileged writes use `service_role`, Task 28).

Required verification (all satisfied — see `RLS_TEST_REPORT.md`):

### Task 27 — Admin Authentication

Implement `/login`, logout, session persistence, session refresh, invalid credential handling, expired session behavior, protected `/admin/*` routes, and `?next=` redirects.

Test logged-out admin access, invalid credentials, valid admin credentials, logout and cookie removal, session refresh, expired sessions, and direct access to every protected route. Do not add public registration.

### Task 28 — Server-Side Role Authorization

Implement the approved admin role check for every create, edit, delete, publish, upload, media-delete, and booking-view operation. Test direct Server Action calls and direct data access, not only visible UI buttons.

### Task 29 — Supabase Storage Implementation

Implement upload, validation, preview, replacement, deletion, deterministic path generation, metadata handling, database reference integrity, and authorization for the seven approved buckets.

Test valid files, invalid MIME types, spoofed extensions, oversized images, audio over 30 MB, invalid dimensions, unauthorized requests, replacement, deletion, referenced files, and orphan files.

### Task 30 — Server-Side Validation

Implement minimal shared validation with Zod where useful. Validate required strings, URLs, emails, phone values, dates, enums, slugs, publication status, media metadata, booking submissions, and newsletter submissions.

Test empty fields, malformed input, unexpected fields, very long values, invalid URLs, duplicate slugs/emails, malformed dates, unauthorized requests, and repeated submissions.

## Tasks 31–40 — Public Website

### Task 31 — Global Public Shell

Implement the confirmed public shell: desktop floating navbar, mobile top bar, mobile drawer, footer, global background, typography, container system, RTL behavior, focus states, and responsive layout.

Do not include CMS data or speculative sections in this task.

### Task 32 — Home Page `/`

Implement the verified home page sections: hero and primary/secondary calls to action, upcoming events preview, Andalusia/about presentation, booking call-to-action banner, featured artists, editorial/story highlight, testimonials, global navigation, and footer.

Connect dynamic content only where the content inventory defines it as dynamic. Test desktop, mobile, RTL, empty data, missing images, loading, links, console errors, and network errors.

### Task 33 — Artists Directory `/artists`

Display published artists with portrait, name, role/genre, approved social links, ordering, and confirmed category filters. Test draft hiding, empty lists, missing images, mobile stacking, RTL, and route links.

### Task 34 — Artist Profile `/artists/[slug]`

Implement the artist identity, portrait, biography, tracks, audio player, gallery, and social links. Handle valid slugs, invalid slugs, missing artists, unpublished artists, missing media, audio errors, responsive behavior, RTL, metadata, and SEO.

### Task 35 — Events `/events`

Display published events with category, date, venue, city, image, and ticket/booking action. Implement only confirmed filters and fields. Link internal booking to `/booking?event_id=...`; do not create an event detail route.

### Task 36 — Academy `/academy`

Display approved academy tracks, instructor information, descriptions, images, ordering, publication state, and newsletter/interest signup where confirmed. Do not implement student enrollment, payments, accounts, or course completion tracking.

### Task 37 — News `/news` and `/news/[slug]`

Implement the news listing, featured article, article cards, reader page, publication dates, metadata, canonical URLs, missing article handling, and 404 behavior. Use ISR only for approved public news content.

### Task 38 — Booking `/booking`

Implement the booking form with name, contact details, event type, preferred date, venue/location, message, selected artist/event context, and safe success/error states.

The form must submit through a validated server boundary. Booking records must remain private and must never be publicly queryable.

### Task 39 — Gallery, Audio, and Media

Implement gallery, approved video providers, and audio playback only where confirmed by Figma and the content inventory. Add loading, missing-media, playback-error, and keyboard-accessible states.

### Task 40 — Public Integration Review

Connect all public routes to Supabase queries for published content. Verify links, filters, empty states, missing assets, mobile behavior, RTL, cache/revalidation behavior, and the absence of draft records from public responses.

## Tasks 41–51 — Admin Workspace and CMS

### Task 41 — Admin Shell

Create the protected admin layout with sidebar/navigation, header, breadcrumbs, logout, loading states, unauthorized states, error boundaries, and the canonical admin route names.

### Task 42 — Admin Dashboard

Create a small dashboard with useful counts for booking requests, artists, upcoming events, articles, and newsletter subscribers. Do not build speculative analytics, charts, or tracking infrastructure.

### Task 43 — Site Settings CMS

Manage the singleton `site_settings` record for hero content, about content, footer mission, contact details, social links, operational regions, and copyright text. Include validation, preview, guarded save, and safe fallback values.

### Task 44 — Artists CMS

Implement admin CRUD for artists, portraits, biographies, categories, featured state, social links, ordering, publication, archive/delete behavior, and related media.

### Task 45 — Tracks and Releases CMS

Manage tracks and releases, artist relationships, covers, audio files, duration, ordering, external links, publication, replacement, and deletion. Enforce the 30 MB audio limit and approved MIME types.

### Task 46 — Events CMS

Manage event title, category, date, venue, city, performer/artist relation, image, optional ticket URL, booking linkage, publication, and status. Validate dates, URLs, and event visibility.

### Task 47 — Academy CMS

Manage `academy_courses`, instructor relation, description, image, ordering, publication, and signup copy. Do not add a student account or enrollment system.

### Task 48 — Articles and Testimonials CMS

Manage article slugs, titles, covers, content, categories, publication dates, featured status, and references. Manage testimonial quote, author role, avatar, ordering, and publication.

### Task 49 — Bookings and Subscribers CMS

Display booking requests only to authorized admins. Support status transitions and private admin notes. Manage newsletter subscribers and subscription status. Never expose private submissions through public components or public queries.

### Task 50 — Media Manager

Create the admin media interface for the seven buckets with upload, replace, delete, preview, path, MIME, file size, related record, and authorization information. Protect referenced files and define orphan cleanup behavior.

### Task 51 — CMS-to-Public Integration

Verify that publishing or editing CMS records updates public pages through the approved cache/revalidation strategy. Confirm that drafts, archived content, private bookings, and private subscriber records never leak into public responses.

## Tasks 52–60 — Security, Quality, and Release

### Task 52 — Authentication Security QA

Test login, logout, session refresh, direct `/admin` access, `?next=` redirect safety, expired sessions, cookie behavior, role changes, and service-role isolation.

### Task 53 — Authorization and RLS QA

Test every table and every CRUD operation as anonymous user, authenticated admin, unauthenticated server request, and unauthorized authenticated user. Include `storage.objects` policies and direct database access.

### Task 54 — Input and Form Security QA

Test validation, honeypot/Turnstile if enabled, duplicate submissions, rate-limit assumptions, long values, malformed URLs, unsafe HTML/Markdown, unexpected fields, and safe error messages.

### Task 55 — Media Security QA

Test MIME spoofing, extension spoofing, file size limits, 30 MB audio boundary cases, image dimensions, SVG rules, replacement, deletion, reference protection, and orphan files.

### Task 56 — Responsive and RTL QA

Test 390px, 768px, 1024px, and 1440px layouts. Check the drawer, forms, tables, cards, audio player, filters, Arabic text, mixed text, numbers, dates, URLs, and phone numbers.

### Task 57 — Visual Figma QA

Compare each public screen with the verified Figma reference for layout, spacing, typography, color, radius, shadow, image treatment, icon direction, and responsive behavior. Record differences and fix only verified mismatches.

### Task 58 — SEO, Accessibility, and Performance

Implement metadata, Open Graph, sitemap, robots rules, canonical URLs, semantic HTML, alt text, keyboard focus, form labels, reduced-motion behavior, image optimization, and basic Core Web Vitals review.

### Task 59 — Production Build and Deployment QA

Run a clean install, typecheck, lint, tests, production build, environment-variable validation, migration verification, and deployment preview. Confirm that secrets are configured only on the server.

### Task 60 — Full-System Regression

Run the complete user journey:

`visitor opens site → browses artists → opens an artist → plays audio → views events → submits booking → admin reviews request → admin publishes content → content appears publicly`.

Verify security, responsive behavior, visual fidelity, data integrity, error handling, logs, and deployment readiness. Issue the final delivery report.

## Task Transition Rule

Do not start Task 26 until Task 25 succeeds. Do not build CMS screens until RLS, Auth, and Storage foundations are working. Resolve conflicts using `TASK_1_20_CANONICAL_SPEC.md` and `ARCHITECTURE_RECONCILIATION_REPORT.md`; treat the original blocked approval report as historical evidence, not the latest gate decision.
