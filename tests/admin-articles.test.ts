import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { articleSchema, testimonialSchema } from "../src/lib/validations/cms.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

// ============================================================================
// Articles
// ============================================================================

test("Task 48 — articles route is dynamic and reads through the admin DAL", () => {
  const page = read("src/app/(admin)/admin/articles/page.tsx");
  const dal = read("src/lib/dal/admin-articles.ts");

  assert.match(page, /dynamic = "force-dynamic"/);
  assert.match(page, /getAdminArticles/);
  assert.match(page, /ArticlesManager/);
  assert.match(dal, /requireAdminSession/);
  assert.match(dal, /is_published/);
  assert.match(dal, /category/);
  assert.doesNotMatch(dal, /content_ar|quote_ar|author_name_ar|avatar_url/);
  assert.doesNotMatch(dal, /"news"|"interview"|"announcement"/);
});

test("Task 48 — articles manager covers canonical fields and guarded actions", () => {
  const manager = read("src/components/admin/ArticlesManager.tsx");

  for (const field of [
    "title", "slug", "category", "excerpt", "content", "cover_image_url",
    "author_name", "featured_artist_id", "published_at", "is_featured", "is_published",
  ]) {
    assert.ok(manager.includes(field), `articles manager must include ${field}`);
  }

  assert.match(manager, /createArticleAction/);
  assert.match(manager, /updateArticleAction/);
  assert.match(manager, /deleteArticleAction/);
  assert.match(manager, /setPublishStatusAction\("articles"/);
  assert.match(manager, /window\.confirm/);
  assert.match(manager, /dir="rtl"/);
  assert.match(manager, /مجدول/); // scheduled (future published_at) label
});

test("Task 48 — article validation accepts culture|artists|academy|events and rejects the phantom categories", () => {
  const input = {
    title: "مقال تجريبي",
    slug: "tajribi",
    category: "culture",
    excerpt: "مقتطف قصير",
    content: "محتوى المقال الكامل",
    cover_image_url: "https://example.com/cover.webp",
    author_name: "هيئة التحرير",
    featured_artist_id: null,
    published_at: "2026-09-10T12:00:00Z",
    is_featured: false,
    is_published: true,
  };

  assert.equal(articleSchema.safeParse(input).success, true);
  // A future published_at with is_published=true is a valid scheduled post, not an error.
  assert.equal(articleSchema.safeParse({ ...input, published_at: "2099-01-01T00:00:00Z" }).success, true);
  assert.equal(articleSchema.safeParse({ ...input, category: "news" }).success, false);
  assert.equal(articleSchema.safeParse({ ...input, category: "interview" }).success, false);
  assert.equal(articleSchema.safeParse({ ...input, cover_image_url: "javascript:alert(1)" }).success, false);
});

test("Task 48 — article update action validates partial updates via omit+partial", () => {
  const action = read("src/actions/cms.ts");
  assert.match(action, /articleSchema\.omit\(\{ id: true \}\)\.partial\(\)\.safeParse\(input\)/);
});

// ============================================================================
// Testimonials
// ============================================================================

test("Task 48 — testimonials route is dynamic and reads through the admin DAL", () => {
  const page = read("src/app/(admin)/admin/testimonials/page.tsx");
  const dal = read("src/lib/dal/admin-testimonials.ts");

  assert.match(page, /dynamic = "force-dynamic"/);
  assert.match(page, /getAdminTestimonials/);
  assert.match(page, /TestimonialsManager/);
  assert.match(dal, /requireAdminSession/);
  assert.match(dal, /display_order/);
  assert.doesNotMatch(dal, /quote_ar|author_name_ar|avatar_url\b/);
});

test("Task 48 — testimonials manager covers canonical fields and guarded actions", () => {
  const manager = read("src/components/admin/TestimonialsManager.tsx");

  for (const field of [
    "quote", "author_name", "author_role", "avatar_image_url", "display_order", "is_published",
  ]) {
    assert.ok(manager.includes(field), `testimonials manager must include ${field}`);
  }

  assert.match(manager, /createTestimonialAction/);
  assert.match(manager, /updateTestimonialAction/);
  assert.match(manager, /deleteTestimonialAction/);
  assert.match(manager, /setPublishStatusAction\("testimonials"/);
  assert.match(manager, /window\.confirm/);
  assert.match(manager, /dir="rtl"/);
});

test("Task 48 — testimonial validation accepts the full form and rejects unsafe input", () => {
  const input = {
    quote: "تجربة رائعة مع الفرقة",
    author_name: "أحمد",
    author_role: "منظم فعاليات",
    avatar_image_url: "https://example.com/avatar.webp",
    display_order: 1,
    is_published: true,
  };

  assert.equal(testimonialSchema.safeParse(input).success, true);
  assert.equal(testimonialSchema.safeParse({ ...input, avatar_image_url: "javascript:alert(1)" }).success, false);
});

test("Task 48 — testimonial update action validates partial updates via omit+partial", () => {
  const action = read("src/actions/cms.ts");
  assert.match(action, /testimonialSchema\.omit\(\{ id: true \}\)\.partial\(\)\.safeParse\(input\)/);
});

test("Task 48 — phantom-schema files were deleted", () => {
  for (const rel of [
    "src/actions/admin-articles.ts",
    "src/actions/admin-testimonials.ts",
    "src/lib/validations/articles.ts",
    "src/lib/validations/testimonials.ts",
    "src/lib/types/admin-articles.ts",
  ]) {
    assert.equal(fs.existsSync(path.join(ROOT, rel)), false, `${rel} must be deleted`);
  }
});

test("Task 48 — Notice region uses role alert/status per notice type in both managers", () => {
  const articlesManager = read("src/components/admin/ArticlesManager.tsx");
  const testimonialsManager = read("src/components/admin/TestimonialsManager.tsx");
  const kit = read("src/components/admin/ManagerKit.tsx");

  assert.match(articlesManager, /<Notice notice={notice} \/>/);
  assert.match(testimonialsManager, /<Notice notice={notice} \/>/);
  assert.match(kit, /role=\{notice\.type === "error" \? "alert" : "status"\}/);
});
