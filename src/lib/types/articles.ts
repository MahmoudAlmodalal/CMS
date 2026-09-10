import type { Database } from "@/lib/supabase/types";

export type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];

export type Article = Omit<Database["public"]["Tables"]["articles"]["Row"], "created_at" | "updated_at"> & {
  id: string;
  title: string;
  slug: string;
  category: "culture" | "artists" | "academy" | "events";
  excerpt: string;
  content: string;
  cover_image_url: string;
  author_name: string;
  featured_artist_id?: string | null;
  published_at: string;
  is_featured: boolean;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

export const ARTICLE_CATEGORIES = [
  { id: "all", label: "الكل" },
  { id: "culture", label: "الأخبار الثقافية" },
  { id: "artists", label: "قصص الفنانين" },
  { id: "academy", label: "الأكاديمية" },
  { id: "events", label: "الفعاليات" },
] as const;

export type ArticleCategoryId = (typeof ARTICLE_CATEGORIES)[number]["id"];

export const CATEGORY_LABELS: Record<string, string> = {
  all: "الكل",
  culture: "الأخبار الثقافية",
  artists: "قصص الفنانين",
  academy: "الأكاديمية",
  events: "الفعاليات",
};

export function getArticleCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || "الأخبار الثقافية";
}
