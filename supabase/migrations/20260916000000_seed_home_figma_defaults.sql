-- Seed the landing-page (/) Figma copy as site_settings defaults.
--
-- Context: the singleton seed in 20260910000100 inserted empty placeholders
-- ('', ...) for the NOT NULL landing columns, so any existing row renders blank
-- instead of falling back to the built-in copy in DEFAULT_SITE_SETTINGS
-- (src/lib/dal/site-settings.ts). This migration backfills the Figma baseline
-- (screen "الرئيسية", node 89:15216 — see FIGMA_DESIGN_SPEC.md §2) into the
-- singleton row, and makes fresh inserts carry it too.
--
-- Copy sources:
--   AR hero/about/booking/footer/contact — FIGMA_DESIGN_SPEC.md §2, verified
--     against DEFAULT_SITE_SETTINGS in src/lib/dal/site-settings.ts
--   AR section headings/CTAs — Figma nodes + src/messages/ar.json home.*
--   EN siblings — src/messages/en.json home.* + DEFAULT_SITE_SETTINGS *_en
--
-- Conventions kept:
--   * `*...*` runs are the app's <Highlight /> markup (HeroSection + Testimonials
--     parse it; FeaturedArtists/Editorial/HomeEvents render plain text).
--   * Nullable home_* overrides are filled explicitly so /admin/settings shows
--     editable Figma values instead of blank inputs.
--   * Only fills columns that are NULL or '' — admin-authored content is never
--     overwritten. Idempotent: safe to re-run.
-- Depends on: 20260910000100 (table + seed), 20260912000000 (_en columns),
--   20260913000000 (home section controls), 20260914000000 (page content controls).
-- Rollback: not reversible by data (admin edits must be preserved); to restore
--   placeholders, UPDATE the row manually.

