import { createClient } from "@/lib/supabase/server";
import type { EventItem } from "@/lib/types/events";

export type Event = EventItem;
export type { EventItem };

/** Node 91:16747 — the standfirst the الفعاليات hero draws. */
export const DEFAULT_EVENTS_SUBTITLE =
  "كل فنان في أندلسيا يحمل قصة ومعاناة تحولت إلى موسيقى تلامس القلوب.";

const EVENT_COLUMNS =
  "id, title, slug, category, event_date, location, city, performer_name, artist_id, description, image_url, ticket_url, is_featured, status, is_published, display_order, created_at, updated_at";

/**
 * The five events الفعاليات draws, in the order the frame lists them (91:16793).
 *
 * That order is not chronological — ١٥ مارس, ٠٥ أبريل, ٢٨ مارس, ٢٨ مارس, ٢٠ أبريل —
 * and the offline path below returns this array as it stands, so the list renders
 * exactly as designed. The Supabase path still orders by event_date, which is the
 * right behaviour once real records exist.
 *
 * `city` carries the place string the design prints after the middle dot, country
 * and all ("بيروت — لبنان"), because that is the whole of what a row shows;
 * `location` stays the venue, which the design never draws but the admin edits.
 *
 * Every date is stamped at midday UTC so the day component cannot slide across a
 * timezone boundary between build and render.
 */
export const CANONICAL_UPCOMING_EVENTS: EventItem[] = [
  {
    id: "e1000000-0000-0000-0000-000000000001",
    title: "ليلة الطرب الأندلسي",
    slug: "laylat-al-tarab-al-andalusi",
    category: "concert",
    event_date: "2026-03-15T12:00:00.000Z",
    location: "مسرح المدينة — شارع الحمرا",
    city: "بيروت — لبنان",
    performer_name: "أحمد العود",
    description:
      "أمسية موسيقية استثنائية تستعيد أروع الموشحات والقصائد الأندلسية بمرافقة التخت الموسيقي الكامل.",
    image_url: "/assets/events/event-1.png",
    cover_image_url: "/assets/events/featured-cover.png",
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
    title: "أمسية العود والكلمة",
    slug: "oud-wa-kalima-evening",
    category: "evening",
    event_date: "2026-04-05T12:00:00.000Z",
    location: "دار الأوبرا المصرية — المسرح الصغير",
    city: "القاهرة — مصر",
    performer_name: "سارة الصوت",
    description:
      "حوار بين التقاسيم والقصيدة، حيث يرافق العود نصوصاً مختارة من الشعر العربي الحديث.",
    image_url: "/assets/events/event-2.png",
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
    title: "مهرجان الربيع الموسيقي",
    slug: "spring-music-festival",
    category: "festival",
    event_date: "2026-03-28T12:00:00.000Z",
    location: "ساحة محمد الخامس",
    city: "الدار البيضاء",
    performer_name: "فرقة أندلسيا",
    description:
      "ثلاثة أيام من العروض المفتوحة تجمع فناني أندلسيا وضيوفهم على مسرح واحد في الهواء الطلق.",
    image_url: "/assets/events/event-3.png",
    ticket_url: null,
    is_featured: false,
    status: "upcoming",
    is_published: true,
    display_order: 3,
    created_at: "2026-09-01T12:00:00.000Z",
    updated_at: "2026-09-01T12:00:00.000Z",
  },
  {
    id: "e1000000-0000-0000-0000-000000000004",
    title: "ورشة الإيقاع الشرقي",
    slug: "oriental-rhythm-workshop",
    category: "workshop",
    event_date: "2026-03-28T12:00:00.000Z",
    location: "مركز الحسين الثقافي",
    city: "عمان — الأردن",
    performer_name: "يوسف الإيقاع",
    description:
      "ورشة مكثفة في الأوزان الشرقية من المقسوم إلى السماعي الثقيل، بأدوات الفرقة نفسها.",
    image_url: "/assets/events/event-4.png",
    ticket_url: null,
    is_featured: false,
    status: "upcoming",
    is_published: true,
    display_order: 4,
    created_at: "2026-09-01T12:00:00.000Z",
    updated_at: "2026-09-01T12:00:00.000Z",
  },
  {
    id: "e1000000-0000-0000-0000-000000000005",
    title: "حفل الذكرى الخامسة",
    slug: "fifth-anniversary-concert",
    category: "concert",
    event_date: "2026-04-20T12:00:00.000Z",
    location: "دبي أوبرا — القاعة الرئيسية",
    city: "دبي — الإمارات",
    performer_name: "فرقة أندلسيا",
    description:
      "حفل الختام الذي تعيد فيه الفرقة أبرز ما قدمته في خمس سنوات، مع ضيوف من كل دورة.",
    image_url: "/assets/events/event-5.png",
    ticket_url: null,
    is_featured: false,
    status: "upcoming",
    is_published: true,
    display_order: 5,
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
