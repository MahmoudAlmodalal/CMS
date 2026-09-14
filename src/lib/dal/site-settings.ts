import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { USE_DEMO_CONTENT } from "@/lib/demo-content";
import { getContentLocale, localizeContent, LOCALIZED_FIELDS } from "./localize";

export interface SiteSettings {
  id: string;
  hero_headline: string;
  hero_subheadline: string;
  hero_image_url: string;
  about_headline: string;
  about_body: string;
  about_image_url: string;
  booking_banner_title: string;
  booking_banner_body: string;
  artists_subtitle: string | null;
  events_subtitle: string | null;
  academy_subtitle: string | null;
  booking_subtitle: string | null;
  contact_email: string;
  contact_phone: string;
  social_links: {
    instagram?: string;
    tiktok?: string;
    [key: string]: string | undefined;
  };
  operational_regions: string;
  footer_mission: string;
  copyright_text: string;
  home_featured_artists_count: number;
  home_featured_articles_count: number;
  home_upcoming_events_count: number;
  show_testimonials: boolean;
  show_editorial: boolean;
  show_events: boolean;
  show_booking_banner: boolean;
  // Optional English translations; null or absent falls back to the Arabic field.
  hero_headline_en?: string | null;
  hero_subheadline_en?: string | null;
  about_headline_en?: string | null;
  about_body_en?: string | null;
  booking_banner_title_en?: string | null;
  booking_banner_body_en?: string | null;
  artists_subtitle_en?: string | null;
  events_subtitle_en?: string | null;
  academy_subtitle_en?: string | null;
  booking_subtitle_en?: string | null;
  operational_regions_en?: string | null;
  footer_mission_en?: string | null;
  copyright_text_en?: string | null;
  // Page-hero overrides (null/blank = fall back to built-in copy).
  events_title: string | null;
  events_title_en?: string | null;
  events_hero_image_url: string | null;
  artists_title: string | null;
  artists_title_en?: string | null;
  artists_hero_image_url: string | null;
  academy_title: string | null;
  academy_title_en?: string | null;
  academy_kicker: string | null;
  academy_kicker_en?: string | null;
  academy_hero_image_url: string | null;
  academy_tracks_heading: string | null;
  academy_tracks_heading_en?: string | null;
  news_title: string | null;
  news_title_en?: string | null;
  news_subtitle: string | null;
  news_subtitle_en?: string | null;
  news_kicker: string | null;
  news_kicker_en?: string | null;
  // Home hero CTAs + about CTA overrides.
  home_hero_primary_cta: string | null;
  home_hero_primary_cta_en?: string | null;
  home_hero_secondary_cta: string | null;
  home_hero_secondary_cta_en?: string | null;
  home_about_cta: string | null;
  home_about_cta_en?: string | null;
  // Home section headings + CTAs overrides.
  home_artists_heading: string | null;
  home_artists_heading_en?: string | null;
  home_artists_cta: string | null;
  home_artists_cta_en?: string | null;
  home_testimonials_heading: string | null;
  home_testimonials_heading_en?: string | null;
  home_editorial_heading: string | null;
  home_editorial_heading_en?: string | null;
  home_events_heading: string | null;
  home_events_heading_en?: string | null;
  home_events_cta: string | null;
  home_events_cta_en?: string | null;
  // Academy value-props + newsletter band overrides.
  academy_values_heading: string | null;
  academy_values_heading_en?: string | null;
  academy_value1_title: string | null;
  academy_value1_title_en?: string | null;
  academy_value1_body: string | null;
  academy_value1_body_en?: string | null;
  academy_value2_title: string | null;
  academy_value2_title_en?: string | null;
  academy_value2_body: string | null;
  academy_value2_body_en?: string | null;
  academy_value3_title: string | null;
  academy_value3_title_en?: string | null;
  academy_value3_body: string | null;
  academy_value3_body_en?: string | null;
  academy_newsletter_heading: string | null;
  academy_newsletter_heading_en?: string | null;
  academy_newsletter_tagline: string | null;
  academy_newsletter_tagline_en?: string | null;
  // SEO metadata overrides (null = fall back to built-in copy).
  seo_home_title: string | null;
  seo_home_title_en?: string | null;
  seo_home_description: string | null;
  seo_home_description_en?: string | null;
  seo_events_title: string | null;
  seo_events_title_en?: string | null;
  seo_events_description: string | null;
  seo_events_description_en?: string | null;
  seo_news_title: string | null;
  seo_news_title_en?: string | null;
  seo_news_description: string | null;
  seo_news_description_en?: string | null;
  seo_artists_title: string | null;
  seo_artists_title_en?: string | null;
  seo_artists_description: string | null;
  seo_artists_description_en?: string | null;
  seo_academy_title: string | null;
  seo_academy_title_en?: string | null;
  seo_academy_description: string | null;
  seo_academy_description_en?: string | null;
  // Label overrides (null = fall back to built-in copy).
  events_filter_all_label: string | null;
  events_filter_all_label_en?: string | null;
  artists_filter_all_label: string | null;
  artists_filter_all_label_en?: string | null;
  booking_cta_label: string | null;
  booking_cta_label_en?: string | null;
  // Page controls (null = built-in link/image/copy).
  show_hero: boolean;
  show_about: boolean;
  show_featured_artists: boolean;
  home_hero_primary_href: string | null;
  home_hero_secondary_href: string | null;
  home_about_href: string | null;
  home_artists_href: string | null;
  home_events_href: string | null;
  booking_cta_href: string | null;
  home_about_heading: string | null;
  home_about_heading_en?: string | null;
  home_events_image_url: string | null;
  booking_banner_image_url: string | null;
  artist_hero_image_url: string | null;
  booking_title: string | null;
  booking_title_en?: string | null;
  seo_booking_title: string | null;
  seo_booking_title_en?: string | null;
  seo_booking_description: string | null;
  seo_booking_description_en?: string | null;
  seo_default_title: string | null;
  seo_default_title_en?: string | null;
  seo_default_description: string | null;
  seo_default_description_en?: string | null;
  seo_og_image_url: string | null;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: "default",
  // Copy verified against Figma الرئيسية (89:15216). Asterisks mark the terracotta
  // runs Figma renders as a second fill inside the same text node — see <Highlight />.
  hero_headline: "منصتك الأولى *لاكتشاف* ودعم *المواهب* الفنية والثقافية",
  hero_subheadline:
    "أندلسيا منصة متخصصة في تمثيل ودعم المواهب الإبداعية، وربط الفنانين بالأماكن والمناسبات التي تستحق الجمال.",
  hero_image_url: "/assets/figma/hero-stage-landscape.png",
  about_headline: "نكتشف · نصل · نحتفي",
  about_body:
    "وُلدنا من إيمان عميق بأن الفن ليس ترفاً بل ضرورة. نعمل على تقريب المسافة بين الفنان الموهوب والجمهور الذي ينتظره، وبين المناسبة التي تستحق اللحظة الفنية التي تجعلها لا تُنسى. أندلسيا منصة متخصصة في تمثيل ودعم المواهب الإبداعية، وربط الفنانين بالأماكن والمناسبات التي تستحق الجمال.",
  about_image_url: "/assets/figma/about-musician.png",
  booking_banner_title: "مناسبتك تستحق موسيقى حقيقية",
  booking_banner_body: "احجز فرقة أندلسيا لحفلتك، مطعمك، مهرجانك — واصنع لحظة لا تُنسى.",
  // Node 91:18059 in frame 91:17844 — the standfirst the design draws on the band.
  artists_subtitle: "كل فنان في أندلسيا يحمل قصة ومعاناة تحوّلت إلى موسيقى تلامس القلوب.",
  events_subtitle: "مواعيد تترك أثراً جميلاً في قلوب عشاق الموسيقى الأصيلة.",
  // Node 91:16345 in frame 91:16119 — the standfirst the design draws on the band.
  academy_subtitle:
    "برامج تعليمية موسيقية مع فنانين حقيقيين في بيئات صغيرة ومكثفة — تجربة تغير مسارك الفني.",
  booking_subtitle: "احجز حفلتك الخاصة أو شاركنا فعاليتك القادمة.",
  contact_email: "hello@andalusia.art",
  contact_phone: "+961 1 234 567",
  social_links: {
    instagram: "https://instagram.com/andalusia.art",
    tiktok: "https://tiktok.com/@andalusia.art",
  },
  operational_regions: "لبنان · المغرب · الخليج",
  footer_mission: "مجموعة فنانين يؤمنون أن الإبداع هو الحياة والموسيقى هي الشعلة.",
  copyright_text: "© أندلسيا ٢٠٢٥ — جميع الحقوق محفوظة",
  // English defaults so the /en site reads in English before any row is authored.
  hero_headline_en: "Your first place to *discover* and support artistic and cultural *talent*",
  hero_subheadline_en:
    "Andalusia represents and supports creative talent, connecting artists with the places and occasions that deserve beauty.",
  about_headline_en: "We discover · We connect · We celebrate",
  about_body_en:
    "We were born from a deep belief that art is not a luxury but a necessity. We work to close the distance between a talented artist and the audience waiting for them, and between an occasion and the artistic moment that makes it unforgettable. Andalusia represents and supports creative talent, connecting artists with the places and occasions that deserve beauty.",
  booking_banner_title_en: "Your occasion deserves real music",
  booking_banner_body_en:
    "Book Andalusia for your party, your restaurant, your festival — and make a moment no one forgets.",
  artists_subtitle_en:
    "Every artist at Andalusia carries a story, plays the soul of the East, and turns heritage into a sound for the future.",
  events_subtitle_en: "Dates that leave a beautiful mark on anyone who loves music with roots.",
  academy_subtitle_en:
    "Educational music programs with real artists in small, intensive environments — an experience that will change your artistic path.",
  booking_subtitle_en: "Book your private evening, or bring us into your next event.",
  operational_regions_en: "Lebanon · Morocco · The Gulf",
  footer_mission_en: "A collective of artists who believe creativity is life and music is the spark.",
  copyright_text_en: "© Andalusia 2025 — All rights reserved",
  // Page-content overrides: null = no override, fall back to built-in copy.
  events_title: null,
  events_title_en: null,
  events_hero_image_url: null,
  artists_title: null,
  artists_title_en: null,
  artists_hero_image_url: null,
  academy_title: null,
  academy_title_en: null,
  academy_kicker: null,
  academy_kicker_en: null,
  academy_hero_image_url: null,
  academy_tracks_heading: null,
  academy_tracks_heading_en: null,
  news_title: null,
  news_title_en: null,
  news_subtitle: null,
  news_subtitle_en: null,
  news_kicker: null,
  news_kicker_en: null,
  home_hero_primary_cta: null,
  home_hero_primary_cta_en: null,
  home_hero_secondary_cta: null,
  home_hero_secondary_cta_en: null,
  home_about_cta: null,
  home_about_cta_en: null,
  home_artists_heading: null,
  home_artists_heading_en: null,
  home_artists_cta: null,
  home_artists_cta_en: null,
  home_testimonials_heading: null,
  home_testimonials_heading_en: null,
  home_editorial_heading: null,
  home_editorial_heading_en: null,
  home_events_heading: null,
  home_events_heading_en: null,
  home_events_cta: null,
  home_events_cta_en: null,
  academy_values_heading: null,
  academy_values_heading_en: null,
  academy_value1_title: null,
  academy_value1_title_en: null,
  academy_value1_body: null,
  academy_value1_body_en: null,
  academy_value2_title: null,
  academy_value2_title_en: null,
  academy_value2_body: null,
  academy_value2_body_en: null,
  academy_value3_title: null,
  academy_value3_title_en: null,
  academy_value3_body: null,
  academy_value3_body_en: null,
  academy_newsletter_heading: null,
  academy_newsletter_heading_en: null,
  academy_newsletter_tagline: null,
  academy_newsletter_tagline_en: null,
  // SEO metadata overrides
  seo_home_title: null,
  seo_home_title_en: null,
  seo_home_description: null,
  seo_home_description_en: null,
  seo_events_title: null,
  seo_events_title_en: null,
  seo_events_description: null,
  seo_events_description_en: null,
  seo_news_title: null,
  seo_news_title_en: null,
  seo_news_description: null,
  seo_news_description_en: null,
  seo_artists_title: null,
  seo_artists_title_en: null,
  seo_artists_description: null,
  seo_artists_description_en: null,
  seo_academy_title: null,
  seo_academy_title_en: null,
  seo_academy_description: null,
  seo_academy_description_en: null,
  // Label overrides
  events_filter_all_label: null,
  events_filter_all_label_en: null,
  artists_filter_all_label: null,
  artists_filter_all_label_en: null,
  booking_cta_label: null,
  booking_cta_label_en: null,
  // Page controls
  show_hero: true,
  show_about: true,
  show_featured_artists: true,
  home_hero_primary_href: null,
  home_hero_secondary_href: null,
  home_about_href: null,
  home_artists_href: null,
  home_events_href: null,
  booking_cta_href: null,
  home_about_heading: null,
  home_about_heading_en: null,
  home_events_image_url: null,
  booking_banner_image_url: null,
  artist_hero_image_url: null,
  booking_title: null,
  booking_title_en: null,
  seo_booking_title: null,
  seo_booking_title_en: null,
  seo_booking_description: null,
  seo_booking_description_en: null,
  seo_default_title: null,
  seo_default_title_en: null,
  seo_default_description: null,
  seo_default_description_en: null,
  seo_og_image_url: null,
  home_featured_artists_count: 6,
  home_featured_articles_count: 4,
  home_upcoming_events_count: 3,
  show_testimonials: true,
  show_editorial: true,
  show_events: true,
  show_booking_banner: true,
};
const EMPTY_SITE_SETTINGS: SiteSettings = {
  ...DEFAULT_SITE_SETTINGS,
  hero_headline: "", hero_subheadline: "", hero_image_url: "",
  about_headline: "", about_body: "", about_image_url: "",
  booking_banner_title: "", booking_banner_body: "",
  artists_subtitle: null, events_subtitle: null, academy_subtitle: null, booking_subtitle: null,
  contact_email: "", contact_phone: "", social_links: {}, operational_regions: "",
  footer_mission: "", copyright_text: "",
  show_hero: false, show_about: false, show_featured_artists: false,
  show_testimonials: false, show_editorial: false, show_events: false, show_booking_banner: false,
  home_featured_artists_count: 0, home_featured_articles_count: 0, home_upcoming_events_count: 0,
};

