-- Artist profile backfill: fill the blanks, never overwrite written copy.
--
-- The public pages read more of an artist than the admin form makes anyone
-- fill in: ArtistProfileCard draws full_bio, ArtistGallery draws
-- spotlight_quote, and the /en site reads every *_en sibling. Rows created
-- before those surfaces existed, or added in a hurry from /admin/artists,
-- leave those cells empty and the profile reads half-built.
--
-- Two passes, both idempotent, neither destructive:
--   1. Every artist in the table (including ones added from the admin panel
--      that this file cannot name) gets full_bio and spotlight_quote derived
--      from the copy that IS there.
--   2. The eight roster artists that CANONICAL_FEATURED_ARTISTS in
--      src/lib/artists.ts falls back to are upserted with complete Arabic and
--      English copy. Every column is written through
--      COALESCE(NULLIF(btrim(existing), ''), incoming), so anything an editor
--      has already written stays exactly as written; only blanks are filled.
--
-- is_published, is_featured and display_order are deliberately left off the
-- conflict clause: this file must not publish anything, un-feature anything,
-- or reshuffle an order someone set. New rows land as drafts (is_published
-- false), matching 20260913000000_default_new_content_to_draft.sql.
--
-- Depends on: 20260910000200_create_artists.sql,
--             20260912000000_add_english_content_columns.sql
-- Idempotent: re-running changes nothing once the blanks are filled.
-- Rollback: none needed; no column is dropped and no written copy is replaced.

-- 1. Derive the two fields the profile page needs from copy that already exists.
UPDATE artists SET
  full_bio        = COALESCE(NULLIF(btrim(full_bio), ''), short_bio),
  spotlight_quote = COALESCE(NULLIF(btrim(spotlight_quote), ''), quote)
WHERE btrim(COALESCE(full_bio, '')) = ''
   OR btrim(COALESCE(spotlight_quote, '')) = '';

