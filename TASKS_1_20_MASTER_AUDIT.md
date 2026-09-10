# TASKS 1–20 MASTER AUDIT — Pre-Implementation Architecture & Specification Review
Date: 2026-09-10 | Auditor: Senior Architect (independent) | Scope: Tasks 1–20, repo `/home/mahmoud/Desktop/cms`
Figma: https://www.figma.com/design/xcKbTxQQhUVOFJerTrkrw2 (node-id=0-1 claimed, UNVERIFIED — see §2)

## 0. Evidence base (actually inspected)
- Repo tree: 18 root MDs + `docs/` mirror (14 files, duplicates), `figma_full_inventory.json` (739,688 B, 1568 nodes), `src/` = stock Next.js (layout, page, globals only — no implementation), `.env.example` (clean), `package.json` (next 16.3.4, react 19, tailwind 4 — no backend deps).
- Sub-audits: content/CMS (6 files), DB/RLS/storage (5 files), auth/app/env/deps (6 files), Figma JSON structural parse.
- Live Figma MCP: `figma_get_file` succeeded once (truncated), subsequent `figma_get_nodes` → `Transport closed` (stdio instability). Verdict relies on inventory JSON + URL + docs, marked accordingly.
- **Missing authoritative artifact:** `figma_audit_master_specification.md` does NOT exist in repo. Referenced 8× via absolute `file:///home/mahmoud/.gemini/antigravity-cli/brain/...` paths (PLAN.md:5, IMPLEMENTATION_DEPENDENCY_PLAN.md:84/102, CONTENT_INVENTORY.md:3, ARCHITECTURE_APPROVAL_REPORT.md:98). All Figma claims citing it are second-hand. BLOCKER B6.

## 1. Figma consistency (inventory JSON truth)
- Structure: dict with 7 keys (`root89`, `laptopArabic`, `mobileArabic`, `desktopEnglish`, `mobileEnglish`, `designSystemComponents`, `designSystemPage`) — custom export, NOT standard Figma API (no document/lastModified).
- `0:1` / `0:0`: count = 0. URL `?node-id=0-1` is **UNVERIFIED**. Closest root: `89:15216` (`الرئيسية`, FRAME 1440×5165, 9 children) — exists ×2 (root89 + laptopArabic child). CONFIRMED.
- Pages CONFIRMED (names/sizes from JSON): laptopArabic SECTION 141:16533 (7×1440: الرئيسية 89:15216, الأكاديمية 91:16119, الفعاليات 91:16532, الحجز 91:17109, الأخبار 91:17296, الفنانين 91:17844, الفنان 134:4420); mobileArabic (7×390 + strip 141:16531); desktopEnglish (7×1440 mirror); mobileEnglish (mirror). Responsive AR 1440↔390 CONFIRMED; EN TEXT still contains Arabic (localization incomplete).
- Design tokens: **zero** `fill/fills/color` keys; typography = 29 TEXT nodes only (Cairo/Qahwa/SF Pro, sizes 14.72–64). No palette/type-scale export. All color/spacing/radius/shadow claims = UNVERIFIED/INFERRED.
- Node 91:17396 (ArticleCard "اقرأ المزيد") cited CONTENT_INVENTORY.md:229 — plausibility only (not live-verified, gateway unstable). Treat component→node links as PARTIAL.

