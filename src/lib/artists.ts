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
  /**
   * The profile card of الفنان (134:4674) draws a different photograph from the
   * card the الفنانين grid draws for the same artist: the grid reuses four
   * placeholder photographs across its eight cards while the detail frame carries
   * the artist's own portrait. There is no such column in Supabase yet, so it
   * stays optional and the profile card falls back to portrait_image_url.
   */
  profile_image_url?: string | null;
  /**
   * The الرئيسية rail (87:14241) draws a third photograph again, different from
   * both the الفنانين card and the detail portrait, and the design carries four of
   * them across its tiles. There is no such column in Supabase either, so it stays
   * optional and ArtistTile falls back to portrait_image_url.
   */
  rail_image_url?: string | null;
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

/**
 * The roster the public pages fall back to without Supabase.
 *
 * Figma frame 91:17844 draws two rows of four on /artists, so there are eight; the
 * frame repeats one placeholder artist across all eight cards, which is a stand-in,
 * not copy to reproduce, so the records carry real people and the design's own four
 * photographs, each used twice exactly as the frame does.
 *
 * The first six are featured, because the الرئيسية rail (87:14241) draws six tiles
 * — five of them inside its 1200px box and the sixth clipped at the edge — and
 * getFeaturedArtists(6) is what fills them. That rail draws four photographs across
 * those five visible tiles, repeating its placeholder on the first two, so the
 * records carry the same four the same number of times; the sixth tile is clipped
 * away entirely, so nothing in the design says what belongs there.
 */
export const CANONICAL_FEATURED_ARTISTS: Artist[] = [
  {
    id: "a1000000-0000-0000-0000-000000000001",
    name: "سارة الصوت",
    slug: "sara-alsawt",
    category: "singing",
    genre_tag: "غناء عربي أصيل",
    city: "الدار البيضاء",
    quote: "الصوت هو المرآة الأصدق للروح.",
    spotlight_quote: "الصوت هو المرآة الأصدق للروح — لا تكذب على جمهورك أبداً.",
    short_bio:
      "مغنية مصرية تختصص في الطرب الأصيل والغناء العاطفي. صوتها يحمل دفء الأرض وعمق التراث، مع لمسة معاصرة تلامس الأجيال.",
    full_bio:
      "سارة الصوت فنانة مخضرمة متخصصة في الطرب الأصيل والغناء الأندلسي، صوتها يجمع بين الأصالة والمعاصرة، تجوب المسارح العربية والدولية منذ أكثر من عقد من الزمن.",
    specialties: "الصوت • الغناء الأندلسي • الطرب الأصيل",
    portrait_image_url: "/assets/artists/artist-1.png",
    rail_image_url: "/assets/artists/rail-1.png",
    profile_image_url: "/assets/artists/sara-alsawt-profile.png",
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
    rail_image_url: "/assets/artists/rail-1.png",
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
    rail_image_url: "/assets/artists/rail-2.png",
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
    rail_image_url: "/assets/artists/rail-3.png",
    is_featured: true,
    is_published: true,
    display_order: 4,
    created_at: "2026-09-10T00:00:00Z",
    updated_at: "2026-09-10T00:00:00Z",
  },
  {
    id: "a1000000-0000-0000-0000-000000000005",
    name: "منى الأندلسية",
    slug: "mona-alandalusia",
    category: "heritage",
    genre_tag: "موشحات وأزجال",
    city: "غرناطة",
    quote: "الموشح ذاكرة مدينة كاملة، ومن يغنيه يعيد بناءها بيتاً بيتاً.",
    spotlight_quote: null,
    short_bio: "باحثة ومؤدية للموشحات الأندلسية، تعيد إحياء النوبات المغاربية على المسرح.",
    full_bio:
      "قضت منى سنوات في تتبع النوبات الأندلسية بين مخطوطات تطوان وفاس قبل أن تعيد تقديمها حية.",
    specialties: "الموشحات • النوبة الأندلسية • الزجل",
    portrait_image_url: "/assets/artists/artist-4.png",
    rail_image_url: "/assets/artists/rail-4.png",
    is_featured: true,
    is_published: true,
    display_order: 5,
    created_at: "2026-09-10T00:00:00Z",
    updated_at: "2026-09-10T00:00:00Z",
  },
  {
    id: "a1000000-0000-0000-0000-000000000006",
    name: "كريم القانون",
    slug: "karim-alqanun",
    category: "oud",
    genre_tag: "قانون وتقاسيم",
    city: "تونس",
    quote: "القانون آلة لا تسامح: كل مقام فيها يطلب أذناً صافية ويداً صبورة.",
    spotlight_quote: null,
    short_bio: "عازف قانون يجمع بين المدرسة التونسية والمقام الشرقي في تقاسيم مرتجلة.",
    full_bio:
      "درس كريم في المعهد العالي للموسيقى بتونس، ويعمل اليوم مع الفرقة على توزيع النوبات.",
    specialties: "القانون • التقاسيم • التوزيع",
    portrait_image_url: "/assets/artists/artist-3.png",
    rail_image_url: "/assets/artists/rail-2.png",
    is_featured: true,
    is_published: true,
    display_order: 6,
    created_at: "2026-09-10T00:00:00Z",
    updated_at: "2026-09-10T00:00:00Z",
  },
  {
    id: "a1000000-0000-0000-0000-000000000007",
    name: "نادية الحديثة",
    slug: "nadia-alhaditha",
    category: "contemporary",
    genre_tag: "تجريب ومزج معاصر",
    city: "مرسيليا",
    quote: "لا أخرج من التراث حين أجرّب، بل أسأله سؤالاً جديداً.",
    spotlight_quote: null,
    short_bio: "ملحّنة تمزج المقام الأندلسي بالآلات الكهربائية والمعالجة الصوتية الحية.",
    full_bio:
      "تشتغل نادية على مشروع يعيد قراءة الموروث الأندلسي بأدوات الموسيقى الإلكترونية المعاصرة.",
    specialties: "التلحين • المعالجة الحية • المزج",
    portrait_image_url: "/assets/artists/artist-1.png",
    is_featured: false,
    is_published: true,
    display_order: 7,
    created_at: "2026-09-10T00:00:00Z",
    updated_at: "2026-09-10T00:00:00Z",
  },
  {
    id: "a1000000-0000-0000-0000-000000000008",
    name: "هشام الناي",
    slug: "hisham-alnay",
    category: "heritage",
    genre_tag: "ناي ومقامات",
    city: "القاهرة",
    quote: "الناي أقرب الآلات إلى النفس؛ لا يصدر صوتاً إلا بما تعطيه من هواء.",
    spotlight_quote: null,
    short_bio: "عازف ناي متخصص في المقامات الشرقية والتقاسيم الحرة المصاحبة للطرب.",
    full_bio:
      "رافق هشام كباراً من مطربي الطرب الأصيل قبل انضمامه إلى أندلسيا عازفاً ومدرّباً.",
    specialties: "الناي • المقامات • التقاسيم الحرة",
    portrait_image_url: "/assets/artists/artist-2.png",
    is_featured: false,
    is_published: true,
    display_order: 8,
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
