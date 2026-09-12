import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { arMessages, enMessages } from "./helpers/i18n.ts";
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
  // Node 91:17126 sets the middle phrase in primary-500 against 80% white, so the
  // catalog carries an <em> around it and the component renders the message rich.
  assert.match(headerContent, /t\.rich\("title"/, "BookingHeader must render the booking.title message");
  assert.match(
    arMessages["booking.title"],
    /مناسبتك تستحق <em>موسيقى<\/em> حقيقية/,
    "Arabic booking headline matches Figma Node 91:17126"
  );
  assert.ok(enMessages["booking.title"], "The booking headline must exist in English too");

  const formContent = fs.readFileSync(
    path.join(root, "src/components/public/BookingForm.tsx"),
    "utf-8"
  );
  assert.match(
    formContent,
    /groupPersonal/,
    "BookingForm must contain Fieldset Legend 1 (Figma Node 91:17174)"
  );
  assert.equal(arMessages["booking.groupPersonal"], "معلوماتك الشخصية", "Arabic legend 1 is confirmed by Figma");
  assert.equal(arMessages["booking.groupOccasion"], "تفاصيل المناسبة", "Arabic legend 2 is confirmed by Figma");
  assert.match(
    formContent,
    /groupOccasion/,
    "BookingForm must contain Fieldset Legend 2 (Figma Node 91:17207)"
  );
  assert.match(formContent, /t\("consent"\)/, "BookingForm must render the legal terms notice (Figma Node 91:17246)");
  // Node 91:17246 is one nowrap line, not the paragraph the first build shipped.
  assert.equal(
    arMessages["booking.consent"],
    "بإرسال هذا النموذج أوافق على شروط الاستخدام وسياسة الخصوصية.",
    "Arabic legal terms copy is confirmed by Figma"
  );
  assert.ok(enMessages["booking.consent"], "The legal terms notice must exist in English too");
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
    /t\("contactHeading"\)/,
    "BookingSidebar must include direct contact card (Figma Node 91:17253)"
  );
  assert.equal(arMessages["booking.contactHeading"], "تواصل مباشرة", "Arabic contact card heading is confirmed by Figma");
  assert.ok(enMessages["booking.contactHeading"], "The contact card heading must exist in English too");
  assert.match(
    sidebarContent,
    /t\("stepsHeading"\)/,
    "BookingSidebar must include 4-step milestone progression (Figma Node 91:17275)"
  );
  assert.equal(arMessages["booking.stepsHeading"], "ماذا يحدث بعد ذلك؟", "Arabic milestone heading is confirmed by Figma");
  for (const step of [1, 2, 3, 4]) {
    assert.ok(arMessages[`booking.step${step}Title`], `Step ${step} must have Arabic copy`);
    assert.ok(enMessages[`booking.step${step}Title`], `Step ${step} must have English copy`);
  }
  assert.equal(arMessages["booking.step1Title"], "نستلم طلبك ونراجعه");
  assert.equal(arMessages["booking.step2Title"], "نتواصل معك خلال ٤٨ ساعة");
  assert.equal(arMessages["booking.step3Title"], "نقترح الفنان والبرنامج");
  assert.equal(arMessages["booking.step4Title"], "تأكيد الحجز والتفاصيل");
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
  // The standfirst the design draws on the band is node 91:17125, not the longer
  // marketing line the first build shipped.
  assert.match(dalContent, /برامج تعليمية موسيقية مع فنانين حقيقيين/);
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

