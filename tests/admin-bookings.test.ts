import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { adminBookingUpdateSchema, adminNewsletterUpdateSchema } from "../src/lib/validations/index.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

function listFilesRecursive(rel: string): string[] {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const entryRel = path.join(rel, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRecursive(entryRel));
    else out.push(entryRel);
  }
  return out;
}

test("Task 45 — bookings route is dynamic and reads through the admin DAL", () => {
  const page = read("src/app/(admin)/admin/bookings/page.tsx");
  const dal = read("src/lib/dal/bookings.ts");

  assert.match(page, /dynamic = "force-dynamic"/);
  assert.match(page, /getAdminBookingRequests/);
  assert.match(page, /BookingsTable/);
  assert.match(dal, /requireAdminSession/);
});

test("Task 45 — subscribers route is dynamic and reads through the admin DAL", () => {
  const page = read("src/app/(admin)/admin/subscribers/page.tsx");

  assert.match(page, /dynamic = "force-dynamic"/);
  assert.match(page, /getAdminNewsletterSubscribers/);
  assert.match(page, /SubscribersTable/);
});

test("Task 45 — bookings table covers status transitions and admin notes, guarded action", () => {
  const table = read("src/components/admin/BookingsTable.tsx");

  for (const status of ["pending", "contacted", "confirmed", "archived"]) {
    assert.ok(table.includes(status), `bookings table must include status ${status}`);
  }
  assert.match(table, /admin_notes/);
  assert.match(table, /updateBookingRequestAction/);
  assert.match(table, /<Notice notice=\{notice\} \/>/);
  assert.match(table, /dir="rtl"/);

  const managerKit = read("src/components/admin/ManagerKit.tsx");
  assert.match(managerKit, /role=\{notice\.type === "error" \? "alert" : "status"\}/);
});

test("Task 45 — subscribers table covers status and guarded action", () => {
  const table = read("src/components/admin/SubscribersTable.tsx");

  assert.match(table, /subscribed/);
  assert.match(table, /unsubscribed/);
  assert.match(table, /updateSubscriberAction/);
  assert.match(table, /<Notice notice=\{notice\} \/>/);
  assert.match(table, /dir="rtl"/);
});

test("Task 45 — admin update schemas accept valid partial updates and reject unsafe input", () => {
  assert.equal(adminBookingUpdateSchema.safeParse({ status: "contacted" }).success, true);
  assert.equal(adminBookingUpdateSchema.safeParse({ admin_notes: "متابعة مع العميل" }).success, true);
  assert.equal(adminBookingUpdateSchema.safeParse({ status: "invalid" }).success, false);
  assert.equal(adminBookingUpdateSchema.safeParse({ status: "contacted", id: "x" }).success, false);

  assert.equal(adminNewsletterUpdateSchema.safeParse({ status: "subscribed" }).success, true);
  assert.equal(adminNewsletterUpdateSchema.safeParse({ status: "unsubscribed" }).success, true);
  assert.equal(adminNewsletterUpdateSchema.safeParse({ status: "invalid" }).success, false);
  assert.equal(adminNewsletterUpdateSchema.safeParse({}).success, false);
});

test("Task 45 — duplicate admin schema/DAL files are removed", () => {
  for (const rel of [
    "src/lib/dal/admin-bookings.ts",
    "src/lib/validations/admin-bookings.ts",
    "src/lib/validations/admin-subscribers.ts",
  ]) {
    assert.equal(fs.existsSync(path.join(ROOT, rel)), false, `${rel} should be deleted`);
  }
});

test("Task 45 — leak guard: no public-facing code references protected tables", () => {
  // Admin-only DAL files legitimately query these tables behind admin auth
  // (layout redirect / requireAdminSession) — they are exempt from this scan.
  const ADMIN_DAL_EXEMPT = new Set(["src/lib/dal/bookings.ts", "src/lib/dal/dashboard.ts"]);

  const candidateFiles = [
    ...listFilesRecursive("src/components/public"),
    ...listFilesRecursive("src/lib/dal").filter((rel) => !ADMIN_DAL_EXEMPT.has(rel)),
  ];

  // Match actual table access (query builder calls), not incidental prose in comments/docstrings.
  const tableAccessPattern = /\.from\(\s*["'](booking_requests|newsletter_subscribers)["']\s*\)/;

  const offenders: string[] = [];
  for (const rel of candidateFiles) {
    const contents = read(rel);
    if (tableAccessPattern.test(contents)) {
      offenders.push(rel);
    }
  }

  assert.deepEqual(offenders, [], `public-facing files must not query protected tables: ${offenders.join(", ")}`);
});

test("Task 45 — RLS migration blocks anonymous select on booking_requests", () => {
  const migration = read("supabase/migrations/20260910001100_enable_rls.sql");

  assert.match(migration, /CREATE POLICY "booking_requests_select_anon_block"/);
  assert.match(migration, /booking_requests_select_anon_block"[\s\S]{0,120}USING \(false\)/);
});