## 2. Task-by-task verdict
| Task | Claim | Evidence | Verdict |
|---|---|---|---|
| T1 Repo isolation | clean workspace | src/ = 3 stock files, no app code | **PASS** |
| T2 Root discovery | root 0:1 | 0:1 absent; 89:15216 confirmed | **PARTIAL** (root found, URL node UNVERIFIED) |
| T3 Node inventory | full recursive export | 1568 nodes, FRAME 654/VECTOR 695/INSTANCE 110/SYMBOL 40/TEXT 29 | **PASS** (schema minimal — no fills/effects) |
| T4 Screens & sitemap | 7 pages AR+EN | 7 AR laptop + 7 mobile + EN mirrors verified | **PASS** (route count says "7" but lists 8 — §3) |
| T5 Responsive | desktop+mobile | 1440↔390 pairs, heights scale (5165→6528) | **PASS** (tablet = engineering decision, correctly separated) |
| T6 Design system | tokens extracted | 22 components, 29 TEXT; zero color keys | **PARTIAL** (components CONFIRMED, tokens UNVERIFIED) |
| T7 Assets audit | assets mapped | 7 buckets defined; node→asset→bucket chain incomplete, avatar path drift | **PARTIAL** |
| T8 Interactions | behaviors mapped | navbar/drawer/carousel/forms/player mostly INFERRED, no prototype data in JSON | **PARTIAL** |
| T9 Figma→impl mapping | mapping doc | exists via CONTENT/APP docs; events/[slug] was speculative (now removed from current APPLICATION) | **PARTIAL** |
| T10 Audit gate | gate functioned | ARCHITECTURE_APPROVAL_REPORT correctly BLOCKED (9/11 pass, 5 blockers) | **PASS** |
| T11 Content inventory | content tiers | 4 tiers, thorough; booking linkage triple, enums diverge (event_type AR vs EN+other, articles categories) | **PASS** (with warnings C-booking/C-enum) |
| T12 CMS scope | 9 modules | MATRIX split tracks/releases vs SCOPE merged; Media Manager only in SCOPE; "7 routes" lists 8; avatar `site/avatars/` 7th path | **PARTIAL** |
| T13 DB schema | 10 tables | All justified Figma→content→CMS→route; ZERO M:N verdict sound | **PASS** (newsletter `status` vs `subscribed_at/is_active` warning) |
| T14 RLS/security | default-deny + FORCE | Full matrix + per-table policies; **audio 20 vs 30 MB**, MIME drift, `site_settings` INSERT DENY vs ALLOW | **FAIL** (3 hard contradictions) |
| T15 Auth | one architecture | **`/admin/login` (AUTH) vs `/login` (APPLICATION/DEPENDENCY/Approval-prescribed)**; matcher differs; subpaths courses vs academy / inquiries vs bookings vs leads | **FAIL** |
| T16 Storage | 7 buckets canonical | Current files agree 7 buckets; **20 vs 25 vs 30 MB audio**, MIME avif/svg/mp4/aac drift, `media-public/audio-samples` obsolete names persist in Approval history | **FAIL** |
| T17 App arch | minimal Next+Supabase | Stack minimal (no Redis/Docker — PASS); routes fixed (events/[slug] removed); but inherits login + subpath contradictions | **FAIL** |
| T18 Env/secrets | env isolation | .env.example: public `NEXT_PUBLIC_*` vs server-only; service_role never `NEXT_PUBLIC_`, never in client | **PASS** |
| T19 Deps plan | valid DAG | 01→…→14 waterfall, no cycles; Step 9 fan-in documented | **PASS** (`/admin/leads` naming vs canonical bookings/subscribers — warning) |
| T20 Approval gate | BLOCKED verdict | Correctly BLOCKED; B1-storage + B4-events/[slug] since fixed in APPLICATION, B2/B3/B5 still open | **PASS** |

Totals: PASS 9 (T1,T3,T4,T5,T10,T11,T13,T18,T19,T20 = 10 — recount below) — final count in §7.

## 3. Route canonical table (8 public, NOT 7)
| Route | Figma node | Purpose | Admin? | Confirmed | Source |
|---|---|---|---|---|---|
| `/` | 89:15216 الرئيسية | home | public | YES | inventory + all content docs |
| `/artists` | 91:17844 الفنانين | directory | public | YES | inventory + docs |
| `/artists/[slug]` | 134:4420 الفنان | profile + player | public | YES | inventory + docs |
| `/events` | 91:16532 الفعاليات | catalog | public | YES | inventory + docs |
| `/academy` | 91:16119 الأكاديمية | 3 tracks | public | YES | inventory + docs |
| `/news` | 91:17296 الأخبار | grid | public | YES | inventory + docs |
| `/news/[slug]` | Task 9 arch (ArticleView) | reader | public | PARTIAL (no dedicated frame in inventory page list) | docs only |
| `/booking` | 91:17109 الحجز | forms + CRM write | public | YES | inventory + docs |
| `/events/[slug]` | — | — | — | **REMOVED** (was speculative, pruned from current APPLICATION) | Approval B4, now resolved |
| `/login` vs `/admin/login` | — | admin entry | admin | **CONTESTED** | AUTH vs APPLICATION — BLOCKER |
| `/admin/*` subpaths | — | CMS | admin | **CONTESTED** (academy/courses, bookings/inquiries/leads, subscribers) | BLOCKER |