/**
 * Fetches singleton site settings (id = 'default').
 * Falls back to DEFAULT_SITE_SETTINGS if not found or on connection error.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  return localizeContent("site_settings", await getSiteSettingsForLocale());
}

/** One settings query per request (metadata + layout + page share it). */
const getSiteSettingsForLocale = cache(async (): Promise<SiteSettings> => {
  const settings = { ...(await getSiteSettingsRaw()) };
  // A row from a database that predates the page-controls migration carries no
  // show_* columns. A missing flag means "visible" (the historic `!== false`
  // semantics) — only an explicit false hides a band.
  for (const flag of [
    "show_hero",
    "show_about",
    "show_featured_artists",
    "show_testimonials",
    "show_editorial",
    "show_events",
    "show_booking_banner",
  ] as const) {
    settings[flag] = settings[flag] ?? true;
  }
  if ((await getContentLocale()) !== "ar") {
    const row = settings as unknown as Record<string, unknown>;
    for (const field of LOCALIZED_FIELDS.site_settings) {
      const english = row[`${field}_en`];
      // An override with no English text must fall back to the built-in English
      // copy (the page's t() default), not leak the Arabic override onto /en.
      if (DEFAULT_SITE_SETTINGS[field] === null && !(typeof english === "string" && english.trim())) {
        row[field] = null;
      }
    }
  }
  return settings;
});

