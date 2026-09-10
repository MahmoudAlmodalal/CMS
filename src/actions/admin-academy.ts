"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth-guard";
import { courseSchema, type CourseInput } from "@/lib/validations/academy";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCoursePublish,
} from "@/lib/dal/admin-academy";

export interface AcademyActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

// Revalidate all relevant paths after any mutation
function revalidateAcademy() {
  revalidatePath("/academy");
  revalidatePath("/admin/academy");
}

/**
 * Create a new academy course (admin only).
 */
export async function createCourseAction(
  input: CourseInput
): Promise<AcademyActionResult<{ id: string }>> {
  try {
    await requireAdminSession();
    const parsed = courseSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues.map((i) => i.message).join("، "),
      };
    }
    const result = await createCourse(parsed.data);
    revalidateAcademy();
    return { ok: true, data: result };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    return { ok: false, error: message };
  }
}

/**
 * Update an existing academy course (admin only).
 */
export async function updateCourseAction(
  id: string,
  input: Partial<CourseInput>
): Promise<AcademyActionResult> {
  try {
    await requireAdminSession();
    const parsed = courseSchema.partial().safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues.map((i) => i.message).join("، "),
      };
    }
    await updateCourse(id, parsed.data);
    revalidateAcademy();
    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    return { ok: false, error: message };
  }
}

/**
 * Delete an academy course (admin only).
 */
export async function deleteCourseAction(
  id: string
): Promise<AcademyActionResult> {
  try {
    await requireAdminSession();
    if (!id) return { ok: false, error: "معرّف الدورة مطلوب" };
    await deleteCourse(id);
    revalidateAcademy();
    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    return { ok: false, error: message };
  }
}

/**
 * Toggle publish status of an academy course (admin only).
 */
export async function togglePublishAction(
  id: string,
  current: boolean
): Promise<AcademyActionResult> {
  try {
    await requireAdminSession();
    if (!id) return { ok: false, error: "معرّف الدورة مطلوب" };
    await toggleCoursePublish(id, current);
    revalidateAcademy();
    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    return { ok: false, error: message };
  }
}
