/**
 * Admin DAL for Articles (Task 48).
 *
 * Published state definition:
 *   An article is considered published when published_at IS NOT NULL
 *   AND published_at <= now() (i.e., the publication timestamp is in the past or present).
 *   Articles with a future published_at are treated as scheduled drafts.
 *   Draft articles have published_at = NULL.
 *
 * Read operations use createClient() (anon/session key, subject to RLS).
 * Write operations use createAdminClient() (service_role, bypasses RLS).
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/auth-guard";
import type { AdminArticle, AdminArticleCategory } from "@/lib/types/admin-articles";
import type { ArticleInput } from "@/lib/validations/articles";

export type { AdminArticle, AdminArticleCategory };

// ============================================================================
// Filters
// ============================================================================

export interface AdminArticleFilters {
  category?: AdminArticleCategory;
  /** true = published (published_at IS NOT NULL AND <= now()), false = draft */
  is_published?: boolean;
  search?: string;
}

// ============================================================================
// READ
// ============================================================================

/**
 * Fetch all articles for the admin panel (including drafts).
 * Supports filtering by category, publish state, and free-text search on title_ar/slug.
 *
 * Temporal logic: published_at <= now() check is applied when is_published = true.
 * Draft state: published_at IS NULL (also catches future-scheduled articles as drafts).
 */
export async function getAdminArticles(
  filters?: AdminArticleFilters
): Promise<AdminArticle[]> {
  await requireAdminSession();
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let query = supabase
    .from("articles")
    .select("id, slug, title_ar, cover_url, content_ar, category, published_at, is_featured, created_at")
    .order("created_at", { ascending: false });

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.is_published === true) {
    // Published: published_at IS NOT NULL AND published_at <= now()
    query = query.not("published_at", "is", null).lte("published_at", nowIso);
  } else if (filters?.is_published === false) {
    // Draft: published_at IS NULL OR published_at > now()
    query = query.is("published_at", null);
  }

  if (filters?.search) {
    const term = `%${filters.search}%`;
    query = query.or(`title_ar.ilike.${term},slug.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("DAL Error [getAdminArticles]:", error.message);
    throw new Error("تعذر تحميل قائمة المقالات");
  }

  return (data as unknown as AdminArticle[]) || [];
}

/**
 * Fetch a single article by ID for the admin panel (regardless of publish state).
 */
export async function getAdminArticleById(id: string): Promise<AdminArticle | null> {
  await requireAdminSession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title_ar, cover_url, content_ar, category, published_at, is_featured, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("DAL Error [getAdminArticleById]:", error.message);
    throw new Error("تعذر تحميل بيانات المقال");
  }

  return data as unknown as AdminArticle | null;
}

// ============================================================================
// WRITE — all use createAdminClient() (service_role)
// ============================================================================

/**
 * Create a new article.
 * If publish_now is true, sets published_at = now().
 */
export async function createArticle(
  data: ArticleInput
): Promise<{ id: string }> {
  const adminClient = createAdminClient();

  const { publish_now, ...rest } = data;
  const payload = {
    ...rest,
    cover_url: rest.cover_url || null,
    published_at: publish_now ? new Date().toISOString() : null,
  };

  const { data: row, error } = await adminClient
    .from("articles")
    .insert(payload as never)
    .select("id")
    .single();

  if (error) {
    console.error("DAL Error [createArticle]:", error.message);
    throw new Error(error.message || "تعذر إنشاء المقال");
  }

  return { id: (row as unknown as { id: string }).id };
}

/**
 * Update an existing article by ID.
 * If publish_now is true and published_at was null, sets published_at = now().
 */
export async function updateArticle(
  id: string,
  data: Partial<ArticleInput>
): Promise<void> {
  const adminClient = createAdminClient();

  const { publish_now, ...rest } = data;
  const payload: Record<string, unknown> = { ...rest };

  if (rest.cover_url !== undefined) {
    payload.cover_url = rest.cover_url || null;
  }

  if (publish_now) {
    // Only set published_at if explicitly publishing now
    payload.published_at = new Date().toISOString();
  }

  const { error } = await adminClient
    .from("articles")
    .update(payload as never)
    .eq("id", id);

  if (error) {
    console.error("DAL Error [updateArticle]:", error.message);
    throw new Error(error.message || "تعذر تحديث المقال");
  }
}

/**
 * Delete an article by ID.
 */
export async function deleteArticle(id: string): Promise<void> {
  const adminClient = createAdminClient();

  const { error } = await adminClient.from("articles").delete().eq("id", id);

  if (error) {
    console.error("DAL Error [deleteArticle]:", error.message);
    throw new Error(error.message || "تعذر حذف المقال");
  }
}

/**
 * Publish an article: sets published_at = now() if currently null (draft).
 * Temporal logic: published_at IS NOT NULL AND published_at <= now() marks an article as published.
 */
export async function publishArticle(id: string): Promise<void> {
  const adminClient = createAdminClient();

  // Only publish if currently unpublished (published_at IS NULL)
  const { data: current } = await adminClient
    .from("articles")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();

  const alreadyPublished =
    current &&
    (current as unknown as { published_at: string | null }).published_at !== null;

  if (!alreadyPublished) {
    const { error } = await adminClient
      .from("articles")
      .update({ published_at: new Date().toISOString() } as never)
      .eq("id", id);

    if (error) {
      console.error("DAL Error [publishArticle]:", error.message);
      throw new Error(error.message || "تعذر نشر المقال");
    }
  }
}

/**
 * Unpublish an article: sets published_at = null (moves to draft).
 * Temporal logic: setting published_at = null makes the article a draft regardless of prior value.
 */
export async function unpublishArticle(id: string): Promise<void> {
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("articles")
    .update({ published_at: null } as never)
    .eq("id", id);

  if (error) {
    console.error("DAL Error [unpublishArticle]:", error.message);
    throw new Error(error.message || "تعذر إلغاء نشر المقال");
  }
}
