# RLS Test Report — Task 26

**Spec:** `RLS_DESIGN.md` §§1–4 · **Migrations:** `supabase/migrations/20260910001100_enable_rls.sql` (49 policies, 10 tables), `20260910001200_storage_policies.sql` (4 policies, 7 buckets) · **Date:** 2026-09-10
**Method:** clean PostgreSQL 17 (docker, removed after run) → base migrations 01–11 → `tests/rls-harness.sql` (roles `anon`/`authenticated` + grants, mock `auth.jwt()` reading per-test `test.jwt` claim, minimal `storage.objects` mock with RLS forced, fixture rows for every policy path) → migrations 12–13 → `tests/rls-tests.sql` (each test self-rolled-back). Reusable in Task 53.

## Result: 27/27 PASS

| Actor | Operation | Expected | Actual | Evidence |
| :--- | :--- | :--- | :--- | :--- |
| — | RLS forced on 10 tables + storage mock | 11 | 11 | T00 `pg_class.relforcerowsecurity` |
| — | Total policies | 53 | 53 | T00 `pg_policies` |
| anon | Read published artists | 1 row | 1 | T01 |
| anon | Read tracks (published + published parent) | 1 (orphan + draft hidden) | 1 | T02 |
| anon | Read releases (parent rule) | 1 | 1 | T03 |
| anon | Read events / academy / testimonials | 1 each | 1 each | T04a/b/c |
| anon | Read articles (past-published only) | 1 (future + draft hidden) | 1 | T05 |
| anon | Read site_settings | 1 | 1 | T06 |
| anon | Read booking_requests / newsletter_subscribers | 0 / 0 | 0 / 0 | T07a/b |
| anon | Insert booking `pending`, no notes | ALLOW | `INSERT 0 1` | T08 |
| anon | Insert booking `status='confirmed'` | DENY | `ERROR: new row violates RLS policy` | T09 |
| anon | Insert booking with `admin_notes` | DENY | same ERROR | T10 |
| anon | Insert newsletter `subscribed` | ALLOW | `INSERT 0 1` | T11 |
| anon | Insert newsletter `unsubscribed` | DENY | same ERROR | T12 |
| anon | Update site_settings / insert artist / delete artist | DENY | `UPDATE 0` / ERROR / `DELETE 0` | T13 |
| authenticated (non-admin) | Read artists / insert artist | 0 rows / DENY | 0 / ERROR | T14a + insert |
| authenticated (admin JWT) | Read artists / tracks / articles / bookings / subscribers | 2 / 3 / 3 / 1 / 1 | same | T15a–e |
| authenticated (admin JWT) | Update booking status, update site_settings, insert artist, delete testimonial | ALLOW | `UPDATE 1` ×2, `INSERT 0 1`, `DELETE 1` | T16 |
| authenticated (admin JWT) | Delete site_settings | DENY | `DELETE 0` | T17 |
| anon | Read storage.objects | 1 | 1 | T18a |
| anon | Insert storage.objects | DENY | ERROR | T18 |
| authenticated (admin JWT) | Insert / delete storage.objects | ALLOW | `INSERT 0 1` / `DELETE 1` | T18 |
| authenticated (admin JWT) | Insert outside 7 buckets | DENY | ERROR | T18 |
| authenticated (admin JWT) | Direct booking insert `confirmed` + notes | DENY per spec | ERROR | T19 / OBS-1 |

Notes: `UPDATE`/`DELETE` with no matching policy affect 0 rows silently (no ERROR) — `UPDATE 0`/`DELETE 0` above are denials, not failures. Fixture/test rows never persisted (every test rolled back). Reapply of migration 12 is clean (idempotent); policy count stays 53.

## OBS-1 (spec observation, no migration change)

`RLS_DESIGN.md` §3.9/§3.10 define only the public write-only INSERT fallback (`pending`/`subscribed`, notes NULL) — there is **no admin INSERT policy** for `booking_requests`/`newsletter_subscribers`, so even an admin JWT cannot insert a non-pending lead or preset notes directly. The master matrix (§1.2) marks admin INSERT as ALLOW. Migration implements the SQL verbatim per the "only approved policies" rule; privileged admin writes use the `service_role` path (bypasses RLS), which Task 28 owns. Recommend Task 28 confirm that privileged Server Actions use `service_role` for these two tables and never depend on an RLS admin-insert path.

## Residual scope (not Task 26)

- `storage.objects` policy *logic* verified against a faithful mock; application to the real platform schema happens with Task 29 (buckets) / deploy (Task 59).
- `auth.jwt()` was mocked (`test.jwt` claim); end-to-end JWT wiring is exercised in Tasks 27–28 and QA Tasks 52–53.
- `service_role` bypass and unauthenticated-direct-DB paths are covered in Task 53.
