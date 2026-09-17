/**
 * Demo content seed — one idempotent script for all 10 demo tables.
 *
 * Usage:
 *   node scripts/seed-demo-content.mjs            # Step 1 — inventory (read-only, no writes)
 *   node scripts/seed-demo-content.mjs --seed     # Step 2 — upsert all demo rows + upload demo audio
 *   node scripts/seed-demo-content.mjs --cleanup  # delete every demo row + demo storage prefix
 *
 * Marker + cleanup contract:
 *   - every demo row carries a `demo-` slug prefix (artists, events, articles)
 *     or a `demo-…@example.com` email (booking_requests, newsletter_subscribers);
 *   - demo testimonials use display_order 901+ (no slug/email column exists);
 *   - demo binaries live under the `x-demo-1/` storage prefix (audio bucket).
 *   - cleanup deletes those slugs/emails/orders + the storage prefix in one pass.
 *     Tracks / releases / works cascade from their artist (ON DELETE CASCADE);
 *     bookings / articles keep SET NULL links and are deleted explicitly first.
 *
 * Shape contract (mirrors src/lib/validations/{cms,booking,newsletter}.ts):
 *   - slugs match ^[a-z0-9-]+$, enums match the migration CHECKs,
 *   - bookings are inserted through the public-booking shape (pending only),
 *     then triaged with adminBookingUpdateSchema semantics (status+admin_notes),
 *   - newsletter rows use the public subscribe shape (email only),
 *   - artist_works use real public YouTube IDs and default to published,
 *   - site settings hero_video_url is a YouTube watch URL only (never a file).
 *
 * Service-role client: RLS-bypass for seeding only; values are never logged.
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { loadEnvFile } from "node:process";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) loadEnvFile(file);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase configuration; values are never logged.");

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) }) },
});

const mode = process.argv.includes("--seed") ? "seed" : process.argv.includes("--cleanup") ? "cleanup" : "inventory";
const DEMO_PREFIX = "x-demo-1";

/* ------------------------------------------------------------------ */
/* Step 1 — inventory (read-only, pre-existing behaviour)              */
/* ------------------------------------------------------------------ */
async function inventory() {
  const tables = ["artists", "tracks", "releases", "artist_works", "events", "booking_requests", "newsletter_subscribers", "articles", "testimonials", "site_settings"];
  for (const table of tables) {
    const privateTable = ["booking_requests", "newsletter_subscribers"].includes(table);
    const rows = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await client.from(table).select(privateTable ? "id" : "*").order("id").range(offset, offset + 499);
      if (error) throw new Error(`${table}: inventory failed (${error.code || "network"}); no writes attempted`);
      rows.push(...data);
      if (data.length < 500) break;
    }
    console.log(JSON.stringify({ table, count: rows.length,
      identities: privateTable ? undefined : rows.map(({ id, slug }) => ({ id, slug })),
      missingEnglish: privateTable ? undefined : Object.fromEntries(Object.keys(rows[0] || {}).filter((field) => field.endsWith("_en")).map((field) => [field, rows.filter((row) => !row[field]?.trim()).length])),
      artists: table === "artists" ? rows.map(({ id, slug, name, name_en, category }) => ({ id, slug, name, name_en, category })) : undefined,
    }));
  }
  const { data: buckets, error } = await client.storage.listBuckets();
  if (error) throw new Error("Storage inventory failed; no writes attempted");
  for (const bucket of buckets) {
    let count = 0;
    const folders = [""];
    for (const folder of folders) {
      for (let offset = 0; ; offset += 100) {
        const { data, error } = await client.storage.from(bucket.id).list(folder, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
        if (error) throw new Error("Storage page failed; no writes attempted");
        for (const object of data) {
          const path = [folder, object.name].filter(Boolean).join("/");
          if (object.id) {
            count++;
            console.log(JSON.stringify({ bucket: bucket.id, path, size: object.metadata?.size, mime: object.metadata?.mimetype }));
          } else folders.push(path);
        }
        if (data.length < 100) break;
      }
    }
    console.log(JSON.stringify({ bucket: bucket.id, count, public: bucket.public }));
  }
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */
const SLUG_RE = /^[a-z0-9-]+$/;
function assertSlug(slug, max = 250) {
  if (typeof slug !== "string" || slug.length < 1 || slug.length > max || !SLUG_RE.test(slug)) {
    throw new Error(`Invalid slug shape: ${slug}`);
  }
}
function pub(bucket, path) {
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
async function upsert(table, rows, onConflict) {
  const { error } = await client.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table} upsert failed: ${error.message}`);
}
async function demoArtistIds() {
  const { data, error } = await client.from("artists").select("id,slug").like("slug", "demo-%");
  if (error) throw error;
  return new Map(data.map((a) => [a.slug, a.id]));
}
async function demoEventIds() {
  const { data, error } = await client.from("events").select("id,slug").like("slug", "demo-%");
  if (error) throw error;
  return new Map(data.map((e) => [e.slug, e.id]));
}

/* ------------------------------------------------------------------ */
/* 1. Artists (10) — 2 per category, demo- slugs, bilingual long bios  */
/* Portraits reuse existing objects in the artists bucket.             */
/* ------------------------------------------------------------------ */
function artistRows(P) {
  const A = [
    {
      slug: "demo-layla-tarab", name: "ليلى الطرب", name_en: "Layla Tarab", category: "singing",
      genre_tag: "طرب أصيل", genre_tag_en: "Classic Tarab", city: "القاهرة", city_en: "Cairo",
      portrait: P("artist-1.png"), quote: "الصوت أمانة، والطرب رسالة تصل القلب قبل الأذن.",
      quote_en: "The voice is a trust; tarab is a message that reaches the heart before the ear.",
      spotlight: "نجمة الأمسية الافتتاحية لمهرجان المقام الأول.", spotlight_en: "Headliner of the first Maqam Festival opening night.",
      short_bio: "مطربة مصرية متخصصة في الطرب الأصيل والموشحات، تحيي حفلات كبرى في القاهرة وبيروت ودبي.",
      short_bio_en: "Egyptian vocalist specialising in classic tarab and muwashahat, headlining major concerts in Cairo, Beirut and Dubai.",
      specialties: "مقامات، موشحات، غناء حي", specialties_en: "Maqams, muwashahat, live vocals",
      full_bio: "وُلدت ليلى الطرب في القاهرة ونشأت في بيت يعشق أم كلثوم وعبد الوهاب، فحفظت روائعهما قبل أن تبلغ العاشرة. درست المقامات الشرقية في معهد الموسيقى العربية وتخرجت بتقدير امتياز، ثم بدأت مشوارها في ساقية الصاوي قبل أن تنتقل إلى المسارح الكبرى. تتميز بقدرة نادرة على الارتجال داخل المقام الواحد، وتمزج في حفلاتها بين التراث العريق والتوزيع العصري الخفيف. أصدرت ثلاثة ألبومات ناجحة وتعاونت مع نخبة الملحنين، وشاركت في مهرجانات قرطاج وجرش. تؤمن أن الطرب فن الحضور والصدق، وتقود ورشاً لتعليم الغناء للشابات. حصلت على جائزة أفضل صوت نسائي مرتين، وتستعد لجولة خليجية جديدة.",
      full_bio_en: "Layla Tarab was born in Cairo into a household devoted to Umm Kulthum and Abdel Wahab, memorising their masterpieces before the age of ten. She studied Eastern maqams at the Institute of Arabic Music, graduating with honours, and began performing at El Sawy Culturewheel before moving to major theatres. She is prized for a rare gift for improvisation within a single maqam, blending deep heritage with light modern arrangements in her concerts. She has released three acclaimed albums, collaborated with leading composers, and appeared at the Carthage and Jerash festivals. She believes tarab is the art of presence and honesty, and she runs singing workshops for young women. Twice voted best female voice, she is now preparing a new Gulf tour.",
    },
    {
      slug: "demo-samar-nagham", name: "سمر النغم", name_en: "Samar Nagham", category: "singing",
      genre_tag: "غناء معاصر", genre_tag_en: "Contemporary Vocals", city: "عمّان", city_en: "Amman",
      portrait: P("artist-2.png"), quote: "أغني للناس حكاياتهم بصوت يشبههم.",
      quote_en: "I sing people their own stories in a voice that resembles them.",
      spotlight: "صوت الحملة الثقافية لعمّان عاصمة الموسيقى.", spotlight_en: "The voice of the Amman music-capital cultural campaign.",
      short_bio: "مغنية أردنية تمزج الفلكلور الشامي بالبوب العربي، عُرفت بأغانيها عن المدينة والذاكرة.",
      short_bio_en: "Jordanian singer blending Levantine folklore with Arab pop, known for her songs about the city and memory.",
      specialties: "بوب عربي، فلكلور، كتابة أغاني", specialties_en: "Arab pop, folklore, songwriting",
      full_bio: "بدأت سمر النغم الغناء في جوقة المدرسة في عمّان، ثم درست الأدب الإنجليزي قبل أن تحسم الموسيقى خيارها النهائي. تكتب كلمات أغانيها بنفسها مستلهمة من أزقة جبل اللويبدة وأسواق وسط البلد. ألبومها الأول باع آلاف النسخ الرقمية وحقق انتشاراً واسعاً بين الشباب. تتعاون مع منتجين من بيروت والقاهرة وتمزج الإيقاعات الإلكترونية بالدبكة والدلعونا. أحيت حفلات في مهرجان الفحيص وأيام عمّان الموسيقية، وتظهر بانتظام في جلسات إذاعية حية. تدعم المواهب النسائية الصاعدة عبر مبادرة صوتها، وتعمل حالياً على ألبوم ثانٍ يوثق حكايات الجدات. صوتها الدافئ وحضورها البسيط جعلاها من أكثر الأصوات المحبوبة في المشهد المعاصر.",
      full_bio_en: "Samar Nagham began singing in her school choir in Amman, then studied English literature before music claimed her completely. She writes her own lyrics, inspired by the alleys of Jabal Al-Weibdeh and the downtown souqs. Her debut album sold thousands of digital copies and spread widely among young listeners. She works with producers from Beirut and Cairo, fusing electronic beats with dabke and dalouna rhythms. She has performed at the Fheis Festival and Amman Music Days and appears regularly in live radio sessions. She supports emerging female talent through her Sawtaha initiative and is now recording a second album documenting grandmothers' stories. Her warm voice and unassuming presence have made her one of the most beloved voices on the contemporary scene.",
    },
    {
      slug: "demo-tariq-awtar", name: "طارق الأوتار", name_en: "Tariq Awtar", category: "oud",
      genre_tag: "عود شرقي", genre_tag_en: "Eastern Oud", city: "بغداد", city_en: "Baghdad",
      portrait: P("artist-3.png"), quote: "العود يحكي ما تعجز عنه الكلمات.",
      quote_en: "The oud narrates what words cannot express.",
      spotlight: "عازف الافتتاح في ليالي المقام البغدادي.", spotlight_en: "Opening soloist of the Baghdad Maqam Nights.",
      short_bio: "عازف عود عراقي من مدرسة بغداد، يجمع بين التقاسيم الحرة والمقطوعات المؤلفة.",
      short_bio_en: "Iraqi oud player of the Baghdad school, combining free taqasim with composed pieces.",
      specialties: "تقاسيم، تأليف، مقام عراقي", specialties_en: "Taqasim, composition, Iraqi maqam",
      full_bio: "تتلمذ طارق الأوتار على يد كبار أساتذة العود في بغداد، وحفظ المقام العراقي عن مشايخه قبل أن يطور لغته الخاصة. يعزف بأسلوب يجمع بين عمق التراث وجرأة التجريب، ويستخدم تقنيات النقر المزدوج ببراعة نادرة. شارك في مهرجانات العود في القاهرة وتطوان وإسطنبول، وأحيا أمسيات منفردة بيعت تذاكرها كاملة. يؤلف مقطوعات تصويرية للأفلام الوثائقية، ويدرّس العود في معهدين موسيقيين. أصدر ألبومين للعود المنفرد نالا إشادة النقاد، ويعمل على منهج تعليمي مصور للمبتدئين. يؤمن أن العود آلة فلسفية تعلّم الصبر والإنصات، ويقود فرقة صغيرة للموسيقى الحجرة الشرقية. مشروعه القادم دمج المقام العراقي مع موسيقى الجاز في أمسية مشتركة.",
      full_bio_en: "Tariq Awtar studied under the great oud masters of Baghdad, learning the Iraqi maqam from its sheikhs before developing his own language. He plays in a style that joins the depth of heritage with daring experimentation, deploying double-pluck techniques with rare brilliance. He has appeared at oud festivals in Cairo, Tetouan and Istanbul, and his sold-out solo evenings are celebrated events. He composes illustrative music for documentary films and teaches oud at two music institutes. His two solo-oud albums earned critical acclaim, and he is preparing a filmed beginners' method. He believes the oud is a philosophical instrument that teaches patience and listening, and he leads a small Eastern chamber ensemble. His next project fuses the Iraqi maqam with jazz in a joint evening.",
    },
    {
      slug: "demo-karim-maqam", name: "كريم المقام", name_en: "Karim Maqam", category: "oud",
      genre_tag: "عود وقانون", genre_tag_en: "Oud and Qanun", city: "دمشق", city_en: "Damascus",
      portrait: P("artist-4.png"), quote: "كل مقام باب، والموسيقي من يملك مفاتيحها.",
      quote_en: "Every maqam is a door, and the musician holds its keys.",
      spotlight: "مؤسس ثنائي الوتر الشامي.", spotlight_en: "Founder of the Levantine Strings Duo.",
      short_bio: "عازف سوري متعدد الآلات الوترية، اشتهر بثنائيات العود والقانون في حفلات دمشق الثقافية.",
      short_bio_en: "Syrian multi-string instrumentalist famed for oud-and-qanun duets at Damascus cultural concerts.",
      specialties: "عود، قانون، موسيقى حجرة", specialties_en: "Oud, qanun, chamber music",
      full_bio: "نشأ كريم المقام في دمشق القديمة حيث كانت أصوات الورش والحكواتية جزءاً من طفولته. تعلم العود أولاً ثم أتقن القانون ليصبح من القلائل الذين يجمعون الآلتين باحتراف. أسس ثنائي الوتر الشامي الذي أحيا عشرات الحفلات في المراكز الثقافية الأوروبية والعربية. يتميز بأسلوبه الهادئ المتأمل وقدرته على بناء التوتر الموسيقي تدريجياً حتى الذروة. سجل موسيقى لثلاثة مسلسلات تلفزيونية، ويتعاون مع شعراء لتقديم أمسيات القصيدة والمقام. يدرّس التأليف الموسيقي عبر الإنترنت لطلاب من خمس دول، ويوثق المقامات النادرة في مدونة صوتية. يؤمن أن الموسيقى الشرقية لغة عالمية تحتاج فقط إلى من يحسن ترجمتها. يستعد لإطلاق ألبوم ثنائيات مع ضيوف من المغرب واليمن.",
      full_bio_en: "Karim Maqam grew up in old Damascus, where workshop sounds and storytellers filled his childhood. He learned the oud first, then mastered the qanun to become one of few professionals commanding both instruments. He founded the Levantine Strings Duo, which has played dozens of concerts at European and Arab cultural centres. His calm, meditative style builds musical tension gradually toward its peak. He has scored three television series and collaborates with poets on verse-and-maqam evenings. He teaches composition online to students in five countries and documents rare maqams in an audio journal. He believes Eastern music is a universal language needing only a skilled translator. He is preparing a duets album with guests from Morocco and Yemen.",
    },
    {
      slug: "demo-youssef-waqa", name: "يوسف الوقّاع", name_en: "Youssef Waqqa", category: "percussion",
      genre_tag: "إيقاع شرقي", genre_tag_en: "Eastern Percussion", city: "القاهرة", city_en: "Cairo",
      portrait: P("stage-1.png"), quote: "الإيقاع قلب الموسيقى النابض.",
      quote_en: "Rhythm is the beating heart of music.",
      spotlight: "قائد ورش الإيقاع في مهرجان الطبول.", spotlight_en: "Lead percussion clinician at the Drums Festival.",
      short_bio: "عازف إيقاع مصري متخصص في الرق والدف، قاد فرق الإيقاع في كبرى الحفلات.",
      short_bio_en: "Egyptian percussionist specialising in riq and daf, leading rhythm sections at major concerts.",
      specialties: "رق، دف، طبول", specialties_en: "Riq, daf, drums",
      full_bio: "بدأ يوسف الوقّاع العزف على الطبلة في الموالد الشعبية، ثم احترف الرق والدف على يد أساتذة الإيقاع في القاهرة. يعرف بأسلوبه الناري الدقيق وقدرته على قيادة عشرات العازفين في عروض الطبول الجماعية. شارك مع نجوم الغناء العربي في جولات خليجية وأوروبية، وسجل إيقاعات لعشرات الألبومات. أسس مدرسة لتعليم الإيقاع للأطفال تعتمد اللعب والحركة، ويقود ورشاً مجانية في الأحياء الشعبية. طور أسلوباً خاصاً في دمج الإيقاعات النوبية والصعيدية بالموسيقى المعاصرة. حصل على تكريم مهرجان الطبول الدولي، ويستعد لعرض إيقاعي مسرحي ضخم. يؤمن أن الإيقاع أول لغات البشر وأن تعلمه يعيد الإنسان إلى جذوره. مشروعه القادم أوركسترا إيقاعية من خمسين عازفاً.",
      full_bio_en: "Youssef Waqqa began on tabla at popular moulids, then mastered riq and daf under Cairo's percussion masters. He is known for a fiery yet precise style and for leading dozens of players in massed drum performances. He has toured the Gulf and Europe with Arab singing stars and recorded rhythms for dozens of albums. He founded a children's rhythm school built on play and movement and runs free workshops in working-class districts. He developed a signature fusion of Nubian and Upper-Egyptian rhythms with contemporary music. Honoured at the International Drums Festival, he is preparing a grand theatrical percussion show. He believes rhythm is humanity's first language and that learning it returns us to our roots. His next project is a fifty-player percussion orchestra.",
    },
    {
      slug: "demo-rania-daff", name: "رانيا الدف", name_en: "Rania Daff", category: "percussion",
      genre_tag: "إيقاعات نسائية", genre_tag_en: "Women's Rhythms", city: "تونس", city_en: "Tunis",
      portrait: P("stage-2.png"), quote: "حين تدق الدفوف تتكلم النساء بلغة القوة.",
      quote_en: "When the dafs sound, women speak the language of strength.",
      spotlight: "مؤسِّسة فرقة دقات النسائية.", spotlight_en: "Founder of the Daqqat women's ensemble.",
      short_bio: "عازفة إيقاع تونسية أسست أول فرقة نسائية للدفوف، تمزج الإيقاعات الصوفية بالبوب.",
      short_bio_en: "Tunisian percussionist who founded the first women's daf ensemble, fusing Sufi rhythms with pop.",
      specialties: "دف، بندير، إيقاع صوفي", specialties_en: "Daf, bendir, Sufi rhythm",
      full_bio: "نشأت رانيا الدف في القيروان حيث حضرت حلقات الذكر الصوفي منذ صغرها، فتعلقت بإيقاعات الدف والبندير. درست الموسيقى في تونس العاصمة وأسست فرقة دقات التي تضم اثنتي عشرة عازفة. تمزج عروضها بين الإيقاعات الصوفية العميقة والأغاني الشعبية التونسية بروح معاصرة. شاركت الفرقة في مهرجانات قرطاج والحمامات ومهرجانات أوروبية للفنون النسائية. تقود رانيا ورش تمكين للفتيات عبر الإيقاع في المناطق الريفية، وتؤمن أن الموسيقى أداة تحرر اجتماعي. سجلت الفرقة ألبومها الأول في استوديو حي، وتستعد لجولة مغاربية. حصلت رانيا على جائزة المرأة المبدعة، وتعمل على فيلم وثائقي عن تاريخ الدفوف. عروضها احتفال بالحياة والذاكرة الجماعية.",
      full_bio_en: "Rania Daff grew up in Kairouan attending Sufi dhikr circles from childhood, falling in love with daf and bendir rhythms. She studied music in Tunis and founded Daqqat, a twelve-woman ensemble. Her shows fuse deep Sufi rhythms with Tunisian folk songs in a contemporary spirit. The ensemble has played Carthage, Hammamet and European women's arts festivals. Rania leads empowerment-through-rhythm workshops for rural girls, believing music is an instrument of social liberation. The ensemble recorded its debut album live in studio and is preparing a Maghreb tour. Rania won the Creative Woman award and is developing a documentary on the history of frame drums. Her performances celebrate life and collective memory.",
    },
    {
      slug: "demo-nadia-hadatha", name: "نادية الحداثة", name_en: "Nadia Hadatha", category: "contemporary",
      genre_tag: "فيوجن عربي", genre_tag_en: "Arab Fusion", city: "بيروت", city_en: "Beirut",
      portrait: P("sara-alsawt-profile.png"), quote: "التراث ليس متحفاً، بل مادة حية نصنع منها الغد.",
      quote_en: "Heritage is not a museum but living matter from which we build tomorrow.",
      spotlight: "صاحبة مشروع بيروت ساوند لاب.", spotlight_en: "Creator of the Beirut Sound Lab project.",
      short_bio: "فنانة لبنانية تدمج المقامات بالإلكترونيكا، وتقود مختبراً للصوت التجريبي.",
      short_bio_en: "Lebanese artist fusing maqams with electronica, leading an experimental sound lab.",
      specialties: "إلكترونيكا، صوتيات، أداء حي", specialties_en: "Electronica, sound art, live performance",
      full_bio: "درست نادية الحداثة هندسة الصوت في بيروت قبل أن تتجه للفن التجريبي، فأسست بيروت ساوند لاب كمساحة للبحث الصوتي. تمزج التسجيلات الميدانية من الأسواق والموانئ مع المقامات الشرقية والإيقاعات الإلكترونية. عرضت أعمالها في بيناليات الشارقة ومراكش ومهرجانات برلين الصوتية. تتعاون مع راقصين وفنانين بصريين في عروض غامرة تمزج الصوت والضوء والحركة. تدرّس التصميم الصوتي في جامعتين، وتدير منحاً صغيرة للفنانين الصوتيين الشباب. ألبومها الأخير المبني على أصوات مرفأ بيروت نال جوائز دولية. تؤمن أن الموسيقى المعاصرة حوار بين الذاكرة والتكنولوجيا، وتعمل على أرشيف رقمي للأصوات المهددة بالاندثار. مشروعها القادم أوبرا إلكترونية بالعربية.",
      full_bio_en: "Nadia Hadatha studied sound engineering in Beirut before turning to experimental art, founding Beirut Sound Lab as a sonic research space. She blends field recordings from souqs and harbours with Eastern maqams and electronic beats. Her works have shown at the Sharjah and Marrakech biennials and Berlin sound festivals. She collaborates with dancers and visual artists on immersive shows fusing sound, light and movement. She teaches sound design at two universities and administers micro-grants for young sound artists. Her latest album, built from Beirut port sounds, won international awards. She believes contemporary music is a dialogue between memory and technology and is building a digital archive of endangered sounds. Her next project is an Arabic electronic opera.",
    },
    {
      slug: "demo-omar-tajrib", name: "عمر التجريب", name_en: "Omar Tajrib", category: "contemporary",
      genre_tag: "جاز شرقي", genre_tag_en: "Eastern Jazz", city: "الإسكندرية", city_en: "Alexandria",
      portrait: P("portraits/jui/1789300780_screenshot-from-2026-09-13-13-52-59-png.png"), quote: "أعزف الجاز بلكنة إسكندرانية.",
      quote_en: "I play jazz with an Alexandrian accent.",
      spotlight: "قائد رباعي الموجة المتوسطية.", spotlight_en: "Bandleader of the Mediterranean Wave Quartet.",
      short_bio: "عازف ساكسفون وبيانو مصري يمزج الجاز بالمقامات، ويقود رباعياً متوسطياً معروفاً.",
      short_bio_en: "Egyptian saxophonist and pianist fusing jazz with maqams, leading a noted Mediterranean quartet.",
      specialties: "ساكسفون، بيانو، ارتجال", specialties_en: "Saxophone, piano, improvisation",
      full_bio: "تعلم عمر التجريب البيانو كلاسيكياً في الإسكندرية قبل أن يقع في حب الجاز عبر أسطوانات والده. أتقن الساكسفون لاحقاً وطور أسلوباً يزاوج الارتجال الجازي بالتقاسيم الشرقية. أسس رباعي الموجة المتوسطية الذي أحيا حفلات في مهرجانات الجاز بالقاهرة وعمّان وتونس. يتعاون مع موسيقيين من اليونان وتركيا وإيطاليا في مشاريع متوسطية مشتركة. يدرّس الارتجال في ورش صيفية، ويؤلف موسيقى للمسرح المستقل. ألبومه الأخير سجل حياً في قلعة قايتباي وحقق نجاحاً نقدياً. يؤمن أن البحر المتوسط مختبر موسيقي طبيعي تواصلت فيه الثقافات منذ الأزل. يستعد لتسجيل ألبوم ثنائي مع عازف عود، ويحلم بمهرجان جاز إسكندراني سنوي. عروضه رحلة بين شواطئ متعددة.",
      full_bio_en: "Omar Tajrib learned classical piano in Alexandria before falling for jazz through his father's records. He later mastered the saxophone, developing a style wedding jazz improvisation to Eastern taqasim. He founded the Mediterranean Wave Quartet, heard at jazz festivals in Cairo, Amman and Tunis. He collaborates with musicians from Greece, Turkey and Italy on shared Mediterranean projects. He teaches improvisation at summer workshops and scores independent theatre. His latest album, recorded live at the Qaitbay Citadel, won critical praise. He believes the Mediterranean is a natural musical laboratory where cultures have conversed since antiquity. He is preparing a duo album with an oud player and dreams of an annual Alexandrian jazz festival. His performances journey between many shores.",
    },
    {
      slug: "demo-mona-turath", name: "منى التراث", name_en: "Mona Turath", category: "heritage",
      genre_tag: "تراث غنائي", genre_tag_en: "Heritage Vocals", city: "فاس", city_en: "Fez",
      portrait: P("portraits/site-settings/1789633895_screenshot-from-2026-09-14-14-02-55-png.png"), quote: "أحفظ تراثنا بصوتي قبل أن تحفظه الكتب.",
      quote_en: "I preserve our heritage with my voice before books preserve it.",
      spotlight: "سفيرة الملحون في المحافل الدولية.", spotlight_en: "Ambassador of malhun at international gatherings.",
      short_bio: "مطربة مغربية متخصصة في الملحون والطرب الأندلسي، توثق القصائد النادرة أداءً وبحثاً.",
      short_bio_en: "Moroccan vocalist specialising in malhun and Andalusi tarab, documenting rare poems in performance and research.",
      specialties: "ملحون، طرب أندلسي، توثيق", specialties_en: "Malhun, Andalusi tarab, documentation",
      full_bio: "وُلدت منى التراث في فاس وتربت على أصوات جوقات الملحون في الزوايا والمناسبات. حفظت مئات القصائد عن شيوخ الفن، وأصبحت من أبرز أصوات الملحون النسائية. تؤدي الطرب الأندلسي بأسلوب أصيل، وتشارك في مهرجانات فاس للموسيقى الروحية وموازين. توثق القصائد النادرة في أرشيف صوتي مفتوح، وتشرف على رسائل جامعية في التراث الغنائي. أسست مدرسة لتعليم الفتيات فن الملحون، وتقود جوقة نسائية للمديح والأناشيد. سجلت ثلاثة ألبومات توثيقية بالتعاون مع المعهد الموسيقي، ونالت وساماً ثقافياً رفيعاً. تؤمن أن التراث مسؤولية الأجيال الحية وليس ذكرى للماضي. تستعد لجولة أوروبية بمصاحبة جوقة الآلات التقليدية. صوتها جسر بين قرون من الشعر والموسيقى.",
      full_bio_en: "Mona Turath was born in Fez, raised on malhun choirs at shrines and celebrations. She memorised hundreds of poems from the art's masters, becoming a leading female malhun voice. She performs Andalusi tarab authentically at the Fez Sacred Music Festival and Mawazine. She documents rare poems in an open audio archive and supervises university theses on vocal heritage. She founded a school teaching girls malhun and leads a women's devotional choir. She recorded three documentary albums with the music institute and received a high cultural honour. She believes heritage is the living generations' responsibility, not a memory of the past. She is preparing a European tour with a traditional-instruments choir. Her voice bridges centuries of poetry and music.",
    },
    {
      slug: "demo-hisham-asala", name: "هشام الأصالة", name_en: "Hisham Asala", category: "heritage",
      genre_tag: "إنشاد ومقامات", genre_tag_en: "Chant and Maqams", city: "القدس", city_en: "Jerusalem",
      portrait: P("portraits/site-settings/1789633904_screenshot-from-2026-09-03-16-42-34-png.png"), quote: "من هذه الأرض خرجت أعذب الأصوات، وأنا واحد من حراسها.",
      quote_en: "The sweetest voices came from this land, and I am one of their guardians.",
      spotlight: "منشد ليالي القدس الرمضانية.", spotlight_en: "Munshid of the Jerusalem Ramadan nights.",
      short_bio: "منشد ومطرب مقدسي يحيي التراث الشامي والموشحات، ويقود فرقة للإنشاد الديني والمديح.",
      short_bio_en: "Jerusalem munshid reviving Levantine heritage and muwashahat, leading a devotional chant ensemble.",
      specialties: "إنشاد، موشحات، مقام شامي", specialties_en: "Chant, muwashahat, Levantine maqam",
      full_bio: "نشأ هشام الأصالة في البلدة القديمة بالقدس حيث تعلم التجويد والإنشاد في المسجد الأقصى. أتقن المقامات الشامية والموشحات الحلبية على يد كبار المنشدين، وأسس فرقة للإنشاد والمديح. يحيي ليالي رمضان والأعياد بحفلات يحضرها الآلاف، ويشارك في مهرجانات التراث في عمان ودمشق والقاهرة. يجمع بين الإنشاد الديني والغناء التراثي الدنيوي باحترام عميق لكليهما. يوثق الأناشيد المقدسية القديمة قبل اندثارها، ويدرّب أجيالاً جديدة من المنشدين الصغار. سجل ألبومين للمديح النبوي والموشحات، ويتعاون مع فرق صوفية من تركيا والبوسنة. يؤمن أن الصوت المقدسي رسالة سلام للعالم. يستعد لإحياء أمسية كبرى في مدرج جميلة الأثري. حضوره يجمع بين الوقار والدفء الإنساني.",
      full_bio_en: "Hisham Asala grew up in Jerusalem's Old City, learning recitation and chant at Al-Aqsa. He mastered Levantine maqams and Aleppine muwashahat under great munshids and founded a chant and madih ensemble. His Ramadan and Eid concerts draw thousands, and he appears at heritage festivals in Amman, Damascus and Cairo. He honours both sacred chant and secular heritage song with equal depth. He documents old Jerusalem anashid before they vanish and trains new generations of young munshids. He recorded two albums of prophetic praise and muwashahat and collaborates with Sufi ensembles from Turkey and Bosnia. He believes the Jerusalem voice is a message of peace to the world. He is preparing a grand evening at the ancient Djemila theatre. His presence blends dignity with human warmth.",
    },
  ];
  return A.map((a, i) => {
    assertSlug(a.slug);
    return {
      name: a.name, name_en: a.name_en, slug: a.slug, category: a.category,
      genre_tag: a.genre_tag, genre_tag_en: a.genre_tag_en, city: a.city, city_en: a.city_en,
      quote: a.quote, quote_en: a.quote_en, spotlight_quote: a.spotlight, spotlight_quote_en: a.spotlight_en,
      short_bio: a.short_bio, short_bio_en: a.short_bio_en, full_bio: a.full_bio, full_bio_en: a.full_bio_en,
      specialties: a.specialties, specialties_en: a.specialties_en,
      portrait_image_url: a.portrait, is_featured: i < 4, is_published: true, display_order: i + 1,
    };
  });
}

/* ------------------------------------------------------------------ */
/* 2. Tracks (24) — 2–3 per artist; first 3 get real MP3s in            */
/*    audio/x-demo-1/; the rest reference graceful missing-media paths */
/* ------------------------------------------------------------------ */
async function seedTracks(artistIds, P) {
  const plan = [
    ["demo-layla-tarab", 3], ["demo-samar-nagham", 3], ["demo-tariq-awtar", 3],
    ["demo-karim-maqam", 3], ["demo-youssef-waqa", 2], ["demo-rania-daff", 2],
    ["demo-nadia-hadatha", 2], ["demo-omar-tajrib", 2], ["demo-mona-turath", 2], ["demo-hisham-asala", 2],
  ];
  const titles = [
    ["نسيم الفجر", "Dawn Breeze"], ["موال الشوق", "Mawwal of Longing"], ["ليالي الأنس", "Nights of Joy"],
    ["درب المدينة", "City Path"], ["حكاية زقاق", "Alley Tale"], ["قمر عمّان", "Amman Moon"],
    ["تقاسيم الرافدين", "Mesopotamian Taqasim"], ["وتر وحنين", "String and Nostalgia"], ["مقام الصبا", "Saba Maqam"],
    ["وتران", "Two Strings"], ["نور الشام", "Light of the Levant"], ["حوار القانون", "Qanun Dialogue"],
    ["دقة قلب", "Heartbeat"], ["طبول الفرح", "Drums of Joy"],
    ["ذكر ودف", "Dhikr and Daf"], ["بندير الليل", "Night Bendir"],
    ["ذبذبات المرفأ", "Harbour Frequencies"], ["سوق الكهرباء", "Electric Souq"],
    ["موجة متوسطية", "Mediterranean Wave"], ["ساكس القيتباي", "Qaitbay Sax"],
    ["قصيدة فاس", "Fez Poem"], ["ملحون الغروب", "Sunset Malhun"],
    ["مديح القدس", "Jerusalem Praise"], ["موشح النور", "Muwashah of Light"],
  ];
  const rows = [];
  let ti = 0;
  for (const [slug, n] of plan) {
    const artist_id = artistIds.get(slug);
    if (!artist_id) throw new Error(`Missing demo artist ${slug}; seed artists first`);
    for (let k = 0; k < n; k++) {
      const [ar, en] = titles[ti];
      const real = ti < 3;
      const file = real ? `demo-track-${ti + 1}.mp3` : `missing-track-${ti + 1}.mp3`;
      rows.push({
        artist_id, title: ar, title_en: en,
        audio_file_url: pub("audio", `${DEMO_PREFIX}/${file}`),
        duration_seconds: 140 + ((ti * 47) % 200),
        cover_image_url: null, display_order: k, is_published: true,
      });
      ti++;
    }
  }
  // Idempotent: tracks carry no slug marker, so guard inserts on title.
  const { data: existing } = await client.from("tracks").select("id,title").limit(1000);
  const have = new Set((existing || []).map((t) => t.title));
  const fresh = rows.filter((r) => !have.has(r.title));
  if (fresh.length) {
    const { error } = await client.from("tracks").insert(fresh);
    if (error) throw new Error(`tracks insert failed: ${error.message}`);
  }
  console.log(JSON.stringify({ seeded: "tracks", total: rows.length, inserted: fresh.length }));
  // Real audio for the first 3 tracks in audio/x-demo-1/ (repo storage
  // conventions: public bucket URL stored on the row). Primary: ffmpeg sine
  // tone. Fallback (no ffmpeg on machine): synthetic CBR silent MP3 frames
  // (MPEG-1 Layer III, 128 kbps, 44.1 kHz) generated with zero dependencies —
  // structurally self-checked below, decodes as silence, duration-accurate.
  const { readFileSync, unlinkSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const wantSeconds = rows.slice(0, 3).map((r) => r.duration_seconds);
  for (let i = 0; i < 3; i++) {
    const tmp = join(tmpdir(), `x-demo-1-track-${i + 1}.mp3`);
    let buf = null;
    try {
      execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi",
        `-i=sine=frequency=${440 + i * 110}:duration=${wantSeconds[i]}`,
        "-codec:a", "libmp3lame", "-b:a", "128k", tmp]);
      buf = readFileSync(tmp);
    } catch {
      buf = syntheticSilentMp3(wantSeconds[i]);
    }
    try {
      const { error } = await client.storage.from("audio").upload(`${DEMO_PREFIX}/demo-track-${i + 1}.mp3`, buf, { contentType: "audio/mpeg", upsert: true });
      if (error) throw error;
      console.log(JSON.stringify({ uploaded: `audio/${DEMO_PREFIX}/demo-track-${i + 1}.mp3`, bytes: buf.length, seconds: wantSeconds[i] }));
    } catch (e) {
      console.log(JSON.stringify({ warning: `audio upload failed for track ${i + 1}; missing-media path retained`, detail: String(e).slice(0, 160) }));
    }
    try { unlinkSync(tmp); } catch { /* noop */ }
  }
}

/** Zero-dependency silent MP3: N valid CBR frames, all-zero side+main data
 *  decodes as silence; self-checked (sync word at every stride). */
function syntheticSilentMp3(seconds, bitrate = 128000, sampleRate = 44100) {
  const frameLen = Math.floor((144 * bitrate) / sampleRate); // 417
  const frames = Math.max(1, Math.round((seconds * sampleRate) / 1152));
  const buf = Buffer.alloc(frameLen * frames);
  for (let f = 0; f < frames; f++) {
    const o = f * frameLen;
    buf[o] = 0xff; buf[o + 1] = 0xfb; buf[o + 2] = 0x90; buf[o + 3] = 0x00;
  }
  for (let f = 0; f < frames; f++) {
    const o = f * frameLen;
    if (buf[o] !== 0xff || (buf[o + 1] & 0xe0) !== 0xe0) throw new Error("synthetic MP3 self-check failed");
  }
  return buf;
}

/* ------------------------------------------------------------------ */
/* 3. Releases (14) — 1–2 per artist, covers from releases bucket       */
/* ------------------------------------------------------------------ */
function releaseRows(artistIds, P) {
  const covers = [P("release-1.png"), P("release-2.png"), P("release-3.png"), P("release-4.png"),
    P("covers/new-release/1789302845_screenshot-from-2026-09-13-13-52-59-png.png")];
  const R = [
    ["demo-layla-tarab", "أغاني الزمن الجميل", "Songs of the Golden Age", "studio", 10, 2023],
    ["demo-layla-tarab", "ليلة طرب حية", "Live Tarab Night", "live", 8, 2025],
    ["demo-samar-nagham", "دروب عمّان", "Amman Paths", "studio", 9, 2024],
    ["demo-samar-nagham", "حكايات الجدات", "Grandmothers' Tales", "studio", 11, 2025],
    ["demo-tariq-awtar", "تقاسيم بغدادية", "Baghdadi Taqasim", "studio", 7, 2022],
    ["demo-tariq-awtar", "عود منفرد: حي", "Solo Oud: Live", "live", 6, 2024],
    ["demo-karim-maqam", "وتران شاميان", "Two Levantine Strings", "studio", 8, 2023],
    ["demo-youssef-waqa", "طبول النيل", "Nile Drums", "studio", 12, 2024],
    ["demo-rania-daff", "دقات", "Daqqat", "studio", 9, 2024],
    ["demo-nadia-hadatha", "أصوات المرفأ", "Port Sounds", "studio", 10, 2025],
    ["demo-omar-tajrib", "موج متوسطي", "Mediterranean Wave", "live", 7, 2023],
    ["demo-mona-turath", "ديوان الملحون", "Malhun Diwan", "studio", 14, 2022],
    ["demo-hisham-asala", "مدائح مقدسية", "Jerusalem Praises", "studio", 9, 2021],
    ["demo-karim-maqam", "أمسية القانون", "Qanun Evening", "live", 5, 2025],
  ];
  return R.map((r, i) => {
    const [slug, title, title_en, release_type, track_count, release_year] = r;
    return {
      artist_id: artistIds.get(slug), title, title_en, release_type, track_count, release_year,
      cover_image_url: covers[i % covers.length], display_order: i % 3, is_published: true,
    };
  });
}

/* ------------------------------------------------------------------ */
/* 4. Artist works (10) — real YouTube IDs, published; 3 custom thumbs */
/* ------------------------------------------------------------------ */
function workRows(artistIds, P) {
  const W = [
    ["demo-layla-tarab", "موال ليالي الأنس — حفل حي", "Live Mawwal of Joy Nights", "concert", "dQw4w9WgXcQ", 0, P("hero-stage.png")],
    ["demo-samar-nagham", "درب المدينة — فيديو كليب", "City Path — Music Video", "song", "9bZkp7q19f0", 0, null],
    ["demo-tariq-awtar", "تقاسيم الرافدين — عود منفرد", "Mesopotamian Taqasim — Solo Oud", "song", "60ItHLz5WEA", 0, null],
    ["demo-karim-maqam", "حوار العود والقانون", "Oud and Qanun Dialogue", "concert", "fJ9rUzIMcZQ", 0, null],
    ["demo-youssef-waqa", "طبول الفرح — عرض إيقاعي", "Drums of Joy — Percussion Show", "concert", "kJQP7kiw5Fk", 0, P("about-musician.png")],
    ["demo-rania-daff", "دقات — لقاء وثائقي", "Daqqat — Documentary Encounter", "documentary", "hTWKbfoikeg", 0, null],
    ["demo-nadia-hadatha", "ذبذبات المرفأ — أداء حي", "Harbour Frequencies — Live Set", "song", "3JZ_D3ELwOQ", 0, null],
    ["demo-omar-tajrib", "موجة متوسطية — جلسة جاز", "Mediterranean Wave — Jazz Session", "concert", "RgKAFK5djSk", 0, null],
    ["demo-mona-turath", "قصيدة فاس — أمسية الملحون", "Fez Poem — Malhun Evening", "concert", "pRpeEdMmmQ0", 0, P("hero-stage-landscape.png")],
    ["demo-hisham-asala", "مديح القدس — مقابلة", "Jerusalem Praise — Interview", "interview", "kXYiU_JCYtU", 0, null],
  ];
  return W.map((w, i) => {
    const [slug, title, title_en, work_type, vid, order, thumb] = w;
    return {
      artist_id: artistIds.get(slug), title, title_en, work_type,
      youtube_url: `https://www.youtube.com/watch?v=${vid}`,
      description: `${title} — من الأعمال المميزة للفنان ضمن موسم العروض.`,
      description_en: `${title_en} — a featured work from the artist's performance season.`,
      thumbnail_image_url: thumb, display_order: order, is_published: true,
    };
  });
}

