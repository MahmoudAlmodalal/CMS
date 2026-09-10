import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  CANONICAL_ACADEMY_COURSES,
  findCanonicalAcademyCourse,
  validateNewsletterEmail,
  NEWSLETTER_MESSAGES,
} from "../src/lib/academy.ts";
import { academyCourseSchema } from "../src/lib/validations/cms.ts";
import { publicNewsletterSubmissionSchema } from "../src/lib/validations/newsletter.ts";

const root = path.resolve(".");

// ============================================================================
// 1. Canonical Academy Courses Data & Validation
// ============================================================================
test("Task 36 — 1. Canonical Academy Tracks Data & Zod Validation", () => {
  assert.equal(
    CANONICAL_ACADEMY_COURSES.length,
    3,
    "Figma confirms exactly 3 educational tracks ('ثلاثة مسارات، موهبة واحدة')"
  );

  const expectedSlugs = ["oud-school", "performance-art", "vocal-tarab"];
  const expectedTitles = ["مدرسة العود", "فن الأداء", "الصوت والطرب"];
  const expectedCategories = ["مدرسة التراث", "فن الأداء", "الصوت والطرب"];

  CANONICAL_ACADEMY_COURSES.forEach((course, index) => {
    assert.equal(course.slug, expectedSlugs[index], `Track ${index + 1} slug mismatch`);
    assert.equal(course.title, expectedTitles[index], `Track ${index + 1} title mismatch`);
    assert.equal(course.track_category, expectedCategories[index], `Track ${index + 1} category mismatch`);
    assert.equal(course.display_order, index + 1, `Track ${index + 1} must have display_order = ${index + 1}`);
    assert.equal(course.is_published, true, `Track ${index + 1} must be published`);
    assert.ok(course.description.length > 20, `Track ${index + 1} must have descriptive copy`);
    assert.ok(course.track_category.length > 0, `Track ${index + 1} must have track_category`);

    // Validate with canonical cms schema
    const parsed = academyCourseSchema.safeParse({
      title: course.title,
      slug: course.slug,
      track_category: course.track_category,
      description: course.description,
      instructor_name: course.instructor_name,
      display_order: course.display_order,
      is_published: course.is_published,
    });
    assert.equal(parsed.success, true, `Track ${course.slug} must satisfy academyCourseSchema`);
  });

  // Slug lookup
  const oudCourse = findCanonicalAcademyCourse("oud-school");
  assert.ok(oudCourse, "Must retrieve 'oud-school' track");
  assert.equal(oudCourse?.title, "مدرسة العود");

  const invalidCourse = findCanonicalAcademyCourse("non-existent-course");
  assert.equal(invalidCourse, null, "Non-existent slug must return null");
});

// ============================================================================
// 2. Newsletter Email Validation & Anti-Bot Protection
// ============================================================================
test("Task 36 — 2. Newsletter Email Validation & Honeypot Logic", () => {
  // 1. Valid email submission
  const valid = validateNewsletterEmail("student@andalusia.art");
  assert.equal(valid.success, true, "Valid email must pass validation");
  assert.equal(valid.email, "student@andalusia.art");

  // 2. Invalid email format
  const invalid = validateNewsletterEmail("not-an-email");
  assert.equal(invalid.success, false, "Invalid email must fail validation");
  assert.match(invalid.error || "", /البريد/);

  // 3. Empty / whitespace email
  const empty = validateNewsletterEmail("   ");
  assert.equal(empty.success, false, "Empty email must fail validation");

  // 4. Injected fields rejected by strict schema
  const injected = publicNewsletterSubmissionSchema.safeParse({
    email: "test@example.com",
    status: "admin",
    is_admin: true,
  });
  assert.equal(injected.success, false, "Extra fields in newsletter submission must be rejected (strict schema)");

  // 5. Messages constants
  assert.ok(NEWSLETTER_MESSAGES.SUCCESS.includes("بنجاح"));
  assert.ok(NEWSLETTER_MESSAGES.ALREADY_SUBSCRIBED.includes("بالفعل"));
  assert.ok(NEWSLETTER_MESSAGES.INVALID_EMAIL.includes("صحيح"));
});

