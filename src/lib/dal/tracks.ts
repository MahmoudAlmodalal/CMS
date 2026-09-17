import { createStaticClient } from "@/lib/supabase/server";
import type { Track } from "@/lib/types/admin-tracks";
import { localizeContentList } from "./localize";

export type { Track };

/**
 * Public DAL for tracks.
 *
 * Fetches published tracks for a given artist, ordered by display_order.
 * Returns an empty array without Supabase credentials or if no tracks exist.
 */
export async function getPublishedTracksByArtist(artistId: string): Promise<Track[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return [];
    }

    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("artist_id", artistId)
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return localizeContentList("tracks", data as unknown as Track[]);
  } catch {
    return [];
  }
}
