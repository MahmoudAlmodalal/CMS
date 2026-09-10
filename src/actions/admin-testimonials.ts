'use server';

import 'server-only';
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth-guard";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialPublish,
} from "@/lib/dal/admin-testimonials";
import { testimonialSchema, type TestimonialInput } from "@/lib/validations/testimonials";

export interface TestimonialActionResult {
  ok: boolean;
  data?: { id: string };
  error?: string;
}

// ============================================================================
// Create
// ============================================================================

/**
 * Create a new testimonial server action.
 */
export async function createTestimonialAction(
  input: TestimonialInput
): Promise<TestimonialActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح" };
  }

  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join("، "),
    };
  }

  try {
    const result = await createTestimonial(parsed.data);
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { ok: true, data: result };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "تعذر إضافة الشهادة",
    };
  }
}

// ============================================================================
// Update
// ============================================================================

/**
 * Update an existing testimonial server action.
 */
export async function updateTestimonialAction(
  id: string,
  input: Partial<TestimonialInput>
): Promise<TestimonialActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح" };
  }

  const parsed = testimonialSchema.partial().safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join("، "),
    };
  }

  try {
    await updateTestimonial(id, parsed.data);
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "تعذر تحديث الشهادة",
    };
  }
}

// ============================================================================
// Delete
// ============================================================================

/**
 * Delete a testimonial server action.
 */
export async function deleteTestimonialAction(
  id: string
): Promise<TestimonialActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح" };
  }

  try {
    await deleteTestimonial(id);
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "تعذر حذف الشهادة",
    };
  }
}

// ============================================================================
// Toggle Publish
// ============================================================================

/**
 * Toggle the published state of a testimonial.
 * @param id - testimonial ID
 * @param current - current is_published value (will be flipped)
 */
export async function toggleTestimonialPublishAction(
  id: string,
  current: boolean
): Promise<TestimonialActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "غير مصرح" };
  }

  try {
    await toggleTestimonialPublish(id, current);
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "تعذر تغيير حالة النشر",
    };
  }
}
