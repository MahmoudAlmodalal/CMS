/**
 * Task 47 — Academy CMS — fs-based test suite
 * Tests: file existence, Zod schema, 'use server' directive, no enrollment imports.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd());

function filePath(rel: string): string {
  return resolve(ROOT, rel);
}

function fileContent(rel: string): string {
  return readFileSync(filePath(rel), "utf-8");
}

function fileExists(rel: string): boolean {
  return existsSync(filePath(rel));
}

// ---------------------------------------------------------------------------
// T1: Required files exist
// ---------------------------------------------------------------------------
describe("T1 — Required files exist", () => {
  const required = [
    "src/lib/types/admin-academy.ts",
    "src/lib/validations/academy.ts",
    "src/lib/dal/admin-academy.ts",
    "src/actions/admin-academy.ts",
    "src/components/admin/academy/CoursesTable.tsx",
    "src/components/admin/academy/CourseForm.tsx",
    "src/app/(admin)/admin/academy/page.tsx",
    "src/app/(admin)/admin/academy/new/page.tsx",
    "src/app/(admin)/admin/academy/[id]/edit/page.tsx",
  ];

  for (const rel of required) {
    it(`exists: ${rel}`, () => {
      assert.ok(fileExists(rel), `Missing required file: ${rel}`);
    });
  }
});

// ---------------------------------------------------------------------------
// T2: courseSchema rejects missing title_ar
// ---------------------------------------------------------------------------
describe("T2 — courseSchema rejects missing title_ar", async () => {
  it("fails with missing title_ar", async () => {
    // Dynamically import to use the actual schema
    const { courseSchema } = await import("../src/lib/validations/academy.ts");
    const result = courseSchema.safeParse({
      // title_ar intentionally omitted
      description_ar: "وصف كافٍ للتحقق من صحة المخطط",
      is_published: false,
      ordering: 0,
    });
    assert.strictEqual(result.success, false);
    const messages = result.error?.issues.map((i) => i.message) ?? [];
    assert.ok(
      messages.some((m) => m.includes("عنوان") || m.includes("مطلوب") || m.includes("Required")),
      `Expected Arabic title error, got: ${messages.join(", ")}`
    );
  });
});

// ---------------------------------------------------------------------------
// T3: courseSchema rejects description_ar < 10 chars
// ---------------------------------------------------------------------------
describe("T3 — courseSchema rejects short description_ar", async () => {
  it("fails when description_ar is < 10 chars", async () => {
    const { courseSchema } = await import("../src/lib/validations/academy.ts");
    const result = courseSchema.safeParse({
      title_ar: "عنوان صالح",
      description_ar: "قصير",   // < 10 chars
      is_published: false,
      ordering: 0,
    });
    assert.strictEqual(result.success, false);
    const messages = result.error?.issues.map((i) => i.message) ?? [];
    assert.ok(
      messages.some((m) => m.includes("10") || m.includes("وصف") || m.includes("أحرف")),
      `Expected description length error, got: ${messages.join(", ")}`
    );
  });
});

// ---------------------------------------------------------------------------
// T4: courseSchema accepts a valid course
// ---------------------------------------------------------------------------
describe("T4 — courseSchema accepts a valid course", async () => {
  it("succeeds with all required + optional fields", async () => {
    const { courseSchema } = await import("../src/lib/validations/academy.ts");
    const result = courseSchema.safeParse({
      title_ar: "أساسيات العود للمبتدئين",
      description_ar: "دورة شاملة لتعلم آلة العود من الصفر حتى الاحتراف في بيئة تفاعلية.",
      instructor_id: null,
      image_url: null,
      signup_copy_ar: "سجّل الآن واستفد من تجربة تعليمية فريدة",
      is_published: true,
      ordering: 1,
    });
    assert.strictEqual(result.success, true, JSON.stringify(result.error?.issues));
  });
});

// ---------------------------------------------------------------------------
// T5: 'use server' in actions file
// ---------------------------------------------------------------------------
describe("T5 — actions file has 'use server' directive", () => {
  it("src/actions/admin-academy.ts starts with use server", () => {
    const content = fileContent("src/actions/admin-academy.ts");
    assert.ok(
      content.includes('"use server"') || content.includes("'use server'"),
      "Expected 'use server' directive in src/actions/admin-academy.ts"
    );
  });
});

// ---------------------------------------------------------------------------
// T6: No enrollment / payment / stripe imports
// ---------------------------------------------------------------------------
describe("T6 — No student enrollment system references", () => {
  const filesToCheck = [
    "src/lib/dal/admin-academy.ts",
    "src/actions/admin-academy.ts",
    "src/components/admin/academy/CoursesTable.tsx",
    "src/components/admin/academy/CourseForm.tsx",
  ];

  const forbidden = ["enrollment", "payment", "stripe"];

  for (const rel of filesToCheck) {
    it(`${rel} has no enrollment/payment/stripe references`, () => {
      const content = fileContent(rel).toLowerCase();
      for (const term of forbidden) {
        assert.ok(
          !content.includes(term),
          `Found forbidden term "${term}" in ${rel}`
        );
      }
    });
  }
});
