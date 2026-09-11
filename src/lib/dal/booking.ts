import { createClient } from "@/lib/supabase/server";

export interface BookingArtistOption {
  id: string;
  name: string;
  slug: string;
}

export interface BookingEventContext {
  id: string;
  title: string;
  event_date: string;
  venue?: string;
  city?: string;
  performer_name?: string;
  artist_id?: string | null;
}

export interface BookingPageData {
  subtitle: string;
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
  artists: BookingArtistOption[];
  eventContext: BookingEventContext | null;
}

type BookingEventRow = {
  id: string;
  title: string;
  event_date: string;
  location?: string | null;
  city?: string | null;
  performer_name?: string | null;
  artist_id?: string | null;
};

type BookingSettingsRow = {
  booking_subtitle?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  social_links?: Record<string, string> | null;
};

/** Node 91:17125 in frame 91:17109 — the standfirst the design draws on the band. */
export const DEFAULT_BOOKING_SUBTITLE =
  "برامج تعليمية موسيقية مع فنانين حقيقيين في بيئات صغيرة ومكثفة — تجربة تغير مسارك الفني.";

export const CANONICAL_BOOKING_ARTISTS: BookingArtistOption[] = [
  { id: "a1000000-0000-0000-0000-000000000001", name: "سارة الصوت", slug: "sara-alsawt" },
  { id: "a1000000-0000-0000-0000-000000000002", name: "طارق العود", slug: "tariq-aloud" },
  { id: "a1000000-0000-0000-0000-000000000003", name: "ليلى القانون", slug: "layla-al-qanun" },
  { id: "a1000000-0000-0000-0000-000000000004", name: "كريم الإيقاع", slug: "karim-percussion" },
];

/**
 * Fetches published artists for populating the booking artist dropdown.
 * Only published artists (is_published = true) are queryable by public users.
 */
export async function getBookingArtists(): Promise<BookingArtistOption[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return CANONICAL_BOOKING_ARTISTS;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("artists")
      .select("id, name, slug")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return CANONICAL_BOOKING_ARTISTS;
    }

    return data as BookingArtistOption[];
  } catch {
    return CANONICAL_BOOKING_ARTISTS;
  }
}

/**
 * Fetches event context if a visitor arrives from /events via ?event_id=[id]
 */
export async function getBookingEventContext(eventId?: string): Promise<BookingEventContext | null> {
  if (!eventId) return null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("id, title, event_date, location, city, performer_name, artist_id")
      .eq("id", eventId)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) return null;
    const row = data as BookingEventRow;

    return {
      id: row.id,
      title: row.title,
      event_date: row.event_date,
      venue: row.location ?? undefined,
      city: row.city ?? undefined,
      performer_name: row.performer_name ?? undefined,
      artist_id: row.artist_id,
    };
  } catch {
    return null;
  }
}

/**
 * Gathers complete context data needed to render /booking shell
 */
export async function getBookingPageData(eventId?: string): Promise<BookingPageData> {
  let subtitle = DEFAULT_BOOKING_SUBTITLE;
  let contactEmail = "hello@andalusia.art";
  let contactPhone = "+961 70 000 000";
  let instagramUrl = "https://instagram.com/andalusia.art";

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("site_settings")
        .select("booking_subtitle, contact_email, contact_phone, social_links")
        .eq("id", "default")
        .maybeSingle();

      if (data) {
        const s = data as BookingSettingsRow;
        if (s.booking_subtitle) subtitle = s.booking_subtitle;
        if (s.contact_email) contactEmail = s.contact_email;
        if (s.contact_phone) contactPhone = s.contact_phone;
        if (s.social_links) {
          if (s.social_links.instagram) instagramUrl = s.social_links.instagram;
        }
      }
    }
  } catch {
    // Keep safe defaults
  }

  const [artists, eventContext] = await Promise.all([
    getBookingArtists(),
    getBookingEventContext(eventId),
  ]);

  return {
    subtitle,
    contactEmail,
    contactPhone,
    instagramUrl,
    artists,
    eventContext,
  };
}
