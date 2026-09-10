/**
 * Admin DAL for Testimonials (Task 48).
 *
 * Read operations use createClient() (anon/session key, subject to RLS).
 * Write operations use createAdminClient() (service_role, bypasses RLS).
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/auth-guard";
import type { AdminTestimonial } from "@/lib/types/admin-articles";
import type { TestimonialInput } from "@/lib/validations/testimonials";

export type { AdminTestimonial };

// ============================================================================
// READ
// ============================================================================

/**
 * Fetch all testimonials for the admin panel (published and unpublished).
 * Ordered by ordering ASC, then created_at DESC.
 */
export async function getAdminTestimonials(): Promise<AdminTestimonial[]> {
  await requireAdminSession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select("id, quote_ar, author_name_ar, author_role_ar, avatar_url, is_published, ordering, created_at")
    .order("ordering", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("DAL Error [getAdminTestimonials]:", error.message);
    throw new Error("تعذر تحميل قائمة آراء الجمهور");
  }

  return (data as unknown as AdminTestimonial[]) || [];
}

/**
 * Fetch a single testimonial by ID for the admin panel.
 */
export async function getAdminTestimonialById(id: string): Promise<AdminTestimonial | null> {
  await requireAdminSession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select("id, quote_ar, author_name_ar, author_role_ar, avatar_url, is_published, ordering, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("DAL Error [getAdminTestimonialById]:", error.message);
    throw new Error("تعذر تحميل بيانات الشهادة");
  }

  return data as unknown as AdminTestimonial | null;
}

// ============================================================================
// WRITE — all use createAdminClient() (service_role)
// ============================================================================

/**
 * Create a new testimonial.
 */
export async function createTestimonial(
  data: TestimonialInput
): Promise<{ id: string }> {
  const adminClient = createAdminClient();

  const payload = {
    ...data,
    author_role_ar: data.author_role_ar || null,
    avatar_url: data.avatar_url || null,
  };

  const { data: row, error } = await adminClient
    .from("testimonials")
    .insert(payload as never)
    .select("id")
    .single();

  if (error) {
    console.error("DAL Error [createTestimonial]:", error.message);
    throw new Error(error.message || "تعذر إضافة الشهادة");
  }

  return { id: (row as unknown as { id: string }).id };
}

/**
 * Update an existing testimonial by ID.
 */
export async function updateTestimonial(
  id: string,
  data: Partial<TestimonialInput>
): Promise<void> {
  const adminClient = createAdminClient();

  const payload: Record<string, unknown> = { ...data };
  if (data.author_role_ar !== undefined) {
    payload.author_role_ar = data.author_role_ar || null;
  }
  if (data.avatar_url !== undefined) {
    payload.avatar_url = data.avatar_url || null;
  }

  const { error } = await adminClient
    .from("testimonials")
    .update(payload as never)
    .eq("id", id);

  if (error) {
    console.error("DAL Error [updateTestimonial]:", error.message);
    throw new Error(error.message || "تعذر تحديث الشهادة");
  }
}

/**
 * Delete a testimonial by ID.
 */
export async function deleteTestimonial(id: string): Promise<void> {
  const adminClient = createAdminClient();

  const { error } = await adminClient.from("testimonials").delete().eq("id", id);

  if (error) {
    console.error("DAL Error [deleteTestimonial]:", error.message);
    throw new Error(error.message || "تعذر حذف الشهادة");
  }
}

/**
 * Toggle the is_published flag of a testimonial.
 * Pass the current is_published value; the function will flip it.
 */
export async function toggleTestimonialPublish(
  id: string,
  current: boolean
): Promise<void> {
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("testimonials")
    .update({ is_published: !current } as never)
    .eq("id", id);

  if (error) {
    console.error("DAL Error [toggleTestimonialPublish]:", error.message);
    throw new Error(error.message || "تعذر تغيير حالة النشر");
  }
}
