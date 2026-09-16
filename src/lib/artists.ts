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
    name_en: "Sara Alsawt",
    slug: "sara-alsawt",
    category: "singing",
    genre_tag: "غناء عربي أصيل",
    genre_tag_en: "Authentic Arabic Vocals",
    city: "الدار البيضاء",
    city_en: "Casablanca",
    quote: "الصوت هو المرآة الأصدق للروح.",
    quote_en: "The voice is the truest mirror of the soul.",
    spotlight_quote: "الصوت هو المرآة الأصدق للروح — لا تكذب على جمهورك أبداً.",
    spotlight_quote_en: "The voice is the truest mirror of the soul — never lie to your audience.",
    short_bio:
      "مغنية مصرية تختصص في الطرب الأصيل والغناء العاطفي. صوتها يحمل دفء الأرض وعمق التراث، مع لمسة معاصرة تلامس الأجيال.",
    short_bio_en: "An Egyptian singer specialising in authentic tarab and emotive vocals. Her voice carries the warmth of the earth and the depth of heritage, with a contemporary touch that reaches every generation.",
    full_bio:
      "سارة الصوت فنانة مخضرمة متخصصة في الطرب الأصيل والغناء الأندلسي، صوتها يجمع بين الأصالة والمعاصرة، تجوب المسارح العربية والدولية منذ أكثر من عقد من الزمن.",
    full_bio_en: "Sara Alsawt is a seasoned artist specialising in authentic tarab and Andalusian song. Her voice joins the classical and the contemporary, and she has toured Arab and international stages for more than a decade.",
    specialties: "الصوت • الغناء الأندلسي • الطرب الأصيل",
    specialties_en: "Voice • Andalusian song • Classical tarab",
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
    name_en: "Tariq Aloud",
    slug: "tariq-aloud",
    category: "oud",
    genre_tag: "عزف العود والتقاسيم",
    genre_tag_en: "Oud Performance & Taqasim",
    city: "بيروت",
    city_en: "Beirut",
    quote: "كل وتر في العود يحكي حكاية حضارة لم تنطفئ شعلتها أبداً.",
    quote_en: "Every string on the oud tells the story of a civilisation whose flame never went out.",
    spotlight_quote: "كل وتر في العود يحكي حكاية حضارة لم تنطفئ شعلتها أبداً.",
    spotlight_quote_en: "Every string on the oud tells the story of a civilisation whose flame never went out.",
    short_bio: "مؤلف وعازف عود بارع يمزج الارتجال الصوفي والتقاسيم البياتية بحس معاصر.",
    short_bio_en: "A composer and accomplished oud player who blends Sufi improvisation and bayati taqasim with a contemporary sensibility.",
    full_bio: "عازف متمكن من تقنيات العود الشرقي والأندلسي، قدّم عروضاً في أرقى المسارح العربية والدولية.",
    full_bio_en: "A master of both Eastern and Andalusian oud technique, he has performed on the finest Arab and international stages.",
    specialties: "عزف العود • التأليف الموسيقي • الارتجال",
    specialties_en: "Oud performance • Composition • Improvisation",
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
    name_en: "Layla Hassan",
    slug: "layla-hassan",
    category: "singing",
    genre_tag: "طرب أندلسي وموشحات",
    genre_tag_en: "Andalusian Tarab & Muwashshahat",
    city: "الرباط",
    city_en: "Rabat",
    quote: "حين نغني الموشحات، نعيد بعث مدن وحضارات لا تزال حية في وجداننا.",
    quote_en: "When we sing the muwashshahat, we bring back cities and civilisations still alive in us.",
    spotlight_quote: "حين نغني الموشحات، نعيد بعث مدن وحضارات لا تزال حية في وجداننا.",
    spotlight_quote_en: "When we sing the muwashshahat, we bring back cities and civilisations still alive in us.",
    short_bio: "باحثة ومطربة متخصصة في توثيق النوبات الأندلسية والقصائد الصوفية.",
    short_bio_en: "A researcher and singer devoted to documenting the Andalusian nubat and the Sufi qasida.",
    full_bio: "قادت مشاريع بحثية وموسيقية لإحياء التراث الغنائي الأندلسي المشترك بين المشرق والمغرب.",
    full_bio_en: "She has led research and performance projects reviving the Andalusian vocal heritage shared between the Mashriq and the Maghreb.",
    specialties: "الموشحات الأندلسية • النوبات • الأداء المسرحي",
    specialties_en: "Andalusian muwashshahat • Nubat • Stage performance",
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
    name_en: "Youssef Aliqa",
    slug: "youssef-aliqa",
    category: "percussion",
    genre_tag: "إيقاع وتراث حي",
    genre_tag_en: "Percussion & Living Heritage",
    city: "عمان",
    city_en: "Amman",
    quote: "الإيقاع هو نبض الحياة؛ به تنتظم الألحان وبه ترقص القلوب.",
    quote_en: "Rhythm is the pulse of life: it orders the melody and sets hearts dancing.",
    spotlight_quote: "الإيقاع هو نبض الحياة؛ به تنتظم الألحان وبه ترقص القلوب.",
    spotlight_quote_en: "Rhythm is the pulse of life: it orders the melody and sets hearts dancing.",
    short_bio: "خبير الإيقاعات التراثية الشرقية والأندلسية وضابط إيقاع فرقة أندلسيا الرئيسي.",
    short_bio_en: "An expert in Eastern and Andalusian traditional rhythms, and Andalusia's principal timekeeper.",
    full_bio: "يمتلك يوسف فهماً عميقاً للموازين الإيقاعية الأندلسية المركبة والدورات الإيقاعية التراثية.",
    full_bio_en: "Youssef holds a deep command of the compound Andalusian rhythmic modes and the traditional percussive cycles.",
    specialties: "الرق • الدف • الإيقاعات المركبة",
    specialties_en: "Riq • Daf • Compound rhythms",
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
    name_en: "Mona Alandalusia",
    slug: "mona-alandalusia",
    category: "heritage",
    genre_tag: "موشحات وأزجال",
    genre_tag_en: "Muwashshahat & Zajal",
    city: "غرناطة",
    city_en: "Granada",
    quote: "الموشح ذاكرة مدينة كاملة، ومن يغنيه يعيد بناءها بيتاً بيتاً.",
    quote_en: "A muwashshah is the memory of a whole city; whoever sings it rebuilds it house by house.",
    spotlight_quote: "الموشح ذاكرة مدينة كاملة، ومن يغنيه يعيد بناءها بيتاً بيتاً.",
    spotlight_quote_en: "A muwashshah is the memory of a whole city; whoever sings it rebuilds it house by house.",
    short_bio: "باحثة ومؤدية للموشحات الأندلسية، تعيد إحياء النوبات المغاربية على المسرح.",
    short_bio_en: "A researcher and performer of Andalusian muwashshahat, reviving the Maghrebi nubat on stage.",
    full_bio:
      "قضت منى سنوات في تتبع النوبات الأندلسية بين مخطوطات تطوان وفاس قبل أن تعيد تقديمها حية.",
    full_bio_en: "Mona spent years tracing the Andalusian nubat through the manuscripts of Tetouan and Fez before bringing them back to live performance.",
    specialties: "الموشحات • النوبة الأندلسية • الزجل",
    specialties_en: "Muwashshahat • Andalusian nuba • Zajal",
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
    name_en: "Karim Alqanun",
    slug: "karim-alqanun",
    category: "oud",
    genre_tag: "قانون وتقاسيم",
    genre_tag_en: "Qanun & Taqasim",
    city: "تونس",
    city_en: "Tunis",
    quote: "القانون آلة لا تسامح: كل مقام فيها يطلب أذناً صافية ويداً صبورة.",
    quote_en: "The qanun forgives nothing: every maqam on it asks for a clear ear and a patient hand.",
    spotlight_quote: "القانون آلة لا تسامح: كل مقام فيها يطلب أذناً صافية ويداً صبورة.",
    spotlight_quote_en: "The qanun forgives nothing: every maqam on it asks for a clear ear and a patient hand.",
    short_bio: "عازف قانون يجمع بين المدرسة التونسية والمقام الشرقي في تقاسيم مرتجلة.",
    short_bio_en: "A qanun player who joins the Tunisian school to the Eastern maqam in improvised taqasim.",
    full_bio:
      "درس كريم في المعهد العالي للموسيقى بتونس، ويعمل اليوم مع الفرقة على توزيع النوبات.",
    full_bio_en: "Karim studied at the Higher Institute of Music in Tunis and today works with the ensemble on arranging the nubat.",
    specialties: "القانون • التقاسيم • التوزيع",
    specialties_en: "Qanun • Taqasim • Arrangement",
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
    name_en: "Nadia Alhaditha",
    slug: "nadia-alhaditha",
    category: "contemporary",
    genre_tag: "تجريب ومزج معاصر",
    genre_tag_en: "Experiment & Contemporary Fusion",
    city: "مرسيليا",
    city_en: "Marseille",
    quote: "لا أخرج من التراث حين أجرّب، بل أسأله سؤالاً جديداً.",
    quote_en: "Experimenting does not take me out of the tradition; it asks the tradition a new question.",
    spotlight_quote: "لا أخرج من التراث حين أجرّب، بل أسأله سؤالاً جديداً.",
    spotlight_quote_en: "Experimenting does not take me out of the tradition; it asks the tradition a new question.",
    short_bio: "ملحّنة تمزج المقام الأندلسي بالآلات الكهربائية والمعالجة الصوتية الحية.",
    short_bio_en: "A composer blending the Andalusian maqam with electric instruments and live sound processing.",
    full_bio:
      "تشتغل نادية على مشروع يعيد قراءة الموروث الأندلسي بأدوات الموسيقى الإلكترونية المعاصرة.",
    full_bio_en: "Nadia works on a project that rereads the Andalusian inheritance through the tools of contemporary electronic music.",
    specialties: "التلحين • المعالجة الحية • المزج",
    specialties_en: "Composition • Live processing • Fusion",
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
    name_en: "Hisham Alnay",
    slug: "hisham-alnay",
    category: "heritage",
    genre_tag: "ناي ومقامات",
    genre_tag_en: "Nay & Maqamat",
    city: "القاهرة",
    city_en: "Cairo",
    quote: "الناي أقرب الآلات إلى النفس؛ لا يصدر صوتاً إلا بما تعطيه من هواء.",
    quote_en: "The nay is the instrument closest to the self: it makes no sound but the breath you give it.",
    spotlight_quote: "الناي أقرب الآلات إلى النفس؛ لا يصدر صوتاً إلا بما تعطيه من هواء.",
    spotlight_quote_en: "The nay is the instrument closest to the self: it makes no sound but the breath you give it.",
    short_bio: "عازف ناي متخصص في المقامات الشرقية والتقاسيم الحرة المصاحبة للطرب.",
    short_bio_en: "A nay player specialising in the Eastern maqamat and the free taqasim that accompany tarab.",
    full_bio:
      "رافق هشام كباراً من مطربي الطرب الأصيل قبل انضمامه إلى أندلسيا عازفاً ومدرّباً.",
    full_bio_en: "Hisham accompanied leading singers of classical tarab before joining Andalusia as a player and coach.",
    specialties: "الناي • المقامات • التقاسيم الحرة",
    specialties_en: "Nay • Maqamat • Free taqasim",
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
