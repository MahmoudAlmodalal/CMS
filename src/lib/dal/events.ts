import { createClient } from "@/lib/supabase/server";
import { pagination } from "@/lib/pagination";
import { USE_DEMO_CONTENT } from "@/lib/demo-content";
import { getContentLocale, localizeContent, localizeContentList } from "./localize";
import { pickLocalized } from "@/lib/utils";
import type { EventItem } from "@/lib/types/events";

export type Event = EventItem;
export type { EventItem };

export const DEFAULT_EVENTS_SUBTITLE =
  "كل فنان في أندلسيا يحمل قصة ومعاناة، وكل عرض هو مساحة حية لتوثيق هذا الإبداع ومشاركته مع الجمهور.";
export const DEFAULT_EVENTS_SUBTITLE_EN =
  "Dates that leave a beautiful mark on anyone who loves music with roots.";

const EVENT_COLUMNS =
  "id, title, title_en, slug, category, event_date, location, location_en, city, city_en, performer_name, performer_name_en, artist_id, description, description_en, image_url, ticket_url, is_featured, status, is_published, display_order, created_at, updated_at";

function isJwtClockError(error: { message?: string } | null | undefined): boolean {
  return error?.message?.toLowerCase().includes("jwt issued at future") ?? false;
}

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
    image_url: "/assets/events/event-1.png",
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
    title: "مهرجان التراث الموسيقي المعاصر — الدورة الرابعة",
    slug: "contemporary-heritage-festival",
    category: "festival",
    event_date: "2026-11-20T18:00:00.000Z",
    location: "دار الأوبرا — القاعة الرئيسية",
    city: "دبي",
    performer_name: "كافة فناني وأساتذة فرقة أندلسيا",
    description: "تظاهرة ثقافية كبرى تجمع نخبة من رواد الموسيقى الأندلسية والشرقية على مدار ثلاثة أيام.",
    image_url: "/assets/events/event-3.png",
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
    if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      return localizeContentList("events", CANONICAL_UPCOMING_EVENTS.slice(0, limit));
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

    if (error) {
      return localizeContentList("events", USE_DEMO_CONTENT ? CANONICAL_UPCOMING_EVENTS.slice(0, limit) : []);
    }

    return localizeContentList("events", (data as unknown as EventItem[]) || []);
  } catch {
    return localizeContentList("events", USE_DEMO_CONTENT ? CANONICAL_UPCOMING_EVENTS.slice(0, limit) : []);
  }
}

/**
 * Data Access Layer for Andalusia Events Catalog
 * Encapsulates PostgREST queries with safe fallbacks and explicit column selection.
 */
export async function getPublishedEvents(category?: string): Promise<EventItem[]> {
  try {
    if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      return localizeContentList("events", CANONICAL_UPCOMING_EVENTS);
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
      if (!isJwtClockError(error)) console.error("[DAL Error getPublishedEvents]:", error.message);
      return localizeContentList("events", USE_DEMO_CONTENT || isJwtClockError(error) ? CANONICAL_UPCOMING_EVENTS : []);
    }

    return localizeContentList("events", (data as unknown as EventItem[]) || []);
  } catch (err: unknown) {
    console.warn("[DAL Warning getPublishedEvents]:", err instanceof Error ? err.message : String(err));
    return localizeContentList("events", USE_DEMO_CONTENT ? CANONICAL_UPCOMING_EVENTS : []);
  }
}

/** Cards per page on /events — the list column holds one card per row. */
export const EVENTS_CATALOG_PER_PAGE = 6;

/**
 * Paginated published events for /events — mirrors getPublishedArticlesPage.
 * `excludeIds` keeps the featured banner card out of the list so it never
 * renders twice on the same page.
 */