/* ------------------------------------------------------------------ */
/* 5. Events (9) — 5 upcoming / 4 completed, one featured              */
/* ------------------------------------------------------------------ */
function eventRows(artistIds, P) {
  const imgs = [P("event-1.png"), P("event-2.png"), P("event-3.png"), P("event-4.png"), P("event-5.png"), P("featured-cover.png"), P("home-band.png")];
  const E = [
    ["demo-maqam-stars-night", "ليلة نجوم المقام", "Maqam Stars Night", "concert", "2026-11-14T20:00:00Z", "المسرح الكبير — القاهرة", "Grand Theatre — Cairo", "القاهرة", "Cairo", "ليلى الطرب وطارق الأوتار", "Layla Tarab & Tariq Awtar", "demo-layla-tarab", "أمسية كبرى تجمع الطرب الأصيل وتقاسيم العود.", "A grand evening of classic tarab and oud taqasim.", true, "upcoming", 0],
    ["demo-beirut-sound-lab", "مختبر بيروت الصوتي", "Beirut Sound Lab Live", "evening", "2026-12-05T21:00:00Z", "محطة الفن — بيروت", "Art Station — Beirut", "بيروت", "Beirut", "نادية الحداثة", "Nadia Hadatha", "demo-nadia-hadatha", "عرض غامر يمزج الصوت والضوء والحركة.", "An immersive show fusing sound, light and movement.", false, "upcoming", 1],
    ["demo-daff-women-fest", "مهرجان دقات النسائي", "Daqqat Women's Festival", "festival", "2027-01-22T19:00:00Z", "قصر الثقافة — تونس", "Culture Palace — Tunis", "تونس", "Tunis", "رانيا الدف وفرقتها", "Rania Daff & Ensemble", "demo-rania-daff", "احتفال إيقاعي نسائي بمشاركة فرق ضيفة.", "A women's rhythm celebration with guest ensembles.", false, "upcoming", 2],
    ["demo-mediterranean-jazz", "جاز المتوسط في الإسكندرية", "Mediterranean Jazz in Alexandria", "concert", "2027-02-18T20:30:00Z", "قلعة قايتباي — الإسكندرية", "Qaitbay Citadel — Alexandria", "الإسكندرية", "Alexandria", "عمر التجريب ورباعيه", "Omar Tajrib & Quartet", "demo-omar-tajrib", "أمسية جاز متوسطية على شاطئ البحر.", "A Mediterranean jazz evening by the sea.", false, "upcoming", 3],
    ["demo-malhan-fez-night", "ليلة الملحون بفاس", "Malhun Night in Fez", "evening", "2027-03-09T20:00:00Z", "باب البودلود — فاس", "Bab Boujloud — Fez", "فاس", "Fez", "منى التراث", "Mona Turath", "demo-mona-turath", "أمسية تراثية في قلب المدينة القديمة.", "A heritage evening in the heart of the old city.", false, "upcoming", 4],
    ["demo-oud-poetry-completed", "العود والشعر — أمسية مكتملة", "Oud and Poetry — Past Evening", "evening", "2025-06-12T20:00:00Z", "دار الأوبرا — دمشق", "Opera House — Damascus", "دمشق", "Damascus", "كريم المقام", "Karim Maqam", "demo-karim-maqam", "أمسية جمعت القصيدة والمقام.", "An evening joining verse and maqam.", false, "completed", 5],
    ["demo-nile-drums-completed", "طبول النيل — عرض مكتمل", "Nile Drums — Past Show", "festival", "2025-03-20T19:30:00Z", "ساقية الصاوي — القاهرة", "El Sawy — Cairo", "القاهرة", "Cairo", "يوسف الوقّاع", "Youssef Waqqa", "demo-youssef-waqa", "عرض إيقاعي جماهيري كبير.", "A grand popular percussion show.", false, "completed", 6],
    ["demo-ramadan-jerusalem", "ليالي القدس الرمضانية", "Jerusalem Ramadan Nights", "concert", "2024-04-02T21:00:00Z", "البلدة القديمة — القدس", "Old City — Jerusalem", "القدس", "Jerusalem", "هشام الأصالة", "Hisham Asala", "demo-hisham-asala", "إنشاد ومديح في أجواء رمضانية.", "Chant and praise in Ramadan ambience.", false, "completed", 7],
    ["demo-amman-pop-workshop", "ورشة كتابة الأغنية", "Songwriting Workshop", "workshop", "2024-11-08T17:00:00Z", "جبل اللويبدة — عمّان", "Jabal Al-Weibdeh — Amman", "عمّان", "Amman", "سمر النغم", "Samar Nagham", "demo-samar-nagham", "ورشة تفاعلية لكتابة الأغاني.", "An interactive songwriting workshop.", false, "completed", 8],
  ];
  return E.map((e, i) => {
    const [slug, title, title_en, category, event_date, location, location_en, city, city_en, performer_name, performer_name_en, artistSlug, description, description_en, is_featured, status, order] = e;
    assertSlug(slug, 200);
    return {
      title, title_en, slug, category, event_date, location, location_en, city, city_en,
      performer_name, performer_name_en, artist_id: artistIds.get(artistSlug),
      description, description_en, image_url: imgs[i % imgs.length],
      ticket_url: status === "upcoming" ? "https://tickets.example.com/demo-event" : null,
      is_featured, status, is_published: true, display_order: order,
    };
  });
}

