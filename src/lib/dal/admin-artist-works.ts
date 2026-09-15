/**
 * Data Access Layer — Admin Artist Works (أعمال الفنان).
 *
 * Reads only. Writes go through the Server Actions in src/actions/cms.ts, the
 * same as every other manager.
 */

import { requireAdminSession } from "@/lib/auth-guard";
import type { AdminArtistWork, ArtistWorkFilters } from "@/lib/types/artist-works";

/** Fetch all works for the admin workspace, optionally filtered. */
export async function getAdminArtistWorks(
  filters?: ArtistWorkFilters
): Promise<AdminArtistWork[]> {
  const { supabase } = await requireAdminSession();
  if (!supabase) return [];

  let query = supabase
    .from("artist_works")
    .select("*, artists(name)")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters?.artist_id) {
    query = query.eq("artist_id" as never, filters.artist_id as never);
  }
  if (filters?.is_published !== undefined) {
    query = query.eq("is_published" as never, filters.is_published as never);
  }

  const { data, error } = await query;

  if (error) {
    console.error("DAL Error [getAdminArtistWorks]:", error.message);
    throw new Error("تعذر تحميل قائمة الأعمال حالياً");
  }

  return (
    (data as unknown as Array<AdminArtistWork & { artists: { name: string } | null }>).map(
      (row) => ({ ...row, artist_name: row.artists?.name ?? null })
    ) || []
  );
}

/** Fetch a single work by ID for the admin workspace. */
export async function getAdminArtistWorkById(id: string): Promise<AdminArtistWork | null> {
  const { supabase } = await requireAdminSession();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("artist_works")
    .select("*, artists(name)")
    .eq("id" as never, id as never)
    .maybeSingle();

  if (error) {
    console.error("DAL Error [getAdminArtistWorkById]:", error.message);
    throw new Error("تعذر تحميل بيانات العمل");
  }
  if (!data) return null;

  const row = data as unknown as AdminArtistWork & { artists: { name: string } | null };
  return { ...row, artist_name: row.artists?.name ?? null };
}