export async function getPublishedEventsPage(
  options: {
    category?: string;
    page?: number;
    perPage?: number;
    excludeIds?: string[];
  } = {}
) {
  const perPage = options.perPage ?? EVENTS_CATALOG_PER_PAGE;
  const emptyBounds = (pageReq = 1) => {
    const bounds = pagination(0, pageReq, perPage);
    return { ...bounds, total: 0, items: [] as EventItem[] };
  };

  const demoPage = async (pageReq = 1) => {
    let rows = CANONICAL_UPCOMING_EVENTS;
    if (options.category && options.category !== "all") {
      rows = rows.filter((e) => e.category === options.category);
    }
    if (options.excludeIds && options.excludeIds.length > 0) {
      rows = rows.filter((e) => !options.excludeIds!.includes(e.id));
    }
    const bounds = pagination(rows.length, pageReq, perPage);
    return {
      ...bounds,
      total: rows.length,
      items: await localizeContentList("events", rows.slice(bounds.from, bounds.to + 1)),
    };
  };

  try {
    if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      return demoPage(options.page);
    }

    const supabase = await createClient();
    const buildQuery = (head = false) => {
      let query = supabase
        .from("events")
        .select(EVENT_COLUMNS, { count: "exact", head })
        .eq("is_published", true);
      if (options.category && options.category !== "all") {
        query = query.eq("category", options.category as EventItem["category"]);
      }
      if (options.excludeIds && options.excludeIds.length > 0) {
        const safeIds = options.excludeIds.filter((id) => /^[A-Za-z0-9_-]{1,64}$/.test(id));
        if (safeIds.length > 0) {
          query = query.not("id", "in", `(${safeIds.join(",")})`);
        }
      }
      return query;
    };

    const { count, error: countError } = await buildQuery(true);
    if (countError) {
      if (!isJwtClockError(countError)) console.error("DAL Error [getPublishedEventsPage:count]:", countError.message);
      return USE_DEMO_CONTENT || isJwtClockError(countError) ? demoPage(options.page) : emptyBounds(options.page);
    }

    const total = count ?? 0;
    const bounds = pagination(total, options.page ?? 1, perPage);
    if (!total) {
      return { ...bounds, total: 0, items: [] as EventItem[] };
    }

    const { data, error } = await buildQuery()
      .order("event_date", { ascending: true })
      .order("id", { ascending: true })
      .range(bounds.from, bounds.to);

    if (error) {
      if (!isJwtClockError(error)) console.error("DAL Error [getPublishedEventsPage:data]:", error.message);
      return USE_DEMO_CONTENT || isJwtClockError(error)
        ? demoPage(options.page)
        : { ...bounds, total, items: [] as EventItem[] };
    }

    const rows = (data as unknown as EventItem[]) || [];
    return { ...bounds, total, items: await localizeContentList("events", rows) };
  } catch (err: unknown) {
    console.warn("[DAL Warning getPublishedEventsPage]:", err instanceof Error ? err.message : String(err));
    return USE_DEMO_CONTENT ? demoPage(options.page) : emptyBounds(options.page);
  }
}

/**
 * Fetches the pinned/featured event for the hero banner on /events
 */
export async function getFeaturedEvent(): Promise<EventItem | null> {
  try {
    if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      const demo = CANONICAL_UPCOMING_EVENTS[0] || null;
      return demo ? localizeContent("events", demo) : null;
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
      if (!isJwtClockError(error)) console.error("[DAL Error getFeaturedEvent]:", error.message);
      const fallback = (USE_DEMO_CONTENT || isJwtClockError(error) ? CANONICAL_UPCOMING_EVENTS[0] || null : null);
      return fallback ? localizeContent("events", fallback) : null;
    }

    if (!data) {
      return null;
    }

    return localizeContent("events", data as unknown as EventItem);
  } catch (err: unknown) {
    console.warn("[DAL Warning getFeaturedEvent]:", err instanceof Error ? err.message : String(err));
    const fallback = (USE_DEMO_CONTENT ? CANONICAL_UPCOMING_EVENTS[0] || null : null);
    return fallback ? localizeContent("events", fallback) : null;
  }
}

/**
 * Fetches the configurable events page subtitle from site_settings singleton
 */
export async function getEventsSubtitle(): Promise<string> {
  const locale = await getContentLocale();
  const fallback = locale === "en" ? DEFAULT_EVENTS_SUBTITLE_EN : DEFAULT_EVENTS_SUBTITLE;

  try {
    if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      return fallback;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("events_subtitle, events_subtitle_en")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data) return fallback;
    return pickLocalized(data, "events_subtitle", locale) || fallback;
  } catch {
    return fallback;
  }
}
