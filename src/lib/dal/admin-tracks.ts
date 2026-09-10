/**
 * Data Access Layer — Admin Tracks (Task 45)
 *
 * All reads use createClient() (anon/cookie session — admin RLS allows reads).
 * All writes use createAdminClient() (service_role, bypasses RLS).
 *
 * Audio upload size limit: 30 MB is enforced at storage layer (Task 50).
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/auth-guard";
import type { AdminTrack, TrackFilters } from "@/lib/types/admin-tracks";
import type { TrackInsert, TrackUpdate } from "@/lib/types/admin-tracks";

/**
 * Fetch all tracks for the admin workspace, optionally filtered.
 * Joins with artists table to include artist name.
 */
export async function getAdminTracks(
  filters?: TrackFilters
): Promise<AdminTrack[]> {
  const { supabase } = await requireAdminSession();
  if (!supabase) return [];

  let query = supabase
    .from("tracks")
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
    console.error("DAL Error [getAdminTracks]:", error.message);
    throw new Error("تعذر تحميل قائمة المقطوعات حالياً");
  }

  return (
    (data as unknown as Array<AdminTrack & { artists: { name: string } | null }>).map(
      (row) => ({
        ...row,
        artist_name: row.artists?.name ?? null,
      })
    ) || []
  );
}

/**
 * Fetch a single track by ID for the admin workspace.
 */
export async function getAdminTrackById(id: string): Promise<AdminTrack | null> {
  const { supabase } = await requireAdminSession();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("tracks")
    .select("*, artists(name)")
    .eq("id" as never, id as never)
    .maybeSingle();

  if (error) {
    console.error("DAL Error [getAdminTrackById]:", error.message);
    throw new Error("تعذر تحميل بيانات المقطوعة");
  }

  if (!data) return null;

  const row = data as unknown as AdminTrack & { artists: { name: string } | null };
  return { ...row, artist_name: row.artists?.name ?? null };
}

/**
 * Create a new track. Uses admin client (service_role) for write.
 */
export async function createTrack(payload: TrackInsert): Promise<{ id: string }> {
  await requireAdminSession();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("tracks")
    .insert(payload as never)
    .select("id")
    .single();

  if (error) {
    console.error("DAL Error [createTrack]:", error.message);
    throw new Error("تعذر إنشاء المقطوعة: " + error.message);
  }

  return { id: (data as unknown as { id: string }).id };
}

/**
 * Update an existing track. Uses admin client (service_role) for write.
 */
export async function updateTrack(id: string, payload: TrackUpdate): Promise<void> {
  await requireAdminSession();
  const admin = createAdminClient();

  const { error } = await admin
    .from("tracks")
    .update(payload as never)
    .eq("id" as never, id as never);

  if (error) {
    console.error("DAL Error [updateTrack]:", error.message);
    throw new Error("تعذر تحديث المقطوعة: " + error.message);
  }
}

/**
 * Delete a track by ID. Uses admin client (service_role) for write.
 */
export async function deleteTrack(id: string): Promise<void> {
  await requireAdminSession();
  const admin = createAdminClient();

  const { error } = await admin
    .from("tracks")
    .delete()
    .eq("id" as never, id as never);

  if (error) {
    console.error("DAL Error [deleteTrack]:", error.message);
    throw new Error("تعذر حذف المقطوعة: " + error.message);
  }
}

/**
 * Toggle the is_published status of a track.
 * @param id Track UUID
 * @param current Current is_published value (will be flipped)
 */
export async function toggleTrackPublish(
  id: string,
  current: boolean
): Promise<{ is_published: boolean }> {
  await requireAdminSession();
  const admin = createAdminClient();
  const next = !current;

  const { error } = await admin
    .from("tracks")
    .update({ is_published: next } as never)
    .eq("id" as never, id as never);

  if (error) {
    console.error("DAL Error [toggleTrackPublish]:", error.message);
    throw new Error("تعذر تغيير حالة نشر المقطوعة: " + error.message);
  }

  return { is_published: next };
}