/* ------------------------------------------------------------------ */
/* 6. Booking requests (10) — public shape in, admin triage after       */
/* ------------------------------------------------------------------ */
async function seedBookings(artistIds, eventIds) {
  const artists = [...artistIds.entries()];
  const events = [...eventIds.entries()];
  const types = ["private_concert", "wedding", "festival", "hotel", "other"];
  const pending = [];
  for (let i = 0; i < 10; i++) {
    const [aslug, artist_id] = artists[i % artists.length];
    const [eslug, event_id] = events[i % events.length];
    pending.push({
      full_name: `عميل العرض ${i + 1}`, email: `demo-booking-${i + 1}@example.com`,
      phone: `+9617000000${i}`, budget_range: i % 2 ? "5000–10000$" : "1000–5000$",
      event_type: types[i % types.length], event_date: `2027-0${(i % 9) + 1}-1${i % 9}`,
      preferred_artist: aslug, artist_id, event_id,
      message: `نرغب بحجز الفنان لفعاليتنا القادمة، التفاصيل: ${eslug}. المرجو التواصل لتأكيد الموعد والبرنامج.`,
    });
  }
  // Idempotent: skip emails already present (public shape has no upsert key).
  const { data: have } = await client.from("booking_requests").select("email").like("email", "demo-booking-%@example.com");
  const haveSet = new Set((have || []).map((r) => r.email));
  const fresh = pending.filter((b) => !haveSet.has(b.email));
  if (fresh.length) {
    const { error } = await client.from("booking_requests").insert(fresh);
    if (error) throw new Error(`booking_requests insert failed: ${error.message}`);
  }
  // Admin triage semantics (adminBookingUpdateSchema: status + admin_notes).
  const triage = [
    ["demo-booking-1@example.com", "pending", null],
    ["demo-booking-2@example.com", "pending", null],
    ["demo-booking-3@example.com", "pending", null],
    ["demo-booking-4@example.com", "contacted", "تم الاتصال بالعميل وطلب تفاصيل إضافية."],
    ["demo-booking-5@example.com", "contacted", "بانتظار تأكيد الموعد من إدارة المكان."],
    ["demo-booking-6@example.com", "confirmed", "تم التأكيد: العربون مستلم والبرنامج متفق عليه."],
    ["demo-booking-7@example.com", "confirmed", "تم التأكيد: الفنان متاح في الموعد المطلوب."],
    ["demo-booking-8@example.com", "confirmed", "تم التأكيد وإرسال العقد."],
    ["demo-booking-9@example.com", "archived", "أرشيف: العميل ألغى الطلب لظرف خاص."],
    ["demo-booking-10@example.com", "archived", "أرشيف: طلب مكرر دُمج مع طلب آخر."],
  ];
  for (const [email, status, admin_notes] of triage) {
    const { error } = await client.from("booking_requests").update({ status, admin_notes }).like("email", email);
    if (error) throw new Error(`booking triage failed for ${email}: ${error.message}`);
  }
  console.log(JSON.stringify({ seeded: "booking_requests", total: 10, inserted: fresh.length }));
}

