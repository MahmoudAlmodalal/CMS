import { createClient } from "@/lib/supabase/server";
import { localizeContent } from "./localize";

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
  artists_subtitle: "كل فنان في أندلسيا يحمل قصة ومعاناة، يعزف بأنامله روح الشرق، ويصنع من التراث نغماً للمستقبل.",
  events_subtitle: "مواعيد تترك أثراً جميلاً في قلوب عشاق الموسيقى الأصيلة.",
  academy_subtitle: "تعلّم من اليد التي تعرف الطريق وتتقن أسرار المقامات.",
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
  academy_subtitle_en: "Learn from the hand that knows the way and the secrets of the maqamat.",
  booking_subtitle_en: "Book your private evening, or bring us into your next event.",
  operational_regions_en: "Lebanon · Morocco · The Gulf",
  footer_mission_en: "A collective of artists who believe creativity is life and music is the spark.",
  copyright_text_en: "© Andalusia 2025 — All rights reserved",
};

/**
 * Fetches singleton site settings (id = 'default').
 * Falls back to DEFAULT_SITE_SETTINGS if not found or on connection error.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  return localizeContent("site_settings", await getSiteSettingsRaw());
}

async function getSiteSettingsRaw(): Promise<SiteSettings> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return DEFAULT_SITE_SETTINGS;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "default")
      .single();

    if (error || !data) {
      return DEFAULT_SITE_SETTINGS;
    }

    const row = data as unknown as Partial<SiteSettings>;
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
    return DEFAULT_SITE_SETTINGS;
  }
}
