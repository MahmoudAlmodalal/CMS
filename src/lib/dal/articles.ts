import { createClient } from "@/lib/supabase/server";
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

/**
 * Fetch all published articles.
 * Strictly enforces RLS public view rules:
 * is_published = true AND published_at <= now().
 * Optional category filtering ('all' or specific slug).
 */
export async function getPublishedArticles(options?: {
  category?: string;
  limit?: number;
}): Promise<Article[]> {
  const category = options?.category;
  const limit = options?.limit;
  const nowIso = new Date().toISOString();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    let filtered = CANONICAL_ARTICLES.filter(
      (a) => a.is_published && a.published_at <= nowIso
    );
    if (category && category !== "all") {
      filtered = filtered.filter((a) => a.category === category);
    }
    filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .lte("published_at", nowIso)
      .order("published_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category as Article["category"]);
    }

    if (typeof limit === "number") {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      let filtered = CANONICAL_ARTICLES.filter(
        (a) => a.is_published && a.published_at <= nowIso
      );
      if (category && category !== "all") {
        filtered = filtered.filter((a) => a.category === category);
      }
      filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
      return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
    }

    return data as unknown as Article[];
  } catch {
    let filtered = CANONICAL_ARTICLES.filter(
      (a) => a.is_published && a.published_at <= nowIso
    );
    if (category && category !== "all") {
      filtered = filtered.filter((a) => a.category === category);
    }
    filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
  }
}

/**
 * Fetch featured published articles.
 * Strictly checks is_published = true AND is_featured = true AND published_at <= now().
 */
export async function getFeaturedArticles(limit = 3): Promise<Article[]> {
  const nowIso = new Date().toISOString();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const featured = CANONICAL_ARTICLES.filter(
      (a) => a.is_published && a.is_featured && a.published_at <= nowIso
    );
    featured.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    return featured.slice(0, limit);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .eq("is_featured", true)
      .lte("published_at", nowIso)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      const featured = CANONICAL_ARTICLES.filter(
        (a) => a.is_published && a.is_featured && a.published_at <= nowIso
      );
      featured.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
      return featured.slice(0, limit);
    }

    return data as unknown as Article[];
  } catch {
    const featured = CANONICAL_ARTICLES.filter(
      (a) => a.is_published && a.is_featured && a.published_at <= nowIso
    );
    featured.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    return featured.slice(0, limit);
  }
}

/**
 * Fetch a single published article by its unique slug.
 * Returns null if the article does not exist, is draft (is_published = false),
 * or has a future publication timestamp (published_at > now()).
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const nowIso = new Date().toISOString();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const found = CANONICAL_ARTICLES.find(
      (a) => a.slug === slug && a.is_published && a.published_at <= nowIso
    );
    return found || null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .lte("published_at", nowIso)
      .maybeSingle();

    if (error || !data) {
      const found = CANONICAL_ARTICLES.find(
        (a) => a.slug === slug && a.is_published && a.published_at <= nowIso
      );
      return found || null;
    }

    return data as unknown as Article;
  } catch {
    const found = CANONICAL_ARTICLES.find(
      (a) => a.slug === slug && a.is_published && a.published_at <= nowIso
    );
    return found || null;
  }
}

/**
 * Fetch related articles for a given article.
 * Prioritizes the same category, excludes the current article, returns up to limit.
 */
export async function getRelatedArticles(
  currentSlug: string,
  category?: string,
  limit = 3
): Promise<Article[]> {
  const allArticles = await getPublishedArticles({ limit: 12 });
  const otherArticles = allArticles.filter((a) => a.slug !== currentSlug);

  if (category) {
    const sameCategory = otherArticles.filter((a) => a.category === category);
    if (sameCategory.length >= limit) {
      return sameCategory.slice(0, limit);
    }
    const differentCategory = otherArticles.filter((a) => a.category !== category);
    return [...sameCategory, ...differentCategory].slice(0, limit);
  }

  return otherArticles.slice(0, limit);
}

/**
 * Pre-render all published article slugs for Next.js ISR generateStaticParams.
 */
export async function getAllPublishedArticleSlugs(): Promise<{ slug: string }[]> {
  const nowIso = new Date().toISOString();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return CANONICAL_ARTICLES.filter(
      (a) => a.is_published && a.published_at <= nowIso
    ).map((a) => ({ slug: a.slug }));
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("slug")
      .eq("is_published", true)
      .lte("published_at", nowIso);

    if (error || !data || data.length === 0) {
      return CANONICAL_ARTICLES.filter(
        (a) => a.is_published && a.published_at <= nowIso
      ).map((a) => ({ slug: a.slug }));
    }

    return (data as Array<{ slug: string }>).map((row) => ({ slug: row.slug }));
  } catch {
    return CANONICAL_ARTICLES.filter(
      (a) => a.is_published && a.published_at <= nowIso
    ).map((a) => ({ slug: a.slug }));
  }
}