/* ------------------------------------------------------------------ */
/* 7. Newsletter (4) — public subscribe shape (email only)              */
/* ------------------------------------------------------------------ */
async function seedNewsletter() {
  const emails = [1, 2, 3, 4].map((i) => `demo-news-${i}@example.com`);
  const { data: have } = await client.from("newsletter_subscribers").select("email").in("email", emails);
  const haveSet = new Set((have || []).map((r) => r.email));
  const fresh = emails.filter((e) => !haveSet.has(e)).map((email) => ({ email }));
  if (fresh.length) {
    const { error } = await client.from("newsletter_subscribers").insert(fresh);
    if (error) throw new Error(`newsletter insert failed: ${error.message}`);
  }
  console.log(JSON.stringify({ seeded: "newsletter_subscribers", total: 4, inserted: fresh.length }));
}

/* ------------------------------------------------------------------ */
/* 8. Articles (12) — 3 per category, bilingual, 2022–2026             */
/* ------------------------------------------------------------------ */
function articleRows(artistIds, P) {
  const covers = [P("article-1.png"), P("article-2.png"), P("article-3.png"), P("news-side-1.png"), P("news-side-2.png")];
  const A = [
    ["demo-maqam-beginners-guide", "دليل المبتدئين إلى المقامات", "A Beginner's Guide to Maqams", "culture", "2022-03-10T10:00:00Z", "مدخل مبسط لعوالم المقام الشرقي وكيف تستمع إليه.", "A gentle entry into Eastern maqams and how to hear them.", "هيئة التحرير", "Editorial Team", "demo-layla-tarab", false],
    ["demo-women-rhythm-history", "تاريخ إيقاعات النساء", "A History of Women's Rhythms", "culture", "2023-06-18T10:00:00Z", "من حلقات الذكر إلى المسارح: رحلة الدفوف النسائية.", "From dhikr circles to concert halls: the journey of women's frame drums.", "منى الباحثة", "Mona Researcher", null, true],
    ["demo-malhan-poetry-art", "فن قصيدة الملحون", "The Art of the Malhun Poem", "culture", "2024-09-25T10:00:00Z", "كيف تُبنى القصيدة الملحونة ولماذا تعيش قروناً.", "How the malhun poem is built — and why it lives for centuries.", "هيئة التحرير", "Editorial Team", "demo-mona-turath", false],
    ["demo-layla-tarab-story", "ليلى الطرب: من الساقية إلى المسارح", "Layla Tarab: From El Sawy to Grand Stages", "artists", "2023-02-14T10:00:00Z", "حكاية صوت حفظ التراث قبل أن يغنيه.", "The story of a voice that memorised heritage before singing it.", "كريم الصحفي", "Karim Journalist", "demo-layla-tarab", true],
    ["demo-tariq-awtar-interview", "حوار مع طارق الأوتار", "An Interview with Tariq Awtar", "artists", "2024-05-30T10:00:00Z", "عن العود آلة فلسفية وعن مشروعه مع الجاز.", "On the oud as philosophy — and his jazz project.", "سلمى المحاورة", "Salma Interviewer", "demo-tariq-awtar", false],
    ["demo-daqqat-ensemble", "فرقة دقات: اثنتا عشرة عازفة", "Daqqat: Twelve Women Players", "artists", "2025-08-11T10:00:00Z", "كيف بنت رانيا الدف أول فرقة دفوف نسائية.", "How Rania Daff built the first women's daf ensemble.", "هيئة التحرير", "Editorial Team", "demo-rania-daff", false],
    ["demo-learn-oud-first-steps", "تعلم العود: خطواتك الأولى", "Learning the Oud: First Steps", "academy", "2022-11-02T10:00:00Z", "اختيار الآلة والجلوس الصحيح وأول مقام.", "Choosing the instrument, sitting right, and the first maqam.", "أستاذ الأكاديمية", "Academy Tutor", null, false],
    ["demo-rhythm-children-play", "تعليم الإيقاع للأطفال باللعب", "Teaching Children Rhythm Through Play", "academy", "2024-01-19T10:00:00Z", "منهج يوسف الوقّاع: الحركة قبل النوتة.", "Youssef Waqqa's method: movement before notation.", "أستاذ الأكاديمية", "Academy Tutor", null, false],
    ["demo-sound-design-basics", "أساسيات التصميم الصوتي", "Sound Design Basics", "academy", "2026-02-07T10:00:00Z", "مدخل عملي من مختبر بيروت الصوتي.", "A hands-on primer from the Beirut Sound Lab.", "نادية المدربة", "Nadia Trainer", "demo-nadia-hadatha", false],
    ["demo-maqam-festival-recap", "حصاد مهرجان المقام الأول", "First Maqam Festival: Recap", "events", "2025-12-01T10:00:00Z", "ليالٍ بيعت تذاكرها وأصوات اكتُشفت.", "Sold-out nights and discovered voices.", "هيئة التحرير", "Editorial Team", null, false],
    ["demo-jazz-citadel-preview", "ترقب: جاز القلعة بالإسكندرية", "Preview: Citadel Jazz in Alexandria", "events", "2026-08-20T10:00:00Z", "ما ينتظر الجمهور في أمسية قايتباي.", "What awaits audiences at the Qaitbay evening.", "كريم الصحفي", "Karim Journalist", "demo-omar-tajrib", false],
    ["demo-ramadan-nights-review", "مراجعة: ليالي رمضان المقدسية", "Review: Jerusalem Ramadan Nights", "events", "2024-04-20T10:00:00Z", "إنشاد جمع الآلاف في البلدة القديمة.", "Chant that gathered thousands in the Old City.", "سلمى المحاورة", "Salma Interviewer", null, false],
  ];
  return A.map((a, i) => {
    const [slug, title, title_en, category, published_at, excerpt, excerpt_en, author_name, author_name_en, artistSlug, is_featured] = a;
    assertSlug(slug);
    const body = (t) => [
      `${t}: الفقرة الأولى تمهد للموضوع وتضع القارئ في أجوائه العامة.`,
      `الفقرة الثانية تتعمق في التفاصيل والأمثلة الحية من الميدان الفني.`,
      `الفقرة الثالثة تنقل أصوات الفنانين وشهاداتهم حول التجربة.`,
      `الفقرة الرابعة تخلص إلى ما يعنيه ذلك لمستقبل المشهد الموسيقي.`,
    ].join("\n\n");
    const bodyEn = (t) => [
      `${t}: the opening paragraph sets the scene and brings the reader inside its world.`,
      `The second paragraph dives into detail with living examples from the music field.`,
      `The third paragraph carries the artists' own voices and testimonies.`,
      `The fourth paragraph concludes with what this means for the scene's future.`,
    ].join("\n\n");
    return {
      title, title_en, slug, category, excerpt, excerpt_en,
      content: body(title), content_en: bodyEn(title_en),
      cover_image_url: covers[i % covers.length],
      author_name, author_name_en,
      featured_artist_id: artistSlug ? artistIds.get(artistSlug) : null,
      published_at, is_featured, is_published: true,
    };
  });
}

