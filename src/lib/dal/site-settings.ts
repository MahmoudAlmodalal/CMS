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
  hero_headline: "أصوات تصنع التاريخ",
  hero_subheadline: "فرقة موسيقية تمزج التراث الأندلسي العريق بالرؤية الموسيقية المعاصرة",
  hero_image_url: "",
  about_headline: "رسالتنا الموسيقية",
  about_body: "مجموعة فنانين يؤمنون أن الإبداع هو الحياة والموسيقى هي الشعلة التي تنير الدرب.",
  about_image_url: "",
  booking_banner_title: "حفلتك القادمة تبدأ من هنا",
  booking_banner_body: "نتفاعل مع الجمهور، نبني شعوراً جديداً — موسيقى، فن، مشاعر، وحدة.",
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
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...row,
      social_links:
        typeof row.social_links === "object" && row.social_links !== null
          ? (row.social_links as Record<string, string>)
          : DEFAULT_SITE_SETTINGS.social_links,
    };

  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