-- 2. Complete the eight roster artists, blanks only.
INSERT INTO artists (
  name, name_en, slug, category, genre_tag, genre_tag_en, city, city_en, quote, quote_en, spotlight_quote, spotlight_quote_en, short_bio, short_bio_en, full_bio, full_bio_en, specialties, specialties_en, portrait_image_url, is_featured, display_order, is_published
) VALUES
  ('سارة الصوت',
   'Sara Alsawt',
   'sara-alsawt',
   'singing',
   'غناء عربي أصيل',
   'Authentic Arabic Vocals',
   'الدار البيضاء',
   'Casablanca',
   'الصوت هو المرآة الأصدق للروح.',
   'The voice is the truest mirror of the soul.',
   'الصوت هو المرآة الأصدق للروح — لا تكذب على جمهورك أبداً.',
   'The voice is the truest mirror of the soul — never lie to your audience.',
   'مغنية مصرية تختصص في الطرب الأصيل والغناء العاطفي. صوتها يحمل دفء الأرض وعمق التراث، مع لمسة معاصرة تلامس الأجيال.',
   'An Egyptian singer specialising in authentic tarab and emotive vocals. Her voice carries the warmth of the earth and the depth of heritage, with a contemporary touch that reaches every generation.',
   'سارة الصوت فنانة مخضرمة متخصصة في الطرب الأصيل والغناء الأندلسي، صوتها يجمع بين الأصالة والمعاصرة، تجوب المسارح العربية والدولية منذ أكثر من عقد من الزمن.',
   'Sara Alsawt is a seasoned artist specialising in authentic tarab and Andalusian song. Her voice joins the classical and the contemporary, and she has toured Arab and international stages for more than a decade.',
   'الصوت • الغناء الأندلسي • الطرب الأصيل',
   'Voice • Andalusian song • Classical tarab',
   '/assets/artists/artist-1.png',
   true,
   1,
   false),
  ('طارق العود',
   'Tariq Aloud',
   'tariq-aloud',
   'oud',
   'عزف العود والتقاسيم',
   'Oud Performance & Taqasim',
   'بيروت',
   'Beirut',
   'كل وتر في العود يحكي حكاية حضارة لم تنطفئ شعلتها أبداً.',
   'Every string on the oud tells the story of a civilisation whose flame never went out.',
   'كل وتر في العود يحكي حكاية حضارة لم تنطفئ شعلتها أبداً.',
   'Every string on the oud tells the story of a civilisation whose flame never went out.',
   'مؤلف وعازف عود بارع يمزج الارتجال الصوفي والتقاسيم البياتية بحس معاصر.',
   'A composer and accomplished oud player who blends Sufi improvisation and bayati taqasim with a contemporary sensibility.',
   'عازف متمكن من تقنيات العود الشرقي والأندلسي، قدّم عروضاً في أرقى المسارح العربية والدولية.',
   'A master of both Eastern and Andalusian oud technique, he has performed on the finest Arab and international stages.',
   'عزف العود • التأليف الموسيقي • الارتجال',
   'Oud performance • Composition • Improvisation',
   '/assets/artists/artist-2.png',
   true,
   2,
   false),
  ('ليلى حسن',
   'Layla Hassan',
   'layla-hassan',
   'singing',
   'طرب أندلسي وموشحات',
   'Andalusian Tarab & Muwashshahat',
   'الرباط',
   'Rabat',
   'حين نغني الموشحات، نعيد بعث مدن وحضارات لا تزال حية في وجداننا.',
   'When we sing the muwashshahat, we bring back cities and civilisations still alive in us.',
   'حين نغني الموشحات، نعيد بعث مدن وحضارات لا تزال حية في وجداننا.',
   'When we sing the muwashshahat, we bring back cities and civilisations still alive in us.',
   'باحثة ومطربة متخصصة في توثيق النوبات الأندلسية والقصائد الصوفية.',
   'A researcher and singer devoted to documenting the Andalusian nubat and the Sufi qasida.',
   'قادت مشاريع بحثية وموسيقية لإحياء التراث الغنائي الأندلسي المشترك بين المشرق والمغرب.',
   'She has led research and performance projects reviving the Andalusian vocal heritage shared between the Mashriq and the Maghreb.',
   'الموشحات الأندلسية • النوبات • الأداء المسرحي',
   'Andalusian muwashshahat • Nubat • Stage performance',
   '/assets/artists/artist-3.png',
   true,
   3,
   false),
  ('يوسف الإيقاع',
   'Youssef Aliqa',
   'youssef-aliqa',
   'percussion',
   'إيقاع وتراث حي',
   'Percussion & Living Heritage',
   'عمان',
   'Amman',
   'الإيقاع هو نبض الحياة؛ به تنتظم الألحان وبه ترقص القلوب.',
   'Rhythm is the pulse of life: it orders the melody and sets hearts dancing.',
   'الإيقاع هو نبض الحياة؛ به تنتظم الألحان وبه ترقص القلوب.',
   'Rhythm is the pulse of life: it orders the melody and sets hearts dancing.',
   'خبير الإيقاعات التراثية الشرقية والأندلسية وضابط إيقاع فرقة أندلسيا الرئيسي.',
   'An expert in Eastern and Andalusian traditional rhythms, and Andalusia''s principal timekeeper.',
   'يمتلك يوسف فهماً عميقاً للموازين الإيقاعية الأندلسية المركبة والدورات الإيقاعية التراثية.',
   'Youssef holds a deep command of the compound Andalusian rhythmic modes and the traditional percussive cycles.',
   'الرق • الدف • الإيقاعات المركبة',
   'Riq • Daf • Compound rhythms',
   '/assets/artists/artist-4.png',
   true,
   4,
   false),
  ('منى الأندلسية',
   'Mona Alandalusia',
   'mona-alandalusia',
   'heritage',
   'موشحات وأزجال',
   'Muwashshahat & Zajal',
   'غرناطة',
   'Granada',
   'الموشح ذاكرة مدينة كاملة، ومن يغنيه يعيد بناءها بيتاً بيتاً.',
   'A muwashshah is the memory of a whole city; whoever sings it rebuilds it house by house.',
   'الموشح ذاكرة مدينة كاملة، ومن يغنيه يعيد بناءها بيتاً بيتاً.',
   'A muwashshah is the memory of a whole city; whoever sings it rebuilds it house by house.',
   'باحثة ومؤدية للموشحات الأندلسية، تعيد إحياء النوبات المغاربية على المسرح.',
   'A researcher and performer of Andalusian muwashshahat, reviving the Maghrebi nubat on stage.',
   'قضت منى سنوات في تتبع النوبات الأندلسية بين مخطوطات تطوان وفاس قبل أن تعيد تقديمها حية.',
   'Mona spent years tracing the Andalusian nubat through the manuscripts of Tetouan and Fez before bringing them back to live performance.',
   'الموشحات • النوبة الأندلسية • الزجل',
   'Muwashshahat • Andalusian nuba • Zajal',
   '/assets/artists/artist-4.png',
   true,
   5,
   false),
  ('كريم القانون',
   'Karim Alqanun',
   'karim-alqanun',
   'oud',
   'قانون وتقاسيم',
   'Qanun & Taqasim',
   'تونس',
   'Tunis',
   'القانون آلة لا تسامح: كل مقام فيها يطلب أذناً صافية ويداً صبورة.',
   'The qanun forgives nothing: every maqam on it asks for a clear ear and a patient hand.',
   'القانون آلة لا تسامح: كل مقام فيها يطلب أذناً صافية ويداً صبورة.',
   'The qanun forgives nothing: every maqam on it asks for a clear ear and a patient hand.',
   'عازف قانون يجمع بين المدرسة التونسية والمقام الشرقي في تقاسيم مرتجلة.',
   'A qanun player who joins the Tunisian school to the Eastern maqam in improvised taqasim.',
   'درس كريم في المعهد العالي للموسيقى بتونس، ويعمل اليوم مع الفرقة على توزيع النوبات.',
   'Karim studied at the Higher Institute of Music in Tunis and today works with the ensemble on arranging the nubat.',
   'القانون • التقاسيم • التوزيع',
   'Qanun • Taqasim • Arrangement',
   '/assets/artists/artist-3.png',
   true,
   6,
   false),
  ('نادية الحديثة',
   'Nadia Alhaditha',
   'nadia-alhaditha',
   'contemporary',
   'تجريب ومزج معاصر',
   'Experiment & Contemporary Fusion',
   'مرسيليا',
   'Marseille',
   'لا أخرج من التراث حين أجرّب، بل أسأله سؤالاً جديداً.',
   'Experimenting does not take me out of the tradition; it asks the tradition a new question.',
   'لا أخرج من التراث حين أجرّب، بل أسأله سؤالاً جديداً.',
   'Experimenting does not take me out of the tradition; it asks the tradition a new question.',
   'ملحّنة تمزج المقام الأندلسي بالآلات الكهربائية والمعالجة الصوتية الحية.',
   'A composer blending the Andalusian maqam with electric instruments and live sound processing.',
   'تشتغل نادية على مشروع يعيد قراءة الموروث الأندلسي بأدوات الموسيقى الإلكترونية المعاصرة.',
   'Nadia works on a project that rereads the Andalusian inheritance through the tools of contemporary electronic music.',
   'التلحين • المعالجة الحية • المزج',
   'Composition • Live processing • Fusion',
   '/assets/artists/artist-1.png',
   false,
   7,
   false),
  ('هشام الناي',
   'Hisham Alnay',
   'hisham-alnay',
   'heritage',
   'ناي ومقامات',
   'Nay & Maqamat',
   'القاهرة',
   'Cairo',
   'الناي أقرب الآلات إلى النفس؛ لا يصدر صوتاً إلا بما تعطيه من هواء.',
   'The nay is the instrument closest to the self: it makes no sound but the breath you give it.',
   'الناي أقرب الآلات إلى النفس؛ لا يصدر صوتاً إلا بما تعطيه من هواء.',
   'The nay is the instrument closest to the self: it makes no sound but the breath you give it.',
   'عازف ناي متخصص في المقامات الشرقية والتقاسيم الحرة المصاحبة للطرب.',
   'A nay player specialising in the Eastern maqamat and the free taqasim that accompany tarab.',
   'رافق هشام كباراً من مطربي الطرب الأصيل قبل انضمامه إلى أندلسيا عازفاً ومدرّباً.',
   'Hisham accompanied leading singers of classical tarab before joining Andalusia as a player and coach.',
   'الناي • المقامات • التقاسيم الحرة',
   'Nay • Maqamat • Free taqasim',
   '/assets/artists/artist-2.png',
   false,
   8,
   false)
