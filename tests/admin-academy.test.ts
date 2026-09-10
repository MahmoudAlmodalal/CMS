import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { academyCourseSchema } from "../src/lib/validations/cms.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

test("Task 44 (rebuild) — academy route is dynamic and reads through the admin DAL", () => {
  const page = read("src/app/(admin)/admin/academy/page.tsx");
  const dal = read("src/lib/dal/admin-academy.ts");

  assert.match(page, /dynamic = "force-dynamic"/);
  assert.match(page, /getAdminCourses/);
  assert.match(page, /AcademyManager/);
  assert.match(dal, /requireAdminSession/);
  assert.match(dal, /academy_courses/); // The same query returns published courses and drafts.
  assert.match(dal, /display_order/);
});

test("Task 44 (rebuild) — manager covers canonical academy course fields and guarded actions", () => {
  const manager = read("src/components/admin/AcademyManager.tsx");

  for (const field of [
    "title", "slug", "track_category", "description", "instructor_name", "instructor_id",
    "image_url", "display_order", "is_published",
  ]) {
    assert.ok(manager.includes(field), `academy manager must include ${field}`);
  }

  // Phantom-schema fields from the deleted implementation must never reappear.
  for (const phantomField of ["title_ar", "description_ar", "signup_copy_ar", "ordering", "publish_now"]) {
    assert.ok(!manager.includes(phantomField), `academy manager must NOT include phantom field ${phantomField}`);
  }

  assert.match(manager, /createAcademyCourseAction/);
  assert.match(manager, /updateAcademyCourseAction/);
  assert.match(manager, /deleteAcademyCourseAction/);
  assert.match(manager, /setPublishStatusAction\("academy_courses"/);
  assert.match(manager, /window\.confirm/);
  assert.match(manager, /dir="rtl"/);

  const kit = read("src/components/admin/ManagerKit.tsx");
  assert.match(kit, /role=\{notice\.type === "error" \? "alert" : "status"\}/);
});

test("Task 44 (rebuild) — academy course validation accepts the full form and enforces the display_order CHECK", () => {
  const input = {
    title: "مسار الغيتار الكلاسيكي",
    slug: "classical-guitar",
    track_category: "آلات وترية",
    description: "مسار تعليمي متكامل لتعلم أساسيات وتقنيات العزف على الغيتار الكلاسيكي.",
    instructor_name: "مدرب تجريبي",
    instructor_id: null,
    image_url: "https://example.com/course.webp",
    display_order: 3,
    is_published: false,
  };

  assert.equal(academyCourseSchema.safeParse(input).success, true);
  assert.equal(academyCourseSchema.safeParse({ ...input, display_order: 0 }).success, false);
  assert.equal(academyCourseSchema.safeParse({ ...input, display_order: 11 }).success, false);
  assert.equal(academyCourseSchema.safeParse({ ...input, slug: "Not Valid Slug!" }).success, false);
});

test("Task 44 (rebuild) — update action validates partial academy course updates through requireAdminSession", () => {
  const action = read("src/actions/cms.ts");

  assert.match(action, /academyCourseSchema\.omit\(\{ id: true \}\)\.partial\(\)\.safeParse\(input\)/);
  assert.match(action, /export async function createAcademyCourseAction/);
  assert.match(action, /export async function deleteAcademyCourseAction/);
});

test("Task 44 (rebuild) — phantom-schema academy files no longer exist", () => {
  for (const rel of [
    "src/app/(admin)/admin/academy/new/page.tsx",
    "src/app/(admin)/admin/academy/[id]/edit/page.tsx",
    "src/components/admin/academy/CourseForm.tsx",
    "src/components/admin/academy/CoursesTable.tsx",
    "src/actions/admin-academy.ts",
    "src/lib/validations/academy.ts",
    "src/lib/types/admin-academy.ts",
  ]) {
    assert.equal(fs.existsSync(path.join(ROOT, rel)), false, `${rel} should have been deleted`);
  }
});
