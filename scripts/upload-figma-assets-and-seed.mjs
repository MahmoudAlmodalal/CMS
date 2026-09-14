import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Map local files to bucket and storage paths
const ASSET_UPLOADS = [
  // Site
  { local: "public/assets/figma/hero-stage-landscape.png", bucket: "site", target: "hero-stage-landscape.png", mime: "image/png" },
  { local: "public/assets/figma/about-musician.png", bucket: "site", target: "about-musician.png", mime: "image/png" },
  { local: "public/assets/figma/hero-stage.png", bucket: "site", target: "hero-stage.png", mime: "image/png" },
  { local: "public/assets/branding/logo-navbar.png", bucket: "site", target: "logo-navbar.png", mime: "image/png" },
  { local: "public/assets/branding/logo-footer.png", bucket: "site", target: "logo-footer.png", mime: "image/png" },

  // Artists
  { local: "public/assets/artists/sara-alsawt-profile.png", bucket: "artists", target: "sara-alsawt-profile.png", mime: "image/png" },
  { local: "public/assets/artists/artist-1.png", bucket: "artists", target: "artist-1.png", mime: "image/png" },
  { local: "public/assets/artists/artist-2.png", bucket: "artists", target: "artist-2.png", mime: "image/png" },
  { local: "public/assets/artists/artist-3.png", bucket: "artists", target: "artist-3.png", mime: "image/png" },
  { local: "public/assets/artists/artist-4.png", bucket: "artists", target: "artist-4.png", mime: "image/png" },
  { local: "public/assets/artists/stage-1.png", bucket: "artists", target: "stage-1.png", mime: "image/png" },
  { local: "public/assets/artists/stage-2.png", bucket: "artists", target: "stage-2.png", mime: "image/png" },

  // Events
  { local: "public/assets/events/home-band.png", bucket: "events", target: "home-band.png", mime: "image/png" },
  { local: "public/assets/events/featured-cover.png", bucket: "events", target: "featured-cover.png", mime: "image/png" },
  { local: "public/assets/events/event-1.png", bucket: "events", target: "event-1.png", mime: "image/png" },
  { local: "public/assets/events/event-2.png", bucket: "events", target: "event-2.png", mime: "image/png" },
  { local: "public/assets/events/event-3.png", bucket: "events", target: "event-3.png", mime: "image/png" },
  { local: "public/assets/events/event-4.png", bucket: "events", target: "event-4.png", mime: "image/png" },
  { local: "public/assets/events/event-5.png", bucket: "events", target: "event-5.png", mime: "image/png" },

  // Articles
  { local: "public/assets/articles/article-1.png", bucket: "articles", target: "article-1.png", mime: "image/png" },
  { local: "public/assets/articles/article-2.png", bucket: "articles", target: "article-2.png", mime: "image/png" },
  { local: "public/assets/articles/article-3.png", bucket: "articles", target: "article-3.png", mime: "image/png" },
  { local: "public/assets/articles/news-side-1.png", bucket: "articles", target: "news-side-1.png", mime: "image/png" },
  { local: "public/assets/articles/news-side-2.png", bucket: "articles", target: "news-side-2.png", mime: "image/png" },

  // Academy
  { local: "public/assets/academy-oud.png", bucket: "academy", target: "academy-oud.png", mime: "image/png" },
  { local: "public/assets/academy-performance.png", bucket: "academy", target: "academy-performance.png", mime: "image/png" },
  { local: "public/assets/academy-vocal.png", bucket: "academy", target: "academy-vocal.png", mime: "image/png" },

  // Releases
  { local: "public/assets/releases/release-1.png", bucket: "releases", target: "release-1.png", mime: "image/png" },
  { local: "public/assets/releases/release-2.png", bucket: "releases", target: "release-2.png", mime: "image/png" },
  { local: "public/assets/releases/release-3.png", bucket: "releases", target: "release-3.png", mime: "image/png" },
  { local: "public/assets/releases/release-4.png", bucket: "releases", target: "release-4.png", mime: "image/png" },
];

