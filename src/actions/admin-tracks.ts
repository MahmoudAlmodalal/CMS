"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth-guard";
import { trackSchema } from "@/lib/validations/tracks.ts";
import {
  createTrack,
  updateTrack,
  deleteTrack,
  toggleTrackPublish,
} from "@/lib/dal/admin-tracks";
import type { TrackInput } from "@/lib/validations/tracks.ts";

export interface TrackActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new track.
 * audio_file_url is required (30 MB limit enforced at storage layer — Task 50).
 */
export async function createTrackAction(
  input: TrackInput
): Promise<TrackActionResult<{ id: string }>> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح بهذه العملية" };
  }

  const parsed = trackSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("، ") };
  }

  try {
    const result = await createTrack(parsed.data as never);
    revalidatePath("/admin/tracks");
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "تعذر إنشاء المقطوعة" };
  }
}

/**
 * Update an existing track by ID.
 */
export async function updateTrackAction(
  id: string,
  input: Partial<TrackInput>
): Promise<TrackActionResult<void>> {
  if (!id) return { ok: false, error: "معرف المقطوعة مطلوب" };

  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح بهذه العملية" };
  }

  const parsed = trackSchema.omit({ id: true }).partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("، ") };
  }
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false, error: "لا توجد تغييرات للحفظ" };
  }

  try {
    await updateTrack(id, parsed.data as never);
    revalidatePath("/admin/tracks");
    revalidatePath(`/admin/tracks/${id}/edit`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "تعذر تحديث المقطوعة" };
  }
}

/**
 * Delete a track by ID.
 */
export async function deleteTrackAction(id: string): Promise<TrackActionResult<void>> {
  if (!id) return { ok: false, error: "معرف المقطوعة مطلوب" };

  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح بهذه العملية" };
  }

  try {
    await deleteTrack(id);
    revalidatePath("/admin/tracks");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "تعذر حذف المقطوعة" };
  }
}

/**
 * Toggle the published state of a track.
 * @param id Track UUID
 * @param currentPublished Current is_published value
 */
export async function toggleTrackPublishAction(
  id: string,
  currentPublished: boolean
): Promise<TrackActionResult<{ is_published: boolean }>> {
  if (!id) return { ok: false, error: "معرف المقطوعة مطلوب" };

  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح بهذه العملية" };
  }

  try {
    const result = await toggleTrackPublish(id, currentPublished);
    revalidatePath("/admin/tracks");
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "تعذر تغيير حالة النشر" };
  }
}
