import type { Database } from "@/lib/supabase/types";

// ============================================================================
// Admin-Only Booking & Subscriber Types (Task 49)
// SECURITY: These types are for admin CMS use only. Never export from public
// routes or components. Booking data is private per SECURITY_MODEL.md.
// ============================================================================

export type BookingRequestRow =
  Database["public"]["Tables"]["booking_requests"]["Row"];

export type NewsletterSubscriberRow =
  Database["public"]["Tables"]["newsletter_subscribers"]["Row"];

/** Admin booking status enum — matches DB constraint */
export type AdminBookingStatus = "pending" | "contacted" | "confirmed" | "archived";

/** Admin subscriber status enum */
export type AdminSubscriberStatus = "subscribed" | "unsubscribed";

/** Filters for admin booking list queries */
export interface AdminBookingFilters {
  status?: AdminBookingStatus;
  search?: string;
  artist_id?: string;
  limit?: number;
  offset?: number;
}

/** Filters for admin subscriber list queries */
export interface AdminSubscriberFilters {
  status?: AdminSubscriberStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

/** Paginated result wrapper */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Status badge color mappings for UI */
export const BOOKING_STATUS_LABELS: Record<AdminBookingStatus, string> = {
  pending: "قيد الانتظار",
  contacted: "تم التواصل",
  confirmed: "مؤكد",
  archived: "مؤرشف",
};

export const BOOKING_STATUS_COLORS: Record<AdminBookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  contacted: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-700",
};

export const SUBSCRIBER_STATUS_LABELS: Record<AdminSubscriberStatus, string> = {
  subscribed: "مشترك",
  unsubscribed: "غير مشترك",
};

export const SUBSCRIBER_STATUS_COLORS: Record<AdminSubscriberStatus, string> = {
  subscribed: "bg-green-100 text-green-800",
  unsubscribed: "bg-gray-100 text-gray-700",
};

/** Event type display labels */
export const BOOKING_EVENT_TYPE_LABELS: Record<string, string> = {
  private_concert: "حفلة خاصة",
  wedding: "حفل زفاف",
  festival: "مهرجان",
  hotel: "فندق",
  other: "أخرى",
};
