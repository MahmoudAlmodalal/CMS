/**
 * Admin DAL for Testimonials (Task 48, rebuilt).
 *
 * Real schema (supabase/migrations/20260910000800_create_testimonials.sql):
 *   id, quote, author_name, author_role, avatar_image_url (nullable), display_order,
 *   is_published, created_at. No published_at column — publication is a plain boolean.
 *
 * Read operations use createClient() (anon/session key, subject to RLS).
 * Write operations use createAdminClient() (service_role, bypasses RLS).
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/auth-guard";
import type { TestimonialInput } from "@/lib/validations/cms";

export interface AdminTestimonial {
  id: string;
  quote: string;
  author_name: string;
  author_role: string;
  /** Optional English translations; null falls back to the Arabic field. */
  quote_en: string | null;
  author_name_en: string | null;
  author_role_en: string | null;
  avatar_image_url: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
}

const TESTIMONIAL_COLUMNS =
  "id, quote, author_name, author_role, avatar_image_url, display_order, is_published, created_at, " +
  "quote_en, author_name_en, author_role_en";

// ============================================================================
// READ
// ============================================================================

export async function getAdminTestimonials(): Promise<AdminTestimonial[]> {
  await requireAdminSession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select(TESTIMONIAL_COLUMNS)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("DAL Error [getAdminTestimonials]:", error.message);
    throw new Error("تعذر تحميل قائمة آراء الجمهور");
  }

  return (data as unknown as AdminTestimonial[]) || [];
}

export async function getAdminTestimonialById(id: string): Promise<AdminTestimonial | null> {
  await requireAdminSession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select(TESTIMONIAL_COLUMNS)
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

export async function createTestimonial(data: TestimonialInput): Promise<{ id: string }> {
  const adminClient = createAdminClient();

  const payload = { ...data, avatar_image_url: data.avatar_image_url || null };

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

export async function updateTestimonial(id: string, data: Partial<TestimonialInput>): Promise<void> {
  const adminClient = createAdminClient();

  const payload: Record<string, unknown> = { ...data };
  if (data.avatar_image_url !== undefined) {
    payload.avatar_image_url = data.avatar_image_url || null;
  }

  const { error } = await adminClient.from("testimonials").update(payload as never).eq("id", id);

  if (error) {
    console.error("DAL Error [updateTestimonial]:", error.message);
    throw new Error(error.message || "تعذر تحديث الشهادة");
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  const adminClient = createAdminClient();

  const { error } = await adminClient.from("testimonials").delete().eq("id", id);

  if (error) {
    console.error("DAL Error [deleteTestimonial]:", error.message);
    throw new Error(error.message || "تعذر حذف الشهادة");
  }
}
