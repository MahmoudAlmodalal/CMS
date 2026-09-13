import { createClient } from "@/lib/supabase/server";
import { USE_DEMO_CONTENT } from "@/lib/demo-content";
import {
  type Article,
  ARTICLE_CATEGORIES,
  type ArticleCategoryId,
  CATEGORY_LABELS,
  getArticleCategoryLabel,
  CARD_CATEGORY_LABELS,
  getArticleCardCategoryLabel,
  CANONICAL_ARTICLES,
  CANONICAL_FEATURED_ARTICLES,
} from "@/lib/articles";

export { type Article, ARTICLE_CATEGORIES, type ArticleCategoryId, CATEGORY_LABELS, getArticleCategoryLabel, CARD_CATEGORY_LABELS, getArticleCardCategoryLabel, CANONICAL_ARTICLES, CANONICAL_FEATURED_ARTICLES };

const demoArticles = (limit?: number) => {
  const now = new Date().toISOString();
  const rows = CANONICAL_ARTICLES.filter((a) => a.is_published && a.published_at <= now);
  return typeof limit === "number" ? rows.slice(0, limit) : rows;
};

export async function getPublishedArticles(options?: { category?: string; limit?: number }): Promise<Article[]> {
  const category = options?.category;
  const limit = options?.limit;
  const nowIso = new Date().toISOString();
  if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    const rows = demoArticles().filter((a) => !category || category === "all" || a.category === category);
    return typeof limit === "number" ? rows.slice(0, limit) : rows;
  }
  try {
    const supabase = await createClient();
    let query = supabase.from("articles").select("*").eq("is_published", true).lte("published_at", nowIso).order("published_at", { ascending: false });
    if (category && category !== "all") query = query.eq("category", category as Article["category"]);
    if (typeof limit === "number") query = query.limit(limit);
    const { data, error } = await query;
    if (error) {
      console.error("DAL Error [getPublishedArticles]:", error.message);
      return USE_DEMO_CONTENT ? demoArticles(limit) : [];
    }
    return (data as unknown as Article[]) || [];
  } catch {
    return USE_DEMO_CONTENT ? demoArticles(limit) : [];
  }
}

export async function getFeaturedArticles(limit = 3): Promise<Article[]> {
  const nowIso = new Date().toISOString();
  if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    return CANONICAL_ARTICLES.filter((a) => a.is_published && a.is_featured && a.published_at <= nowIso).slice(0, limit);
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("articles").select("*").eq("is_published", true).eq("is_featured", true).lte("published_at", nowIso).order("published_at", { ascending: false }).limit(limit);
    if (error) return USE_DEMO_CONTENT ? CANONICAL_FEATURED_ARTICLES.slice(0, limit) : [];
    return (data as unknown as Article[]) || [];
  } catch {
    return USE_DEMO_CONTENT ? CANONICAL_FEATURED_ARTICLES.slice(0, limit) : [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const nowIso = new Date().toISOString();
  if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) return CANONICAL_ARTICLES.find((a) => a.slug === slug && a.is_published && a.published_at <= nowIso) || null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("articles").select("*").eq("slug", slug).eq("is_published", true).lte("published_at", nowIso).maybeSingle();
    if (error || !data) return null;
    return data as unknown as Article;
  } catch {
    return USE_DEMO_CONTENT ? CANONICAL_ARTICLES.find((a) => a.slug === slug && a.is_published && a.published_at <= nowIso) || null : null;
  }
}

export async function getRelatedArticles(currentSlug: string, category?: string, limit = 3): Promise<Article[]> {
  const other = (await getPublishedArticles({ limit: 12 })).filter((a) => a.slug !== currentSlug);
  if (!category) return other.slice(0, limit);
  return [...other.filter((a) => a.category === category), ...other.filter((a) => a.category !== category)].slice(0, limit);
}

export async function getAllPublishedArticleSlugs(): Promise<{ slug: string }[]> {
  const nowIso = new Date().toISOString();
  if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) return demoArticles().map((a) => ({ slug: a.slug }));
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("articles").select("slug").eq("is_published", true).lte("published_at", nowIso);
    if (error) return USE_DEMO_CONTENT ? demoArticles().map((a) => ({ slug: a.slug })) : [];
    return (data as Array<{ slug: string }> || []).map((row) => ({ slug: row.slug }));
  } catch {
    return USE_DEMO_CONTENT ? demoArticles().map((a) => ({ slug: a.slug })) : [];
  }
}
