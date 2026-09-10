import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  /** Pending booking requests (status = 'pending') */
  pendingBookings: number;
  /** Total published artists */
  publishedArtists: number;
  /** Upcoming events (event_date >= today, is_published = true) */
  upcomingEvents: number;
  /** Total published articles */
  publishedArticles: number;
  /** Active newsletter subscribers (status = 'subscribed') */
  activeSubscribers: number;
}

const FALLBACK: DashboardStats = {
  pendingBookings: 0,
  publishedArtists: 0,
  upcomingEvents: 0,
  publishedArticles: 0,
  activeSubscribers: 0,
};

/**
 * Fetches dashboard metric counts for the admin overview panel.
 *
 * Uses the cookie-aware server client — caller must be an authenticated admin
 * (enforced by the admin layout, Layer 2). RLS enforces Layer 4 protection
 * on booking_requests and newsletter_subscribers (admin-only read).
 *
 * Returns safe zero fallback values when Supabase is unavailable
 * (e.g., during prerender / CI without live credentials).
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return FALLBACK;
  }

  try {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const [
      bookingRes,
      artistRes,
      eventRes,
      articleRes,
      subscriberRes,
    ] = await Promise.all([
      supabase
        .from("booking_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("artists")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true),
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .gte("event_date", today),
      supabase
        .from("articles")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .lte("published_at", new Date().toISOString()),
      supabase
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true })
        .eq("status", "subscribed"),
    ]);

    return {
      pendingBookings: bookingRes.count ?? 0,
      publishedArtists: artistRes.count ?? 0,
      upcomingEvents: eventRes.count ?? 0,
      publishedArticles: articleRes.count ?? 0,
      activeSubscribers: subscriberRes.count ?? 0,
    };
  } catch {
    return FALLBACK;
  }
}