DO $$
BEGIN
  -- Fresh-DB path: insert the Figma baseline when no singleton row exists yet.
  INSERT INTO site_settings (
    id,
    hero_headline, hero_subheadline, hero_image_url,
    hero_headline_en, hero_subheadline_en,
    about_headline, about_body, about_image_url,
    about_headline_en, about_body_en,
    booking_banner_title, booking_banner_body,
    booking_banner_title_en, booking_banner_body_en,
    artists_subtitle, artists_subtitle_en,
    events_subtitle, events_subtitle_en,
    academy_subtitle, academy_subtitle_en,
    booking_subtitle, booking_subtitle_en,
    contact_email, contact_phone,
    social_links,
    operational_regions, operational_regions_en,
    footer_mission, footer_mission_en,
    copyright_text, copyright_text_en,
    home_hero_primary_cta, home_hero_primary_cta_en,
    home_hero_secondary_cta, home_hero_secondary_cta_en,
    home_about_cta, home_about_cta_en,
    home_artists_heading, home_artists_heading_en,
    home_artists_cta, home_artists_cta_en,
    home_testimonials_heading, home_testimonials_heading_en,
    home_editorial_heading, home_editorial_heading_en,
    home_events_heading, home_events_heading_en,
    home_events_cta, home_events_cta_en
  )
  SELECT
    'default',
    'منصتك الأولى *لاكتشاف* ودعم *المواهب* الفنية والثقافية',
    'أندلسيا منصة متخصصة في تمثيل ودعم المواهب الإبداعية، وربط الفنانين بالأماكن والمناسبات التي تستحق الجمال.',
    '/assets/figma/hero-stage-landscape.png',
    'Your first place to *discover* and support artistic and cultural *talent*',
    'Andalusia represents and supports creative talent, connecting artists with the places and occasions that deserve beauty.',
    'نكتشف · نصل · نحتفي',
    'وُلدنا من إيمان عميق بأن الفن ليس ترفاً بل ضرورة. نعمل على تقريب المسافة بين الفنان الموهوب والجمهور الذي ينتظره، وبين المناسبة التي تستحق اللحظة الفنية التي تجعلها لا تُنسى. أندلسيا منصة متخصصة في تمثيل ودعم المواهب الإبداعية، وربط الفنانين بالأماكن والمناسبات التي تستحق الجمال.',
    '/assets/figma/about-musician.png',
    'We discover · We connect · We celebrate',
    'We were born from a deep belief that art is not a luxury but a necessity. We work to close the distance between a talented artist and the audience waiting for them, and between an occasion and the artistic moment that makes it unforgettable. Andalusia represents and supports creative talent, connecting artists with the places and occasions that deserve beauty.',
    'مناسبتك تستحق موسيقى حقيقية',
    'احجز فرقة أندلسيا لحفلتك، مطعمك، مهرجانك — واصنع لحظة لا تُنسى.',
    'Your occasion deserves real music',
    'Book Andalusia for your party, your restaurant, your festival — and make a moment no one forgets.',
    'كل فنان في أندلسيا يحمل قصة ومعاناة تحوّلت إلى موسيقى تلامس القلوب.',
    'Every artist at Andalusia carries a story, plays the soul of the East, and turns heritage into a sound for the future.',
    'مواعيد تترك أثراً جميلاً في قلوب عشاق الموسيقى الأصيلة.',
    'Dates that leave a beautiful mark on anyone who loves music with roots.',
    'برامج تعليمية موسيقية مع فنانين حقيقيين في بيئات صغيرة ومكثفة — تجربة تغير مسارك الفني.',
    'Educational music programs with real artists in small, intensive environments — an experience that will change your artistic path.',
    'احجز حفلتك الخاصة أو شاركنا فعاليتك القادمة.',
    'Book your private evening, or bring us into your next event.',
    'hello@andalusia.art',
    '+961 1 234 567',
    '{"instagram": "https://instagram.com/andalusia.art", "tiktok": "https://tiktok.com/@andalusia.art"}'::jsonb,
    'لبنان · المغرب · الخليج',
    'Lebanon · Morocco · The Gulf',
    'مجموعة فنانين يؤمنون أن الإبداع هو الحياة والموسيقى هي الشعلة.',
    'A collective of artists who believe creativity is life and music is the spark.',
    '© أندلسيا ٢٠٢٥ — جميع الحقوق محفوظة',
    '© Andalusia 2025 — All rights reserved',
    'اكتشف الفنانين',
    'Discover the artists',
    'احجز الآن',
    'Book now',
    'تعرّف على فنانينا ←',
    'Meet our artists →',
    'أصوات تصنع التاريخ',
    'Voices that make history',
    'عرض جميع الفنانين ←',
    'View all artists →',
    'يقولون عن *أندلسيا*',
    'They say about *Andalusia*',
    'نكتب كي لا تضيع التفاصيل',
    'We write so the details are never lost',
    'نلتقي في المكان. في اللحظة',
    'We meet in the place. In the moment',
    'عرض كل الفعاليات',
    'View all events'
  WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE id = 'default');

  -- Existing-DB path: backfill only NULL / empty cells, never admin content.
  UPDATE site_settings SET
    hero_headline = CASE WHEN hero_headline IS NULL OR hero_headline = '' THEN 'منصتك الأولى *لاكتشاف* ودعم *المواهب* الفنية والثقافية' ELSE hero_headline END,
    hero_subheadline = CASE WHEN hero_subheadline IS NULL OR hero_subheadline = '' THEN 'أندلسيا منصة متخصصة في تمثيل ودعم المواهب الإبداعية، وربط الفنانين بالأماكن والمناسبات التي تستحق الجمال.' ELSE hero_subheadline END,
    hero_image_url = CASE WHEN hero_image_url IS NULL OR hero_image_url IN ('', '/assets/hero-stage.png') THEN '/assets/figma/hero-stage-landscape.png' ELSE hero_image_url END,
    hero_headline_en = CASE WHEN hero_headline_en IS NULL OR hero_headline_en = '' THEN 'Your first place to *discover* and support artistic and cultural *talent*' ELSE hero_headline_en END,
    hero_subheadline_en = CASE WHEN hero_subheadline_en IS NULL OR hero_subheadline_en = '' THEN 'Andalusia represents and supports creative talent, connecting artists with the places and occasions that deserve beauty.' ELSE hero_subheadline_en END,
    about_headline = CASE WHEN about_headline IS NULL OR about_headline = '' THEN 'نكتشف · نصل · نحتفي' ELSE about_headline END,
    about_body = CASE WHEN about_body IS NULL OR about_body = '' THEN 'وُلدنا من إيمان عميق بأن الفن ليس ترفاً بل ضرورة. نعمل على تقريب المسافة بين الفنان الموهوب والجمهور الذي ينتظره، وبين المناسبة التي تستحق اللحظة الفنية التي تجعلها لا تُنسى. أندلسيا منصة متخصصة في تمثيل ودعم المواهب الإبداعية، وربط الفنانين بالأماكن والمناسبات التي تستحق الجمال.' ELSE about_body END,
    about_image_url = CASE WHEN about_image_url IS NULL OR about_image_url IN ('', '/assets/about-musician.png') THEN '/assets/figma/about-musician.png' ELSE about_image_url END,
    about_headline_en = CASE WHEN about_headline_en IS NULL OR about_headline_en = '' THEN 'We discover · We connect · We celebrate' ELSE about_headline_en END,
    about_body_en = CASE WHEN about_body_en IS NULL OR about_body_en = '' THEN 'We were born from a deep belief that art is not a luxury but a necessity. We work to close the distance between a talented artist and the audience waiting for them, and between an occasion and the artistic moment that makes it unforgettable. Andalusia represents and supports creative talent, connecting artists with the places and occasions that deserve beauty.' ELSE about_body_en END,
    booking_banner_title = CASE WHEN booking_banner_title IS NULL OR booking_banner_title = '' THEN 'مناسبتك تستحق موسيقى حقيقية' ELSE booking_banner_title END,
    booking_banner_body = CASE WHEN booking_banner_body IS NULL OR booking_banner_body = '' THEN 'احجز فرقة أندلسيا لحفلتك، مطعمك، مهرجانك — واصنع لحظة لا تُنسى.' ELSE booking_banner_body END,
    booking_banner_title_en = CASE WHEN booking_banner_title_en IS NULL OR booking_banner_title_en = '' THEN 'Your occasion deserves real music' ELSE booking_banner_title_en END,
    booking_banner_body_en = CASE WHEN booking_banner_body_en IS NULL OR booking_banner_body_en = '' THEN 'Book Andalusia for your party, your restaurant, your festival — and make a moment no one forgets.' ELSE booking_banner_body_en END,
    artists_subtitle = CASE WHEN artists_subtitle IS NULL OR artists_subtitle = '' THEN 'كل فنان في أندلسيا يحمل قصة ومعاناة تحوّلت إلى موسيقى تلامس القلوب.' ELSE artists_subtitle END,
    artists_subtitle_en = CASE WHEN artists_subtitle_en IS NULL OR artists_subtitle_en = '' THEN 'Every artist at Andalusia carries a story, plays the soul of the East, and turns heritage into a sound for the future.' ELSE artists_subtitle_en END,
    events_subtitle = CASE WHEN events_subtitle IS NULL OR events_subtitle = '' THEN 'مواعيد تترك أثراً جميلاً في قلوب عشاق الموسيقى الأصيلة.' ELSE events_subtitle END,
    events_subtitle_en = CASE WHEN events_subtitle_en IS NULL OR events_subtitle_en = '' THEN 'Dates that leave a beautiful mark on anyone who loves music with roots.' ELSE events_subtitle_en END,
    academy_subtitle = CASE WHEN academy_subtitle IS NULL OR academy_subtitle = '' THEN 'برامج تعليمية موسيقية مع فنانين حقيقيين في بيئات صغيرة ومكثفة — تجربة تغير مسارك الفني.' ELSE academy_subtitle END,
    academy_subtitle_en = CASE WHEN academy_subtitle_en IS NULL OR academy_subtitle_en = '' THEN 'Educational music programs with real artists in small, intensive environments — an experience that will change your artistic path.' ELSE academy_subtitle_en END,
    booking_subtitle = CASE WHEN booking_subtitle IS NULL OR booking_subtitle = '' THEN 'احجز حفلتك الخاصة أو شاركنا فعاليتك القادمة.' ELSE booking_subtitle END,
    booking_subtitle_en = CASE WHEN booking_subtitle_en IS NULL OR booking_subtitle_en = '' THEN 'Book your private evening, or bring us into your next event.' ELSE booking_subtitle_en END,
    contact_email = CASE WHEN contact_email IS NULL OR contact_email = '' OR contact_email = 'contact@example.com' THEN 'hello@andalusia.art' ELSE contact_email END,
    contact_phone = CASE WHEN contact_phone IS NULL OR contact_phone = '' THEN '+961 1 234 567' ELSE contact_phone END,
    social_links = CASE WHEN social_links IS NULL OR social_links = '{}'::jsonb THEN '{"instagram": "https://instagram.com/andalusia.art", "tiktok": "https://tiktok.com/@andalusia.art"}'::jsonb ELSE social_links END,
    operational_regions = CASE WHEN operational_regions IS NULL OR operational_regions = '' THEN 'لبنان · المغرب · الخليج' ELSE operational_regions END,
    operational_regions_en = CASE WHEN operational_regions_en IS NULL OR operational_regions_en = '' THEN 'Lebanon · Morocco · The Gulf' ELSE operational_regions_en END,
    footer_mission = CASE WHEN footer_mission IS NULL OR footer_mission = '' THEN 'مجموعة فنانين يؤمنون أن الإبداع هو الحياة والموسيقى هي الشعلة.' ELSE footer_mission END,
    footer_mission_en = CASE WHEN footer_mission_en IS NULL OR footer_mission_en = '' THEN 'A collective of artists who believe creativity is life and music is the spark.' ELSE footer_mission_en END,
    copyright_text = CASE WHEN copyright_text IS NULL OR copyright_text = '' THEN '© أندلسيا ٢٠٢٥ — جميع الحقوق محفوظة' ELSE copyright_text END,
    copyright_text_en = CASE WHEN copyright_text_en IS NULL OR copyright_text_en = '' THEN '© Andalusia 2025 — All rights reserved' ELSE copyright_text_en END,
    home_hero_primary_cta = CASE WHEN home_hero_primary_cta IS NULL OR home_hero_primary_cta = '' THEN 'اكتشف الفنانين' ELSE home_hero_primary_cta END,
    home_hero_primary_cta_en = CASE WHEN home_hero_primary_cta_en IS NULL OR home_hero_primary_cta_en = '' THEN 'Discover the artists' ELSE home_hero_primary_cta_en END,
    home_hero_secondary_cta = CASE WHEN home_hero_secondary_cta IS NULL OR home_hero_secondary_cta = '' THEN 'احجز الآن' ELSE home_hero_secondary_cta END,
    home_hero_secondary_cta_en = CASE WHEN home_hero_secondary_cta_en IS NULL OR home_hero_secondary_cta_en = '' THEN 'Book now' ELSE home_hero_secondary_cta_en END,
    home_about_cta = CASE WHEN home_about_cta IS NULL OR home_about_cta = '' THEN 'تعرّف على فنانينا ←' ELSE home_about_cta END,
    home_about_cta_en = CASE WHEN home_about_cta_en IS NULL OR home_about_cta_en = '' THEN 'Meet our artists →' ELSE home_about_cta_en END,
    home_artists_heading = CASE WHEN home_artists_heading IS NULL OR home_artists_heading = '' THEN 'أصوات تصنع التاريخ' ELSE home_artists_heading END,
    home_artists_heading_en = CASE WHEN home_artists_heading_en IS NULL OR home_artists_heading_en = '' THEN 'Voices that make history' ELSE home_artists_heading_en END,
    home_artists_cta = CASE WHEN home_artists_cta IS NULL OR home_artists_cta = '' THEN 'عرض جميع الفنانين ←' ELSE home_artists_cta END,
    home_artists_cta_en = CASE WHEN home_artists_cta_en IS NULL OR home_artists_cta_en = '' THEN 'View all artists →' ELSE home_artists_cta_en END,
    home_testimonials_heading = CASE WHEN home_testimonials_heading IS NULL OR home_testimonials_heading = '' THEN 'يقولون عن *أندلسيا*' ELSE home_testimonials_heading END,
    home_testimonials_heading_en = CASE WHEN home_testimonials_heading_en IS NULL OR home_testimonials_heading_en = '' THEN 'They say about *Andalusia*' ELSE home_testimonials_heading_en END,
    home_editorial_heading = CASE WHEN home_editorial_heading IS NULL OR home_editorial_heading = '' THEN 'نكتب كي لا تضيع التفاصيل' ELSE home_editorial_heading END,
    home_editorial_heading_en = CASE WHEN home_editorial_heading_en IS NULL OR home_editorial_heading_en = '' THEN 'We write so the details are never lost' ELSE home_editorial_heading_en END,
    home_events_heading = CASE WHEN home_events_heading IS NULL OR home_events_heading = '' THEN 'نلتقي في المكان. في اللحظة' ELSE home_events_heading END,
    home_events_heading_en = CASE WHEN home_events_heading_en IS NULL OR home_events_heading_en = '' THEN 'We meet in the place. In the moment' ELSE home_events_heading_en END,
    home_events_cta = CASE WHEN home_events_cta IS NULL OR home_events_cta = '' THEN 'عرض كل الفعاليات' ELSE home_events_cta END,
    home_events_cta_en = CASE WHEN home_events_cta_en IS NULL OR home_events_cta_en = '' THEN 'View all events' ELSE home_events_cta_en END,
    updated_at = now()
  WHERE id = 'default';
END $$;
