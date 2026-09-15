import { createClient } from "@/lib/supabase/server";
import { getContentLocale } from "./localize";
import { getSiteSettings } from "./site-settings";
import { pickLocalized } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";

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
  title_en?: string | null;
  location_en?: string | null;
  city_en?: string | null;
  performer_name_en?: string | null;
};

/** 
 * Node 91:17125 in frame 91:17109 — the standfirst the design draws on the band:
 * "برامج تعليمية موسيقية مع فنانين حقيقيين في بيئات صغيرة ومكثفة — تجربة تغير مسارك الفني."
 */
export const DEFAULT_BOOKING_SUBTITLE =
  "احجز حفلتك الخاصة أو شاركنا فعاليتك القادمة.";

export const DEFAULT_BOOKING_SUBTITLE_EN =
  "Book Andalusia for your concert, your restaurant, your festival — and make a moment nobody forgets, with some of the finest musicians and singers around.";

/** The booking subtitle shown when site_settings carries none, in the reader's locale. */
function localizedDefaultBookingSubtitle(locale: AppLocale): string {
  return locale === "ar" ? DEFAULT_BOOKING_SUBTITLE : DEFAULT_BOOKING_SUBTITLE_EN;
}

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
      .select("id, name, slug, name_en")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return CANONICAL_BOOKING_ARTISTS;
    }

    const locale = await getContentLocale();
    return (data as (BookingArtistOption & { name_en?: string | null })[]).map((row) => ({
      id: row.id,
      name: pickLocalized(row, "name", locale),
      slug: row.slug,
    }));
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
      .select(
        "id, title, event_date, location, city, performer_name, artist_id, " +
          "title_en, location_en, city_en, performer_name_en"
      )
      .eq("id", eventId)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) return null;
    const row = data as unknown as BookingEventRow;
    const locale = await getContentLocale();

    return {
      id: row.id,
      title: pickLocalized(row, "title", locale),
      event_date: row.event_date,
      venue: pickLocalized(row, "location", locale) || undefined,
      city: pickLocalized(row, "city", locale) || undefined,
      performer_name: pickLocalized(row, "performer_name", locale) || undefined,
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
  const locale = await getContentLocale();
  const settings = await getSiteSettings();
  const s = settings;
  const subtitle = pickLocalized(s, "booking_subtitle", locale)?.trim() || localizedDefaultBookingSubtitle(locale);
  const contactEmail = settings.contact_email?.trim() || "hello@andalusia.art";
  const contactPhone = settings.contact_phone?.trim() || "+961 1 234 567";
  const instagramUrl = settings.social_links?.instagram || "https://instagram.com/andalusia.art";

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
