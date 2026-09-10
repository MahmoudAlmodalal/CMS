import { createClient } from "@/lib/supabase/server";

export interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_role: string;
  avatar_image_url?: string | null;
  display_order: number;
  is_published: boolean;
  created_at?: string;
}

export const CANONICAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1000000-0000-0000-0000-000000000001",
    quote:
      "أندلسيا ليست مجرد منصة فنية، بل هي جسر حقيقي يربط بين أصالة التراث وروح الحاضر. تجربة استثنائية في كل حفل ومقطوعة موسيقية.",
    author_name: "عمر الحاج",
    author_role: "ناقد موسيقي وصحفي ثقافي",
    avatar_image_url: null,
    display_order: 1,
    is_published: true,
  },
  {
    id: "t1000000-0000-0000-0000-000000000002",
    quote:
      "التنظيم والاحترافية العالية التي قدمتها فرقة أندلسيا في أمسيتنا الثقافية جعلت من الحدث ذكرى لا تُنسى لجميع الحاضرين. فنانون استثنائيون بمعنى الكلمة.",
    author_name: "د. ناديا القاسم",
    author_role: "مديرة مهرجان أصداء التراث الدولي",
    avatar_image_url: null,
    display_order: 2,
    is_published: true,
  },
  {
    id: "t1000000-0000-0000-0000-000000000003",
    quote:
      "المستوى الموسيقي المتقن والشغف الذي يلمسه الجمهور في أداء فناني أندلسيا يعيد للموشحات الأندلسية بريقها الخالد وألقها الساحر.",
    author_name: "كريم الزهراني",
    author_role: "باحث في المقامات التراثية والأندلسية",
    avatar_image_url: null,
    display_order: 3,
    is_published: true,
  },
];

/**
 * Fetch published testimonials for the homepage carousel.
 * Strictly queries is_published = true ordered by display_order ASC.
 */
export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return CANONICAL_TESTIMONIALS;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return CANONICAL_TESTIMONIALS;
    }

    return data as unknown as Testimonial[];
  } catch {
    return CANONICAL_TESTIMONIALS;
  }
}
