import { createStaticClient } from "@/lib/supabase/server";
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

export {
  type Article,
  ARTICLE_CATEGORIES,
  type ArticleCategoryId,
  CATEGORY_LABELS,
  getArticleCategoryLabel,
  CARD_CATEGORY_LABELS,
  getArticleCardCategoryLabel,
  CANONICAL_ARTICLES,
  CANONICAL_FEATURED_ARTICLES,
};
export const getNewsCardCategoryLabel = getArticleCardCategoryLabel;

export const NEWS_GRID_PER_PAGE = 6;

export async function getPublishedArticlesPage(
  options: {
    category?: string;
    page?: number;
    perPage?: number;
    excludeIds?: string[];
    excludeFeatured?: boolean;
  } = {}
) {
  const perPage = options.perPage ?? PAGE_SIZE;
  const nowIso = new Date().toISOString();
  const emptyBounds = (pageReq = 1) => {
    const bounds = pagination(0, pageReq, perPage);
    return { ...bounds, total: 0, items: [] as Article[] };
  };

  try {
    const supabase = createStaticClient();
    const buildQuery = (head = false) => {
      let query = supabase
        .from("articles")
        .select("*", { count: "exact", head })
        .eq("is_published", true)
        .lte("published_at", nowIso);
      if (options.category && options.category !== "all") {
        query = query.eq("category", options.category as Article["category"]);
      }
      if (options.excludeFeatured) {
        query = query.eq("is_featured", false);
      }
      if (options.excludeIds && options.excludeIds.length > 0) {
        const safeIds = options.excludeIds.filter((id) => /^[A-Za-z0-9_-]{1,64}$/.test(id));
        if (safeIds.length > 0) {
          query = query.not("id", "in", `(${safeIds.join(",")})`);
        }
      }
      return query;
    };

    const { count, error: countError } = await buildQuery(true);
    if (countError) {
      console.error("DAL Error [getPublishedArticlesPage:count]:", countError.message);
      return emptyBounds(options.page);
    }

    const total = count ?? 0;
    const bounds = pagination(total, options.page ?? 1, perPage);
    if (!total) {
      return { ...bounds, total: 0, items: [] as Article[] };
    }

    const { data, error } = await buildQuery()
      .order("published_at", { ascending: false })
      .order("id", { ascending: true })
      .range(bounds.from, bounds.to);

    if (error) {
      console.error("DAL Error [getPublishedArticlesPage:data]:", error.message);
      return { ...bounds, total, items: [] as Article[] };
    }

    const rows = (data as unknown as Article[]) || [];
    return { ...bounds, total, items: await localizeContentList("articles", rows) };
  } catch (err) {
    console.error("DAL Error [getPublishedArticlesPage]:", err);
    return emptyBounds(options.page);
  }
}

export async function getPublishedArticles(options?: { category?: string; limit?: number }): Promise<Article[]> {
  const category = options?.category;
  const limit = options?.limit;
  const nowIso = new Date().toISOString();
  try {
    const supabase = createStaticClient();
    let query = supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .lte("published_at", nowIso)
      .order("published_at", { ascending: false })
      .order("id", { ascending: true });
    if (category && category !== "all") {
      query = query.eq("category", category as Article["category"]);
    }
    if (typeof limit === "number") {
      query = query.limit(limit);
    }
    const { data, error } = await query;
    if (error) {
      console.error("DAL Error [getPublishedArticles]:", error.message);
      return [];
    }
    const rows = (data as unknown as Article[]) || [];
    return localizeContentList("articles", rows);
  } catch (err) {
    console.error("DAL Error [getPublishedArticles]:", err);
    return [];
  }
}

export async function getFeaturedArticles(limit = 3): Promise<Article[]> {
  const nowIso = new Date().toISOString();
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .eq("is_featured", true)
      .lte("published_at", nowIso)
      .order("published_at", { ascending: false })
      .order("id", { ascending: true })
      .limit(limit);
    if (error) {
      console.error("DAL Error [getFeaturedArticles]:", error.message);
      return [];
    }
    const rows = (data as unknown as Article[]) || [];
    return localizeContentList("articles", rows);
  } catch (err) {
    console.error("DAL Error [getFeaturedArticles]:", err);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!slug) return null;
  const nowIso = new Date().toISOString();
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .lte("published_at", nowIso)
      .maybeSingle();
    if (error || !data) {
      if (error) console.error("DAL Error [getArticleBySlug]:", error.message);
      return null;
    }
    return localizeContent("articles", data as unknown as Article);
  } catch (err) {
    console.error("DAL Error [getArticleBySlug]:", err);
    return null;
  }
}

export async function getRelatedArticles(
  currentSlug: string,
  category?: string,
  limit = 3
): Promise<Article[]> {
  const nowIso = new Date().toISOString();
  try {
    const supabase = createStaticClient();
    const query = supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .lte("published_at", nowIso)
      .neq("slug", currentSlug)
      .order("published_at", { ascending: false })
      .order("id", { ascending: true })
      .limit(12);
    const { data, error } = await query;
    if (error || !data) {
      if (error) console.error("DAL Error [getRelatedArticles]:", error.message);
      return [];
    }
    const rows = data as unknown as Article[];
    const sliced =
      !category || category === "all"
        ? rows.slice(0, limit)
        : [
            ...rows.filter((a) => a.category === category),
            ...rows.filter((a) => a.category !== category),
          ].slice(0, limit);
    return localizeContentList("articles", sliced);
  } catch (err) {
    console.error("DAL Error [getRelatedArticles]:", err);
    return [];
  }
}

export async function getAllPublishedArticleSlugs(): Promise<{ slug: string }[]> {
  const nowIso = new Date().toISOString();
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("articles")
      .select("slug")
      .eq("is_published", true)
      .lte("published_at", nowIso)
      .order("published_at", { ascending: false })
      .order("id", { ascending: true });
    if (error || !data) {
      if (error) console.error("DAL Error [getAllPublishedArticleSlugs]:", error.message);
      return [];
    }
    return (data as Array<{ slug: string }>).map((row) => ({ slug: row.slug }));
  } catch (err) {
    console.error("DAL Error [getAllPublishedArticleSlugs]:", err);
    return [];
  }
}
