/**
 * Admin-specific types for Articles and Testimonials CMS (Task 48).
 *
 * Articles schema:
 *   id, slug, title_ar, cover_url, content_ar, category, published_at (timestamptz nullable),
 *   is_featured, created_at
 *
 * Testimonials schema:
 *   id, quote_ar, author_name_ar, author_role_ar, avatar_url, is_published, ordering, created_at
 */

// ============================================================================
// Article Category
// ============================================================================

export const ADMIN_ARTICLE_CATEGORIES = [
  "news",
  "culture",
  "interview",
  "announcement",
] as const;

export type AdminArticleCategory = (typeof ADMIN_ARTICLE_CATEGORIES)[number];

export const ADMIN_ARTICLE_CATEGORY_LABELS: Record<AdminArticleCategory, string> = {
  news: "أخبار",
  culture: "ثقافة",
  interview: "مقابلات",
  announcement: "إعلانات",
};

// ============================================================================
// AdminArticle Row Type
// ============================================================================

export interface AdminArticle {
  id: string;
  slug: string;
  title_ar: string;
  cover_url: string | null;
  content_ar: string;
  category: AdminArticleCategory;
  /** NULL means draft; non-null AND <= now() means published */
  published_at: string | null;
  is_featured: boolean;
  created_at: string;
}

/** Computed helper — article is published if published_at IS NOT NULL AND <= now() */
export function isArticlePublished(article: Pick<AdminArticle, "published_at">): boolean {
  if (!article.published_at) return false;
  return new Date(article.published_at) <= new Date();
}

// ============================================================================
// AdminTestimonial Row Type
// ============================================================================

export interface AdminTestimonial {
  id: string;
  quote_ar: string;
  author_name_ar: string;
  author_role_ar: string | null;
  avatar_url: string | null;
  is_published: boolean;
  ordering: number;
  created_at: string;
}
