/**
 * Task 42 — Admin Dashboard
 *
 * Tests verify dashboard architecture, DAL interface, stat card coverage,
 * and security constraints — all via fs.readFileSync (no live Supabase needed).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

function exists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

// ─── T1: DAL file exists and exports correct interface ───────────────────────
test("Task 42 — 1. Dashboard DAL exists and exports DashboardStats + getDashboardStats", () => {
  assert.ok(exists("src/lib/dal/dashboard.ts"), "dashboard.ts DAL missing");
  const dal = read("src/lib/dal/dashboard.ts");

  // Must export the stats interface
  assert.ok(dal.includes("DashboardStats"), "DashboardStats interface missing");
  assert.ok(dal.includes("getDashboardStats"), "getDashboardStats function missing");

  // Must be server-only
  assert.ok(dal.includes('import "server-only"'), "dashboard DAL must import server-only");
});

// ─── T2: DAL covers all 5 required metrics ───────────────────────────────────
test("Task 42 — 2. DAL covers all 5 required stat metrics", () => {
  const dal = read("src/lib/dal/dashboard.ts");

  assert.ok(dal.includes("pendingBookings"), "pendingBookings missing from DAL");
  assert.ok(dal.includes("publishedArtists"), "publishedArtists missing from DAL");
  assert.ok(dal.includes("upcomingEvents"), "upcomingEvents missing from DAL");
  assert.ok(dal.includes("publishedArticles"), "publishedArticles missing from DAL");
  assert.ok(dal.includes("activeSubscribers"), "activeSubscribers missing from DAL");
});

// ─── T3: DAL queries correct tables with correct filters ─────────────────────
test("Task 42 — 3. DAL queries booking_requests, artists, events, articles, newsletter_subscribers", () => {
  const dal = read("src/lib/dal/dashboard.ts");

  assert.ok(dal.includes('"booking_requests"'), "booking_requests table missing");
  assert.ok(dal.includes('"artists"'), "artists table missing");
  assert.ok(dal.includes('"events"'), "events table missing");
  assert.ok(dal.includes('"articles"'), "articles table missing");
  assert.ok(dal.includes('"newsletter_subscribers"'), "newsletter_subscribers table missing");

  // Correct status filter for bookings
  assert.ok(dal.includes('"pending"'), "DAL should filter bookings by status='pending'");
  // Correct status filter for subscribers
  assert.ok(dal.includes('"subscribed"'), "DAL should filter subscribers by status='subscribed'");
  // Upcoming events use date gating
  assert.ok(dal.includes("gte") || dal.includes("event_date"), "Events should be filtered by event_date (upcoming)");
});

// ─── T4: DAL has safe fallback for missing credentials ───────────────────────
test("Task 42 — 4. DAL returns safe zero fallback when Supabase credentials absent", () => {
  const dal = read("src/lib/dal/dashboard.ts");

  // Must have a FALLBACK constant with zeros
  assert.ok(dal.includes("FALLBACK"), "FALLBACK constant missing from DAL");
  assert.ok(dal.includes("NEXT_PUBLIC_SUPABASE_URL"), "missing credential guard");
  assert.ok(dal.includes("return FALLBACK"), "missing fallback return");
});

// ─── T5: Dashboard page imports DAL and renders stat cards ───────────────────
test("Task 42 — 5. Admin dashboard page imports getDashboardStats and renders 5 stat cards", () => {
  const page = read("src/app/(admin)/admin/page.tsx");

  assert.ok(page.includes("getDashboardStats"), "page does not import getDashboardStats");
  assert.ok(page.includes("pendingBookings"), "pendingBookings stat not rendered");
  assert.ok(page.includes("publishedArtists"), "publishedArtists stat not rendered");
  assert.ok(page.includes("upcomingEvents"), "upcomingEvents stat not rendered");
  assert.ok(page.includes("publishedArticles"), "publishedArticles stat not rendered");
  assert.ok(page.includes("activeSubscribers"), "activeSubscribers stat not rendered");
});

// ─── T6: Dashboard page uses force-dynamic (no stale counts) ─────────────────
test("Task 42 — 6. Dashboard page is force-dynamic to prevent stale stat counts", () => {
  const page = read("src/app/(admin)/admin/page.tsx");
  assert.ok(
    page.includes('dynamic = "force-dynamic"') || page.includes("dynamic = 'force-dynamic'"),
    'dashboard page must export dynamic = "force-dynamic"'
  );
});

// ─── T7: Dashboard page links stat cards to canonical admin routes ────────────
test("Task 42 — 7. Stat cards link to canonical admin routes", () => {
  const page = read("src/app/(admin)/admin/page.tsx");

  assert.ok(page.includes('"/admin/bookings"'), "missing /admin/bookings link");
  assert.ok(page.includes('"/admin/artists"'), "missing /admin/artists link");
  assert.ok(page.includes('"/admin/events"'), "missing /admin/events link");
  assert.ok(page.includes('"/admin/articles"'), "missing /admin/articles link");
  assert.ok(page.includes('"/admin/subscribers"'), "missing /admin/subscribers link");
});

// ─── T8: No speculative tables or analytics ──────────────────────────────────
test("Task 42 — 8. Dashboard contains no speculative analytics or tracking tables", () => {
  const dal = read("src/lib/dal/dashboard.ts");
  const page = read("src/app/(admin)/admin/page.tsx");
  const combined = dal + page;

  const forbidden = ["page_views", "sessions", "analytics", "chartjs", "recharts", "d3.js"];
  for (const term of forbidden) {
    assert.ok(!combined.toLowerCase().includes(term), `Speculative feature detected: ${term}`);
  }
});
