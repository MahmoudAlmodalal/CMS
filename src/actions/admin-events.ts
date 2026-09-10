"use server";

// Task 46 — Events CMS Server Actions
// NOTE: Events do NOT have public detail pages.
// Booking links use /booking?event_id=<uuid> format.

import "server-only";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { eventSchema } from "@/lib/validations/events";
import type { EventFormInput } from "@/lib/validations/events";

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new event.
 * Validates input via eventSchema, writes via service_role client.
 */
export async function createEventAction(
  input: Partial<EventFormInput>
): Promise<ActionResult<{ id: string }>> {
  await requireAdminSession();

  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join("، "),
    };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("events")
      .insert(parsed.data as never)
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };

    try {
      revalidatePath("/events");
      revalidatePath("/admin/events");
    } catch {
      // ignore revalidation errors in test environments
    }

    return { ok: true, data: { id: (data as { id: string }).id } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "خطأ غير متوقع";
    return { ok: false, error: msg };
  }
}

/**
 * Update an existing event by ID.
 * Validates partial input via eventSchema, writes via service_role client.
 */
export async function updateEventAction(
  id: string,
  input: Partial<EventFormInput>
): Promise<ActionResult<void>> {
  await requireAdminSession();

  if (!id) return { ok: false, error: "معرف الفعالية مطلوب" };

  const parsed = eventSchema.omit({ id: true }).partial().safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join("، "),
    };
  }
  if (Object.keys(parsed.data).length === 0) {
    return { ok: false, error: "لا توجد تغييرات للحفظ" };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("events")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id" as never, id as never);

    if (error) return { ok: false, error: error.message };

    try {
      revalidatePath("/events");
      revalidatePath("/admin/events");
    } catch {
      // ignore revalidation errors in test environments
    }

    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "خطأ غير متوقع";
    return { ok: false, error: msg };
  }
}

/**
 * Delete an event by ID.
 * Irreversible — requires admin session.
 */
export async function deleteEventAction(
  id: string
): Promise<ActionResult<void>> {
  await requireAdminSession();

  if (!id) return { ok: false, error: "معرف الفعالية مطلوب" };

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("events")
      .delete()
      .eq("id" as never, id as never);

    if (error) return { ok: false, error: error.message };

    try {
      revalidatePath("/events");
      revalidatePath("/admin/events");
    } catch {
      // ignore revalidation errors in test environments
    }

    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "خطأ غير متوقع";
    return { ok: false, error: msg };
  }
}

/**
 * Toggle the is_published status for an event.
 * @param id - Event UUID
 * @param current - Current published value (will be negated)
 */
export async function togglePublishAction(
  id: string,
  current: boolean
): Promise<ActionResult<void>> {
  await requireAdminSession();

  if (!id) return { ok: false, error: "معرف الفعالية مطلوب" };

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("events")
      .update({
        is_published: !current,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id" as never, id as never);

    if (error) return { ok: false, error: error.message };

    try {
      revalidatePath("/events");
      revalidatePath("/admin/events");
    } catch {
      // ignore revalidation errors in test environments
    }

    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "خطأ غير متوقع";
    return { ok: false, error: msg };
  }
}

/**
 * Toggle the is_featured status for an event.
 * @param id - Event UUID
 * @param current - Current featured value (will be negated)
 */
export async function toggleFeaturedAction(
  id: string,
  current: boolean
): Promise<ActionResult<void>> {
  await requireAdminSession();

  if (!id) return { ok: false, error: "معرف الفعالية مطلوب" };

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("events")
      .update({
        is_featured: !current,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id" as never, id as never);

    if (error) return { ok: false, error: error.message };

    try {
      revalidatePath("/events");
      revalidatePath("/admin/events");
    } catch {
      // ignore revalidation errors in test environments
    }

    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "خطأ غير متوقع";
    return { ok: false, error: msg };
  }
}
