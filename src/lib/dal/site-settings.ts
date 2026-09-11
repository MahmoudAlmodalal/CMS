import { createClient } from "@/lib/supabase/server";

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
};

/**
 * Fetches singleton site settings (id = 'default').
 * Falls back to DEFAULT_SITE_SETTINGS if not found or on connection error.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
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