test("Figma 91:17109 — booking page and footer geometry match the frame", () => {
  const page = fs.readFileSync(path.join(root, "src/app/[locale]/(public)/booking/page.tsx"), "utf-8");
  const hero = fs.readFileSync(path.join(root, "src/components/public/PageHero.tsx"), "utf-8");
  const headerContent = fs.readFileSync(path.join(root, "src/components/public/BookingHeader.tsx"), "utf-8");
  const sidebar = fs.readFileSync(path.join(root, "src/components/public/BookingSidebar.tsx"), "utf-8");
  const form = fs.readFileSync(path.join(root, "src/components/public/BookingForm.tsx"), "utf-8");
  const footer = fs.readFileSync(path.join(root, "src/components/public/Footer.tsx"), "utf-8");

  // The hero band takes its height and its copy offset from the frame, and is not
  // vertically centred — 91:17123 sits 247px down a 611px band.
  assert.match(hero, /--hero-height/, "PageHero must take its band height from the frame");
  assert.match(hero, /--hero-content-top/, "PageHero must take its copy offset from the frame");
  assert.match(headerContent, /height=\{611\}/, "Booking hero band is 611px tall");
  assert.match(headerContent, /contentTop=\{247\}/, "Booking hero copy sits 247px down the band");

  // Content row 91:17792: sidebar 412, form 672, 58px apart, pair centred at 1142.
  assert.match(page, /lg:w-\[1142px\]/, "Content row must be the 1142 the two columns make");
  assert.match(page, /lg:gap-\[58px\]/, "Sidebar and form sit 58px apart");
  assert.match(page, /lg:pt-\[65px\]/, "Content row opens 65px under the hero band");
  assert.match(sidebar, /lg:w-\[412px\]/, "Sidebar is 412 wide");
  assert.match(form, /lg:w-\[672px\]/, "Form is 672 wide");
  // The form is rendered first so RTL places it on the right, where the design draws it.
  assert.ok(
    page.indexOf("<BookingForm") < page.indexOf("<BookingSidebar"),
    "Form must precede the sidebar so Arabic puts it on the right"
  );

  // The form sits straight on the page surface; the design draws no card around it.
  // Scoped to the <form> element's own class list — the success panel below it is a
  // state the design never draws, so it keeps its card.
  const formRoot = form.slice(form.indexOf("<form"), form.indexOf("<form") + 400);
  assert.match(
    formRoot,
    /className="flex w-full flex-col text-start lg:w-\[672px\]/,
    "Form root is a plain column, not a card"
  );
  assert.doesNotMatch(formRoot, /bg-white|shadow|rounded-2xl/, "The form carries no card");
  assert.match(form, /h-12 w-full rounded-\[16px\] border-\[1\.333px\]/, "Controls are 48px on a 16px radius");

  // Footer 94:18509 places its four columns at absolute offsets in a 736x190 block.
  assert.match(footer, /lg:w-\[736px\]/, "Footer content block is 736 wide");
  assert.match(footer, /lg:left-\[594px\]/, "Brand column sits at 594");
  assert.match(footer, /lg:left-\[290px\]/, "Explore column sits at 290");
  assert.match(footer, /lg:left-\[90px\]/, "Contact column sits at 90");
  assert.match(footer, /lg:left-\[-193px\]/, "Booking column overhangs the block at -193");
  // The mark is drawn once in the corner, not tiled over the whole surface.
  assert.match(footer, /footer-mark\.png/, "Footer must use the corner mark cropped from the reference");
  assert.doesNotMatch(footer, /bg-repeat/, "The arabesque is not a repeating field in the design");
  // Strapline left, copyright right — the reverse of source order in Arabic.
  // Unconditional, not sm:-gated: the mobile instance 136:7847 draws the same
  // single 342x42.667 row, so there is no breakpoint at which it stacks.
  assert.match(footer, /flex flex-row-reverse/, "Bottom bar order is reversed against the reading direction");
  assert.doesNotMatch(footer, /sm:flex-row-reverse/, "The reversed row is not breakpoint-gated in the design");

  // Mobile instance 140:14746 is 390x882, bottom-anchored (2007 + 882 = 2889),
  // and is a distinct rhythm rather than a reflow of the desktop footer. Its
  // blocks are a column of four fixed boxes, each inset from the inline start.
  assert.match(footer, /pb-\[26\.333px\] pt-\[21px\] lg:pb-8 lg:pt-16/, "Mobile footer opens on 21 and closes on 26.333");
  assert.match(footer, /w-\[345px\]/, "Brand block is 345 wide on mobile");
  assert.match(footer, /mb-\[46\.5px\]/, "46.5 separates the brand block from the explore column");
  assert.match(footer, /h-\[190px\] w-\[156px\]/, "Explore column is a fixed 156x190 box");
  assert.match(footer, /h-\[137px\] w-\[156px\]/, "Contact column is a fixed 156x137 box, flush under explore");
  assert.match(footer, /mb-\[29px\]/, "29 separates the contact column from the booking pitch");
  assert.match(footer, /h-\[190px\] w-\[321px\]/, "Booking pitch is a fixed 321x190 box");
  assert.match(footer, /mt-5 flex flex-row-reverse/, "Bottom bar opens 20 under the booking pitch on mobile");
  assert.match(footer, /lg:mt-14/, "Desktop keeps the 56px bottom-bar margin");
  // The blocks sit 1, 12 and 25 from the inline start — inside the footer's own
  // 24px padding, so the column has to break out of it.
  assert.match(footer, /-mx-6 flex flex-col items-start/, "Mobile column spans the full 390");
  assert.match(footer, /ms-px/, "Brand block sits 1 from the inline start");
  assert.match(footer, /ms-3 flex h-\[190px\]/, "Explore column sits 12 from the inline start");
  assert.match(footer, /ms-\[25px\]/, "Booking pitch sits 25 from the inline start");
});
