'use server';

import 'server-only';
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth-guard";
import {
  getAdminArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  unpublishArticle,
} from "@/lib/dal/admin-articles";
import { articleSchema, type ArticleInput } from "@/lib/validations/articles";

export interface ArticleActionResult {
  ok: boolean;
  data?: { id: string };
  error?: string;
}

// ============================================================================
// Create
// ============================================================================

/**
 * Create a new article server action.
 * Validates input, guards admin session, persists via DAL,
 * then revalidates /news, /news/[slug], and /admin/articles cache paths.
 */
export async function createArticleAction(
  input: ArticleInput
): Promise<ArticleActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح" };
  }

  const parsed = articleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join("، "),
    };
  }

  try {
    const result = await createArticle(parsed.data);
    revalidatePath("/news");
    revalidatePath(`/news/${parsed.data.slug}`);
    revalidatePath("/admin/articles");
    return { ok: true, data: result };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "تعذر إنشاء المقال",
    };
  }
}

// ============================================================================
// Update
// ============================================================================

/**
 * Update an existing article server action.
 * Revalidates /news, /news/[slug], and /admin/articles.
 */
export async function updateArticleAction(
  id: string,
  input: Partial<ArticleInput>
): Promise<ArticleActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح" };
  }

  const parsed = articleSchema.partial().safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join("، "),
    };
  }

  try {
    await updateArticle(id, parsed.data);
    revalidatePath("/news");
    if (parsed.data.slug) {
      revalidatePath(`/news/${parsed.data.slug}`);
    }
    revalidatePath("/admin/articles");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "تعذر تحديث المقال",
    };
  }
}

// ============================================================================
// Delete
// ============================================================================

/**
 * Delete an article server action.
 * Revalidates /news and /admin/articles.
 */
export async function deleteArticleAction(
  id: string
): Promise<ArticleActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح" };
  }

  try {
    await deleteArticle(id);
    revalidatePath("/news");
    revalidatePath("/admin/articles");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "تعذر حذف المقال",
    };
  }
}

// ============================================================================
// Publish / Unpublish
// ============================================================================

/**
 * Publish an article: sets published_at = now() if currently null (draft).
 * Temporal logic: published_at IS NOT NULL AND published_at <= now() = published.
 */
export async function publishArticleAction(
  id: string
): Promise<ArticleActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح" };
  }

  try {
    await publishArticle(id);
    revalidatePath("/news");
    revalidatePath("/admin/articles");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "تعذر نشر المقال",
    };
  }
}

/**
 * Unpublish an article: sets published_at = null (moves to draft).
 */
export async function unpublishArticleAction(
  id: string
): Promise<ArticleActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح" };
  }

  try {
    await unpublishArticle(id);
    revalidatePath("/news");
    revalidatePath("/admin/articles");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "تعذر إلغاء نشر المقال",
    };
  }
}

// Re-export list helper for convenience
export { getAdminArticles };
