import { createClient } from "@/lib/supabase/server";
import { requireAdminSession } from "@/lib/auth-guard";
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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return CANONICAL_FEATURED_ARTISTS.filter((a) => a.is_featured).slice(0, limit);
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return CANONICAL_FEATURED_ARTISTS.filter((a) => a.is_featured).slice(0, limit);
    }

    return data as unknown as Artist[];
  } catch {
    return CANONICAL_FEATURED_ARTISTS.filter((a) => a.is_featured).slice(0, limit);
  }
}

/**
 * Fetches all published artists from Supabase ordered by display_order ASC, name ASC.
 * Draft artists (is_published = false) are never returned.
 */
export async function getPublishedArtists(options?: {
  category?: string;
}): Promise<Artist[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return CANONICAL_FEATURED_ARTISTS;
    }

    const supabase = await createClient();
    let query = supabase
      .from("artists")
      .select(
        "id, name, slug, category, genre_tag, city, quote, spotlight_quote, short_bio, full_bio, specialties, portrait_image_url, is_featured, is_published, display_order, created_at, updated_at"
      )
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
      return CANONICAL_FEATURED_ARTISTS;
    }

    return (data as unknown as Artist[]) || CANONICAL_FEATURED_ARTISTS;
  } catch (err) {
    console.warn("DAL Warning [getPublishedArtists]: Failed to fetch artists", err);
    return CANONICAL_FEATURED_ARTISTS;
  }
}

/**
 * Fetches a single published artist by slug.
 * Returns null if not found or if is_published is false.
 */
export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return CANONICAL_FEATURED_ARTISTS.find((a) => a.slug === slug) || null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error || !data) {
      return CANONICAL_FEATURED_ARTISTS.find((a) => a.slug === slug) || null;
    }

    return data as unknown as Artist;
  } catch {
    return CANONICAL_FEATURED_ARTISTS.find((a) => a.slug === slug) || null;
  }
}
