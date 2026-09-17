import { createStaticClient } from "@/lib/supabase/server";
import { pagination } from "@/lib/pagination";
import { requireAdminSession } from "@/lib/auth-guard";
import { USE_DEMO_CONTENT } from "@/lib/demo-content";
import { localizeContent, localizeContentList } from "./localize";
import type { Database } from "@/lib/supabase/types";
import {
  type Artist,
  ARTIST_CATEGORIES,
  type ArtistCategoryId,
  CANONICAL_FEATURED_ARTISTS,
  getCategoryLabel,
} from "@/lib/types/artists";

export {
  type Artist,
  ARTIST_CATEGORIES,
  type ArtistCategoryId,
  CANONICAL_FEATURED_ARTISTS,
  getCategoryLabel,
};

/**
 * Fetches every artist for the protected admin workspace, including drafts.
 * The auth guard is intentionally kept in the DAL so the page cannot forget it.
 */
export async function getAdminArtists(): Promise<Artist[]> {
  const { supabase } = await requireAdminSession();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("DAL Error [getAdminArtists]:", error.message);
    throw new Error("تعذر تحميل قائمة الفنانين حالياً");
  }

  return (data as unknown as Artist[]) || [];
}

/**
 * Fetches featured published artists for the homepage.
 * Strictly checks is_published = true AND is_featured = true.
 */
export async function getFeaturedArtists(limit = 4): Promise<Artist[]> {
  try {
    if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      return localizeContentList("artists", CANONICAL_FEATURED_ARTISTS.slice(0, limit));
    }

    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return localizeContentList("artists", USE_DEMO_CONTENT ? CANONICAL_FEATURED_ARTISTS.slice(0, limit) : []);
    }

    return localizeContentList("artists", (data as unknown as Artist[]) || []);
  } catch {
    return localizeContentList("artists", USE_DEMO_CONTENT ? CANONICAL_FEATURED_ARTISTS.slice(0, limit) : []);
  }
}

/**
 * Published artist slugs for generateStaticParams, which runs without a request,
 * so it must not touch cookies() via the session-aware client.
 */
export async function getPublishedArtistSlugs(): Promise<{ slug: string }[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return USE_DEMO_CONTENT ? CANONICAL_FEATURED_ARTISTS.map((a) => ({ slug: a.slug })) : [];
  }
  const { data, error } = await createStaticClient().from("artists").select("slug").eq("is_published", true);
  if (error) {
    console.warn("DAL Warning [getPublishedArtistSlugs]:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Fetches all published artists from Supabase ordered by display_order ASC, name ASC.
 * Draft artists (is_published = false) are never returned.
 */
export async function getPublishedArtists(options?: { category?: string }): Promise<Artist[]> {
  try {
    if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      return localizeContentList("artists", CANONICAL_FEATURED_ARTISTS);
    }

    const supabase = createStaticClient();
    let query = supabase
      .from("artists")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (options?.category && options.category !== "all") {
      query = query.eq(
        "category",
        options.category as Database["public"]["Tables"]["artists"]["Row"]["category"],
      );
    }


    const { data, error } = await query;

    if (error) {
      console.error("DAL Error [getPublishedArtists]:", error.message);
      return localizeContentList("artists", USE_DEMO_CONTENT ? CANONICAL_FEATURED_ARTISTS : []);
    }

    return localizeContentList("artists", (data as unknown as Artist[]) || []);
  } catch (err) {
    console.warn("DAL Warning [getPublishedArtists]: Failed to fetch artists", err);
    return localizeContentList("artists", USE_DEMO_CONTENT ? CANONICAL_FEATURED_ARTISTS : []);
  }
}

/** Cards per page on /artists — the desktop grid draws four columns by two rows. */
export const ARTISTS_CATALOG_PER_PAGE = 8;

/**
 * Paginated published artists for /artists — mirrors getPublishedArticlesPage.
 * Ordering matches getPublishedArtists: display_order ASC, name ASC.
 */
export async function getPublishedArtistsPage(
  options: {
    category?: string;
    page?: number;
    perPage?: number;
  } = {}
) {
  const perPage = options.perPage ?? ARTISTS_CATALOG_PER_PAGE;
  const emptyBounds = (pageReq = 1) => {
    const bounds = pagination(0, pageReq, perPage);
    return { ...bounds, total: 0, items: [] as Artist[] };
  };

  const demoPage = async (pageReq = 1) => {
    let rows = CANONICAL_FEATURED_ARTISTS;
    if (options.category && options.category !== "all") {
      rows = rows.filter((a) => a.category === options.category);
    }
    const ordered = [...rows].sort((a, b) => {
      if (a.display_order !== b.display_order) return a.display_order - b.display_order;
      return a.name.localeCompare(b.name, "ar");
    });
    const bounds = pagination(ordered.length, pageReq, perPage);
    return {
      ...bounds,
      total: ordered.length,
      items: await localizeContentList("artists", ordered.slice(bounds.from, bounds.to + 1)),
    };
  };

  try {
    if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      return demoPage(options.page);
    }

    const supabase = createStaticClient();
    const buildQuery = (head = false) => {
      let query = supabase
        .from("artists")
        .select("*", { count: "exact", head })
        .eq("is_published", true);
      if (options?.category && options.category !== "all") {
        query = query.eq(
          "category",
          options.category as Database["public"]["Tables"]["artists"]["Row"]["category"],
        );
      }
      return query;
    };

    const { count, error: countError } = await buildQuery(true);
    if (countError) {
      console.error("DAL Error [getPublishedArtistsPage:count]:", countError.message);
      return USE_DEMO_CONTENT ? demoPage(options.page) : emptyBounds(options.page);
    }

    const total = count ?? 0;
    const bounds = pagination(total, options.page ?? 1, perPage);
    if (!total) {
      return { ...bounds, total: 0, items: [] as Artist[] };
    }

    const { data, error } = await buildQuery()
      .order("display_order", { ascending: true })
      .order("name", { ascending: true })
      .range(bounds.from, bounds.to);

    if (error) {
      console.error("DAL Error [getPublishedArtistsPage:data]:", error.message);
      return USE_DEMO_CONTENT ? demoPage(options.page) : { ...bounds, total, items: [] as Artist[] };
    }

    const rows = (data as unknown as Artist[]) || [];
    return { ...bounds, total, items: await localizeContentList("artists", rows) };
  } catch (err) {
    console.warn("DAL Warning [getPublishedArtistsPage]: Failed to fetch artists page", err);
    return USE_DEMO_CONTENT ? demoPage(options.page) : emptyBounds(options.page);
  }
}

/**
 * Fetches a single published artist by slug.
 * Returns null if not found or if is_published is false.
 */
export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  try {
    if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      const demo = CANONICAL_FEATURED_ARTISTS.find((a) => a.slug === slug) || null;
      return demo ? localizeContent("artists", demo) : null;
    }

    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error || !data) {
      return null;
    }

    return localizeContent("artists", data as unknown as Artist);
  } catch {
    const fallback = USE_DEMO_CONTENT ? CANONICAL_FEATURED_ARTISTS.find((a) => a.slug === slug) || null : null;
    const localized = fallback ? await localizeContent("artists", fallback) : null;
    return localized || null;
  }
}
