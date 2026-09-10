/**
 * Admin DAL for Articles (Task 48, rebuilt).
 *
 * Real schema (supabase/migrations/20260910000700_create_articles.sql):
 *   id, title, slug, category (culture|artists|academy|events), excerpt, content,
 *   cover_image_url, author_name, featured_artist_id, published_at (timestamptz, default now()),
 *   is_featured, is_published, created_at, updated_at.
 *
 * Publication is temporal: a row is publicly visible only when
 * is_published = true AND published_at <= now(). A future published_at with
 * is_published = true is a valid *scheduled* article, not an error — the
 * admin UI must label it "مجدول" rather than rejecting it.
 *
 * Read operations use createClient() (anon/session key, subject to RLS).
 * Write operations use createAdminClient() (service_role, bypasses RLS).
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/auth-guard";
import type { ArticleCategory } from "@/lib/validations/primitives";
import type { ArticleInput } from "@/lib/validations/cms";

export interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  excerpt: string;
  content: string;
  cover_image_url: string;
  author_name: string;
  featured_artist_id: string | null;
  published_at: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

const ARTICLE_COLUMNS =
  "id, title, slug, category, excerpt, content, cover_image_url, author_name, featured_artist_id, published_at, is_featured, is_published, created_at";

/** True only when the row is both flagged published and its scheduled time has arrived. */
export function isArticleLive(article: Pick<AdminArticle, "is_published" | "published_at">): boolean {
  return article.is_published && new Date(article.published_at) <= new Date();
}

/** A published-but-future row is a scheduled post, not an error state. */
export function isArticleScheduled(article: Pick<AdminArticle, "is_published" | "published_at">): boolean {
  return article.is_published && new Date(article.published_at) > new Date();
}

export interface AdminArticleFilters {
  category?: ArticleCategory;
  is_published?: boolean;
  search?: string;
}

// ============================================================================
// READ
// ============================================================================

export async function getAdminArticles(filters?: AdminArticleFilters): Promise<AdminArticle[]> {
  await requireAdminSession();
  const supabase = await createClient();

  let query = supabase.from("articles").select(ARTICLE_COLUMNS).order("created_at", { ascending: false });

  if (filters?.category) {
    const category = filters.category as "culture" | "artists" | "academy" | "events";
    query = query.eq("category", category);
  }

  if (filters?.is_published !== undefined) {
    query = query.eq("is_published", filters.is_published);
  }

  if (filters?.search) {
    const term = `%${filters.search}%`;
    query = query.or(`title.ilike.${term},slug.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("DAL Error [getAdminArticles]:", error.message);
    throw new Error("تعذر تحميل قائمة المقالات");
  }

  return (data as unknown as AdminArticle[]) || [];
}

export async function getAdminArticleById(id: string): Promise<AdminArticle | null> {
  await requireAdminSession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_COLUMNS)
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

export async function createArticle(data: ArticleInput): Promise<{ id: string }> {
  const adminClient = createAdminClient();

  const { data: row, error } = await adminClient
    .from("articles")
    .insert(data as never)
    .select("id")
    .single();

  if (error) {
    console.error("DAL Error [createArticle]:", error.message);
    throw new Error(error.message || "تعذر إنشاء المقال");
  }

  return { id: (row as unknown as { id: string }).id };
}

export async function updateArticle(id: string, data: Partial<ArticleInput>): Promise<void> {
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("articles")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", id);

  if (error) {
    console.error("DAL Error [updateArticle]:", error.message);
    throw new Error(error.message || "تعذر تحديث المقال");
  }
}

export async function deleteArticle(id: string): Promise<void> {
  const adminClient = createAdminClient();

  const { error } = await adminClient.from("articles").delete().eq("id", id);

  if (error) {
    console.error("DAL Error [deleteArticle]:", error.message);
    throw new Error(error.message || "تعذر حذف المقال");
  }
}