// ============================================================================
// 3. Server Action & DAL Source Code Audits
// ============================================================================
test("Task 36 — 3. Server Action & DAL Implementation Verification", () => {
  // Action audit
  const actionPath = path.join(root, "src/actions/newsletter.ts");
  assert.ok(fs.existsSync(actionPath), "src/actions/newsletter.ts must exist");
  const actionCode = fs.readFileSync(actionPath, "utf-8");

  assert.match(actionCode, /'use server'/, "Action must be a Next.js Server Action");
  assert.match(actionCode, /_hp/, "Action must enforce honeypot anti-spam check");
  assert.match(actionCode, /newsletter_subscribers/, "Action must insert into newsletter_subscribers table");
  assert.match(actionCode, /status:\s*["']subscribed["']/, "Action must set status = 'subscribed'");
  assert.match(actionCode, /23505/, "Action must catch Postgres unique constraint 23505 safely");

  // DAL audit
  const dalPath = path.join(root, "src/lib/dal/academy.ts");
  assert.ok(fs.existsSync(dalPath), "src/lib/dal/academy.ts must exist");
  const dalCode = fs.readFileSync(dalPath, "utf-8");

  assert.match(dalCode, /getPublishedAcademyCourses/, "DAL must export getPublishedAcademyCourses");
  assert.match(dalCode, /academy_courses/, "DAL must query academy_courses table");
  assert.match(dalCode, /is_published.*true/, "DAL must filter is_published = true");
  assert.match(dalCode, /display_order/, "DAL must order by display_order ASC");
  assert.match(dalCode, /CANONICAL_ACADEMY_COURSES/, "DAL must fall back to canonical courses");
});

// ============================================================================
// 4. Academy Component Architecture & Figma Node Mapping
// ============================================================================
test("Task 36 — 4. Academy Component Files & Figma Node Verification", () => {
  const expectedFiles = [
    "src/components/public/academy/AcademyHeader.tsx",
    "src/components/public/academy/AcademyValueProps.tsx",
    "src/components/public/academy/TrackCard.tsx",
    "src/components/public/academy/AcademyTracks.tsx",
    "src/components/public/academy/AcademyNewsletter.tsx",
    "src/components/public/academy/index.ts",
    "src/app/(public)/academy/page.tsx",
  ];

  for (const rel of expectedFiles) {
    const fullPath = path.join(root, rel);
    assert.ok(fs.existsSync(fullPath), `Expected academy file to exist: ${rel}`);
  }

  // Header verification (Figma 91:16119 / 91:16346 / 91:16345)
  const headerCode = fs.readFileSync(
    path.join(root, "src/components/public/academy/AcademyHeader.tsx"),
    "utf-8"
  );
  assert.match(headerCode, /تعلّم من اليد التي تعرف الطريق/, "Header must contain confirmed Figma title");
  assert.match(headerCode, /subtitle/, "Header must accept dynamic subtitle");

  // Value Props verification (Figma 91:16352 / 91:16359 / 91:16366 / 91:16373)
  const valuePropsCode = fs.readFileSync(
    path.join(root, "src/components/public/academy/AcademyValueProps.tsx"),
    "utf-8"
  );
  assert.match(valuePropsCode, /التعلّم هنا مختلف/, "Value props must contain confirmed heading");
  assert.match(valuePropsCode, /مجموعات صغيرة/, "Pillar 1 'مجموعات صغيرة' must be present");
  assert.match(valuePropsCode, /فنانون من الواقع/, "Pillar 2 'فنانون من الواقع' must be present");
  assert.match(valuePropsCode, /أداء حقيقي/, "Pillar 3 'أداء حقيقي' must be present");

  // Tracks Section verification (Figma 91:16347 / 91:16438)
  const tracksCode = fs.readFileSync(
    path.join(root, "src/components/public/academy/AcademyTracks.tsx"),
    "utf-8"
  );
  assert.match(tracksCode, /ثلاثة مسارات، موهبة واحدة/, "Tracks section must contain confirmed title");

  // Newsletter Section verification (Figma 91:16423 / 91:16425 / 91:16431)
  const newsletterCode = fs.readFileSync(
    path.join(root, "src/components/public/academy/AcademyNewsletter.tsx"),
    "utf-8"
  );
  assert.match(newsletterCode, /'use client'/, "Newsletter component must be client-interactive");
  assert.match(newsletterCode, /رسالة واحدة في الشهر\./, "Newsletter must contain confirmed heading");
  assert.match(newsletterCode, /لكنها تستحق كل الانتظار\./, "Newsletter must contain confirmed tagline");
  assert.match(newsletterCode, /_hp/, "Newsletter must include honeypot field");
  assert.match(newsletterCode, /subscribeNewsletter/, "Newsletter must invoke subscribeNewsletter action");

  // Barrel export verification
  const barrelCode = fs.readFileSync(
    path.join(root, "src/components/public/academy/index.ts"),
    "utf-8"
  );
  assert.match(barrelCode, /export \{ AcademyHeader \}/);
  assert.match(barrelCode, /export \{ AcademyValueProps/);
  assert.match(barrelCode, /export \{ TrackCard \}/);
  assert.match(barrelCode, /export \{ AcademyTracks \}/);
  assert.match(barrelCode, /export \{ AcademyNewsletter \}/);

  // Page Route verification
  const pageCode = fs.readFileSync(
    path.join(root, "src/app/(public)/academy/page.tsx"),
    "utf-8"
  );
  assert.match(pageCode, /getSiteSettings/, "Page must fetch site settings");
  assert.match(pageCode, /getPublishedAcademyCourses/, "Page must fetch published academy courses");
  assert.match(pageCode, /AcademyHeader/, "Page must render AcademyHeader");
  assert.match(pageCode, /AcademyValueProps/, "Page must render AcademyValueProps");
  assert.match(pageCode, /AcademyTracks/, "Page must render AcademyTracks");
  assert.match(pageCode, /AcademyNewsletter/, "Page must render AcademyNewsletter");
});

// ============================================================================
// 5. Booking Routing & Zero Speculative Routes Verification
// ============================================================================
test("Task 36 — 5. Track Card Action Link directs to /booking?course=[slug]", () => {
  const trackCardCode = fs.readFileSync(
    path.join(root, "src/components/public/academy/TrackCard.tsx"),
    "utf-8"
  );

  // Must link to /booking?course=...
  assert.match(
    trackCardCode,
    /\/booking\?course=/,
    "Track card CTA must link to /booking?course=[slug]"
  );

  // Must NOT create speculative routes
  assert.doesNotMatch(trackCardCode, /\/courses\//, "Must not link to nonexistent /courses/ route");
  assert.doesNotMatch(trackCardCode, /\/events\//, "Must not link to nonexistent /events/ route");
});

// ============================================================================
// 6. Strict Scope Guard: Zero Enrollment, Payments, Accounts
// ============================================================================
test("Task 36 — 6. Scope Integrity: No student enrollment, payments, or LMS", () => {
  const academyDir = path.join(root, "src/components/public/academy");
  const files = fs.readdirSync(academyDir);

  for (const file of files) {
    const code = fs.readFileSync(path.join(academyDir, file), "utf-8").toLowerCase();
    assert.doesNotMatch(code, /stripe/, `File ${file} must not contain Stripe integration`);
    assert.doesNotMatch(code, /checkout/, `File ${file} must not contain checkout logic`);
    assert.doesNotMatch(code, /student_id/, `File ${file} must not contain student ID / LMS tracking`);
    assert.doesNotMatch(code, /enrollment_status/, `File ${file} must not contain student enrollment status`);
    assert.doesNotMatch(code, /course_completion/, `File ${file} must not contain course completion tracking`);
  }
});