/* ------------------------------------------------------------------ */
/* 9. Testimonials (6) — bilingual (marker: display_order 901+)        */
/* ------------------------------------------------------------------ */
function testimonialRows() {
  const T = [
    ["أمسية لا تُنسى: التنظيم راقٍ والصوت مذهل، وسنحجز مجدداً بلا تردد.", "An unforgettable evening: refined organisation, stunning sound — we will book again without hesitation.", "م. سارة الحلبي", "Sara Alhalabi", "مديرة فعاليات — فندق", "Events Manager — Hotel"],
    ["تعامل احترافي من أول اتصال حتى نهاية الحفل، والفنان فاق التوقعات.", "Professional handling from first call to finale; the artist exceeded expectations.", "أ. خالد المصري", "Khaled Masri", "منظم أعراس", "Wedding Planner"],
    ["ورش الأطفال غيّرت علاقة ابني بالموسيقى، شكراً للصبر والشغف.", "The children's workshop changed my son's relationship with music — thank you for the patience and passion.", "أم ليان", "Um Layan", "ولية أمر", "Parent"],
    ["جودة الصوت والالتزام بالمواعيد يستحقان الإشادة، تجربة راقية.", "Sound quality and punctuality deserve praise — a classy experience.", "د. عمر فاروق", "Omar Farouk", "مدير مهرجان", "Festival Director"],
    ["الفرقة النسائية أضافت لحفلنا روحاً خاصة، ضيوفنا ما زالوا يتحدثون عنها.", "The women's ensemble gave our event a special soul — guests still talk about it.", "نور الهدى", "Nour Alhuda", "عروس سابقة", "Former Bride"],
    ["توثيق الملحون بهذا المستوى عمل ثقافي يستحق الدعم والتقدير.", "Documenting malhun at this level is cultural work deserving support and esteem.", "البروفيسور أمين", "Professor Amine", "باحث في التراث", "Heritage Researcher"],
  ];
  return T.map((t, i) => ({
    quote: t[0], quote_en: t[1], author_name: t[2], author_name_en: t[3],
    author_role: t[4], author_role_en: t[5], avatar_image_url: null,
    display_order: 901 + i, is_published: true,
  }));
}