ON CONFLICT (slug) DO UPDATE SET
  name = COALESCE(NULLIF(btrim(artists.name), ''), EXCLUDED.name),
  name_en = COALESCE(NULLIF(btrim(artists.name_en), ''), EXCLUDED.name_en),
  category = COALESCE(NULLIF(btrim(artists.category), ''), EXCLUDED.category),
  genre_tag = COALESCE(NULLIF(btrim(artists.genre_tag), ''), EXCLUDED.genre_tag),
  genre_tag_en = COALESCE(NULLIF(btrim(artists.genre_tag_en), ''), EXCLUDED.genre_tag_en),
  city = COALESCE(NULLIF(btrim(artists.city), ''), EXCLUDED.city),
  city_en = COALESCE(NULLIF(btrim(artists.city_en), ''), EXCLUDED.city_en),
  quote = COALESCE(NULLIF(btrim(artists.quote), ''), EXCLUDED.quote),
  quote_en = COALESCE(NULLIF(btrim(artists.quote_en), ''), EXCLUDED.quote_en),
  spotlight_quote = COALESCE(NULLIF(btrim(artists.spotlight_quote), ''), EXCLUDED.spotlight_quote),
  spotlight_quote_en = COALESCE(NULLIF(btrim(artists.spotlight_quote_en), ''), EXCLUDED.spotlight_quote_en),
  short_bio = COALESCE(NULLIF(btrim(artists.short_bio), ''), EXCLUDED.short_bio),
  short_bio_en = COALESCE(NULLIF(btrim(artists.short_bio_en), ''), EXCLUDED.short_bio_en),
  full_bio = COALESCE(NULLIF(btrim(artists.full_bio), ''), EXCLUDED.full_bio),
  full_bio_en = COALESCE(NULLIF(btrim(artists.full_bio_en), ''), EXCLUDED.full_bio_en),
  specialties = COALESCE(NULLIF(btrim(artists.specialties), ''), EXCLUDED.specialties),
  specialties_en = COALESCE(NULLIF(btrim(artists.specialties_en), ''), EXCLUDED.specialties_en),
  portrait_image_url = COALESCE(NULLIF(btrim(artists.portrait_image_url), ''), EXCLUDED.portrait_image_url),
  updated_at = now()
WHERE btrim(COALESCE(artists.name, '')) = ''
   OR btrim(COALESCE(artists.name_en, '')) = ''
   OR btrim(COALESCE(artists.category, '')) = ''
   OR btrim(COALESCE(artists.genre_tag, '')) = ''
   OR btrim(COALESCE(artists.genre_tag_en, '')) = ''
   OR btrim(COALESCE(artists.city, '')) = ''
   OR btrim(COALESCE(artists.city_en, '')) = ''
   OR btrim(COALESCE(artists.quote, '')) = ''
   OR btrim(COALESCE(artists.quote_en, '')) = ''
   OR btrim(COALESCE(artists.spotlight_quote, '')) = ''
   OR btrim(COALESCE(artists.spotlight_quote_en, '')) = ''
   OR btrim(COALESCE(artists.short_bio, '')) = ''
   OR btrim(COALESCE(artists.short_bio_en, '')) = ''
   OR btrim(COALESCE(artists.full_bio, '')) = ''
   OR btrim(COALESCE(artists.full_bio_en, '')) = ''
   OR btrim(COALESCE(artists.specialties, '')) = ''
   OR btrim(COALESCE(artists.specialties_en, '')) = ''
   OR btrim(COALESCE(artists.portrait_image_url, '')) = '';
