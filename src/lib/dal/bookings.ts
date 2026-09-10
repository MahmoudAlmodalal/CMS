import { requireAdminSession, type AuthContext } from "@/lib/auth-guard";
import type { Database } from "@/lib/supabase/types";

export type BookingRequestRow = Database["public"]["Tables"]["booking_requests"]["Row"];
export type NewsletterSubscriberRow = Database["public"]["Tables"]["newsletter_subscribers"]["Row"];

export interface BookingFilters {
  status?: "pending" | "contacted" | "confirmed" | "archived";
  limit?: number;
  offset?: number;
}

export interface SubscriberFilters {
  status?: "subscribed" | "unsubscribed";
  limit?: number;
  offset?: number;
}

/**
 * Data Access Layer: Administrative retrieval of booking requests.
 *
 * Security Invariants:
 * - Layer 3 Defense: Enforces requireAdminSession(). Direct unauthenticated/non-admin
 *   calls are rejected with UNAUTHORIZED_ADMIN_ACTION.
 * - Layer 4 Defense: PostgREST RLS blocks anonymous access (booking_requests_select_anon_block).
 */
export async function getAdminBookingRequests(
  filters?: BookingFilters,
  ctx?: AuthContext
): Promise<BookingRequestRow[]> {
  const { supabase } = await requireAdminSession(ctx);
  if (!supabase) return [];

  let query = supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[DAL Error getAdminBookingRequests]:", error.message);
    return [];
  }
  return data || [];
}

/**
 * Administrative retrieval of a single booking request by UUID.
 */
export async function getAdminBookingRequestById(
  id: string,
  ctx?: AuthContext
): Promise<BookingRequestRow | null> {
  const { supabase } = await requireAdminSession(ctx);
  if (!id || !supabase) return null;

  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[DAL Error getAdminBookingRequestById]:", error.message);
    return null;
  }
  return data || null;
}

/**
 * Administrative retrieval of newsletter subscribers.
 */
export async function getAdminNewsletterSubscribers(
  filters?: SubscriberFilters,
  ctx?: AuthContext
): Promise<NewsletterSubscriberRow[]> {
  const { supabase } = await requireAdminSession(ctx);
  if (!supabase) return [];

  let query = supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[DAL Error getAdminNewsletterSubscribers]:", error.message);
    return [];
  }
  return data || [];
}