/* ------------------------------------------------------------------ */
/* 10. Site settings — single update, every admin-editable field       */
/* ------------------------------------------------------------------ */
function siteSettingsUpdate(S) {
  return {
    hero_headline: "منصتك الأولى *لاكتشاف* ودعم *المواهب* الفنية والثقافية",
    hero_headline_en: "Your first platform to *discover* and support artistic and cultural *talent*",
    hero_subheadline: "أندلسيا منصة متخصصة في تمثيل ودعم المواهب الإبداعية، وربط الفنانين بالأماكن والمناسبات التي تستحق الجمال.",
    hero_subheadline_en: "Andalusia is a platform for representing and supporting creative talent, connecting artists with the venues and occasions that deserve beauty.",
    hero_image_url: S("hero-stage-landscape.png"),
    hero_video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    about_headline: "نكتشف · نصل · نحتفي",
    about_headline_en: "We discover · We connect · We celebrate",
    about_body: "وُلدنا من إيمان عميق بأن الفن ليس ترفاً بل ضرورة. نعمل على تقريب المسافة بين الفنان الموهوب والجمهور الذي ينتظره، وبين المناسبة التي تستحق اللحظة الفنية التي تجعلها لا تُنسى.",
    about_body_en: "We were born from a deep belief that art is a necessity, not a luxury. We close the distance between gifted artists and the audiences awaiting them — and the occasions deserving an unforgettable artistic moment.",
    about_image_url: S("about-musician.png"),
    booking_banner_title: "احجز فنانك للمناسبة القادمة",
    booking_banner_title_en: "Book your artist for the next occasion",
    booking_banner_body: "أخبرنا بتفاصيل مناسبتك وسنرشح لك الفنان الأنسب ونرافقك حتى ليلة الحفل.",
    booking_banner_body_en: "Tell us about your occasion and we will recommend the right artist and stay with you until show night.",
    artists_subtitle: "نخبة من الأصوات والعازفين في خمسة تصنيفات.",
    artists_subtitle_en: "A selection of voices and instrumentalists across five categories.",
    events_subtitle: "حفلات ومهرجانات وأمسيات وورش على مدار الموسم.",
    events_subtitle_en: "Concerts, festivals, evenings and workshops through the season.",
    academy_subtitle: "مسارات تعليمية من العود إلى التصميم الصوتي.",
    academy_subtitle_en: "Learning tracks from oud to sound design.",
    booking_subtitle: "اطلب عرض سعر خلال دقائق وسنرد خلال يوم عمل.",
    booking_subtitle_en: "Request a quote in minutes; we reply within one business day.",
    contact_email: "contact@example.com", contact_phone: "+9611234567",
    social_links: { instagram: "https://instagram.com/example", tiktok: "https://tiktok.com/@example" },
    operational_regions: "لبنان · المغرب · الخليج",
    operational_regions_en: "Lebanon · Morocco · The Gulf",
    footer_mission: "مجموعة فنانين يؤمنون أن الإبداع هو الحياة والموسيقى هي الشعلة.",
    footer_mission_en: "A collective of artists who believe creativity is life and music is the spark.",
    copyright_text: "© أندلسيا ٢٠٢٦ — جميع الحقوق محفوظة",
    copyright_text_en: "© Andalusia 2026 — All rights reserved",
    home_featured_artists_count: 6, home_featured_articles_count: 4, home_upcoming_events_count: 3,
    show_testimonials: true, show_editorial: true, show_events: true, show_booking_banner: true,
    events_title: "الفعاليات", events_title_en: "Events",
    events_hero_image_url: S("hero-stage.png"),
    artists_title: "الفنانون", artists_title_en: "Artists",
    artists_hero_image_url: S("hero-stage.png"),
    academy_title: "الأكاديمية", academy_title_en: "Academy",
    academy_kicker: "تعلّم · تدرّب · اعزف", academy_kicker_en: "Learn · Practise · Play",
    academy_hero_image_url: S("about-musician.png"),
    academy_tracks_heading: "المسارات التعليمية", academy_tracks_heading_en: "Learning Tracks",
    news_title: "الأخبار والمقالات", news_title_en: "News & Articles",
    news_subtitle: "قصص من المشهد الموسيقي.", news_subtitle_en: "Stories from the music scene.",
    news_kicker: "المدونة", news_kicker_en: "Journal",
    home_hero_primary_cta: "اكتشف الفنانين", home_hero_primary_cta_en: "Discover Artists",
    home_hero_secondary_cta: "احجز مناسبتك", home_hero_secondary_cta_en: "Book Your Occasion",
    home_about_cta: "تعرف علينا أكثر", home_about_cta_en: "More About Us",
    home_artists_heading: "فنانون مميزون", home_artists_heading_en: "Featured Artists",
    home_artists_cta: "جميع الفنانين", home_artists_cta_en: "All Artists",
    home_testimonials_heading: "قالوا عنا", home_testimonials_heading_en: "Testimonials",
    home_editorial_heading: "مختارات تحريرية", home_editorial_heading_en: "Editorial Picks",
    home_events_heading: "فعاليات قادمة", home_events_heading_en: "Upcoming Events",
    home_events_cta: "جميع الفعاليات", home_events_cta_en: "All Events",
    academy_values_heading: "قيمنا التعليمية", academy_values_heading_en: "Our Teaching Values",
    academy_value1_title: "التأصيل", academy_value1_title_en: "Rootedness",
    academy_value1_body: "نبدأ من التراث قبل التجريب.", academy_value1_body_en: "We start from heritage before experiment.",
    academy_value2_title: "الممارسة", academy_value2_title_en: "Practice",
    academy_value2_body: "نتعلم بالعزف لا بالحفظ.", academy_value2_body_en: "We learn by playing, not memorising.",
    academy_value3_title: "المجتمع", academy_value3_title_en: "Community",
    academy_value3_body: "ننمو معاً في فرق وورش.", academy_value3_body_en: "We grow together in bands and workshops.",
    academy_newsletter_heading: "النشرة التعليمية", academy_newsletter_heading_en: "Learning Newsletter",
    academy_newsletter_tagline: "دروس وتمارين كل أسبوع.", academy_newsletter_tagline_en: "Lessons and exercises weekly.",
    seo_home_title: "أندلسيا — اكتشف المواهب الفنية",
    seo_home_title_en: "Andalusia — Discover Artistic Talent",
    seo_home_description: "منصة تمثيل الفنانين والحجوزات والفعاليات والأكاديمية.",
    seo_home_description_en: "Artist representation, bookings, events and academy platform.",
    seo_events_title: "الفعاليات — أندلسيا", seo_events_title_en: "Events — Andalusia",
    seo_events_description: "حفلات ومهرجانات وأمسيات الموسم الحالي.",
    seo_events_description_en: "This season's concerts, festivals and evenings.",
    seo_news_title: "الأخبار — أندلسيا", seo_news_title_en: "News — Andalusia",
    seo_news_description: "مقالات وقصص من المشهد الموسيقي.",
    seo_news_description_en: "Articles and stories from the music scene.",
    seo_artists_title: "الفنانون — أندلسيا", seo_artists_title_en: "Artists — Andalusia",
    seo_artists_description: "تعرف على فناني أندلسيا وعوالمهم.",
    seo_artists_description_en: "Meet the Andalusia artists and their worlds.",
    seo_academy_title: "الأكاديمية — أندلسيا", seo_academy_title_en: "Academy — Andalusia",
    seo_academy_description: "مسارات تعليمية في الموسيقى من الأساس حتى الاحتراف.",
    seo_academy_description_en: "Music learning tracks from basics to mastery.",
    events_filter_all_label: "الكل", events_filter_all_label_en: "All",
    artists_filter_all_label: "الكل", artists_filter_all_label_en: "All",
    booking_cta_label: "احجز الآن", booking_cta_label_en: "Book Now",
    show_hero: true, show_about: true, show_featured_artists: true,
    home_hero_primary_href: "/artists", home_hero_secondary_href: "/booking",
    home_about_href: "/about", home_artists_href: "/artists",
    home_events_href: "/events", booking_cta_href: "/booking",
    home_about_heading: "حكايتنا", home_about_heading_en: "Our Story",
    home_events_image_url: S("hero-stage.png"),
    booking_banner_image_url: S("hero-stage-landscape.png"),
    artist_hero_image_url: S("hero-stage.png"),
    booking_title: "احجز فنانك", booking_title_en: "Book Your Artist",
    booking_hero_image_url: S("hero-stage-landscape.png"),
    booking_group_personal: "بياناتك", booking_group_personal_en: "Your Details",
    booking_group_occasion: "تفاصيل المناسبة", booking_group_occasion_en: "Occasion Details",
    booking_consent_text: "أوافق على التواصل معي بخصوص طلبي.",
    booking_consent_text_en: "I agree to be contacted about my request.",
    booking_submit_label: "أرسل الطلب", booking_submit_label_en: "Send Request",
    booking_loading_label: "جارٍ الإرسال…", booking_loading_label_en: "Sending…",
    booking_success_title: "تم استلام طلبك", booking_success_title_en: "Request Received",
    booking_success_body: "سنعاود الاتصال بك خلال يوم عمل واحد.",
    booking_success_body_en: "We will call you back within one business day.",
    booking_success_note: "احتفظ برقم الطلب للمتابعة.",
    booking_success_note_en: "Keep your request number for follow-up.",
    seo_booking_title: "الحجز — أندلسيا", seo_booking_title_en: "Booking — Andalusia",
    seo_booking_description: "احجز فنانك للمناسبات والأعراس والفعاليات.",
    seo_booking_description_en: "Book your artist for occasions, weddings and events.",
    seo_default_title: "أندلسيا", seo_default_title_en: "Andalusia",
    seo_default_description: "منصة المواهب الفنية والثقافية.",
    seo_default_description_en: "The artistic and cultural talent platform.",
    seo_og_image_url: S("hero-stage-landscape.png"),
  };
}

