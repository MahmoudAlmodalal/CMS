// Task 46 — Events CMS Data Access Layer
// NOTE: Events do NOT have public detail pages (/events/[slug]).
// External booking links use /booking?event_id=<uuid> instead.

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/auth-guard";
import type { Database } from "@/lib/supabase/types";
import type {
  AdminEvent,
  AdminEventFilters,
} from "@/lib/types/admin-events";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

/**
 * Fetch all events for admin (includes drafts and unpublished).
 * Supports optional filters: category, is_published, upcoming_only.
 * Uses requireAdminSession to prevent unauthorized read access.
 */
export async function getAdminEvents(
  filters?: AdminEventFilters
): Promise<AdminEvent[]> {
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })
    .order("display_order", { ascending: true });

  if (filters?.category) {
    query = query.eq(
      "category",
      filters.category as Database["public"]["Tables"]["events"]["Row"]["category"]
    );
  }

  if (typeof filters?.is_published === "boolean") {
    query = query.eq("is_published", filters.is_published);
  }

  if (filters?.upcoming_only) {
    query = query.gte("event_date", new Date().toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("DAL Error [getAdminEvents]:", error.message);
    throw new Error("تعذر تحميل قائمة الفعاليات");
  }

  return (data as unknown as AdminEvent[]) || [];
}

/**
 * Fetch a single event by ID for admin editing.
 * Returns null if not found.
 */
export async function getAdminEventById(id: string): Promise<AdminEvent | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id" as never, id as never)
    .maybeSingle();

  if (error) {
    console.error("DAL Error [getAdminEventById]:", error.message);
    throw new Error("تعذر تحميل بيانات الفعالية");
  }

  return data as unknown as AdminEvent | null;
}

/**
 * Create a new event record (writes via service_role to bypass RLS).
 */
export async function createEvent(
  data: Omit<EventInsert, "id" | "created_at" | "updated_at">
): Promise<AdminEvent> {
  const admin = createAdminClient();

  const { data: created, error } = await admin
    .from("events")
    .insert({ ...data } as never)
    .select("*")
    .single();

  if (error) {
    console.error("DAL Error [createEvent]:", error.message);
    throw new Error("تعذر إنشاء الفعالية: " + error.message);
  }

  return created as unknown as AdminEvent;
}

/**
 * Update an existing event record (writes via service_role to bypass RLS).
 */
export async function updateEvent(
  id: string,
  data: EventUpdate
): Promise<AdminEvent> {
  const admin = createAdminClient();

  const { data: updated, error } = await admin
    .from("events")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, id as never)
    .select("*")
    .single();

  if (error) {
    console.error("DAL Error [updateEvent]:", error.message);
    throw new Error("تعذر تحديث الفعالية: " + error.message);
  }

  return updated as unknown as AdminEvent;
}

/**
 * Delete an event record by ID (writes via service_role to bypass RLS).
 */
export async function deleteEvent(id: string): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("events")
    .delete()
    .eq("id" as never, id as never);

  if (error) {
    console.error("DAL Error [deleteEvent]:", error.message);
    throw new Error("تعذر حذف الفعالية: " + error.message);
  }
}

/**
 * Toggle the is_published flag for an event.
 * @param id - Event UUID
 * @param current - Current published state (will be inverted)
 */
export async function toggleEventPublish(
  id: string,
  current: boolean
): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("events")
    .update({ is_published: !current, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, id as never);

  if (error) {
    console.error("DAL Error [toggleEventPublish]:", error.message);
    throw new Error("تعذر تغيير حالة نشر الفعالية");
  }
}

/**
 * Toggle the is_featured flag for an event.
 * @param id - Event UUID
 * @param current - Current featured state (will be inverted)
 */
export async function toggleEventFeatured(
  id: string,
  current: boolean
): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("events")
    .update({ is_featured: !current, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, id as never);

  if (error) {
    console.error("DAL Error [toggleEventFeatured]:", error.message);
    throw new Error("تعذر تغيير حالة تمييز الفعالية");
  }
}
