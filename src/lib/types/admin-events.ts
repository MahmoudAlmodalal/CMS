// Task 46 — Events CMS Admin Types
// NOTE: Events do NOT have public detail pages (/events/[slug]).
// The booking flow links to /booking?event_id=... instead.

import type { Database } from "@/lib/supabase/types";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

export type EventCategory = "concert" | "festival" | "evening" | "workshop";
export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

/** Full admin event record (all fields, including drafts) */
export interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  category: EventCategory;
  event_date: string;
  location: string;
  city: string;
  performer_name: string;
  artist_id: string | null;
  description: string | null;
  /** Optional English translations; null falls back to the Arabic field. */
  title_en: string | null;
  location_en: string | null;
  city_en: string | null;
  performer_name_en: string | null;
  description_en: string | null;
  image_url: string;
  ticket_url: string | null;
  is_featured: boolean;
  status: EventStatus;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  concert: "حفلات",
  festival: "مهرجانات",
  evening: "أمسيات",
  workshop: "ورش",
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: "قادم",
  ongoing: "جارٍ",
  completed: "منتهٍ",
  cancelled: "ملغى",
};

export const EVENT_CATEGORIES: EventCategory[] = [
  "concert",
  "festival",
  "evening",
  "workshop",
];

export const EVENT_STATUSES: EventStatus[] = [
  "upcoming",
  "ongoing",
  "completed",
  "cancelled",
];

/** Filters for admin listing */
export interface AdminEventFilters {
  category?: EventCategory;
  is_published?: boolean;
  upcoming_only?: boolean;
}