async function getSiteSettingsRaw(): Promise<SiteSettings> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return USE_DEMO_CONTENT ? DEFAULT_SITE_SETTINGS : EMPTY_SITE_SETTINGS;
    }

    const supabase = await createClient();
    let { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "default")
      .single();
    // Public pages normally use the anon/RLS client. If the deployed database
    // has a stale or missing public SELECT policy, retry server-side so the
    // CMS content still renders without exposing the service key.
    if ((error || !data) && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createAdminClient();
      ({ data, error } = await admin
        .from("site_settings")
        .select("*")
        .eq("id", "default")
        .single());
    }

    if (error || !data) {
      return USE_DEMO_CONTENT ? DEFAULT_SITE_SETTINGS : EMPTY_SITE_SETTINGS;
    }
    if (!USE_DEMO_CONTENT) return data as unknown as SiteSettings;

    // Null/blank columns must not wipe a built-in default (e.g. a null `_en`
    // replacing the English default, or '' blanking the hero image).
    const defaults = DEFAULT_SITE_SETTINGS as unknown as Record<string, unknown>;
    const row = Object.fromEntries(
      Object.entries(data as Record<string, unknown>).filter(
        ([key, value]) => (value !== null && value !== "") || defaults[key] == null
      )
    ) as Partial<SiteSettings>;
    const heroImageUrl = row.hero_image_url === "/assets/hero-stage.png"
      ? DEFAULT_SITE_SETTINGS.hero_image_url
      : row.hero_image_url;
    const aboutImageUrl = row.about_image_url === "/assets/about-musician.png"
      ? DEFAULT_SITE_SETTINGS.about_image_url
      : row.about_image_url;
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...row,
      hero_image_url: heroImageUrl ?? DEFAULT_SITE_SETTINGS.hero_image_url,
      about_image_url: aboutImageUrl ?? DEFAULT_SITE_SETTINGS.about_image_url,
      social_links:
        typeof row.social_links === "object" && row.social_links !== null
          ? (row.social_links as Record<string, string>)
          : DEFAULT_SITE_SETTINGS.social_links,
    };

  } catch {
    return USE_DEMO_CONTENT ? DEFAULT_SITE_SETTINGS : EMPTY_SITE_SETTINGS;
  }
}
