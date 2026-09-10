import { createClient } from "@/lib/supabase/server";
import type { EventItem } from "@/lib/types/events";

export type Event = EventItem;
export type { EventItem };

export const DEFAULT_EVENTS_SUBTITLE =
  "كل فنان في أندلسيا يحمل قصة ومعاناة، وكل عرض هو مساحة حية لتوثيق هذا الإبداع ومشاركته مع الجمهور.";

const EVENT_COLUMNS =
  "id, title, slug, category, event_date, location, city, performer_name, artist_id, description, image_url, ticket_url, is_featured, status, is_published, display_order, created_at, updated_at";

export const CANONICAL_UPCOMING_EVENTS: EventItem[] = [
  {
    id: "e1000000-0000-0000-0000-000000000001",
    title: "ليلة الطرب الأندلسي والموشحات الخالدة",
    slug: "laylat-al-tarab-al-andalusi",
    category: "concert",
    event_date: "2026-10-15T20:00:00.000Z",
    location: "مسرح المدينة — شارع الحمرا",
    city: "بيروت",
    performer_name: "فرقة أندلسيا مع سارة الصوت",
    description: "أمسية موسيقية استثنائية تستعيد أروع الموشحات والقصائد الأندلسية بمرافقة التخت الموسيقي الكامل.",
    image_url: "/assets/events/event-beirut.webp",
    ticket_url: null,
    is_featured: true,
    status: "upcoming",
    is_published: true,
    display_order: 1,
    created_at: "2026-09-01T12:00:00.000Z",
    updated_at: "2026-09-01T12:00:00.000Z",
  },
  {
    id: "e1000000-0000-0000-0000-000000000002",
    title: "أمسية تقاسيم العود وسحر المقامات",
    slug: "oud-maqamat-evening",
    category: "evening",
    event_date: "2026-11-02T19:30:00.000Z",
    location: "المسرح الوطني محمد الخامس",
    city: "الرباط",
    performer_name: "طارق العود ومجموعة التراث",
    description: "رحلة صوفية موسيقية في مقامات البياتي والراست والحجاز برؤية معاصرة وأداء نقي.",
    image_url: "/assets/events/event-rabat.webp",
    ticket_url: null,
    is_featured: false,
    status: "upcoming",
    is_published: true,
    display_order: 2,
    created_at: "2026-09-01T12:00:00.000Z",
    updated_at: "2026-09-01T12:00:00.000Z",
  },
  {
    id: "e1000000-0000-0000-0000-000000000003",
    title: "مهرجان التراث الموسيقي المعاصر — الدورة الرابعة",
    slug: "contemporary-heritage-festival",
    category: "festival",
    event_date: "2026-11-20T18:00:00.000Z",
    location: "دار الأوبرا — القاعة الرئيسية",
    city: "دبي",
    performer_name: "كافة فناني وأساتذة فرقة أندلسيا",
    description: "تظاهرة ثقافية كبرى تجمع نخبة من رواد الموسيقى الأندلسية والشرقية على مدار ثلاثة أيام.",
    image_url: "/assets/events/event-dubai.webp",
    ticket_url: null,
    is_featured: true,
    status: "upcoming",
    is_published: true,
    display_order: 3,
    created_at: "2026-09-01T12:00:00.000Z",
    updated_at: "2026-09-01T12:00:00.000Z",
  },
];

/**
 * Fetch upcoming published events for the homepage.
 * Queries is_published = true AND event_date >= now(), ordered by event_date ASC.
 */
export async function getUpcomingEvents(limit = 3): Promise<EventItem[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return CANONICAL_UPCOMING_EVENTS.slice(0, limit);
    }

    const supabase = await createClient();
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .eq("is_published", true)
      .gte("event_date", nowIso)
      .order("event_date", { ascending: true })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return CANONICAL_UPCOMING_EVENTS.slice(0, limit);
    }

    return data as unknown as EventItem[];
  } catch {
    return CANONICAL_UPCOMING_EVENTS.slice(0, limit);
  }
}

/**
 * Data Access Layer for Andalusia Events Catalog
 * Encapsulates PostgREST queries with safe fallbacks and explicit column selection.
 */
export async function getPublishedEvents(category?: string): Promise<EventItem[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return CANONICAL_UPCOMING_EVENTS;
    }

    const supabase = await createClient();
    let query = supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .eq("is_published", true)
      .order("event_date", { ascending: true });

    if (category && category !== "all") {
      query = query.eq("category", category as EventItem["category"]);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[DAL Error getPublishedEvents]:", error.message);
      return CANONICAL_UPCOMING_EVENTS;
    }

    return (data as unknown as EventItem[]) || CANONICAL_UPCOMING_EVENTS;
  } catch (err: unknown) {
    console.warn("[DAL Warning getPublishedEvents]:", err instanceof Error ? err.message : String(err));
    return CANONICAL_UPCOMING_EVENTS;
  }
}

/**
 * Fetches the pinned/featured event for the hero banner on /events
 */
export async function getFeaturedEvent(): Promise<EventItem | null> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return CANONICAL_UPCOMING_EVENTS[0] || null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("event_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[DAL Error getFeaturedEvent]:", error.message);
      return CANONICAL_UPCOMING_EVENTS[0] || null;
    }

    return (data as unknown as EventItem) || CANONICAL_UPCOMING_EVENTS[0] || null;
  } catch (err: unknown) {
    console.warn("[DAL Warning getFeaturedEvent]:", err instanceof Error ? err.message : String(err));
    return CANONICAL_UPCOMING_EVENTS[0] || null;
  }
}

/**
 * Fetches the configurable events page subtitle from site_settings singleton
 */
export async function getEventsSubtitle(): Promise<string> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return DEFAULT_EVENTS_SUBTITLE;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("events_subtitle")
      .eq("id", "default")
      .maybeSingle();

    const subtitle = (data as { events_subtitle?: string | null } | null)?.events_subtitle;
    if (error || !subtitle) {
      return DEFAULT_EVENTS_SUBTITLE;
    }

    return subtitle;
  } catch {
    return DEFAULT_EVENTS_SUBTITLE;
  }
}
