import { createClient, createStaticClient } from "@/lib/supabase/server";
import { USE_DEMO_CONTENT } from "@/lib/demo-content";
import { PAGE_SIZE, pagination } from "@/lib/pagination";
import { localizeContent, localizeContentList } from "./localize";
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
export const getNewsCardCategoryLabel = getArticleCardCategoryLabel;

const canonicalArticles = (category?: string, limit?: number) => {
  const now = new Date().toISOString();
  const rows = CANONICAL_ARTICLES.filter(
    (a) =>
      a.is_published &&
      a.published_at <= now &&
      (!category || category === "all" || a.category === category),
  );
  return typeof limit === "number" ? rows.slice(0, limit) : rows;
};

const demoArticles = (limit?: number) => canonicalArticles(undefined, limit);

export async function getPublishedArticlesPage(options: { category?: string; page?: number } = {}) {
  const nowIso = new Date().toISOString();
  const fallback = async () => {
    const rows = canonicalArticles(options.category)
      .sort((a, b) => b.published_at.localeCompare(a.published_at) || a.id.localeCompare(b.id));
    const bounds = pagination(rows.length, options.page ?? 1, PAGE_SIZE);
    return { ...bounds, total: rows.length, items: await localizeContentList("articles", rows.slice(bounds.from, bounds.to + 1)) };
  };
  if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) return fallback();
  try {
    const supabase = await createClient();
    const buildQuery = (head = false) => {
      let query = supabase.from("articles").select("*", { count: "exact", head }).eq("is_published", true).lte("published_at", nowIso);
      if (options.category && options.category !== "all") query = query.eq("category", options.category as Article["category"]);
      return query;
    };
    const { count, error: countError } = await buildQuery(true);
    if (countError) return fallback();
    const total = count ?? 0;
    const bounds = pagination(total, options.page ?? 1, PAGE_SIZE);
    if (!total) return { ...bounds, total, items: [] as Article[] };
    const { data, error } = await buildQuery()
      .order("published_at", { ascending: false })
      .order("id", { ascending: true })
      .range(bounds.from, bounds.to);
    if (error) return fallback();
    return { ...bounds, total, items: await localizeContentList("articles", (data as unknown as Article[]) || []) };
  } catch {
    return fallback();
  }
}

export async function getPublishedArticles(options?: { category?: string; limit?: number }): Promise<Article[]> {
  const category = options?.category;
  const limit = options?.limit;
  const nowIso = new Date().toISOString();
  if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    return localizeContentList("articles", canonicalArticles(category, limit));
  }
  try {
    const supabase = await createClient();
    let query = supabase.from("articles").select("*").eq("is_published", true).lte("published_at", nowIso).order("published_at", { ascending: false });
    if (category && category !== "all") query = query.eq("category", category as Article["category"]);
    if (typeof limit === "number") query = query.limit(limit);
    const { data, error } = await query;
    if (error) {
      console.error("DAL Error [getPublishedArticles]:", error.message);
      return localizeContentList("articles", canonicalArticles(category, limit));
    }
    const rows = (data as unknown as Article[]) || [];
    return localizeContentList("articles", rows.length ? rows : canonicalArticles(category, limit));
  } catch {
    return localizeContentList("articles", canonicalArticles(category, limit));
  }
}

export async function getFeaturedArticles(limit = 3): Promise<Article[]> {
  const nowIso = new Date().toISOString();
  if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    return localizeContentList("articles", CANONICAL_ARTICLES.filter((a) => a.is_published && a.is_featured && a.published_at <= nowIso).slice(0, limit));
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("articles").select("*").eq("is_published", true).eq("is_featured", true).lte("published_at", nowIso).order("published_at", { ascending: false }).limit(limit);
    if (error) return localizeContentList("articles", CANONICAL_FEATURED_ARTICLES.slice(0, limit));
    const rows = (data as unknown as Article[]) || [];
    return localizeContentList("articles", rows.length ? rows : CANONICAL_FEATURED_ARTICLES.slice(0, limit));
  } catch {
    return localizeContentList("articles", CANONICAL_FEATURED_ARTICLES.slice(0, limit));
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const nowIso = new Date().toISOString();
  if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    const demo = CANONICAL_ARTICLES.find((a) => a.slug === slug && a.is_published && a.published_at <= nowIso) || null;
    return demo ? localizeContent("articles", demo) : null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("articles").select("*").eq("slug", slug).eq("is_published", true).lte("published_at", nowIso).maybeSingle();
    if (error || !data) {
      const found = CANONICAL_ARTICLES.find(
        (a) => a.slug === slug && a.is_published && a.published_at <= nowIso,
      );
      return found ? localizeContent("articles", found) : null;
    }
    return localizeContent("articles", data as unknown as Article);
  } catch {
    const found = CANONICAL_ARTICLES.find(
      (a) => a.slug === slug && a.is_published && a.published_at <= nowIso,
    );
    return found || null;
  }
}

export async function getRelatedArticles(currentSlug: string, category?: string, limit = 3): Promise<Article[]> {
  const other = (await getPublishedArticles({ limit: 12 })).filter((a) => a.slug !== currentSlug);
  const sliced = !category ? other.slice(0, limit) : [...other.filter((a) => a.category === category), ...other.filter((a) => a.category !== category)].slice(0, limit);
  return localizeContentList("articles", sliced);
}

export async function getAllPublishedArticleSlugs(): Promise<{ slug: string }[]> {
  const nowIso = new Date().toISOString();
  if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) return demoArticles().map((a) => ({ slug: a.slug }));
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.from("articles").select("slug").eq("is_published", true).lte("published_at", nowIso);
    if (error) return canonicalArticles().map((a) => ({ slug: a.slug }));
    const rows = (data as Array<{ slug: string }> || []).map((row) => ({ slug: row.slug }));
    return rows.length ? rows : canonicalArticles().map((a) => ({ slug: a.slug }));
  } catch {
    return canonicalArticles().map((a) => ({ slug: a.slug }));
  }
}
