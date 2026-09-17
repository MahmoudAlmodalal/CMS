import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf-8");

const MIGRATION = "supabase/migrations/20260922000000_rate_limit_booking_requests.sql";

test("the booking rate limit lives in the database, where the public path can reach it", () => {
  const sql = read(MIGRATION);

  // The anon role cannot SELECT booking_requests ("booking_requests_select_anon_block"
  // is USING (false)), so the public submit path cannot count its own history.
  // A BEFORE INSERT trigger can, and unlike an in-process counter it is not
  // defeated by serverless instances each keeping their own memory.
  assert.match(sql, /BEFORE INSERT ON booking_requests/);
  assert.match(sql, /SECURITY DEFINER/, "the count must run past the anon SELECT block");
  assert.match(sql, /HINT = 'BOOKING_RATE_LIMIT'/, "the action matches on this hint");

  // Admin paths must not be caught by a limit meant for anonymous visitors.
  // service_role is the one createPrivilegedBookingAction uses, and its token
  // carries no app_metadata, so is_admin() alone is not enough.
  assert.match(sql, /public\.is_admin\(\)/);
  assert.match(sql, /service_role/);

  // scripts/apply-migrations.sh re-runs every file against a database that was
  // migrated by hand, and runs each inside one transaction.
  assert.match(sql, /CREATE OR REPLACE FUNCTION/);
  assert.match(sql, /DROP TRIGGER IF EXISTS/);
  assert.match(sql, /CREATE INDEX IF NOT EXISTS/);
  assert.doesNotMatch(sql, /CONCURRENTLY|ALTER TYPE[\s\S]*ADD VALUE|VACUUM/);
});

test("a rate-limited submission is reported as a refusal, not a failure", () => {
  const action = read("src/actions/booking.ts");

  // Telling someone who has just sent three requests to "try again later" is
  // the one reply that makes it worse.
  assert.match(action, /isRateLimitRejection/);
  assert.match(action, /BOOKING_RATE_LIMIT/);
  assert.match(action, /msg\(\s*\n?\s*"rateLimited"/);

  for (const locale of ["ar", "en"] as const) {
    const messages = JSON.parse(read(`src/messages/${locale}.json`));
    assert.ok(
      messages.booking?.server?.rateLimited,
      `booking.server.rateLimited must exist in ${locale}.json or /${locale} falls back to Arabic`,
    );
  }
});

test("the public booking form carries the same honeypot the newsletter uses", () => {
  const form = read("src/components/public/BookingForm.tsx");
  const action = read("src/actions/booking.ts");

  assert.match(form, /name="_hp"/, "the hidden field the newsletter already uses");
  assert.match(form, /aria-hidden="true"/, "it must not be announced to a screen reader");
  assert.match(form, /tabIndex=\{-1\}/, "nor reachable by keyboard");

  // A filled honeypot gets the success a bot expects; an error would tell it
  // exactly what to change.
  assert.match(action, /formData\.get\("_hp"\)/);
  assert.match(action, /return \{ success: true, message: msg\("success", BOOKING_SUCCESS_AR\) \};/);

  for (const locale of ["ar", "en"] as const) {
    const messages = JSON.parse(read(`src/messages/${locale}.json`));
    assert.ok(messages.booking?.honeypot, `booking.honeypot must exist in ${locale}.json`);
  }
});

test("the in-memory deduplicator is gone", () => {
  // It was a static Map on a class, so on serverless each instance kept its own
  // copy and it could never have rate-limited anything across them. It was also
  // imported by nothing but its own test, which made the suite look like it
  // covered a protection that was not wired up at all.
  assert.doesNotMatch(read("src/lib/validations/security.ts"), /SubmissionDeduplicator/);
});