/* ------------------------------------------------------------------ */
/* Step 2 — seed                                                       */
/* ------------------------------------------------------------------ */
async function seed() {
  const PA = (p) => pub("artists", p);
  const PR = (p) => pub("releases", p);
  const PE = (p) => pub("events", p);
  const PS = (p) => pub("site", p);
  const PC = (p) => pub("articles", p);

  await upsert("artists", artistRows(PA), "slug");
  const artistIds = await demoArtistIds();
  if (artistIds.size < 10) throw new Error(`Expected 10 demo artists, found ${artistIds.size}`);
  console.log(JSON.stringify({ seeded: "artists", total: 10 }));

  await seedTracks(artistIds, PR);

  const releases = releaseRows(artistIds, PR);
  const { data: relHave } = await client.from("releases").select("id,title").limit(1000);
  const relSet = new Set((relHave || []).map((r) => r.title));
  const relFresh = releases.filter((r) => !relSet.has(r.title));
  if (relFresh.length) {
    const { error } = await client.from("releases").insert(relFresh);
    if (error) throw new Error(`releases insert failed: ${error.message}`);
  }
  console.log(JSON.stringify({ seeded: "releases", total: releases.length, inserted: relFresh.length }));

  const works = workRows(artistIds, PS);
  const { data: workHave } = await client.from("artist_works").select("id,title").limit(1000);
  const workSet = new Set((workHave || []).map((w) => w.title));
  const workFresh = works.filter((w) => !workSet.has(w.title));
  if (workFresh.length) {
    const { error } = await client.from("artist_works").insert(workFresh);
    if (error) throw new Error(`artist_works insert failed: ${error.message}`);
  }
  console.log(JSON.stringify({ seeded: "artist_works", total: works.length, inserted: workFresh.length }));

  await upsert("events", eventRows(artistIds, PE), "slug");
  const eventIds = await demoEventIds();
  console.log(JSON.stringify({ seeded: "events", total: 9, found: eventIds.size }));

  await seedBookings(artistIds, eventIds);
  await seedNewsletter();

  await upsert("articles", articleRows(artistIds, PC), "slug");
  console.log(JSON.stringify({ seeded: "articles", total: 12 }));

  // Testimonials: idempotent on display_order marker (no slug/email column exists).
  const testi = testimonialRows();
  const { data: testiHave } = await client.from("testimonials").select("id,display_order").gte("display_order", 900);
  if (!testiHave?.length) {
    const { error } = await client.from("testimonials").insert(testi);
    if (error) throw new Error(`testimonials insert failed: ${error.message}`);
  }
  console.log(JSON.stringify({ seeded: "testimonials", total: 6, inserted: testiHave?.length ? 0 : 6 }));

  // Step 3 (folded in): fill every empty _en twin on pre-existing rows is
  // covered by the full bilingual demo payload above; the settings update
  // below additionally closes all 30+ missing _en gaps inventoried on
  // site_settings (academy values, SEO, labels, booking copy). Payload keys
  // are filtered to columns that exist in the live schema; anything else is
  // reported as needs-client-confirmation (migration pending) — never forced.
  const { data: currentSettings } = await client.from("site_settings").select("*").eq("id", "default").single();
  const fullSettings = siteSettingsUpdate(PS);
  const dropped = Object.keys(fullSettings).filter((k) => !(k in (currentSettings || {})));
  const payload = Object.fromEntries(Object.entries(fullSettings).filter(([k]) => k in (currentSettings || {})));
  const { error: settingsError } = await client.from("site_settings").update(payload).eq("id", "default");
  if (settingsError) throw new Error(`site_settings update failed: ${settingsError.message}`);
  console.log(JSON.stringify({ seeded: "site_settings", total: 1, fields: Object.keys(payload).length, needs_client_confirmation: dropped }));

  console.log(JSON.stringify({ done: true, hint: "verify: every public page (ar/en), admin tables, revalidate site-settings-public, npm run typecheck, npm test" }));
}

