# Code review — testing strategy, server actions, E2E coverage

Reviewed at `41547bb`, on the whole repository, driven by what the test files
do and do not prove. Everything below was verified by running the code, not by
reading it alone. The fixes described are in the three commits that follow this
document on `claude/e2e-test-review-pages-2wmwu7`.

---

## 1. The test suite was green because it was not being run

`package.json` `scripts.test` listed **34 of the 41** files in `tests/`. The
seven it left out were not marked skipped, quarantined or documented — they
were simply absent from the list, and a commit had adjusted CI so the deploy
proceeded regardless:

```yaml
# .github/workflows/ci-cd.yml, deploy job
# Keep validation visible as a quality signal, but do not let legacy
# contract tests prevent the migration and production deploy jobs.
needs: migrate
```

Two separate problems were hiding behind that.

**The exclusion was mostly unnecessary.** Four of the seven — `academy`,
`booking`, `public-integration`, `empirical-m1-challenge` — fail only when
`node_modules` is absent, because they import `zod` transitively:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'zod'
    imported from /home/user/CMS/src/lib/validations/cms.ts
```

With dependencies installed they pass. 25 tests had been switched off for a
missing `npm ci`.

**`npm test` was red anyway.** Four tests *inside* the 34-file list were
failing, so the "Tests" step of both workflows was failing on every run and the
deploy was wired around it:

| test | why |
|---|---|
| `admin-tracks` — audio contract | asserts `TracksManager` mounts `AudioUploadField`; tracks moved to a YouTube link |
| `admin-tracks` — partial update | asserts the source reads `trackSchema.omit(…)`; it reads `trackSchemaBase.omit(…)` |
| `media` — MediaPickerField integrations | asserts `TracksManager` imports the cover picker; a track's artwork is now the video thumbnail |
| `english-content` — `_en` twins | **crashed**: `Cannot use 'in' operator to search for 'title_en' in undefined` |

The last one is the interesting one. `trackSchema` gained a `.refine()`, which
makes it a `ZodEffects`, and a `ZodEffects` has no `.shape`. So the check that
every translatable migration column has a Zod field stopped checking anything
and threw instead — the test was not reporting a schema problem, it had simply
lost the ability to look.

**Fixed.** The four in-list tests now assert the current contract, the four
needlessly-excluded files are back, and the three genuinely stale ones are
handled in §2. `scripts.test` is a glob:

```json
"test": "node --experimental-strip-types --test \"tests/*.test.ts\""
```

so a new test file cannot be left out of the suite by omission. `deploy` depends
on `validate` again. **279 tests, 279 passing** — up from 241 run, 237 passing.

## 2. Most of the suite asserts on source text, not behaviour

**38 of the 41** test files call `readFileSync` on a component and match a
regular expression against its source. Only `server-validation.test.ts` and
`storage.test.ts` execute the code they cover.

This is why the failures in §1 were all false alarms about intentional changes,
and it is why they accumulated: a suite that breaks on every rename and passes
through every logic regression stops being read as a signal.

The sharpest examples asserted exact Figma pixel values:

```
AssertionError: Hero headline must declare 64px desktop font size
AssertionError: AboutSection must enforce canonical Figma height: 879px
AssertionError: Navbar CTA must use the localized admin label
```

These describe a design that has since moved on. `empirical-m2-upper-stages`
(10 of its 12 tests failing) is deleted; the two failing blocks in
`home-page.test.ts` and the one in `public-shell.test.ts` are removed and the
rest of those files kept, because the surrounding tests are about structure
rather than pixels and still hold.

**Not changed, worth deciding on:** the remaining ~36 source-grep files. They
are cheap and they do catch deletions, but they should not be mistaken for
coverage. Layout and geometry belong in the E2E suite, where a real browser can
measure them; §5 is the start of that.

## 3. Server Actions accepted their own authorization context

The most serious finding.

Every exported action in `src/actions/cms.ts` — 36 of them — took a second
parameter:

```ts
export async function createArtistAction(
  input: ArtistInput,
  ctx?: AuthContext          // ← supplied by the caller
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdminSession(ctx);
```

and the guard short-circuited on it:

```ts
export async function requireAdminSession(ctx?: AuthContext) {
  if (ctx?.user !== undefined) {
    assertAdminRole(ctx.user);        // validates a claim the caller wrote
    return { supabase: ctx.supabase, user: ctx.user };
  }
  // …only here does supabase.auth.getUser() run
```

**A Server Action's arguments come from the client.** A POST carrying
`{user: {app_metadata: {role: "admin"}}}` satisfied `assertAdminRole` against a
claim the attacker supplied, and `supabase.auth.getUser()` — the line that
actually verifies the JWT against GoTrue — never ran.

What the forged path then returned is the second half of the bug. Because a
`SupabaseClient` is not serializable, `ctx.supabase` arrives `undefined`, and
every action had a branch for that:

```ts
if (!supabase) return { ok: true, data: { id: parsed.data.id || "mock-artist-id" } };
```

`ok: true`, with a fabricated id, for a write that never touched the database.
There were **33** such branches. `insertedId()` carried the same default, so a
real insert that came back without an id also reported a new record called
`mock-record-id`.

Mitigating it: `middleware.ts` answers a non-GET to `/admin/*` from a
non-admin with a 401, and the action endpoints are bound to admin routes. The
guard was not the only thing standing between an anonymous POST and the CMS.
But a guard that accepts the caller's word for who they are is not a guard, and
nothing in the code documented the middleware as load-bearing for it.

**The seam was used by nothing.** No test and no component ever passed a `ctx`
— `grep` across `tests/`, `e2e/`, `src/components/` and `src/app/` returns
nothing. It was a test affordance that no test took.

**Fixed.** The parameter is gone from all 36 actions, from the two booking and
newsletter DAL readers that copied the pattern, and from `requireAdminSession`,
which now always builds a cookie-backed client and verifies the token. That
made `supabase` non-optional and the 33 fake-success branches unreachable, so
they are deleted; `insertedId()` returns `null` and its callers report an error
rather than inventing a record.

## 4. Smaller defects, all fixed

**`isAdminUser` and `assertAdminRole` disagreed.** `assertAdminRole` accepted
`admin` or `service_role`; `isAdminUser` accepted only `admin`. Two functions,
one question, two answers. They now agree.

**`uploadMediaAction` and `deleteMediaAction` existed twice** — in
`src/actions/storage.ts` and `src/actions/admin-media.ts` — with different
signatures and different guards. Nothing imported the `admin-media` pair; every
media component uses `storage.ts`, whose `requireStorageAdmin` also validates
MIME, size and content sniffing. The dead copies are removed, and the
upload-contract test now points at the implementation that actually runs.

**The newsletter told visitors they had subscribed when they had not.** With
Supabase unconfigured, `subscribeNewsletter` returned `success: true` as a
"graceful offline/demo fallback". That is a reasonable local affordance and a
bad production one: a deploy with a missing env var would thank every visitor
for subscribing and store nothing. The fallback is now scoped to non-production;
production logs and returns the server-error message.

**Playwright could not start where Google Chrome is absent.** `playwright.config.ts`
pinned `channel: "chrome"`, which fails rather than falling back — including in
CI and in the container this review ran in, where only bundled Chromium exists.
It now defaults to the bundled browser, with `E2E_BROWSER_CHANNEL=chrome` to opt
back in.

**`watch()` classified early failures against the wrong origin.** It derived the
same-origin filter from `page.url()`, which is `about:blank` until the first
`goto` — so failed requests during initial load were dropped instead of
reported. It takes the base URL now.

## 5. E2E covered less than its file list suggested

Before this change, `e2e/` was four files and looked thorough. Measured against
the routes:

- **`/academy/[slug]` had no test at all.** The route exists, renders a full
  course page with CMS overrides and `notFound()` handling, and nothing touched it.
- **CRUD ran on one of eight managers.** A comment said as much — *"full CRUD
  only on artists as the representative manager; the other six share ManagerKit
  and are covered by page-load checks"* — but a page-load check does not
  exercise a save, a publish or a delete, and there are seven others, not six.
- **`/admin/works` and `/admin/diagnostics` were never checked for an auth
  redirect.** `auth.spec.ts` hardcoded a 13-route list that had drifted from
  `CANONICAL_ADMIN_ROUTES`.
- **Three tests could not fail.** In `public.spec.ts`, the testimonials slider
  and audio player tests placed every assertion behind `if (count > 0)`, so they
  passed whether or not the widget existed:

  ```ts
  const playBtn = page.getByRole("button", { name: /تشغيل|^Play$/i });
  if ((await playBtn.count()) > 0 && (await playBtn.first().isVisible())) {
    await playBtn.first().click();
  }                                    // ← no expect anywhere in the test
  ```

- **Selectors hardcoded Arabic copy.** `getByRole("navigation", {name: "تصنيفات الفنانين"})`
  breaks on a copy edit and leaves the English side untested.

**Added.** 139 tests across 8 spec files:

| spec | covers |
|---|---|
| `admin-crud.spec.ts` | all 8 managers: required-field block → create → reload → edit → publish → public 200 → unpublish → public 404 → delete → reload |
| `admin-settings.spec.ts` | settings form, preview panel, all 6 `/admin/pages` tabs, and a saved override asserted on the public page |
| `admin-tables.spec.ts` | bookings triage, subscribers, every storage bucket, diagnostics run |
| `public-pages.spec.ts` | academy detail + its 404, events filter, news pagination, artist works/gallery and the YouTube embed, and the three no-op widget tests rewritten to fail when absent |

Two choices worth naming. `admin-crud.spec.ts` is one table rather than eight
specs, because every manager really does share the ManagerKit contract
(`#<entity>-form`, `حفظ <noun>` → `حفظ التعديلات`, `تعديل` / `حذف`,
`role="status"` on success) — and it fills each form by reading its controls at
runtime, so a field added next month is covered rather than quietly skipped.
And `e2e/messages.ts` resolves selectors through `src/messages/*.json`, the same
catalog the components render from, so each assertion holds in both locales and
a copy edit fails at the key rather than as a selector matching nothing.

`global-setup` now fails with *"Seed the demo content first: node
scripts/seed-demo-content.mjs --seed"* when a listing has no published rows,
instead of letting every detail test fail separately as a missing link.

## 6. Open, not addressed here

- **`SubmissionDeduplicator`** (`src/lib/validations/security.ts:127`) is
  written, exported and unit-tested — and used by nothing. The public booking
  and newsletter actions have no rate limiting or duplicate suppression of any
  kind. The test suite covering a class no caller uses is the §2 problem in
  miniature.
- **The ~36 remaining source-grep test files** — see §2.
- **The E2E suite has not been executed.** It needs a live Supabase project and
  an admin user, which this environment does not have. Every spec is
  typechecked and enumerates under `playwright test --list`; none has been run
  against a browser.

## Verification

```
npm ci
npm run lint       # 0 errors, 48 pre-existing warnings
npm run typecheck  # clean
npm test           # 279 tests, 279 passing
npm run build      # compiled, 17 static pages
npx playwright test --list   # 139 tests in 8 files
```

To run the E2E suite:

```
# .env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#       SUPABASE_SERVICE_ROLE_KEY, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD
node scripts/seed-demo-content.mjs --seed
npm run e2e
```

`global-teardown` deletes every `E2E-TEST%` and `e2e-test+%` row the run
creates. The two specs that touch `site_settings` restore what they changed
themselves, because a singleton row cannot be cleaned up by pattern.
