import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  publicBookingSubmissionSchema,
  adminBookingUpdateSchema,
} from "../src/lib/validations/booking.ts";

const root = path.resolve(".");

test("Task 38 — 1. Booking Route Architecture & Component Files", () => {
  const expectedFiles = [
    "src/app/[locale]/(public)/booking/page.tsx",
    "src/components/public/BookingHeader.tsx",
    "src/components/public/BookingForm.tsx",
    "src/components/public/BookingSidebar.tsx",
    "src/components/public/BookingContextBanner.tsx",
    "src/actions/booking.ts",
    "src/lib/dal/booking.ts",
    "src/lib/validations/booking.ts",
  ];

  for (const rel of expectedFiles) {
    const fullPath = path.join(root, rel);
    assert.ok(fs.existsSync(fullPath), `Expected booking file to exist: ${rel}`);
  }

  const barrel = fs.readFileSync(path.join(root, "src/components/public/index.ts"), "utf-8");
  assert.match(barrel, /export \{ BookingHeader/);
  assert.match(barrel, /export \{ BookingSidebar/);
  assert.match(barrel, /export \{ BookingForm/);
  assert.match(barrel, /export \{ BookingContextBanner/);
});

test("Task 38 — 2. Strict RLS Privacy: Booking Records are Write-Only and Never Publicly Queryable", () => {
  const rlsMigration = fs.readFileSync(
    path.join(root, "supabase/migrations/20260910001100_enable_rls.sql"),
    "utf-8"
  );

  // Verify anon SELECT is blocked with USING (false)
  assert.match(
    rlsMigration,
    /CREATE POLICY ["']booking_requests_select_anon_block["']\s+ON booking_requests\s+FOR SELECT\s+TO anon\s+USING \(false\);/i,
    "RLS migration must strictly deny all public/anon SELECT operations on booking_requests"
  );

  // Verify public INSERT is restricted to pending status and null admin_notes
  assert.match(
    rlsMigration,
    /CREATE POLICY ["']booking_requests_insert_public["']\s+ON booking_requests\s+FOR INSERT\s+TO anon,\s*authenticated\s+WITH CHECK\s*\(\s*status\s*=\s*'pending'\s+AND\s+admin_notes\s+IS\s+NULL\s*\);/i,
    "RLS migration must restrict public INSERT to status='pending' and admin_notes IS NULL"
  );

  // Verify Server Action never calls select() on booking_requests
  const actionContent = fs.readFileSync(path.join(root, "src/actions/booking.ts"), "utf-8");
  assert.doesNotMatch(
    actionContent,
    /\.from\(["']booking_requests["']\)\.select/,
    "Public Server Action must NEVER execute SELECT queries on booking_requests (privacy guarantee)"
  );

  // Verify DAL does not query booking_requests
  const dalContent = fs.readFileSync(path.join(root, "src/lib/dal/booking.ts"), "utf-8");
  assert.doesNotMatch(
    dalContent,
    /booking_requests/,
    "Public booking DAL must NEVER query booking_requests table"
  );
});

test("Task 38 — 3. Zod Public Booking Validation: Valid Submission", () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 14);
  const futureDate = tomorrow.toISOString().split("T")[0];

  const validPayload = {
    full_name: "طارق منصور",
    email: "tariq.mansour@example.com",
    phone: "+961 70 123456",
    budget_range: "٢٠٠٠ - ٤٠٠٠ دولار",
    event_type: "private_concert" as const,
    event_date: futureDate,
    preferred_artist: "عازف عود منفرد",
    artist_id: "a1000000-0000-0000-0000-000000000001",
    event_id: null,
    message: "نود تنظيم أمسية خاصة في بيروت تتضمن تقاسيم عود وموشحات أندلسية لمدة ساعتين.",
  };

  const parsed = publicBookingSubmissionSchema.safeParse(validPayload);
  assert.ok(parsed.success, "Valid payload must pass schema validation");
  if (parsed.success) {
    assert.equal(parsed.data.full_name, "طارق منصور");
    assert.equal(parsed.data.email, "tariq.mansour@example.com");
    assert.equal(parsed.data.event_type, "private_concert");
  }
});

test("Task 38 — 4. Zod Public Booking Validation: Strict Anti-Injection & Bounds", () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);
  const futureDate = tomorrow.toISOString().split("T")[0];

  // 1. Rejection of status / admin_notes parameter injection
  const injectedPayload = {
    full_name: "مخترق أمني",
    email: "hacker@example.com",
    phone: "+961 70 111222",
    budget_range: null,
    event_type: "wedding",
    event_date: futureDate,
    preferred_artist: null,
    artist_id: null,
    event_id: null,
    message: "محاولة حقن حقول إدارية سرية.",
    status: "confirmed", // FORBIDDEN by .strict()
    admin_notes: "تمت الموافقة المسبقة", // FORBIDDEN by .strict()
  };

  const injectionResult = publicBookingSubmissionSchema.safeParse(injectedPayload);
  assert.equal(
    injectionResult.success,
    false,
    "Schema with .strict() must reject unexpected fields like status and admin_notes"
  );

  // 2. Rejection of past event dates
  const pastDatePayload = {
    full_name: "أحمد علي",
    email: "ahmad@example.com",
    phone: null,
    budget_range: null,
    event_type: "festival",
    event_date: "2020-01-01", // Past date
    preferred_artist: null,
    artist_id: null,
    event_id: null,
    message: "حفل في تاريخ سابق.",
  };
  const pastResult = publicBookingSubmissionSchema.safeParse(pastDatePayload);
  assert.equal(pastResult.success, false, "Schema must reject past event dates");

  // 3. Rejection of short message (< 5 chars)
  const shortMessagePayload = {
    full_name: "أحمد علي",
    email: "ahmad@example.com",
    phone: null,
    budget_range: null,
    event_type: "festival",
    event_date: futureDate,
    preferred_artist: null,
    artist_id: null,
    event_id: null,
    message: "أهل", // only 3 chars, below min(5)
  };
  const shortMsgResult = publicBookingSubmissionSchema.safeParse(shortMessagePayload);
  assert.equal(shortMsgResult.success, false, "Schema must reject messages shorter than 5 chars");

  // 4. Rejection of malformed email
  const badEmailPayload = {
    full_name: "أحمد علي",
    email: "invalid-email-address",
    phone: null,
    budget_range: null,
    event_type: "festival",
    event_date: futureDate,
    preferred_artist: null,
    artist_id: null,
    event_id: null,
    message: "رسالة حجز نظامية مستوفية لكافة الشروط المطلوبة.",
  };
  const badEmailResult = publicBookingSubmissionSchema.safeParse(badEmailPayload);
  assert.equal(badEmailResult.success, false, "Schema must reject malformed email format");
});

test("Task 38 — 5. Figma Alignment: Header, Form Groups & Sidebar Verification", () => {
  const headerContent = fs.readFileSync(
    path.join(root, "src/components/public/BookingHeader.tsx"),
    "utf-8"
  );
  assert.match(
    headerContent,
    /مناسبتك تستحق موسيقى حقيقية/,
    "BookingHeader must match Figma headline Node 91:17126"
  );

  const formContent = fs.readFileSync(
    path.join(root, "src/components/public/BookingForm.tsx"),
    "utf-8"
  );
  assert.match(
    formContent,
    /معلوماتك الشخصية/,
    "BookingForm must contain Fieldset Legend 1 (Figma Node 91:17174)"
  );
  assert.match(
    formContent,
    /تفاصيل المناسبة/,
    "BookingForm must contain Fieldset Legend 2 (Figma Node 91:17207)"
  );
  assert.match(
    formContent,
    /بإرسالك هذا الطلب، فإنك توافق على سياسة الخصوصية/,
    "BookingForm must contain legal terms notice (Figma Node 91:17246)"
  );
  assert.match(
    formContent,
    /أرسل الطلب/,
    "BookingForm must render confirmed CTA button (Figma Node 186:1827)"
  );

  const sidebarContent = fs.readFileSync(
    path.join(root, "src/components/public/BookingSidebar.tsx"),
    "utf-8"
  );
  assert.match(
    sidebarContent,
    /تواصل مباشرة/,
    "BookingSidebar must include direct contact card (Figma Node 91:17253)"
  );
  assert.match(
    sidebarContent,
    /ماذا يحدث بعد ذلك؟/,
    "BookingSidebar must include 4-step milestone progression (Figma Node 91:17275)"
  );
  assert.match(sidebarContent, /نستلم طلبك ونراجعه/);
  assert.match(sidebarContent, /نتواصل معك خلال ٤٨ ساعة/);
  assert.match(sidebarContent, /نقترح الفنان والبرنامج/);
  assert.match(sidebarContent, /تأكيد الحجز والتفاصيل/);
});

test("Task 38 — 6. Deep Link Parameters & DAL Fallback Integrity", () => {
  // NOTE: src/lib/dal/booking.ts imports @/lib/supabase/server (next/headers),
  // which plain node --test cannot resolve. Per the events-page.test.ts precedent,
  // DAL modules are asserted via file content, not runtime import.
  const dalContent = fs.readFileSync(
    path.join(root, "src/lib/dal/booking.ts"),
    "utf-8"
  );
  assert.match(
    dalContent,
    /DEFAULT_BOOKING_SUBTITLE\s*=\s*"[^"]{10,}"/,
    "DAL must export a non-trivial DEFAULT_BOOKING_SUBTITLE fallback"
  );
  assert.match(dalContent, /احجز فرقة أندلسيا/);
  for (const slug of ["sara-alsawt", "tariq-aloud", "layla-al-qanun", "karim-percussion"]) {
    assert.match(
      dalContent,
      new RegExp(`slug:\\s*"${slug}"`),
      `CANONICAL_BOOKING_ARTISTS must include fallback artist ${slug}`
    );
  }

  const pageContent = fs.readFileSync(
    path.join(root, "src/app/[locale]/(public)/booking/page.tsx"),
    "utf-8"
  );

  // Search parameters handling
  assert.match(pageContent, /event_id/);
  assert.match(pageContent, /artist/);
  assert.match(pageContent, /course/);
  assert.match(pageContent, /BookingContextBanner/);
});
