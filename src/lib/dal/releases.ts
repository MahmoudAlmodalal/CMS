import { createClient } from "@/lib/supabase/server";
import { type Release, CANONICAL_RELEASES } from "@/lib/releases";

export { type Release, CANONICAL_RELEASES };

/**
 * Fetches a published artist's discography, ordered exactly as the frame draws it.
 *
 * Draft releases (is_published = false) are never returned. Without Supabase the
 * reader resolves to CANONICAL_RELEASES, which carries the four albums drawn on
 * 134:4682 for سارة الصوت and nothing for anyone else.
 */
export async function getPublishedReleasesByArtist(artistId: string): Promise<Release[]> {
  const canonical = CANONICAL_RELEASES.filter(
    (r) => r.artist_id === artistId && r.is_published
  );

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return canonical;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("releases")
      .select("*")
      .eq("artist_id", artistId)
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("release_year", { ascending: false });

    if (error || !data) return canonical;

    return data as unknown as Release[];
  } catch {
    return canonical;
  }
}