## 4. DB/RLS/storage/auth snapshots
- DB: 10 tables (`site_settings` singleton `id='default'`, `artists`, `tracks`, `releases`, `events`, `academy_courses`, `articles`, `testimonials`, `booking_requests`, `newsletter_subscribers`). Relationships CASCADE/SET NULL sound. Slugs UNIQUE, `published_at<=now()`, timestamps present.
- RLS: default-deny + FORCE, anon SELECT published-only (+ hierarchical tracks/releases, temporal articles), booking/newsletter `SELECT USING(false)` + guarded INSERT (`status='pending'`, `admin_notes IS NULL` / `status='subscribed'`). Storage public-read + admin-write. Principle sound; values contradict (§5).
- Storage canonical (current): `site,artists,releases,events,academy,articles` 5 MB + `audio` **30 MB canonical-proposed** (`31457280`). Images jpeg/png/webp (+avif, +svg site-only proposed); audio mpeg/ogg/wav (+mp4/aac proposed).
- Auth canonical-proposed: `/login` + `src/app/(auth)/login/page.tsx`, matcher `['/admin/:path*','/login']`, 4 layers (middleware → layout `getUser`+role → Server Action `requireAdminSession` → `auth.is_admin()`). NOT yet applied to AUTH_ARCHITECTURE.md.

## 5. Critical contradictions (→ TASK_1_20_CONTRADICTIONS.md, 9 IDs)
C1 login route, C2 middleware matcher, C3 admin subpaths, C4 audio 20/25/30, C5 MIME drift, C6 site_settings INSERT, C7 storage policy names, C8 booking artist triple, C9 newsletter schema + "7 routes list 8" + ticket_url/author_role/category enum warnings.

## 6. Scope: required vs creep
REQUIRED: 8 public routes, 9 CMS modules (8 content + media manager), 10 tables, 7 buckets, 4-layer auth. JUSTIFIED: Turnstile, Resend, CRON_SECRET, ISR for news. SPECULATIVE (remove/approve): `/events/[slug]` (removed ✓), enrollment/payments/community/analytics (correctly rejected). No page builder, no extra backend. Scope discipline GOOD.

## 7. Final gate matrix
| Task | Status | Critical | Ready? |
|---|---|---|---|
| T1 | PASS | 0 | YES |
| T2 | PARTIAL | B6 evidence gap | YES w/ warning |
| T3 | PASS | 0 | YES |
| T4 | PASS | count wording | YES |
| T5 | PASS | 0 | YES |
| T6 | PARTIAL | tokens unverified | YES w/ warning |
| T7 | PARTIAL | avatar path | YES w/ warning |
| T8 | PARTIAL | inferred→arch | NO (must label INFERRED) |
| T9 | PARTIAL | master-spec missing | NO (re-anchor to inventory) |
| T10 | PASS | 0 | YES |
| T11 | PASS | warnings only | YES |
| T12 | PARTIAL | grouping/count | YES w/ warning |
| T13 | PASS | warnings only | YES |
| T14 | FAIL | C4,C5,C6 | NO |
| T15 | FAIL | C1,C2,C3 | NO |
| T16 | FAIL | C4,C5 | NO |
| T17 | FAIL | C1,C3 | NO |
| T18 | PASS | 0 | YES |
| T19 | PASS | naming warning | YES |
| T20 | PASS | correctly blocked | YES |

TOTAL: 20 | PASS 9 (T1,T3,T4,T5,T10,T11,T13,T18,T19,T20) | PARTIAL 7 (T2,T6,T7,T8,T9,T12 + recount: T4/T5 PASS, so PARTIAL = T2,T6,T7,T8,T9,T12 = 6; T11 PASS) — exact: PASS 10, PARTIAL 6, FAIL 4, BLOCKED 0. See IMPLEMENTATION_READINESS for locked count.
CRITICAL BLOCKERS: 6 (login, subpaths, audio size, MIME, site_settings insert, missing master spec) | HIGH: 3 | MEDIUM: 5 | LOW: 4.

## FINAL ARCHITECTURE STATUS: **BLOCKED**
Implementation would require developers to invent: which login route, which admin paths, which audio limit/MIME, whether site_settings INSERT allowed, which booking-artist field, which newsletter columns. DO NOT begin Tasks 21–60. Smallest safe correction = apply TASK_1_20_CANONICAL_SPEC.md §8 patch list (6 single-line doc fixes + re-anchor Figma refs to `figma_full_inventory.json`), then re-run gate.