async function uploadAll() {
  console.log("=== Step 1: Uploading images to Supabase Storage ===");
  const urls = {};

  // Pre-populate canonical Supabase Storage public URLs
  for (const item of ASSET_UPLOADS) {
    const key = `${item.bucket}:${item.target}`;
    urls[key] = `${supabaseUrl}/storage/v1/object/public/${item.bucket}/${item.target}`;
  }

  for (const item of ASSET_UPLOADS) {
    if (!fs.existsSync(item.local)) {
      console.warn(`File not found: ${item.local}`);
      continue;
    }
    const buffer = fs.readFileSync(item.local);
    const { error } = await supabase.storage.from(item.bucket).upload(item.target, buffer, {
      contentType: item.mime,
      upsert: true,
    });
    if (error) {
      console.error(`Error uploading ${item.local} -> ${item.bucket}/${item.target}:`, error.message);
    } else {
      const key = `${item.bucket}:${item.target}`;
      console.log(`Uploaded: ${key}`);
    }
  }

  // Fallback for hero image if needed
  urls["site:hero-stage-landscape.png"] = urls["site:hero-stage-landscape.png"] || 
    `${supabaseUrl}/storage/v1/object/public/site/hero-stage-landscape.png`;
  urls["site:about-musician.png"] = urls["site:about-musician.png"] || 
    `${supabaseUrl}/storage/v1/object/public/site/about-musician.png`;

  console.log("\n=== Step 2: Seeding / Updating database with Supabase storage URLs ===");

  // 1. Site settings
  const sitePayload = {
    id: "default",
    hero_headline: "منصتك الأولى لاكتشاف ودعم المواهب الفنية والثقافية",
    hero_subheadline: "أندلسيا منصة متخصصة في تمثيل ودعم المواهب الإبداعية، وربط الفنانين بالأماكن والمناسبات التي تستحق الجمال.",
    hero_image_url: urls["site:hero-stage-landscape.png"],
    hero_headline_en: "Your first platform for discovering and supporting artistic and cultural talents.",
    hero_subheadline_en: "Andalusia represents and supports creative talent, connecting artists with the places and occasions that deserve beauty.",
    about_headline: "نكتشف · نصل · نحتفي",
    about_body: "وُلدنا من إيمان عميق بأن الفن ليس ترفاً بل ضرورة. نعمل على تقريب المسافة بين الفنان الموهوب والجمهور الذي ينتظره، وبين المناسبة التي تستحق اللحظة الفنية التي تجعلها لا تُنسى. أندلسيا منصة متخصصة في تمثيل ودعم المواهب الإبداعية، وربط الفنانين بالأماكن والمناسبات التي تستحق الجمال.",
    about_image_url: urls["site:about-musician.png"],
    about_headline_en: "We discover · We connect · We celebrate",
    about_body_en: "We were born from a deep belief that art is not a luxury but a necessity. We work to close the distance between a talented artist and the audience waiting for them, and between an occasion and the artistic moment that makes it unforgettable. Andalusia represents and supports creative talent, connecting artists with the places and occasions that deserve beauty.",
    booking_banner_title: "مناسبتك تستحق موسيقى حقيقية. ♪",
    booking_banner_body: "احجز فرقة أندلسيا لحفلتك، مطعمك، مهرجانك — واصنع لحظة لا تُنسى.",
    booking_banner_title_en: "Your occasion deserves real music. ♪",
    booking_banner_body_en: "Book Andalusia for your party, your restaurant, your festival — and make a moment no one forgets.",
    artists_subtitle: "كل فنان في أندلسيا يحمل قصة ومعاناة تحوّلت إلى موسيقى تلامس القلوب.",
    artists_subtitle_en: "Every artist in Andalusia carries a story and struggle that transforms into music that touches the heart.",
    events_subtitle: "مواعيد تترك أثراً جميلاً.",
    events_subtitle_en: "Dates that leave a beautiful mark.",
    academy_subtitle: "برامج تعليمية موسيقية مع فنانين حقيقيين في بيئات صغيرة ومكثفة — تجربة تغير مسارك الفني.",
    academy_subtitle_en: "Educational music programs with real artists in small, intensive environments — an experience that will change your artistic path.",
    booking_subtitle: "احجز حفلتك الخاصة أو شاركنا فعاليتك القادمة.",
    booking_subtitle_en: "Book your private evening, or bring us into your next event.",
    contact_email: "hello@andalusia.art",
    contact_phone: "+961 1 234 567",
    operational_regions: "لبنان · المغرب · الخليج",
    operational_regions_en: "Lebanon · Morocco · The Gulf",
    footer_mission: "مجموعة فنانين يؤمنون أن الإبداع هو الحياة والموسيقى هي الشعلة.",
    footer_mission_en: "A collective of artists who believe creativity is life and music is the spark.",
    copyright_text: "© أندلسيا ٢٠٢٥ — جميع الحقوق محفوظة",
    copyright_text_en: "© Andalusia 2025 — All rights reserved",
    home_hero_primary_cta: "احجز الآن",
    home_hero_primary_cta_en: "Book now",
    home_hero_secondary_cta: "اكتشف الفنانين",
    home_hero_secondary_cta_en: "Discover artists",
    home_about_cta: "تعرّف على فنانينا ←",
    home_about_cta_en: "Meet our artists →",
    home_artists_heading: "أصوات تصنع التاريخ",
    home_artists_heading_en: "Voices that make history",
    home_artists_cta: "عرض جميع الفنانين ←",
    home_artists_cta_en: "View all artists →",
    home_testimonials_heading: "يقولون عن أندلسيا",
    home_testimonials_heading_en: "They say about Andalusia",
    home_editorial_heading: "نكتب كي لا تضيع التفاصيل",
    home_editorial_heading_en: "We write so that details do not get lost",
    home_events_heading: "نلتقي في المكان. في اللحظة",
    home_events_heading_en: "We meet at the place. At the moment.",
    home_events_cta: "عرض كل الفعاليات",
    home_events_cta_en: "View all events",
    events_title: "مواعيد تترك أثراً جميلاً.",
    events_title_en: "Dates that leave a beautiful mark.",
    artists_title: "أصوات تصنع التاريخ",
    artists_title_en: "Voices that make history",
    academy_title: "أكاديمية أندلسيا الموسيقية",
    academy_title_en: "Andalusia Music Academy",
    academy_kicker: "تعلّم من اليد التي تعرف الطريق",
    academy_kicker_en: "Learn from the hand that knows the way",
    academy_tracks_heading: "ثلاثة مسارات، موهبة واحدة",
    academy_tracks_heading_en: "Three paths, one talent",
    news_title: "الأخبار والمقالات",
    news_title_en: "News & Articles",
    news_subtitle: "نكتب كي لا تضيع التفاصيل",
    news_subtitle_en: "We write so that details do not get lost",
    booking_title: "مناسبتك تستحق موسيقى حقيقية. ♪",
    booking_title_en: "Your event deserves real music. ♪",
  };

  const { error: siteErr } = await supabase.from("site_settings").upsert(sitePayload);
  if (siteErr) console.error("Error upserting site_settings:", siteErr.message);
  else console.log("✓ site_settings updated successfully");

  // 2. Artists
  const artistsData = [
    {
      id: "b1111111-1111-1111-1111-111111111111",
      slug: "sara-alsawt",
      name: "سارة الصوت",
      name_en: "Sara Alsawt",
      category: "singing",
      genre_tag: "غناء أصيل وموشحات أندلسية",
      genre_tag_en: "Classical Tarab & Andalusian Vocals",
      city: "بيروت — لبنان",
      city_en: "Beirut — Lebanon",
      quote: "الصوت هو المرآة الأصدق للروح — لا تكذب على جمهورك أبداً.",
      quote_en: "The voice is the truest mirror of the soul — never lie to your audience.",
      short_bio: "مغنية متخصصة في الطرب الأصيل والغناء العاطفي. صوتها يحمل دفء الأرض وعمق التراث مع لمسة معاصرة تلامس الأجيال.",
      short_bio_en: "A singer specializing in authentic tarab and emotive vocals. Her voice carries the warmth of the earth and the depth of heritage with a contemporary touch.",
      full_bio: "سارة الصوت فنانة مخضرمة متخصصة في الطرب الأصيل والموشحات الأندلسية، قدمت عروضاً في أرقى المسارح العربية والعالمية.",
      full_bio_en: "Sara Alsawt is a seasoned artist specializing in classical Tarab and Andalusian muwashahat, performing across major Arab and international venues.",
      specialties: "غناء أندلسي، موشحات، طرب أصيل",
      specialties_en: "Andalusian Vocals, Muwashahat, Classical Tarab",
      portrait_image_url: urls["artists:sara-alsawt-profile.png"] || urls["artists:artist-1.png"],
      is_published: true,
      is_featured: true,
      display_order: 1,
    },
    {
      id: "b2222222-2222-2222-2222-222222222222",
      slug: "tariq-oud",
      name: "طارق العود",
      name_en: "Tariq Al-Oud",
      category: "oud",
      genre_tag: "عزف العود",
      genre_tag_en: "Oud Master",
      city: "بيروت — لبنان",
      city_en: "Beirut — Lebanon",
      quote: "العود ليس مجرد آلة، بل امتداد لروح العازف ينبض بكل وتر.",
      quote_en: "The oud is not merely an instrument; it is an extension of the soul vibrating with every string.",
      short_bio: "عازف عود ومؤلف موسيقي يمزج التراث الأندلسي العريق بالرؤية المعاصرة.",
      short_bio_en: "Oud virtuoso and composer blending classical Andalusian heritage with modern vision.",
      full_bio: "يعد طارق العود من أبرز العازفين في جيله، حيث طوّر أسلوباً فريداً يجمع بين التقنية الكلاسيكية والارتجال الطربي الحي.",
      full_bio_en: "Tariq Al-Oud is recognized as one of the finest virtuosos of his generation, developing a unique technique uniting classic discipline with live improvisation.",
      specialties: "عزف عود، مقامات شرقية، تأليف موسيقي",
      specialties_en: "Oud Solo, Oriental Maqams, Composition",
      portrait_image_url: urls["artists:artist-1.png"],
      is_published: true,
      is_featured: true,
      display_order: 2,
    },
    {
      id: "b3333333-3333-3333-3333-333333333333",
      slug: "nour-alwan",
      name: "نور علوان",
      name_en: "Nour Alwan",
      category: "heritage",
      genre_tag: "موسيقى وتراث",
      genre_tag_en: "Music & Heritage",
      city: "القاهرة — مصر",
      city_en: "Cairo — Egypt",
      quote: "الموسيقى جسر يعبر بنا عبر الزمان ليعيد إحياء أرقى المشاعر الإنسانية.",
      quote_en: "Music is a bridge across time reviving the finest human feelings.",
      short_bio: "فنانة وباحثة موسيقية متخصصة في إحياء الموشحات والألحان التراثية النادرة.",
      short_bio_en: "Artist and music researcher dedicated to reviving rare traditional melodies and muwashahat.",
      full_bio: "تكرس نور علوان جهودها الفنية لإعادة اكتشاف المخطوطات الموسيقية التاريخية وتقديمها بروح شابة للجمهور المعاصر.",
      full_bio_en: "Nour Alwan dedicates her artistic career to rediscovering historical musical manuscripts and performing them for contemporary audiences.",
      specialties: "أبحاث تراثية، إنشاد، موشحات",
      specialties_en: "Heritage Research, Vocal Chanting, Muwashahat",
      portrait_image_url: urls["artists:artist-2.png"],
      is_published: true,
      is_featured: true,
      display_order: 3,
    },
    {
      id: "b4444444-4444-4444-4444-444444444444",
      slug: "youssef-iqaa",
      name: "يوسف الإيقاع",
      name_en: "Youssef Al-Iqaa",
      category: "percussion",
      genre_tag: "إيقاع وتراث",
      genre_tag_en: "Rhythm & Heritage",
      city: "الدار البيضاء",
      city_en: "Casablanca",
      quote: "الإيقاع هو نبض الحياة في كل عمل فني وهو ما يوقظ الروح.",
      quote_en: "Rhythm is the heartbeat in every art piece that awakens the soul.",
      short_bio: "ضابط إيقاع ماهر يتقن الأوزان العربية والأندلسية المعقدة بموهبة فذة.",
      short_bio_en: "Master percussionist commanding intricate Arabic and Andalusian rhythmic meters.",
      full_bio: "يقود يوسف الإيقاع القسم الإيقاعي في العديد من الفرق العالمية، مبرزاً غنى الإيقاعات المغاربية والأندلسية الأصيلة.",
      full_bio_en: "Youssef Al-Iqaa leads rhythm sections in prestigious world ensembles, highlighting the richness of authentic Maghrebi and Andalusian percussion.",
      specialties: "إيقاع شرقي، رق، دف، أوزان أندلسية",
      specialties_en: "Oriental Percussion, Riq, Duff, Andalusian Rhythms",
      portrait_image_url: urls["artists:artist-3.png"],
      is_published: true,
      is_featured: true,
      display_order: 4,
    },
  ];

  for (const artist of artistsData) {
    const { error: aErr } = await supabase.from("artists").upsert(artist, { onConflict: "slug" });
    if (aErr) console.error(`Error upserting artist ${artist.slug}:`, aErr.message);
    else console.log(`✓ Artist ${artist.name} (${artist.slug}) upserted`);
  }

  // 3. Events
  const eventsData = [
    {
      id: "e1111111-1111-1111-1111-111111111111",
      slug: "andalusian-music-night",
      title: "ليلة الطرب الأندلسي",
      title_en: "Andalusian Music Night",
      category: "concert",
      event_date: "2026-03-15T20:00:00Z",
      location: "بيروت — لبنان",
      location_en: "Beirut — Lebanon",
      city: "بيروت",
      city_en: "Beirut",
      performer_name: "أحمد العود",
      performer_name_en: "Ahmad Al-Oud",
      description: "أمسية طربية ساحرة تستعيد أجمل ما جادت به القريحة الأندلسية من موشحات وألحان أصيلة.",
      description_en: "A magical evening of enchanting music reviving Andalusian melodies and classical muwashahat.",
      image_url: urls["events:event-1.png"] || urls["events:home-band.png"],
      ticket_url: "https://andalusia.art/booking",
      is_featured: true,
      is_published: true,
      display_order: 1,
    },
    {
      id: "e2222222-2222-2222-2222-222222222222",
      slug: "oud-and-poetry-evening",
      title: "أمسية العود والكلمة",
      title_en: "Evening of Oud and Poetry",
      category: "evening",
      event_date: "2026-04-05T19:30:00Z",
      location: "القاهرة — مصر",
      location_en: "Cairo — Egypt",
      city: "القاهرة",
      city_en: "Cairo",
      performer_name: "سارة الصوت",
      performer_name_en: "Sara Alsawt",
      description: "لقاء فني حميمي يجمع بين عذوبة الكلمة وسحر العود مع نخبة من فناني منصة أندلسيا.",
      description_en: "An intimate artistic gathering uniting poetic beauty and the resonance of the oud.",
      image_url: urls["events:event-2.png"] || urls["events:featured-cover.png"],
      ticket_url: "https://andalusia.art/booking",
      is_featured: true,
      is_published: true,
      display_order: 2,
    },
    {
      id: "e3333333-3333-3333-3333-333333333333",
      slug: "spring-music-festival",
      title: "مهرجان الربيع الموسيقي",
      title_en: "Spring Music Festival",
      category: "festival",
      event_date: "2026-05-20T21:00:00Z",
      location: "الدار البيضاء — المغرب",
      location_en: "Casablanca — Morocco",
      city: "الدار البيضاء",
      city_en: "Casablanca",
      performer_name: "فرقة أندلسيا",
      performer_name_en: "Andalusia Ensemble",
      description: "مهرجان احتفالي جامع يستضيف عروضاً حية ومشاركات دولية تحتفي بالموسيقى التراثية.",
      description_en: "A grand celebration hosting live shows celebrating timeless musical heritage.",
      image_url: urls["events:event-3.png"] || urls["events:home-band.png"],
      ticket_url: "https://andalusia.art/booking",
      is_featured: true,
      is_published: true,
      display_order: 3,
    },
  ];

  for (const ev of eventsData) {
    const { error: eErr } = await supabase.from("events").upsert(ev, { onConflict: "slug" });
    if (eErr) console.error(`Error upserting event ${ev.slug}:`, eErr.message);
    else console.log(`✓ Event ${ev.title} (${ev.slug}) upserted`);
  }

  // 4. Academy courses
  const coursesData = [
    {
      id: "a1111111-1111-1111-1111-111111111111",
      slug: "oud-academy",
      title: "مدرسة العود",
      title_en: "Oud Academy",
      track_category: "مدرسة التراث",
      description: "دراسة أصول العود والمقامات الشرقية وتقنيات العزف الأندلسي مع نخبة من الأساتذة.",
      image_url: urls["academy:academy-oud.png"],
      display_order: 1,
      is_published: true,
    },
    {
      id: "a2222222-2222-2222-2222-222222222222",
      slug: "takht-ensemble",
      title: "فن الأداء والتخت الشرقي",
      title_en: "Ensemble & Performance",
      track_category: "التناغم الموسيقي",
      description: "تدريب عملي على التفاعل الحي والارتجال داخل فرق التخت الشرقي الكلاسيكي.",
      image_url: urls["academy:academy-performance.png"],
      display_order: 2,
      is_published: true,
    },
    {
      id: "a3333333-3333-3333-3333-333333333333",
      slug: "classical-tarab-vocal",
      title: "الصوت والطرب الكلاسيكي",
      title_en: "Vocal & Classical Tarab",
      track_category: "الغناء والتنفس",
      description: "تقنيات الصوت والموشحات الأندلسية والقصائد المغناة وتطوير المساحة الصوتية.",
      image_url: urls["academy:academy-vocal.png"],
      display_order: 3,
      is_published: true,
    },
  ];

  for (const course of coursesData) {
    const { error: cErr } = await supabase.from("academy_courses").upsert(course, { onConflict: "slug" });
    if (cErr) console.error(`Error upserting course ${course.slug}:`, cErr.message);
    else console.log(`✓ Course ${course.title} (${course.slug}) upserted`);
  }

  // 5. Articles
  const articlesData = [
    {
      id: "c1111111-1111-1111-1111-111111111111",
      slug: "summer-music-events-schedule",
      title: "الإعلان عن جدول فعاليات الصيف الموسيقية",
      title_en: "Announcement of the Summer Music Events Schedule",
      category: "events",
      excerpt: "تعرف على الحفلات الموسيقية والأمسيات الفنية المخطط لها للموسم القادم في منصة الأندلس الثقافية.",
      excerpt_en: "Discover the planned concerts and artistic evenings for the upcoming season at the Andalus Cultural Platform.",
      content: "يسر منصة أندلسيا الإعلان عن روزنامة الفعاليات الصيفية التي تضم سلسلة من الحفلات الطربية والأمسيات الحية بمشاركة أبرز نجوم الموسيقى التراثية في العالم العربي.",
      content_en: "Andalusia platform is delighted to unveil its summer lineup featuring musical evenings and live performances by prominent heritage artists.",
      author_name: "الأخبار",
      author_name_en: "News",
      cover_image_url: urls["articles:article-1.png"] || urls["articles:news-side-1.png"],
      is_featured: true,
      is_published: true,
    },
    {
      id: "c2222222-2222-2222-2222-222222222222",
      slug: "photographer-journey-old-city-alleys",
      title: "رحلة مصور في أزقة المدينة القديمة",
      title_en: "A Photographer's Journey Through the Alleys of the Old City",
      category: "artists",
      excerpt: "يشاركنا المصور الفوتوغرافي تجربته في توثيق الحياة اليومية والتفاصيل المعمارية التي تعكس الهوية التاريخية.",
      excerpt_en: "The photographer shares his experience in documenting daily life and architectural details reflecting historical identity.",
      content: "رحلة بصرية تأخذنا عبر عدسة الكاميرا إلى عمق الأزقة العتيقة حيث تلتقي أصالة الماضي بالحاضر في لوحات حية نابضة بالضوء والذاكرة.",
      content_en: "A visual odyssey taking us through the lens into the depth of ancient alleys where past authenticity meets present vibrancy.",
      author_name: "قصص الفنانين",
      author_name_en: "Artists' stories",
      cover_image_url: urls["articles:article-2.png"] || urls["articles:news-side-2.png"],
      is_featured: true,
      is_published: true,
    },
    {
      id: "c3333333-3333-3333-3333-333333333333",
      slug: "interview-sculptor-ahmed-mahmoud",
      title: "حوار مع النحات أحمد محمود",
      title_en: "Interview with Sculptor Ahmed Mahmoud",
      category: "artists",
      excerpt: "حوار خاص يستكشف تجربة النحت الحديث وكيف تلهم الموسيقى الأندلسية حركة الأشكال والخطوط في أعماله الفنية.",
      excerpt_en: "A special interview exploring modern sculpture and how Andalusian music inspires forms and lines in his artwork.",
      content: "في هذا الحوار الحصري، يحدثنا الفنان أحمد محمود عن فلسفته في تحويل النغم والمقامات الموسيقية إلى كتل منحوتة تعبر عن الوجدان العربي.",
      content_en: "In this exclusive interview, artist Ahmed Mahmoud discusses his philosophy of transforming melodic modes into sculpted forms.",
      author_name: "قصص الفنانين",
      author_name_en: "Artists' stories",
      cover_image_url: urls["articles:article-3.png"] || urls["articles:article-1.png"],
      is_featured: true,
      is_published: true,
    },
    {
      id: "c4444444-4444-4444-4444-444444444444",
      slug: "new-classical-sculpture-workshop",
      title: "ورشة عمل جديدة في النحت الكلاسيكي",
      title_en: "A New Workshop in Classical Sculpture",
      category: "academy",
      excerpt: "تعلن أكاديمية أندلسيا عن إطلاق ورشة عمل تدريبية مكثفة للمهتمين بتعلم أصول النحت والتشكيل الكلاسيكي.",
      excerpt_en: "Andalusia Academy announces an intensive training workshop for those interested in mastering classical sculpture.",
      content: "تهدف الورشة إلى تمكين المشاركين من فهم أبعاد الكتلة والفراغ، والتعامل مع المواد التقليدية بأساليب تحاكي الإبداع الأندلسي الأصيل.",
      content_en: "The workshop aims to empower participants with an understanding of mass and space using traditional materials.",
      author_name: "الأكاديمية",
      author_name_en: "Academy",
      cover_image_url: urls["articles:news-side-1.png"] || urls["articles:article-2.png"],
      is_featured: false,
      is_published: true,
    },
  ];

  for (const art of articlesData) {
    const { error: artErr } = await supabase.from("articles").upsert(art, { onConflict: "slug" });
    if (artErr) console.error(`Error upserting article ${art.slug}:`, artErr.message);
    else console.log(`✓ Article ${art.title} (${art.slug}) upserted`);
  }

  // 6. Testimonials
  const testimonialsData = [
    {
      id: "10000000-0000-0000-0000-000000000001",
      quote: "من أفضل الفرق الموسيقية التي شاركت في فعالياتنا على مدى عشر سنوات. الانسجام بين الفنانين والحضور يخلق سحراً حقيقياً.",
      quote_en: "One of the best musical groups to perform at our events over the past ten years. The harmony between the artists and the audience creates real magic.",
      author_name: "عمر الحاج",
      author_name_en: "Omar Al-Hajj",
      author_role: "منظم فعاليات ثقافية",
      author_role_en: "Cultural Events Organizer",
      display_order: 1,
      is_published: true,
    },
    {
      id: "10000000-0000-0000-0000-000000000002",
      quote: "التنظيم والاحترافية العالية التي قدمتها فرقة أندلسيا جعلت من أمسيتنا ذكرى لا تُنسى لجميع الحاضرين.",
      quote_en: "Andalusia’s organization and professionalism turned our evening into an unforgettable memory for everyone who attended.",
      author_name: "د. ناديا القاسم",
      author_name_en: "Dr. Nadia Al-Qasim",
      author_role: "مديرة مهرجان أصداء التراث الدولي",
      author_role_en: "Director, Echoes of Heritage International Festival",
      display_order: 2,
      is_published: true,
    },
    {
      id: "10000000-0000-0000-0000-000000000003",
      quote: "المستوى الموسيقي المتقن والشغف الذي يلمسه الجمهور في أداء فناني أندلسيا يعيد للموشحات الأندلسية بريقها الخالد.",
      quote_en: "The musicians’ mastery and passion bring the timeless brilliance of Andalusian muwashahat back to life.",
      author_name: "كريم الزهراني",
      author_name_en: "Karim Al-Zahrani",
      author_role: "باحث في المقامات التراثية والأندلسية",
      author_role_en: "Researcher in Traditional and Andalusian Maqams",
      display_order: 3,
      is_published: true,
    },
  ];

  for (const t of testimonialsData) {
    const { error: tErr } = await supabase.from("testimonials").upsert(t, { onConflict: "id" });
    if (tErr) console.error(`Error upserting testimonial ${t.author_name}:`, tErr.message);
    else console.log(`✓ Testimonial by ${t.author_name} upserted`);
  }

  // 7. Releases
  const releasesData = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      artist_id: "b1111111-1111-1111-1111-111111111111",
      title: "شمس الأندلس",
      title_en: "Shams Al-Andalus",
      release_type: "studio",
      track_count: 8,
      release_year: 2025,
      cover_image_url: urls["releases:release-1.png"],
      display_order: 1,
      is_published: true,
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      artist_id: "b1111111-1111-1111-1111-111111111111",
      title: "أوتار وقصائد",
      title_en: "Strings & Poems",
      release_type: "live",
      track_count: 4,
      release_year: 2024,
      cover_image_url: urls["releases:release-2.png"],
      display_order: 2,
      is_published: true,
    }
  ];

  for (const rel of releasesData) {
    const { error: rErr } = await supabase.from("releases").upsert(rel, { onConflict: "id" });
    if (rErr) console.error(`Error upserting release ${rel.title}:`, rErr.message);
    else console.log(`✓ Release ${rel.title} upserted`);
  }

  console.log("\n=== Finished All Uploads and Data Sync ===");
}

uploadAll().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
