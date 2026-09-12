import type { Database } from "@/lib/supabase/types";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventCategory = "concert" | "festival" | "evening" | "workshop";
export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  category: EventCategory;
  event_date: string;
  location: string;
  city: string;
  performer_name: string;
  artist_id?: string | null;
  description?: string | null;
  image_url: string;
  /**
   * The featured panel (91:16914) draws a different photograph from the one the
   * event's own row draws — a 503x397 cover against a 140x105 thumbnail — so a
   * featured event carries both. There is no such column in Supabase yet, so it
   * stays optional and FeaturedEventBanner falls back to image_url without it.
   */
  cover_image_url?: string | null;
  ticket_url?: string | null;
  is_featured: boolean;
  status: EventStatus;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const CATEGORY_MAP: Record<EventCategory, string> = {
  concert: "حفلات",
  festival: "مهرجانات",
  evening: "أمسيات",
  workshop: "ورش",
};

export const CATEGORY_TABS = [
  { id: "all", label: "الكل" },
  { id: "concert", label: "حفلات" },
  { id: "festival", label: "مهرجانات" },
  { id: "evening", label: "أمسيات" },
  { id: "workshop", label: "ورش" },
] as const;

export type CategoryFilterId = (typeof CATEGORY_TABS)[number]["id"];
