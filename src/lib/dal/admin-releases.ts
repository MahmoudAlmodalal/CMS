/**
 * Data Access Layer — Admin Releases (Task 45)
 *
 * All reads use createClient() (anon/cookie session — admin RLS allows reads).
 * All writes use createAdminClient() (service_role, bypasses RLS).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/auth-guard";
import type { AdminRelease, ReleaseFilters } from "@/lib/types/admin-tracks";
import type { ReleaseInsert, ReleaseUpdate } from "@/lib/types/admin-tracks";

/**
 * Fetch all releases for the admin workspace, optionally filtered.
 * Joins with artists table to include artist name.
 */
export async function getAdminReleases(
  filters?: ReleaseFilters
): Promise<AdminRelease[]> {
  const { supabase } = await requireAdminSession();
  if (!supabase) return [];

  let query = supabase
    .from("releases")
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
    console.error("DAL Error [getAdminReleases]:", error.message);
    throw new Error("تعذر تحميل قائمة الإصدارات حالياً");
  }

  return (
    (data as unknown as Array<AdminRelease & { artists: { name: string } | null }>).map(
      (row) => ({
        ...row,
        artist_name: row.artists?.name ?? null,
      })
    ) || []
  );
}

/**
 * Fetch a single release by ID for the admin workspace.
 */
export async function getAdminReleaseById(id: string): Promise<AdminRelease | null> {
  const { supabase } = await requireAdminSession();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("releases")
    .select("*, artists(name)")
    .eq("id" as never, id as never)
    .maybeSingle();

  if (error) {
    console.error("DAL Error [getAdminReleaseById]:", error.message);
    throw new Error("تعذر تحميل بيانات الإصدار");
  }

  if (!data) return null;

  const row = data as unknown as AdminRelease & { artists: { name: string } | null };
  return { ...row, artist_name: row.artists?.name ?? null };
}

/**
 * Create a new release. Uses admin client (service_role) for write.
 */
export async function createRelease(payload: ReleaseInsert): Promise<{ id: string }> {
  await requireAdminSession();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("releases")
    .insert(payload as never)
    .select("id")
    .single();

  if (error) {
    console.error("DAL Error [createRelease]:", error.message);
    throw new Error("تعذر إنشاء الإصدار: " + error.message);
  }

  return { id: (data as unknown as { id: string }).id };
}

/**
 * Update an existing release. Uses admin client (service_role) for write.
 */
export async function updateRelease(id: string, payload: ReleaseUpdate): Promise<void> {
  await requireAdminSession();
  const admin = createAdminClient();

  const { error } = await admin
    .from("releases")
    .update(payload as never)
    .eq("id" as never, id as never);

  if (error) {
    console.error("DAL Error [updateRelease]:", error.message);
    throw new Error("تعذر تحديث الإصدار: " + error.message);
  }
}

/**
 * Delete a release by ID. Uses admin client (service_role) for write.
 */
export async function deleteRelease(id: string): Promise<void> {
  await requireAdminSession();
  const admin = createAdminClient();

  const { error } = await admin
    .from("releases")
    .delete()
    .eq("id" as never, id as never);

  if (error) {
    console.error("DAL Error [deleteRelease]:", error.message);
    throw new Error("تعذر حذف الإصدار: " + error.message);
  }
}

/**
 * Toggle the is_published status of a release.
 * @param id Release UUID
 * @param current Current is_published value (will be flipped)
 */
export async function toggleReleasePublish(
  id: string,
  current: boolean
): Promise<{ is_published: boolean }> {
  await requireAdminSession();
  const admin = createAdminClient();
  const next = !current;

  const { error } = await admin
    .from("releases")
    .update({ is_published: next } as never)
    .eq("id" as never, id as never);

  if (error) {
    console.error("DAL Error [toggleReleasePublish]:", error.message);
    throw new Error("تعذر تغيير حالة نشر الإصدار: " + error.message);
  }

  return { is_published: next };
}
