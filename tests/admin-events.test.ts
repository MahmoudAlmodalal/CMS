import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { eventSchema } from "../src/lib/validations/cms.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

test("Task 46 — events route is dynamic and reads through the admin DAL", () => {
  const page = read("src/app/(admin)/admin/events/page.tsx");
  const dal = read("src/lib/dal/admin-events.ts");

  assert.match(page, /dynamic = "force-dynamic"/);
  assert.match(page, /getAdminEvents/);
  assert.match(page, /EventsTable/);
  assert.match(dal, /is_published/); // The same query returns published events and drafts.
  assert.match(dal, /display_order/);
});

test("Task 46 — no leftover imports from the deleted shadow action/validation files", () => {
  assert.equal(fs.existsSync(path.join(ROOT, "src/actions/admin-events.ts")), false);
  assert.equal(fs.existsSync(path.join(ROOT, "src/lib/validations/events.ts")), false);

  const table = read("src/components/admin/events/EventsTable.tsx");
  const form = read("src/components/admin/events/EventForm.tsx");
  assert.doesNotMatch(table, /@\/actions\/admin-events/);
  assert.doesNotMatch(table, /@\/lib\/validations\/events/);
  assert.doesNotMatch(form, /@\/actions\/admin-events/);
  assert.doesNotMatch(form, /@\/lib\/validations\/events/);
});

test("Task 46 — table and form cover canonical event fields and guarded actions", () => {
  const table = read("src/components/admin/events/EventsTable.tsx");
  const form = read("src/components/admin/events/EventForm.tsx");
  const combined = table + form;

  for (const field of [
    "title", "slug", "category", "event_date", "location", "city", "performer_name",
    "artist_id", "description", "image_url", "ticket_url", "is_featured", "status",
    "is_published", "display_order",
  ]) {
    assert.ok(combined.includes(field), `event manager must include ${field}`);
  }

  assert.match(table, /createEventAction/);
  assert.match(table, /updateEventAction/);
  assert.match(table, /deleteEventAction/);
  assert.match(table, /setPublishStatusAction\("events"/);
  assert.match(table, /window\.confirm/);
  assert.match(table, /dir="rtl"/);

  // Notice a11y role lives in the shared ManagerKit component, reused here.
  assert.match(table, /<Notice notice=\{notice\} \/>/);
  const kit = read("src/components/admin/ManagerKit.tsx");
  assert.match(kit, /role=\{notice\.type === "error" \? "alert" : "status"\}/);
});

test("Task 46 — booking deep link is shown and no public event detail route is added", () => {
  const form = read("src/components/admin/events/EventForm.tsx");
  assert.match(form, /\/booking\?event_id=/);

  assert.equal(fs.existsSync(path.join(ROOT, "src/app/(main)/events/[slug]")), false);
  assert.equal(fs.existsSync(path.join(ROOT, "src/app/events/[slug]")), false);
});

test("Task 46 — event validation accepts the full form and rejects unsafe/invalid updates", () => {
  const input = {
    title: "أمسية عود",
    slug: "amsiyat-oud",
    category: "evening",
    event_date: "2026-12-01T19:00:00.000Z",
    location: "قاعة الأندلس",
    city: "دمشق",
    performer_name: "فرقة الأندلس",
    artist_id: null,
    description: "أمسية موسيقية",
    image_url: "https://example.com/event.webp",
    ticket_url: null,
    is_featured: true,
    status: "upcoming",
    is_published: true,
    display_order: 1,
  };

  assert.equal(eventSchema.safeParse(input).success, true);
  assert.equal(eventSchema.safeParse({ ...input, image_url: "javascript:alert(1)" }).success, false);
  assert.equal(eventSchema.safeParse({ ...input, category: "opera" }).success, false);
  assert.equal(eventSchema.safeParse({ ...input, status: "archived" }).success, false);
});

test("Task 46 — update action validates partial event updates through the shared cms action", () => {
  const action = read("src/actions/cms.ts");

  assert.match(action, /eventSchema\.omit\(\{ id: true \}\)\.partial\(\)\.safeParse\(input\)/);
  assert.match(action, /createEventAction/);
  assert.match(action, /updateEventAction/);
  assert.match(action, /deleteEventAction/);
});
