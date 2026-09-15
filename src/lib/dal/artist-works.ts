import { createClient } from "@/lib/supabase/server";
import type { ArtistWork } from "@/lib/types/artist-works";
import { localizeContentList } from "./localize";

export type { ArtistWork };

/**
 * A published artist's works, in the order the admin arranged them.
 *
 * Drafts (is_published = false) are never returned. Unlike releases there is no
 * canonical Figma fallback for works — the section simply does not render when
 * the table is unreachable or empty, which is what the design draws for an
 * artist with nothing published yet.
 */
export async function getPublishedWorksByArtist(artistId: string): Promise<ArtistWork[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return [];
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("artist_works")
      .select("*")
      .eq("artist_id", artistId)
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return localizeContentList("artist_works", data as unknown as ArtistWork[]);
  } catch {
    // The table may not exist yet on an environment whose migrations lag the
    // deploy; the profile page must still render its other bands.
    return [];
  }
}
