import { createClient } from "@/lib/supabase/server";
import { localizeContent, localizeContentList, getContentLocale } from "./localize";
import { pickLocalized } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";
import type { EventItem } from "@/lib/types/events";

export type Event = EventItem;
export type { EventItem };

/** Node 91:16747 — the standfirst the الفعاليات hero draws. */
export const DEFAULT_EVENTS_SUBTITLE =
  "كل فنان في أندلسيا يحمل قصة ومعاناة تحولت إلى موسيقى تلامس القلوب.";

export const DEFAULT_EVENTS_SUBTITLE_EN =
  "Every Andalusia artist carries a story and a struggle, and every performance is a living space to record that craft and share it with an audience.";

/** The subtitle shown when site_settings carries none, in the reader's locale. */
function localizedDefaultEventsSubtitle(locale: AppLocale): string {
  return locale === "ar" ? DEFAULT_EVENTS_SUBTITLE : DEFAULT_EVENTS_SUBTITLE_EN;
}

const EVENT_COLUMNS =
  "id, title, slug, category, event_date, location, city, performer_name, artist_id, description, image_url, ticket_url, is_featured, status, is_published, display_order, created_at, updated_at, " +
  "title_en, location_en, city_en, performer_name_en, description_en";

function shortlist(rows: EventItem[], limit: number): EventItem[] {
  return [...rows]
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, limit)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
}

async function getUpcomingEventsRaw(limit = 3): Promise<EventItem[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return [];
    }

    const supabase = await createClient();
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .eq("is_published", true)
      .eq("status", "upcoming")
      .gte("event_date", nowIso)
      .order("display_order", { ascending: true })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return [];
    }

    return shortlist(data as unknown as EventItem[], limit);
  } catch {
    return [];
  }
}

/**
 * Data Access Layer for Andalusia Events Catalog
 * Encapsulates PostgREST queries with safe fallbacks and explicit column selection.
 */
async function getPublishedEventsRaw(category?: string): Promise<EventItem[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return [];
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
      return [];
    }

    return (data as unknown as EventItem[]) || [];
  } catch (err: unknown) {
    console.warn("[DAL Warning getPublishedEvents]:", err instanceof Error ? err.message : String(err));
    return [];
  }
}

/**
 * Fetches the pinned/featured event for the hero banner on /events
 */
async function getFeaturedEventRaw(): Promise<EventItem | null> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null;
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
      return null;
    }

    return (data as unknown as EventItem) || null;
  } catch (err: unknown) {
    console.warn("[DAL Warning getFeaturedEvent]:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

/**
 * Fetches the configurable events page subtitle from site_settings singleton
 */
export async function getEventsSubtitle(): Promise<string> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return localizedDefaultEventsSubtitle(await getContentLocale());
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("events_subtitle, events_subtitle_en")
      .eq("id", "default")
      .maybeSingle();

    const row = data as { events_subtitle?: string | null; events_subtitle_en?: string | null } | null;
    if (error || !row?.events_subtitle) {
      return localizedDefaultEventsSubtitle(await getContentLocale());
    }

    return pickLocalized(row, "events_subtitle", await getContentLocale());
  } catch {
    return localizedDefaultEventsSubtitle(await getContentLocale());
  }
}

/*
 * Public readers resolve content into the request's locale. Arabic rows are
 * returned untouched; English falls back to Arabic per field when a
 * translation has not been written yet.
 */
export async function getUpcomingEvents(limit = 3): Promise<EventItem[]> {
  return localizeContentList("events", await getUpcomingEventsRaw(limit));
}
export async function getPublishedEvents(category?: string): Promise<EventItem[]> {
  return localizeContentList("events", await getPublishedEventsRaw(category));
}
export async function getFeaturedEvent(): Promise<EventItem | null> {
  const row = await getFeaturedEventRaw();
  return row ? localizeContent("events", row) : null;
}
