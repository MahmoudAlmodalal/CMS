# TASK 1–20 SCOPE AUDIT — required / justified / optional / speculative / creep
## REQUIRED (build)
8 public routes (§CANONICAL-1); 9 CMS modules (8 content + media manager); 10 tables; 7 buckets (6×5MB + audio 30MB); 4-layer auth; booking + newsletter write-only CRM; markdown articles; audio player.

## JUSTIFIED ENGINEERING (build, label as such — not Figma claims)
Tablet ≥768 single-column + drawer <1024; breakpoints 640/768/1024/1280; ISR `generateStaticParams` for `/news/[slug]` + `/artists/[slug]`; `force-dynamic` admin; HTTP 206 range streaming (native Supabase); Turnstile + Resend + CRON_SECRET; avatar 2 MB app-guidance inside 5 MB bucket; `preferred_artist` free-text alongside `artist_id` FK.

## OPTIONAL (deferred, schema-ready only)
EN localization (`_ar/_en` or JSONB — NO columns now); `ticket_url` external override (nullable, fallback booking); subscriber `status` triage; course `?course=[slug]` routing.

## SPECULATIVE (do NOT build without approval)
`/events/[slug]` (REMOVED ✓); payments/enrollment/social/community/analytics engine/advanced CRM workflows/generic page builder/drag-drop (all correctly REJECTED — CMS_SCOPE §REJECTED, Approval #10).

## SCOPE CREEP (found: none active)
Historical only: `media-public/audio-samples` bucket names (Approval history; current files fixed ✓); PLAN.md `next-intl /[locale]`, mock fallback data, 6-table early cuts (superseded, mark HISTORICAL). Current spec adds nothing beyond verified requirements except wording miscount "7 routes" (fix → 8).
Verdict: scope discipline GOOD; no active creep. Gate remains BLOCKED only on contradictions, not scope.
