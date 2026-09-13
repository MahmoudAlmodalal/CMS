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
import { arMessages } from "./helpers/i18n.ts";

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
  // The third card labels itself "صوت ومجموع" in Figma node 91:16468, which is not
  // its title; the design is the authority on the copy it draws.
  const expectedCategories = ["مدرسة التراث", "فن الأداء", "صوت ومجموع"];

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
    "src/components/public/academy/AcademyValueProps.tsx",
    "src/components/public/academy/TrackCard.tsx",
    "src/components/public/academy/AcademyTracks.tsx",
    "src/components/public/academy/AcademyNewsletter.tsx",
    "src/components/public/academy/index.ts",
    "src/app/[locale]/(public)/academy/page.tsx",
  ];

  for (const rel of expectedFiles) {
    const fullPath = path.join(root, rel);
    assert.ok(fs.existsSync(fullPath), `Expected academy file to exist: ${rel}`);
  }

  // The copy lives in the message catalogue, not in the components, so the frame's
  // own words are asserted there and the components are asserted on structure.
  assert.match(
    arMessages["academy.title"],
    /تعلّم من <em>اليد التي تعرف الطريق<\/em>/,
    "Headline matches Figma node 91:16346, with its primary-500 phrase marked up"
  );
  assert.match(
    arMessages["academy.tracksHeading"],
    /ثلاثة <em>مسارات<\/em>، موهبة واحدة/,
    "Tracks heading matches Figma node 91:16347"
  );
  assert.equal(
    arMessages["academy.valuesHeading"],
    "التعلّم هنا مختلف",
    "Value-props heading matches Figma node 91:16352"
  );
  for (const [key, expected] of [
    ["academy.value1Title", "مجموعات صغيرة"],
    ["academy.value2Title", "فنانون من الواقع"],
    ["academy.value3Title", "أداء حقيقي"],
    ["academy.newsletterHeading", "رسالة واحدة في الشهر."],
    ["academy.newsletterTagline", "♪ لكنها تستحق كل الانتظار."],
    ["academy.newsletterPlaceholder", "بريدك الإلكتروني"],
  ] as const) {
    assert.equal(arMessages[key], expected, `${key} must match the frame`);
  }

  // Value-props band 91:16348 — full-bleed espresso, the arabesque mark once at the
  // top-left, a 888-wide grid of three 270.44 columns. No cards, no numerals.
  const valuePropsCode = fs.readFileSync(
    path.join(root, "src/components/public/academy/AcademyValueProps.tsx"),
    "utf-8"
  );
  assert.match(valuePropsCode, /bg-brand-espresso/, "Value props sit on the espresso band");
  assert.match(valuePropsCode, /band-mark\.png/, "Value props carry the arabesque corner mark");
  assert.match(valuePropsCode, /lg:w-\[888px\]/, "Value-props grid is 888 wide");
  assert.match(valuePropsCode, /270\.44px/, "Value-props columns are 270.44 wide");
  assert.doesNotMatch(valuePropsCode, /<Card/, "The design draws no cards in this band");

  // Tracks 91:16347 / 91:16437 — the heading anchored 560px in from the start edge,
  // the grid 1136 wide at 154 from that edge on a flat 325.61 row.
  const tracksCode = fs.readFileSync(
    path.join(root, "src/components/public/academy/AcademyTracks.tsx"),
    "utf-8"
  );
  assert.match(tracksCode, /lg:ms-\[560px\]/, "Tracks heading starts 560px in");
  assert.match(tracksCode, /lg:ms-\[154px\]/, "Tracks grid starts 154px in");
  assert.match(tracksCode, /lg:w-\[1136px\]/, "Tracks grid is 1136 wide");
  // The row height is the one figure both frames share: 325.61 on the 1440 one,
  // 325.611 on the 390 one (139:13167), so it is stated once as auto-rows rather
  // than as an lg:-only explicit row.
  assert.match(tracksCode, /auto-rows-\[325\.611px\]/, "Tracks row is a flat 325.611 at both widths");
  assert.doesNotMatch(tracksCode, /lg:grid-rows-/, "The row height is no longer lg:-only");
  assert.doesNotMatch(tracksCode, /tracksSubtitle/, "The design draws no standfirst here");

  // Track card 91:16439 — 20px radius on a 0.833px hairline, the numeral and the
  // register link at the inline end, everything else at the inline start.
  const trackCardCode = fs.readFileSync(
    path.join(root, "src/components/public/academy/TrackCard.tsx"),
    "utf-8"
  );
  assert.match(trackCardCode, /rounded-\[20px\] border-\[0\.833px\] border-secondary-400/,
    "Track card geometry matches the frame");
  assert.match(trackCardCode, /text-\[60px\] font-black leading-\[60px\]/,
    "Track numeral is Cairo Black 60/60");
  assert.match(trackCardCode, /mt-auto self-end/, "Register link is pinned to the card's far corner");
  assert.doesNotMatch(trackCardCode, /instructor_name/, "The design draws no instructor line");

  // Newsletter 91:16420 — the 491 field first so Arabic puts it on the right, then
  // the 149x44 button.
  const newsletterCode = fs.readFileSync(
    path.join(root, "src/components/public/academy/AcademyNewsletter.tsx"),
    "utf-8"
  );
  assert.match(newsletterCode, /"use client"/, "Newsletter component must be client-interactive");
  assert.match(newsletterCode, /_hp/, "Newsletter must include honeypot field");
  assert.match(newsletterCode, /subscribeNewsletter/, "Newsletter must invoke subscribeNewsletter action");
  // The form row is 652 on the 1440 frame (91:16427) and 359 on the 390 one
  // (139:13480), with the same 12 gap and the same 149 button on both. So the email
  // field is not a breakpoint width: it is whatever the row has left — 491 and 198.
  assert.match(newsletterCode, /h-11 w-\[149px\] shrink-0/, "Submit button is 149 wide at both widths");
  assert.match(newsletterCode, /h-\[51px\] min-w-0 flex-1/, "Email field takes the remainder: 491 at 1440, 198 at 390");
  assert.match(newsletterCode, /lg:max-w-\[652px\]/, "…which makes it 491 inside the 1440 frame's 652 row");
  assert.doesNotMatch(newsletterCode, /sm:w-\[491px\]/, "The 491 is no longer an sm: width");
  assert.ok(
    newsletterCode.indexOf("type=\"email\"") < newsletterCode.indexOf("type=\"submit\""),
    "Field must precede the button so Arabic puts it on the right"
  );

  // Barrel export verification
  const barrelCode = fs.readFileSync(
    path.join(root, "src/components/public/academy/index.ts"),
    "utf-8"
  );
  assert.match(barrelCode, /export \{ AcademyValueProps/);
  assert.match(barrelCode, /export \{ TrackCard \}/);
  assert.match(barrelCode, /export \{ AcademyTracks \}/);
  assert.match(barrelCode, /export \{ AcademyNewsletter \}/);

  // Page 91:16119 — hero band 611 tall with the block 185 down and the headline at
  // 72/90, then tracks, then the pillars. The page led with the pillars before.
  const pageCode = fs.readFileSync(
    path.join(root, "src/app/[locale]/(public)/academy/page.tsx"),
    "utf-8"
  );
  assert.match(pageCode, /getSiteSettings/, "Page must fetch site settings");
  assert.match(pageCode, /getPublishedAcademyCourses/, "Page must fetch published academy courses");
  assert.match(pageCode, /height=\{611\}/, "Academy hero band is 611px tall");
  assert.match(pageCode, /contentTop=\{185\}/, "Hero block opens 185px down the band");
  assert.match(pageCode, /titleSize=\{72\}/, "Academy headline is 72px");
  assert.match(pageCode, /AcademyValueProps/, "Page must render AcademyValueProps");
  assert.match(pageCode, /AcademyTracks/, "Page must render AcademyTracks");
  assert.match(pageCode, /AcademyNewsletter/, "Page must render AcademyNewsletter");
  assert.ok(
    pageCode.indexOf("<AcademyTracks") < pageCode.indexOf("<AcademyValueProps"),
    "The frame puts the tracks above the pillars"
  );
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

/**
 * الأكاديمية on the 390 frame — 139:12420.
 *
 * The band arithmetic closes exactly: 490 + 1413 + 737.91 + 15.09 + 353 = 3009,
 * which is where the frame puts its footer. Recorded in docs/figma/DECISIONS.md §15.
 */
test("الأكاديمية — the 390 frame's bands", () => {
  const strip = (s: string) =>
    s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
  const page = strip(
    fs.readFileSync(path.join(root, "src/app/[locale]/(public)/academy/page.tsx"), "utf-8")
  );
  const tracks = strip(
    fs.readFileSync(path.join(root, "src/components/public/academy/AcademyTracks.tsx"), "utf-8")
  );
  const props = strip(
    fs.readFileSync(path.join(root, "src/components/public/academy/AcademyValueProps.tsx"), "utf-8")
  );
  const news = strip(
    fs.readFileSync(path.join(root, "src/components/public/academy/AcademyNewsletter.tsx"), "utf-8")
  );

  // 139:13053 is 390x500 hung at y=-10 — the one mobile band that is not 678.
  assert.match(page, /mobileHeight=\{490\}/, "The academy hero band is 490 on the 390 frame");

  // Tracks: heading at (52,733) on a 286 measure, container at (10,863) 362 wide.
  assert.match(tracks, /pb-\[31\.16px\] pt-\[243px\]/, "243 opens the band and 31.16 closes it");
  assert.match(tracks, /lg:pb-0 lg:pt-\[102px\]/, "The 1440 frame's own 102 is untouched");
  assert.match(tracks, /mx-auto w-\[286px\] text-center/, "The heading is centred on a 286 measure");
  assert.match(tracks, /leading-\[49\.5px\]/, "Its two lines make the 99 box the frame draws");
  assert.match(tracks, /lg:ms-\[560px\].*lg:text-start/, "…and it is start-anchored again at 1440");
  assert.doesNotMatch(tracks, /sm:text-\[40px\]/, "There is no tablet artboard to step the heading at sm:");
  assert.match(tracks, /ms-\[18px\] mt-\[31px\] grid w-\[362px\]/, "The card container is 362 wide, 18 in from the start");
  assert.doesNotMatch(tracks, /md:grid-cols-2/, "…and it does not pair the cards at an invented tablet width");

  // 139:13444 is an empty 388x737.91 reservation — the height is reproduced, the
  // internals are not invented.
  assert.match(props, /min-h-\[737\.906px\]/, "The value-props band fills its reserved box");
  assert.match(props, /lg:min-h-0/, "…and the 1440 frame keeps its own height");

  // Newsletter 139:13473 / 91:16420 are the same 353-tall section at both widths:
  // 96 of air, a 36 heading, a 34 standfirst, then 40 + a 51 form row.
  assert.match(news, /className="w-full px-6 py-24"/, "96 of air at both widths");
  assert.match(news, /text-\[32px\] leading-\[36px\]/, "The heading box is 36 at both widths");
  assert.doesNotMatch(news, /sm:text-\[40px\]/, "The 40 was invented — the text is 326 wide on both frames");
  assert.match(news, /leading-\[26px\]/, "The standfirst block is 8 + 26");
  assert.match(news, /-mx-\[8\.5px\] flex w-auto items-start gap-3/, "The form row is 359 wide and 12 apart");
  assert.doesNotMatch(news, /sm:flex-row/, "The row is a row at both widths, not only above sm:");
  assert.match(news, /h-\[51px\] min-w-0 flex-1/, "The input takes the remainder: 198 at 390, 491 at 1440");
  assert.match(news, /h-11 w-\[149px\] shrink-0/, "The button is a flat 149x44 at both widths");
});
