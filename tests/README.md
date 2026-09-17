# tests/

Run with `npm test` (a glob — every `tests/*.test.ts` is in the suite; nothing
is opted in by hand, because a hand-written list is how seven files ended up
outside the suite unnoticed).

## What these tests are, and what they are not

Most files here are **contract tests over source text**: they `readFileSync` a
component or action and match a regular expression against it. They are cheap,
they run without a browser or a database, and they do catch a deleted export, a
dropped guard, or a schema that has stopped matching its migration.

They are **not** proof that anything works. A test that greps `TracksManager.tsx`
for `createTrackAction` passes whether or not saving a track succeeds. Three
consequences follow, all of which have actually happened in this repo:

- **They break on intentional changes.** When tracks moved from an uploaded
  audio file to a YouTube link, three tests failed for asserting the old
  design. Nothing was wrong with the code.
- **They can stop checking without failing.** The `_en` column test called
  `.shape` on a schema that had gained a `.refine()`; a `ZodEffects` has no
  `.shape`, so the test crashed rather than checking anything.
- **They pass through real bugs.** `/academy` threw `FORMATTING_ERROR` on every
  render and the whole suite stayed green. Booting the app found it in seconds.

So: a green `npm test` means nothing has been deleted or renamed out from under
these assertions. It does not mean the site works.

## Where the real coverage is

- `tests/server-validation.test.ts` and `tests/storage.test.ts` execute the code
  they cover — these are the behavioural unit tests.
- `e2e/` drives a real browser against a real database, and is where page
  behaviour, CRUD, auth and layout belong. See the run instructions in
  `docs/code-review-2026-09-17.md`.
- SQL behaviour (for example the booking rate-limit trigger) is verified against
  a real Postgres; `tests/booking-rate-limit.test.ts` guards the contract the
  application relies on, not the trigger's behaviour.

## Adding a test

Prefer, in order:

1. A behavioural test that calls the function and asserts on what it returns.
2. An E2E spec, if it needs a browser or a database.
3. A source-text contract test — only for an invariant that has no runtime
   surface, such as "this action is not exported without its guard". Say in a
   comment *why* the invariant matters, so the next person can tell a stale
   assertion from a real one.

Never assert on exact pixel values, Tailwind classes or copy. Those changed, the
tests did not, and ten of them had to be deleted.
