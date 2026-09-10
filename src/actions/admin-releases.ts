"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth-guard";
import { releaseSchema } from "@/lib/validations/releases.ts";
import {
  createRelease,
  updateRelease,
  deleteRelease,
  toggleReleasePublish,
} from "@/lib/dal/admin-releases";
import type { ReleaseInput } from "@/lib/validations/releases.ts";

export interface ReleaseActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new release/album.
 */
export async function createReleaseAction(
  input: ReleaseInput
): Promise<ReleaseActionResult<{ id: string }>> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح بهذه العملية" };
  }

  const parsed = releaseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("، ") };
  }

  try {
    const result = await createRelease(parsed.data as never);
    revalidatePath("/admin/releases");
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "تعذر إنشاء الإصدار" };
  }
}

/**
 * Update an existing release by ID.
 */
export async function updateReleaseAction(
  id: string,
  input: Partial<ReleaseInput>
): Promise<ReleaseActionResult<void>> {
  if (!id) return { ok: false, error: "معرف الإصدار مطلوب" };

  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح بهذه العملية" };
  }

  const parsed = releaseSchema.omit({ id: true }).partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("، ") };
  }
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false, error: "لا توجد تغييرات للحفظ" };
  }

  try {
    await updateRelease(id, parsed.data as never);
    revalidatePath("/admin/releases");
    revalidatePath(`/admin/releases/${id}/edit`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "تعذر تحديث الإصدار" };
  }
}

/**
 * Delete a release by ID.
 */
export async function deleteReleaseAction(id: string): Promise<ReleaseActionResult<void>> {
  if (!id) return { ok: false, error: "معرف الإصدار مطلوب" };

  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح بهذه العملية" };
  }

  try {
    await deleteRelease(id);
    revalidatePath("/admin/releases");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "تعذر حذف الإصدار" };
  }
}

/**
 * Toggle the published state of a release.
 * @param id Release UUID
 * @param currentPublished Current is_published value
 */
export async function toggleReleasePublishAction(
  id: string,
  currentPublished: boolean
): Promise<ReleaseActionResult<{ is_published: boolean }>> {
  if (!id) return { ok: false, error: "معرف الإصدار مطلوب" };

  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح بهذه العملية" };
  }

  try {
    const result = await toggleReleasePublish(id, currentPublished);
    revalidatePath("/admin/releases");
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "تعذر تغيير حالة النشر" };
  }
}