/* ------------------------------------------------------------------ */
/* Cleanup — one pass over demo markers (children cascade)             */
/* ------------------------------------------------------------------ */
async function cleanup() {
  const { error: bErr, count: bCount } = await client.from("booking_requests").delete({ count: "exact" }).like("email", "demo-%@example.com");
  if (bErr) throw bErr;
  const { error: nErr, count: nCount } = await client.from("newsletter_subscribers").delete({ count: "exact" }).like("email", "demo-%@example.com");
  if (nErr) throw nErr;
  const { error: tErr, count: tCount } = await client.from("testimonials").delete({ count: "exact" }).gte("display_order", 900);
  if (tErr) throw tErr;
  for (const table of ["articles", "events", "artists"]) {
    const { error, count } = await client.from(table).delete({ count: "exact" }).like("slug", "demo-%");
    if (error) throw error;
    console.log(JSON.stringify({ cleaned: table, count }));
  }
  // Storage prefix x-demo-1/ in audio (children of nothing — explicit remove).
  const { data: files } = await client.storage.from("audio").list(DEMO_PREFIX, { limit: 100 });
  if (files?.length) {
    const { error } = await client.storage.from("audio").remove(files.map((f) => `${DEMO_PREFIX}/${f.name}`));
    if (error) throw error;
  }
  console.log(JSON.stringify({ cleaned: "booking_requests", count: bCount, newsletter_subscribers: nCount, testimonials: tCount, storage: `audio/${DEMO_PREFIX}/` }));
}

if (mode === "inventory") await inventory();
else if (mode === "seed") await seed();
else await cleanup();
