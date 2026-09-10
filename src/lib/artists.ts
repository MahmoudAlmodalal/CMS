import type { Database } from "@/lib/supabase/types";

export type Artist = Omit<
  Database["public"]["Tables"]["artists"]["Row"],
  "created_at" | "updated_at"
> & {
  id: string;
  name: string;
  slug: string;
  category: "singing" | "oud" | "percussion" | "contemporary" | "heritage" | string;
  genre_tag: string;
  city: string;
  quote: string;
  spotlight_quote?: string | null;
  short_bio: string;
  full_bio: string;
  specialties: string;
  portrait_image_url: string;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export const ARTIST_CATEGORIES = [
  { id: "all", label: "الكل" },
  { id: "singing", label: "غناء" },
  { id: "oud", label: "عود وموسيقى" },
  { id: "percussion", label: "إيقاع" },
  { id: "contemporary", label: "معاصر" },
  { id: "heritage", label: "تراث" },
] as const;

export type ArtistCategoryId = (typeof ARTIST_CATEGORIES)[number]["id"];

export const CANONICAL_FEATURED_ARTISTS: Artist[] = [
  {
    id: "a1000000-0000-0000-0000-000000000001",
    name: "سارة الصوت",
    slug: "sara-alsawt",
    category: "singing",
    genre_tag: "غناء عربي أصيل",
    city: "الدار البيضاء",
    quote: "الصوت هو المرآة الأصدق للروح، وفي المقامات الأندلسية تتسع الروح لتحتضن العالم.",
    spotlight_quote: null,
    short_bio: "صوت طربي أصيل يجمع بين عمق التراث المغاربي وسحر الموشحات الأندلسية.",
    full_bio: "نشأت سارة في بيئة فنية عريقة، وتتلمذت على يد كبار أساتذة الطرب الأندلسي في فاس والرباط.",
    specialties: "الصوت • الغناء الأندلسي • الطرب الأصيل",
    portrait_image_url: "/assets/artists/artist-1.png",
    is_featured: true,
    is_published: true,
    display_order: 1,
    created_at: "2026-09-10T00:00:00Z",
    updated_at: "2026-09-10T00:00:00Z",
  },
  {
    id: "a1000000-0000-0000-0000-000000000002",
    name: "طارق العود",
    slug: "tariq-aloud",
    category: "oud",
    genre_tag: "عزف العود والتقاسيم",
    city: "بيروت",
    quote: "كل وتر في العود يحكي حكاية حضارة لم تنطفئ شعلتها أبداً.",
    spotlight_quote: null,
    short_bio: "مؤلف وعازف عود بارع يمزج الارتجال الصوفي والتقاسيم البياتية بحس معاصر.",
    full_bio: "عازف متمكن من تقنيات العود الشرقي والأندلسي، قدّم عروضاً في أرقى المسارح العربية والدولية.",
    specialties: "عزف العود • التأليف الموسيقي • الارتجال",
    portrait_image_url: "/assets/artists/artist-2.png",
    is_featured: true,
    is_published: true,
    display_order: 2,
    created_at: "2026-09-10T00:00:00Z",
    updated_at: "2026-09-10T00:00:00Z",
  },
  {
    id: "a1000000-0000-0000-0000-000000000003",
    name: "ليلى حسن",
    slug: "layla-hassan",
    category: "singing",
    genre_tag: "طرب أندلسي وموشحات",
    city: "الرباط",
    quote: "حين نغني الموشحات، نعيد بعث مدن وحضارات لا تزال حية في وجداننا.",
    spotlight_quote: null,
    short_bio: "باحثة ومطربة متخصصة في توثيق النوبات الأندلسية والقصائد الصوفية.",
    full_bio: "قادت مشاريع بحثية وموسيقية لإحياء التراث الغنائي الأندلسي المشترك بين المشرق والمغرب.",
    specialties: "الموشحات الأندلسية • النوبات • الأداء المسرحي",
    portrait_image_url: "/assets/artists/artist-3.png",
    is_featured: true,
    is_published: true,
    display_order: 3,
    created_at: "2026-09-10T00:00:00Z",
    updated_at: "2026-09-10T00:00:00Z",
  },
  {
    id: "a1000000-0000-0000-0000-000000000004",
    name: "يوسف الإيقاع",
    slug: "youssef-aliqa",
    category: "percussion",
    genre_tag: "إيقاع وتراث حي",
    city: "عمان",
    quote: "الإيقاع هو نبض الحياة؛ به تنتظم الألحان وبه ترقص القلوب.",
    spotlight_quote: null,
    short_bio: "خبير الإيقاعات التراثية الشرقية والأندلسية وضابط إيقاع فرقة أندلسيا الرئيسي.",
    full_bio: "يمتلك يوسف فهماً عميقاً للموازين الإيقاعية الأندلسية المركبة والدورات الإيقاعية التراثية.",
    specialties: "الرق • الدف • الإيقاعات المركبة",
    portrait_image_url: "/assets/artists/artist-4.png",
    is_featured: true,
    is_published: true,
    display_order: 4,
    created_at: "2026-09-10T00:00:00Z",
    updated_at: "2026-09-10T00:00:00Z",
  },
];

/**
 * Returns Arabic label for a given category ID
 */
export function getCategoryLabel(category: string): string {
  const found = ARTIST_CATEGORIES.find((c) => c.id === category);
  return found ? found.label : category;
}
