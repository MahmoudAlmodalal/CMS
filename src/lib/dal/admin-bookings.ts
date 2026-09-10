import "server-only";
import { requireAdminSession } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  BookingRequestRow,
  AdminBookingFilters,
} from "@/lib/types/admin-bookings";

// ============================================================================
// Admin-Only Booking DAL (Task 49)
//
// SECURITY CRITICAL:
// - All functions call requireAdminSession() / use service_role for mutations
// - No function is named getBookings or getPublicBookings (no public exposure)
// - Never export from public routes, public components, or public layouts
// - createAdminClient() bypasses RLS for privileged reads/writes
// ============================================================================

/**
 * Retrieve paginated admin booking requests with optional filters.
 * Reads use requireAdminSession + server client; only admin role can access.
 *
 * PRIVATE: NEVER expose this via public routes or components.
 */
export async function getAdminBookings(
  filters?: AdminBookingFilters
): Promise<BookingRequestRow[]> {
  // Layer 3 Defense: Assert admin session before any DB access
  await requireAdminSession();

  const adminClient = createAdminClient();

  let query = adminClient
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.search) {
    const term = filters.search.trim();
    if (term) {
      query = query.or(
        `full_name.ilike.%${term}%,email.ilike.%${term}%`
      );
    }
  }

  if (filters?.artist_id) {
    query = query.eq("artist_id", filters.artist_id);
  }

  const pageSize = filters?.limit ?? 50;
  query = query.limit(pageSize);

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + pageSize - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[admin-bookings DAL] getAdminBookings error:", error.message);
    return [];
  }

  return (data as BookingRequestRow[]) ?? [];
}

/**
 * Retrieve a single booking request by ID (admin-only).
 * Returns null if not found or on error.
 *
 * PRIVATE: NEVER expose this via public routes or components.
 */
export async function getAdminBookingById(
  id: string
): Promise<BookingRequestRow | null> {
  // Layer 3 Defense
  await requireAdminSession();

  if (!id) return null;

  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("booking_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[admin-bookings DAL] getAdminBookingById error:", error.message);
    return null;
  }

  return (data as BookingRequestRow | null) ?? null;
}

/**
 * Update booking status and optional admin notes.
 * Status transitions: pending → contacted | confirmed | archived
 * Uses service_role client for write operations.
 *
 * PRIVATE: NEVER expose this via public routes or components.
 */
export async function updateBookingStatus(
  id: string,
  status: "pending" | "contacted" | "confirmed" | "archived",
  admin_notes?: string | null
): Promise<{ ok: boolean; error?: string }> {
  // Layer 3 Defense
  await requireAdminSession();

  if (!id) return { ok: false, error: "معرف طلب الحجز مطلوب" };

  const adminClient = createAdminClient();

  const payload: Record<string, unknown> = { status };
  if (admin_notes !== undefined) {
    payload.admin_notes = admin_notes;
  }

  const { error } = await adminClient
    .from("booking_requests")
    .update(payload as never)
    .eq("id", id as never);

  if (error) {
    console.error("[admin-bookings DAL] updateBookingStatus error:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/**
 * Hard-delete a booking request by ID.
 * GDPR-ready: permanently erases PII (full_name, email, phone, message).
 * Log the deletion event at the application layer before calling this if audit is needed.
 *
 * PRIVATE: NEVER expose this via public routes or components.
 */
export async function deleteBooking(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  // Layer 3 Defense
  await requireAdminSession();

  if (!id) return { ok: false, error: "معرف طلب الحجز مطلوب" };

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("booking_requests")
    .delete()
    .eq("id", id as never);

  if (error) {
    console.error("[admin-bookings DAL] deleteBooking error:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
