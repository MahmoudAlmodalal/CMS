# Andalusia Music Platform — Content Inventory & CMS Data Mapping

**Specification Reference:** `figma_audit_master_specification.md`  
**Figma Root Reference:** `89:15216` (`الرئيسية`)  
**Target Architecture:** Next.js 15 App Router + Supabase PostgreSQL & Storage  
**Audit Gate:** Complete & Verified (Tasks 1–10)

---

## 1. Content Classification Taxonomy

Every content element in the platform is strictly classified into one of four mutually exclusive tiers:

1. **Static UI/content:** Hardcoded directly into React/Next.js components. Stable UI elements (navigation links, button labels, section headings, decorative vectors, layout grids) that do not require CMS editing. Hardcoding prevents visual regression, reduces database queries, and optimizes TTFB.
2. **CMS-managed dynamic content:** Editable by band managers and editorial staff via CMS. Stored in Supabase PostgreSQL tables and queried dynamically at build/runtime. Includes artist profiles, tracks, discography releases, live events, academy tracks, news articles, and testimonials.
3. **System/configuration data:** Site-wide administrative settings (hero copy, manifesto text, contact channels, social handles, footer metadata) stored in a singleton `site_settings` table (1 row).
4. **User-submitted data:** Ingested via public interactive forms (`/booking`, `/academy` newsletter). Treated as private, write-only transactional records with Row Level Security (RLS). Never exposed publicly.

---

## 2. Requirement Status Definition

For every entity and field:
- **CONFIRMED:** Explicitly present in the Figma canvas text layers, components, or asset nodes.
- **INFERRED:** Logically necessary to support an explicit Figma feature (e.g., `slug` for route linking, `duration_seconds` for audio player timeline).
- **UNKNOWN:** Undetermined architectural detail requiring stakeholder clarification (e.g., external ticketing link vs internal inquiry routing).

---

## 3. Global Shell (Navbar & Footer)

| Area | Figma Element | Figma Node ID | Public Component | Content Classification | CMS Field | Database Entity | Database Field | Public Route | Status | Notes / Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| Global Nav | Brand Logo & Mark | `94:18729` / `186:1519` | `Navbar.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | Static vector asset `/public/assets/branding/logo.svg` |
| Global Nav | Nav Link: "الرئيسية" | `94:18729` / `186:1536` | `Navbar.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | Hardcoded route link to `/` |
| Global Nav | Nav Link: "الأكاديمية" | `94:18729` / `186:1534` | `Navbar.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | Hardcoded route link to `/academy` |
| Global Nav | Nav Link: "الفنانين" | `94:18729` / `186:1532` | `Navbar.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | Hardcoded route link to `/artists` |
| Global Nav | Nav Link: "الأخبار" | `94:18729` / `186:1530` | `Navbar.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | Hardcoded route link to `/news` |
| Global Nav | Nav Link: "الفعاليات" | `94:18729` / `186:1528` | `Navbar.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | Hardcoded route link to `/events` |
| Global Nav | CTA Button: "أحجز الآن" | `94:18729` / `186:1523` | `Navbar.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | Hardcoded button directing to `/booking` |
| Global Nav | Mobile Hamburger Toggle | `139:12348` | `MobileNavbar.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | Client-side drawer trigger |
| Global Nav | Mobile Drawer Links | `139:12368` | `MobileDrawer.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | Stacks the 5 navigation links + booking CTA |
| Global Footer | Footer Mission Text | `94:18289` / `186:2077` | `Footer.tsx` | System/configuration data | `footer_mission` | `site_settings` | `footer_mission` | All | **CONFIRMED** | "مجموعة فنانين يؤمنون أن الإبداع هو الحياة..." |
| Global Footer | Footer Tagline | `94:18289` / `186:2079` | `Footer.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | "♪ من رحم المعاناة ولدت الموسيقى" |
| Global Footer | Column Header: "استكشف" | `94:18289` / `186:2082` | `Footer.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | Hardcoded column header |
| Global Footer | Footer Navigation Links | `94:18289` / `186:2084-90` | `Footer.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | Hardcoded internal navigation links |
| Global Footer | Column Header: "تواصل" | `94:18289` / `186:2093` | `Footer.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | Hardcoded column header |
| Global Footer | Contact Email | `94:18289` / `186:2095` | `Footer.tsx` | System/configuration data | `contact_email` | `site_settings` | `contact_email` | All | **CONFIRMED** | Confirmed: `hello@andalusia.art` |
| Global Footer | Social Media Handles | `94:18289` / `186:2097` | `Footer.tsx` | System/configuration data | `social_links` | `site_settings` | `social_links` | All | **CONFIRMED** | Confirmed: Instagram, TikTok (stored as JSONB) |
| Global Footer | Regional Presence String | `94:18289` / `186:2099` | `Footer.tsx` | System/configuration data | `operational_regions` | `site_settings` | `operational_regions` | All | **CONFIRMED** | Confirmed: "لبنان · المغرب · الخليج" |
| Global Footer | Mini CTA Heading & Pitch | `94:18289` / `186:2102-05` | `Footer.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | "حفلتك القادمة تبدأ من هنا." |
| Global Footer | Mini CTA Button: "ابدأ حجزك الآن ♪" | `94:18289` / `186:2107` | `Footer.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | Permanent button linking to `/booking` |
| Global Footer | Footer Motto | `94:18289` / `186:2111` | `Footer.tsx` | Static UI/content | None | None | None | All | **CONFIRMED** | "موسيقى · ثقافة · قدرة" |
| Global Footer | Copyright Notice | `94:18289` / `186:2113` | `Footer.tsx` | System/configuration data | `copyright_text` | `site_settings` | `copyright_text` | All | **CONFIRMED** | "© أندلسيا ٢٠٢٥ — جميع الحقوق محفوظة" |

---

## 4. Home Page (`/`)

| Area | Figma Element | Figma Node ID | Public Component | Content Classification | CMS Field | Database Entity | Database Field | Public Route | Status | Notes / Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| Hero | Main Headline | `148:3708` / `186:2000` | `HeroSection.tsx` | System/configuration data | `hero_headline` | `site_settings` | `hero_headline` | `/` | **CONFIRMED** | "منصتك الأولى لاكتشاف ودعم المواهب الفنية والثقافية" |
| Hero | Supporting Subtitle | `148:3708` / `186:1999` | `HeroSection.tsx` | System/configuration data | `hero_subheadline` | `site_settings` | `hero_subheadline` | `/` | **CONFIRMED** | "أندلسيا منصة متخصصة في تمثيل ودعم المواهب..." |
| Hero | Primary CTA Button | `148:3708` / `186:1998` | `HeroSection.tsx` | Static UI/content | None | None | None | `/` | **CONFIRMED** | "احجز الآن" (links to `/booking`) |
| Hero | Secondary CTA Button | `148:3708` / `186:1993` | `HeroSection.tsx` | Static UI/content | None | None | None | `/` | **CONFIRMED** | "اكتشف الفنانين" (links to `/artists`) |
| Hero | Background Stage Visual | `148:3708` / `186:1987` | `HeroSection.tsx` | CMS-managed dynamic content | `hero_image_url` | `site_settings` | `hero_image_url` | `/` | **CONFIRMED** | High-res band stage photograph |
| Events Preview | Section Heading: "نلتقي في المكان..." | `87:14400` / `87:14481` | `HomeEvents.tsx` | Static UI/content | None | None | None | `/` | **CONFIRMED** | Stylized Aref Ruqaa editorial kicker |
| Events Preview | Upcoming Event Cards (x3) | `87:14400` / `115:2435` | `EventCard.tsx` | CMS-managed dynamic content | Relation query | `events` | `limit: 3, order: event_date ASC` | `/` | **CONFIRMED** | Queries earliest 3 scheduled events |
| Events Preview | Event Card Title | `87:14492` | `EventCard.tsx` | CMS-managed dynamic content | `title` | `events` | `title` | `/` | **CONFIRMED** | e.g. "ليلة الطرب الأندلسي" |
| Events Preview | Event Card Date Badge | `87:14487-89` | `EventCard.tsx` | CMS-managed dynamic content | `event_date` | `events` | `event_date` | `/` | **CONFIRMED** | DM Mono day number + Cairo Arabic month |
| Events Preview | Event Card Location | `87:14495` | `EventCard.tsx` | CMS-managed dynamic content | `location` | `events` | `location` | `/` | **CONFIRMED** | e.g. "بيروت — لبنان" |
| Events Preview | Event Card Category Badge | `87:14497` | `EventCard.tsx` | CMS-managed dynamic content | `category` | `events` | `category` | `/` | **CONFIRMED** | "حفل", "مهرجان", "أمسية", "ورشة" |
| Events Preview | Event Card Action Link | `87:14498` | `EventCard.tsx` | Static UI/content | None | None | None | `/` | **CONFIRMED** | Links to `/booking?event_id=[id]` |
| Events Preview | "عرض كل الفعاليات" Link | `87:14533` | `HomeEvents.tsx` | Static UI/content | None | None | None | `/` | **CONFIRMED** | Directs to `/events` |
| About Section | Section Kicker: "من نحن" | `87:14466` / `186:284` | `AboutSection.tsx` | Static UI/content | None | None | None | `/` | **CONFIRMED** | Static section tag |
| About Section | Headline: "نكتشف · نصل · نحتفي" | `112:850` / `186:281` | `AboutSection.tsx` | System/configuration data | `about_headline` | `site_settings` | `about_headline` | `/` | **CONFIRMED** | Band manifesto tagline |
| About Section | Manifesto Body Paragraph | `112:850` / `186:279` | `AboutSection.tsx` | System/configuration data | `about_body` | `site_settings` | `about_body` | `/` | **CONFIRMED** | "وُلدنا من إيمان عميق بأن الفن ليس ترفاً..." |
| About Section | CTA: "تعرّف على فنانينا ←" | `112:850` / `186:278` | `AboutSection.tsx` | Static UI/content | None | None | None | `/` | **CONFIRMED** | Directs to `/artists` |
| About Section | Musician Studio Portrait | `87:14467` | `AboutSection.tsx` | CMS-managed dynamic content | `about_image_url` | `site_settings` | `about_image_url` | `/` | **CONFIRMED** | Studio musician visual (509 × 678 px) |
| Booking Strip | Section Note Glyph "♪" | `87:14534` / `87:14537` | `BookingBanner.tsx` | Static UI/content | None | None | None | `/` | **CONFIRMED** | Brand decorative vector |
| Booking Strip | Headline: "مناسبتك تستحق..." | `87:14534` / `87:14539` | `BookingBanner.tsx` | System/configuration data | `booking_banner_title` | `site_settings` | `booking_banner_title` | `/` | **CONFIRMED** | High-contrast orange banner title |
| Booking Strip | Subtitle Pitch Text | `87:14534` / `87:14541` | `BookingBanner.tsx` | System/configuration data | `booking_banner_body` | `site_settings` | `booking_banner_body` | `/` | **CONFIRMED** | Pitch copy for private engagements |
| Booking Strip | Button: "ابدأ حجزك الآن ♪" | `87:14534` / `186:1782` | `BookingBanner.tsx` | Static UI/content | None | None | None | `/` | **CONFIRMED** | Directs to `/booking` |
| Featured Artists | Section Title: "أصوات تصنع التاريخ"| `87:14240` / `87:14299` | `FeaturedArtists.tsx` | Static UI/content | None | None | None | `/` | **CONFIRMED** | Static section header |
| Featured Artists | Artist Preview Cards (x4) | `87:14240` / `31:3581` | `ArtistCard.tsx` | CMS-managed dynamic content | Relation query | `artists` | `where: is_featured = true, limit: 4` | `/` | **CONFIRMED** | Pinned ensemble highlights |
| Featured Artists | Artist Name | `87:14247` | `ArtistCard.tsx` | CMS-managed dynamic content | `name` | `artists` | `name` | `/` | **CONFIRMED** | e.g. "ليلى حسن", "طارق العود" |
| Featured Artists | Artist Genre Tag | `87:14249` | `ArtistCard.tsx` | CMS-managed dynamic content | `genre_tag` | `artists` | `genre_tag` | `/` | **CONFIRMED** | e.g. "غناء عربي", "عزف العود" |
| Featured Artists | Artist Portrait Image | `87:14240` | `ArtistCard.tsx` | CMS-managed dynamic content | `portrait_image_url` | `artists` | `portrait_image_url` | `/` | **CONFIRMED** | Headshot visual |
| Featured Artists | "عرض جميع الفنانين ←" Link | `87:14240` / `186:1051` | `FeaturedArtists.tsx` | Static UI/content | None | None | None | `/` | **CONFIRMED** | Directs to `/artists` |
| Editorial Feature | Section Title: "نكتب كي لا تضيع..."| `87:14400` / `87:14402` | `EditorialFeature.tsx` | Static UI/content | None | None | None | `/` | **CONFIRMED** | Editorial section heading |
| Editorial Feature | Story Cards (x3) | `87:14400` / `186:187-1255`| `ArticleCard.tsx` | CMS-managed dynamic content | Relation query | `articles` | `where: is_featured = true, limit: 3` | `/` | **CONFIRMED** | Featured cultural articles |
| Editorial Feature | Story Title | `186:192` | `ArticleCard.tsx` | CMS-managed dynamic content | `title` | `articles` | `title` | `/` | **CONFIRMED** | e.g. "الموسيقى تعبر الحدود" |
| Editorial Feature | Story Category Badge | `186:189` | `ArticleCard.tsx` | CMS-managed dynamic content | `category` | `articles` | `category` | `/` | **CONFIRMED** | "ثقافة", "فعاليات", "فنانون" |
| Editorial Feature | Story Publication Date | `186:187` | `ArticleCard.tsx` | CMS-managed dynamic content | `published_at` | `articles` | `published_at` | `/` | **CONFIRMED** | Date string e.g. "٢٨ يناير ٢٠٢٦" |
| Editorial Feature | Story Excerpt | `186:195` | `ArticleCard.tsx` | CMS-managed dynamic content | `excerpt` | `articles` | `excerpt` | `/` | **CONFIRMED** | Brief article introduction |
| Editorial Feature | Story Thumbnail Image | `186:183` | `ArticleCard.tsx` | CMS-managed dynamic content | `cover_image_url` | `articles` | `cover_image_url` | `/` | **CONFIRMED** | Editorial thumbnail visual |
| Testimonials | Section Heading: "يقولون عن أندلسيا"| `87:14313` / `87:14314` | `TestimonialsSlider.tsx`| Static UI/content | None | None | None | `/` | **CONFIRMED** | Static section heading |
| Testimonials | Endorsement Quote Text | `87:14313` / `186:1792` | `TestimonialsSlider.tsx`| CMS-managed dynamic content | `quote` | `testimonials` | `quote` | `/` | **CONFIRMED** | Attendee and critic reviews |
| Testimonials | Reviewer Name | `87:14313` / `186:1797` | `TestimonialsSlider.tsx`| CMS-managed dynamic content | `author_name` | `testimonials` | `author_name` | `/` | **CONFIRMED** | e.g. "عمر الحاج" |
| Testimonials | Reviewer Role / Title | `87:14313` / `186:1798` | `TestimonialsSlider.tsx`| CMS-managed dynamic content | `author_role` | `testimonials` | `author_role` | `/` | **INFERRED** | Professional affiliation |
| Testimonials | Slider Arrows (Prev/Next) | `87:14313` / `176:5965` | `TestimonialsSlider.tsx`| Static UI/content | None | None | None | `/` | **CONFIRMED** | Client carousel navigation controls |

---

## 5. Artists Directory (`/artists`)

| Area | Figma Element | Figma Node ID | Public Component | Content Classification | CMS Field | Database Entity | Database Field | Public Route | Status | Notes / Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| Header | Directory Title: "أصوات تصنع التاريخ"| `91:17844` / `91:18060` | `ArtistsHeader.tsx` | Static UI/content | None | None | None | `/artists` | **CONFIRMED** | Fixed directory title |
| Header | Directory Subtitle Text | `91:17844` / `91:18059` | `ArtistsHeader.tsx` | System/configuration data | `artists_subtitle` | `site_settings` | `artists_subtitle` | `/artists` | **CONFIRMED** | "كل فنان في أندلسيا يحمل قصة ومعاناة..." |
| Filter Tabs | Tab: "الكل" | `91:17844` / `91:18158` | `ArtistFilterTabs.tsx` | Static UI/content | None | None | None | `/artists` | **CONFIRMED** | Resets filter state |
| Filter Tabs | Tab: "غناء" | `91:17844` / `91:18147` | `ArtistFilterTabs.tsx` | Static UI/content | Filter query | `artists` | `category = 'singing'` | `/artists` | **CONFIRMED** | Filter pill |
| Filter Tabs | Tab: "عود وموسيقى" | `91:17844` / `91:18149` | `ArtistFilterTabs.tsx` | Static UI/content | Filter query | `artists` | `category = 'oud'` | `/artists` | **CONFIRMED** | Filter pill |
| Filter Tabs | Tab: "إيقاع" | `91:17844` / `91:18151` | `ArtistFilterTabs.tsx` | Static UI/content | Filter query | `artists` | `category = 'percussion'` | `/artists` | **CONFIRMED** | Filter pill |
| Filter Tabs | Tab: "معاصر" | `91:17844` / `91:18153` | `ArtistFilterTabs.tsx` | Static UI/content | Filter query | `artists` | `category = 'contemporary'`| `/artists` | **CONFIRMED** | Filter pill |
| Filter Tabs | Tab: "تراث" | `91:17844` / `91:18155` | `ArtistFilterTabs.tsx` | Static UI/content | Filter query | `artists` | `category = 'heritage'` | `/artists` | **CONFIRMED** | Filter pill |
| Artists Grid | Grid Container (3-column) | `91:17844` / `91:18068-143`| `ArtistsGrid.tsx` | CMS-managed dynamic content | Relation query | `artists` | `where: is_published = true` | `/artists` | **CONFIRMED** | Responsive grid of active musicians |
| Artist Card | Musician Name | `91:18070` | `ArtistCard.tsx` | CMS-managed dynamic content | `name` | `artists` | `name` | `/artists` | **CONFIRMED** | e.g. "يوسف الإيقاع" |
| Artist Card | Specialty / Genre Tag | `91:18068` | `ArtistCard.tsx` | CMS-managed dynamic content | `genre_tag` | `artists` | `genre_tag` | `/artists` | **CONFIRMED** | e.g. "إيقاع وتراث" |
| Artist Card | City / Base | `91:18072` | `ArtistCard.tsx` | CMS-managed dynamic content | `city` | `artists` | `city` | `/artists` | **CONFIRMED** | e.g. "الدار البيضاء" |
| Artist Card | Portrait Image | `91:18068` | `ArtistCard.tsx` | CMS-managed dynamic content | `portrait_image_url` | `artists` | `portrait_image_url` | `/artists` | **CONFIRMED** | Headshot visual |
| Artist Card | Card Link Target | `91:18070` | `ArtistCard.tsx` | CMS-managed dynamic content | `slug` | `artists` | `slug` | `/artists` | **INFERRED** | Unique route identifier `/artists/[slug]` |

---

## 6. Single Artist Profile (`/artists/[slug]`)

| Area | Figma Element | Figma Node ID | Public Component | Content Classification | CMS Field | Database Entity | Database Field | Public Route | Status | Notes / Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| Profile Hero | Artist Name (Display) | `134:4420` / `134:4635` | `ArtistHero.tsx` | CMS-managed dynamic content | `name` | `artists` | `name` | `/artists/[slug]` | **CONFIRMED** | e.g. "سارة الصوت" |
| Profile Hero | Artist Quotation / Motto | `134:4420` / `134:4637` | `ArtistHero.tsx` | CMS-managed dynamic content | `quote` | `artists` | `quote` | `/artists/[slug]` | **CONFIRMED** | ♪ "الصوت هو المرآة الأصدق للروح." |
| Profile Hero | Short Bio Summary | `134:4420` / `134:4638` | `ArtistHero.tsx` | CMS-managed dynamic content | `short_bio` | `artists` | `short_bio` | `/artists/[slug]` | **CONFIRMED** | "مغنية مصرية تختصص في الطرب الأصيل..." |
| Profile Hero | Primary Action: "احجز الفنان ♪"| `134:4420` / `134:4641` | `ArtistHero.tsx` | Static UI/content | None | None | None | `/artists/[slug]` | **CONFIRMED** | Links to `/booking?artist=[slug]` |
| Profile Hero | Secondary Action: "تواصل مباشرة"| `134:4420` / `134:4643` | `ArtistHero.tsx` | Static UI/content | None | None | None | `/artists/[slug]` | **CONFIRMED** | Opens inquiry modal or triggers mailto |
| Profile Hero | Hero Portrait Visual | `134:4420` / `134:4631` | `ArtistHero.tsx` | CMS-managed dynamic content | `portrait_image_url` | `artists` | `portrait_image_url` | `/artists/[slug]` | **CONFIRMED** | High-resolution performance photo |
| Spotlight | Heading: "الفن في لحظته الأصدق" | `134:4420` / `134:4646` | `ArtistSpotlight.tsx` | Static UI/content | None | None | None | `/artists/[slug]` | **CONFIRMED** | Typographic section header |
| Spotlight | Spotlight Quote | `134:4420` / `134:4655` | `ArtistSpotlight.tsx` | CMS-managed dynamic content | `spotlight_quote` | `artists` | `spotlight_quote` | `/artists/[slug]` | **INFERRED** | Optional spotlight quote (falls back to `quote`) |
| Spotlight | Quote Attribution Name | `134:4420` / `134:4657` | `ArtistSpotlight.tsx` | CMS-managed dynamic content | `name` | `artists` | `name` | `/artists/[slug]` | **CONFIRMED** | Interpolates artist name |
| Artist Booking CTA | Banner Title: "تريد [الاسم]..." | `134:4420` / `134:4665` | `ArtistBookingPrompt.tsx` | CMS-managed dynamic content | `name` | `artists` | `name` | `/artists/[slug]` | **CONFIRMED** | Interpolated personalized banner title |
| Artist Booking CTA | Banner Subtitle Text | `134:4420` / `134:4667` | `ArtistBookingPrompt.tsx` | Static UI/content | None | None | None | `/artists/[slug]` | **CONFIRMED** | "تواصل معنا وسنصمم لك تجربة موسيقية لا تُنسى." |
| Artist Booking CTA | Button: "ابدأ حجزك الآن ♪" | `134:4420` / `134:4670` | `ArtistBookingPrompt.tsx` | Static UI/content | None | None | None | `/artists/[slug]` | **CONFIRMED** | Links to `/booking?artist=[slug]` |
| Bio Section | Section Title: "مسيرتها الفنية" | `134:4420` / `134:4684` | `ArtistBiography.tsx` | Static UI/content | None | None | None | `/artists/[slug]` | **CONFIRMED** | Section heading |
| Bio Section | Disciplines String | `134:4420` / `134:4679` | `ArtistBiography.tsx` | CMS-managed dynamic content | `specialties` | `artists` | `specialties` | `/artists/[slug]` | **CONFIRMED** | "الصوت • الغناء الأندلسي • الطرب الأصيل" |
| Bio Section | Full Biography Text | `134:4420` / `134:4681` | `ArtistBiography.tsx` | CMS-managed dynamic content | `full_bio` | `artists` | `full_bio` | `/artists/[slug]` | **CONFIRMED** | Multi-paragraph markdown biography |
| Discography | Works Filter Tabs | `134:4420` / `134:4690-94`| `ArtistDiscography.tsx` | Static UI/content | None | None | None | `/artists/[slug]` | **CONFIRMED** | Tabs: "أغاني", "حفلات", "ألبومات" |
| Discography | Release Cards Grid | `134:4420` / `134:4701-44`| `ReleaseCard.tsx` | CMS-managed dynamic content | Relation query | `releases` | `where: artist_id = id` | `/artists/[slug]` | **CONFIRMED** | Musician studio/live recordings list |
| Discography | Release Type Badge | `134:4701` | `ReleaseCard.tsx` | CMS-managed dynamic content | `release_type` | `releases` | `release_type` | `/artists/[slug]` | **CONFIRMED** | "ألبوم استوديو", "ألبوم حي" |
| Discography | Release Title | `134:4703` | `ReleaseCard.tsx` | CMS-managed dynamic content | `title` | `releases` | `title` | `/artists/[slug]` | **CONFIRMED** | e.g. "نسمة من الأندلس", "حنين" |
| Discography | Release Track Count | `134:4706` | `ReleaseCard.tsx` | CMS-managed dynamic content | `track_count` | `releases` | `track_count` | `/artists/[slug]` | **CONFIRMED** | e.g. 12 |
| Discography | Release Year | `134:4708` | `ReleaseCard.tsx` | CMS-managed dynamic content | `release_year` | `releases` | `release_year` | `/artists/[slug]` | **CONFIRMED** | e.g. 2023 |
| Discography | Release Cover Artwork | `134:4420` | `ReleaseCard.tsx` | CMS-managed dynamic content | `cover_image_url` | `releases` | `cover_image_url` | `/artists/[slug]` | **CONFIRMED** | Album sleeve graphic |
| Audio Player | Featured Track Title | `134:4420` | `AudioPlayerWidget.tsx` | CMS-managed dynamic content | `title` | `tracks` | `title` | `/artists/[slug]` | **CONFIRMED** | Track title loaded into player |
| Audio Player | Audio File Stream URL | `134:4420` | `AudioPlayerWidget.tsx` | CMS-managed dynamic content | `audio_file_url` | `tracks` | `audio_file_url` | `/artists/[slug]` | **CONFIRMED** | Streamable audio file (Supabase Storage) |
| Audio Player | Track Duration (Seconds) | `134:4420` | `AudioPlayerWidget.tsx` | CMS-managed dynamic content | `duration_seconds` | `tracks` | `duration_seconds` | `/artists/[slug]` | **INFERRED** | Displayed in mm:ss format |
| Audio Player | Player Play/Pause Controls | `134:4420` | `AudioPlayerWidget.tsx` | Static UI/content | None | None | None | `/artists/[slug]` | **CONFIRMED** | Interactive player atom |

---

## 7. Events Catalog (`/events`)

| Area | Figma Element | Figma Node ID | Public Component | Content Classification | CMS Field | Database Entity | Database Field | Public Route | Status | Notes / Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| Header | Page Title: "مواعيد تترك أثراً..."| `91:16532` / `91:16748` | `EventsHeader.tsx` | Static UI/content | None | None | None | `/events` | **CONFIRMED** | Fixed header title |
| Header | Subtitle Text | `91:16532` / `91:16747` | `EventsHeader.tsx` | System/configuration data | `events_subtitle` | `site_settings` | `events_subtitle` | `/events` | **CONFIRMED** | "كل فنان في أندلسيا يحمل قصة ومعاناة..." |
| Filter Tabs | Tab: "الكل" | `91:16532` / `186:1781` | `EventsFilterTabs.tsx` | Static UI/content | None | None | None | `/events` | **CONFIRMED** | Resets event filter |
| Filter Tabs | Tab: "حفلات" | `91:16532` / `186:1778` | `EventsFilterTabs.tsx` | Static UI/content | Filter query | `events` | `category = 'concert'` | `/events` | **CONFIRMED** | Category filter pill |
| Filter Tabs | Tab: "مهرجانات" | `91:16532` / `186:1775` | `EventsFilterTabs.tsx` | Static UI/content | Filter query | `events` | `category = 'festival'`| `/events` | **CONFIRMED** | Category filter pill |
| Filter Tabs | Tab: "أمسيات" | `91:16532` / `186:1772` | `EventsFilterTabs.tsx` | Static UI/content | Filter query | `events` | `category = 'evening'` | `/events` | **CONFIRMED** | Category filter pill |
| Filter Tabs | Tab: "ورش" | `91:16532` / `186:1769` | `EventsFilterTabs.tsx` | Static UI/content | Filter query | `events` | `category = 'workshop'`| `/events` | **CONFIRMED** | Category filter pill |
| Featured Event | Badge: "الفعالية الأبرز" | `91:16532` / `91:16919` | `FeaturedEventBanner.tsx`| Static UI/content | None | None | None | `/events` | **CONFIRMED** | Highlight card kicker badge |
| Featured Event | Event Title | `91:16532` / `91:16921` | `FeaturedEventBanner.tsx`| CMS-managed dynamic content | `title` | `events` | `title` | `/events` | **CONFIRMED** | e.g. "ليلة الطرب الأندلسي" |
| Featured Event | Performer Attribution | `91:16532` / `91:16923` | `FeaturedEventBanner.tsx`| CMS-managed dynamic content | `performer_name` | `events` | `performer_name` | `/events` | **CONFIRMED** | e.g. "أحمد العود" |
| Featured Event | Date & Location String | `91:16532` / `91:16925` | `FeaturedEventBanner.tsx`| CMS-managed dynamic content | Computed string | `events` | `event_date`, `location` | `/events` | **CONFIRMED** | "١٥ مارس ٢٠٢٦ · بيروت — لبنان" |
| Featured Event | Action Button: "أحجز الآن" | `91:16532` / `186:1747` | `FeaturedEventBanner.tsx`| Static UI/content | None | None | None | `/events` | **CONFIRMED** | Links to `/booking?event_id=[id]` |
| Featured Event | Cover Poster Photo | `91:16532` / `186:880` | `FeaturedEventBanner.tsx`| CMS-managed dynamic content | `image_url` | `events` | `image_url` | `/events` | **CONFIRMED** | "حفل بيروت" poster visual |
| Event Cards List | Catalog Rows / Cards | `91:16532` / `91:16800-909`| `EventCard.tsx` | CMS-managed dynamic content | Relation query | `events` | `where: is_published = true` | `/events` | **CONFIRMED** | Full chronological events catalog |
| Event Card | Category Badge | `91:16800` | `EventCard.tsx` | CMS-managed dynamic content | `category` | `events` | `category` | `/events` | **CONFIRMED** | "حفلات", "أمسيات", "مهرجانات", "ورش" |
| Event Card | Event Title | `91:16802` | `EventCard.tsx` | CMS-managed dynamic content | `title` | `events` | `title` | `/events` | **CONFIRMED** | e.g. "ورشة الإيقاع الشرقي" |
| Event Card | Performer & City String | `91:16804` | `EventCard.tsx` | CMS-managed dynamic content | Computed string | `events` | `performer_name`, `city` | `/events` | **CONFIRMED** | e.g. "يوسف الإيقاع · عمان — الأردن" |
| Event Card | Date Day Number | `91:16809` | `EventCard.tsx` | CMS-managed dynamic content | `event_date` (day) | `events` | `event_date` | `/events` | **CONFIRMED** | DM Mono day digits e.g. "١٥" |
| Event Card | Date Month Name | `91:16811` | `EventCard.tsx` | CMS-managed dynamic content | `event_date` (month)| `events` | `event_date` | `/events` | **CONFIRMED** | Cairo Arabic month e.g. "مارس" |
| Event Card | Action Button: "احجز" | `91:16814` | `EventCard.tsx` | Static UI/content | None | None | None | `/events` | **CONFIRMED** | Links to `/booking?event_id=[id]` |
| Event Record | External Ticket Link | Architecture | `EventCard.tsx` | CMS-managed dynamic content | `ticket_url` | `events` | `ticket_url` | `/events` | **UNKNOWN** | Optional external ticketing URL |

---

## 8. Educational Academy (`/academy`)

| Area | Figma Element | Figma Node ID | Public Component | Content Classification | CMS Field | Database Entity | Database Field | Public Route | Status | Notes / Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| Header | Title: "تعلّم من اليد التي..." | `91:16119` / `91:16346` | `AcademyHeader.tsx` | Static UI/content | None | None | None | `/academy` | **CONFIRMED** | Display title |
| Header | Subtitle Text | `91:16119` / `91:16345` | `AcademyHeader.tsx` | System/configuration data | `academy_subtitle` | `site_settings` | `academy_subtitle` | `/academy` | **CONFIRMED** | "برامج تعليمية موسيقية مع فنانين حقيقيين..." |
| Value Props | Section Title: "التعلّم هنا مختلف" | `91:16119` / `91:16352` | `AcademyValueProps.tsx` | Static UI/content | None | None | None | `/academy` | **CONFIRMED** | Static section heading |
| Value Prop 1 | "مجموعات صغيرة" (Title + Text) | `91:16359` / `91:16361` | `AcademyValueProps.tsx` | Static UI/content | None | None | None | `/academy` | **CONFIRMED** | "لا تتجاوز ثمانية مشاركين..." |
| Value Prop 2 | "فنانون من الواقع" (Title + Text) | `91:16366` / `91:16368` | `AcademyValueProps.tsx` | Static UI/content | None | None | None | `/academy` | **CONFIRMED** | "أساتذة هم فنانون نشطون في مجالهم..." |
| Value Prop 3 | "أداء حقيقي" (Title + Text) | `91:16373` / `91:16375` | `AcademyValueProps.tsx` | Static UI/content | None | None | None | `/academy` | **CONFIRMED** | "كل برنامج ينتهي بعرض أمام جمهور حقيقي..." |
| Tracks Section | Heading: "ثلاثة مسارات، موهبة واحدة"| `91:16119` / `91:16347` | `AcademyTracks.tsx` | Static UI/content | None | None | None | `/academy` | **CONFIRMED** | Section title |
| Track Card 1 | Track Sequence Number: "1" | `91:16444` | `TrackCard.tsx` | CMS-managed dynamic content | `display_order` | `academy_courses` | `display_order` | `/academy` | **CONFIRMED** | Sequence index 1 |
| Track Card 1 | Track Category: "مدرسة التراث" | `91:16442` | `TrackCard.tsx` | CMS-managed dynamic content | `track_category` | `academy_courses` | `track_category` | `/academy` | **CONFIRMED** | Track discipline tag |
| Track Card 1 | Track Title: "مدرسة العود" | `91:16446` | `TrackCard.tsx` | CMS-managed dynamic content | `title` | `academy_courses` | `title` | `/academy` | **CONFIRMED** | Program name |
| Track Card 1 | Track Description | `91:16448` | `TrackCard.tsx` | CMS-managed dynamic content | `description` | `academy_courses` | `description` | `/academy` | **CONFIRMED** | Program curriculum teaser |
| Track Card 1 | Action Button: "سجّل الآن ←" | `91:16451` | `TrackCard.tsx` | Static UI/content | None | None | None | `/academy` | **CONFIRMED** | Links to `/booking?course=oud-school` |
| Track Card 2 | Track 2: "فن الأداء" | `91:16457` / `91:16459` | `TrackCard.tsx` | CMS-managed dynamic content | `title`, `description` | `academy_courses` | `title`, `description` | `/academy` | **CONFIRMED** | Performance track record |
| Track Card 3 | Track 3: "الصوت والطرب" | `91:16470` / `91:16472` | `TrackCard.tsx` | CMS-managed dynamic content | `title`, `description` | `academy_courses` | `title`, `description` | `/academy` | **CONFIRMED** | Vocal track record |
| Newsletter | Heading: "رسالة واحدة في الشهر." | `91:16119` / `91:16423` | `AcademyNewsletter.tsx` | Static UI/content | None | None | None | `/academy` | **CONFIRMED** | Static section heading |
| Newsletter | Tagline: "♪ لكنها تستحق كل الانتظار."| `91:16119` / `91:16425` | `AcademyNewsletter.tsx` | Static UI/content | None | None | None | `/academy` | **CONFIRMED** | Static lead text |
| Newsletter | Email Input Field | `91:16119` / `91:16431` | `AcademyNewsletter.tsx` | User-submitted data | Ingestion field | `newsletter_subscribers` | `email` | `/academy` | **CONFIRMED** | Validated email address |
| Newsletter | Subscribe Button | `91:16119` / `186:1061` | `AcademyNewsletter.tsx` | Static UI/content | None | None | None | `/academy` | **CONFIRMED** | Form submit trigger |

---

## 9. Cultural News & Stories (`/news` & `/news/[slug]`)

| Area | Figma Element | Figma Node ID | Public Component | Content Classification | CMS Field | Database Entity | Database Field | Public Route | Status | Notes / Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| News Hero | Category Tag: "الأخبار الثقافية"| `91:17296` / `91:17301` | `NewsHero.tsx` | CMS-managed dynamic content | `category` | `articles` | `category` | `/news` | **CONFIRMED** | Category badge |
| News Hero | Hero Story Title | `91:17296` / `91:17304` | `NewsHero.tsx` | CMS-managed dynamic content | `title` | `articles` | `title` | `/news` | **CONFIRMED** | "افتتاح المعرض الفني السنوي في الأندلس" |
| News Hero | Hero Story Excerpt | `91:17296` / `91:17306` | `NewsHero.tsx` | CMS-managed dynamic content | `excerpt` | `articles` | `excerpt` | `/news` | **CONFIRMED** | "يستضيف المركز هذا الأسبوع مجموعة من أبرز الفنانين..." |
| News Hero | Hero Cover Image | `91:17296` | `NewsHero.tsx` | CMS-managed dynamic content | `cover_image_url` | `articles` | `cover_image_url` | `/news` | **CONFIRMED** | Editorial cover photo |
| Side Highlights | Secondary Story 1 Title | `91:17296` / `91:17314` | `NewsHero.tsx` | CMS-managed dynamic content | `title` | `articles` | `title` | `/news` | **CONFIRMED** | "حوار مع النحات أحمد محمود" |
| Side Highlights | Secondary Story 1 Category | `91:17296` / `91:17312` | `NewsHero.tsx` | CMS-managed dynamic content | `category` | `articles` | `category` | `/news` | **CONFIRMED** | "قصص الفنانين" |
| Side Highlights | Secondary Story 2 Title | `91:17296` / `91:17321` | `NewsHero.tsx` | CMS-managed dynamic content | `title` | `articles` | `title` | `/news` | **CONFIRMED** | "ورشة عمل جديدة في النحت الكلاسيكي" |
| Side Highlights | Secondary Story 2 Category | `91:17296` / `91:17319` | `NewsHero.tsx` | CMS-managed dynamic content | `category` | `articles` | `category` | `/news` | **CONFIRMED** | "الأكاديمية" |
| News Grid | Section Title: "آخر الأخبار" | `91:17296` / `91:17796` | `NewsGrid.tsx` | Static UI/content | None | None | None | `/news` | **CONFIRMED** | Static section header |
| Article Card | Publication Date Badge | `91:17382` | `ArticleCard.tsx` | CMS-managed dynamic content | `published_at` | `articles` | `published_at` | `/news` | **CONFIRMED** | e.g. "١٠ مايو ٢٠٢٤" |
| Article Card | Category Tag | `91:17386` | `ArticleCard.tsx` | CMS-managed dynamic content | `category` | `articles` | `category` | `/news` | **CONFIRMED** | e.g. "المشهد الثقافي" |
| Article Card | Article Title | `91:17389` | `ArticleCard.tsx` | CMS-managed dynamic content | `title` | `articles` | `title` | `/news` | **CONFIRMED** | Article headline |
| Article Card | Article Excerpt | `91:17392` | `ArticleCard.tsx` | CMS-managed dynamic content | `excerpt` | `articles` | `excerpt` | `/news` | **CONFIRMED** | Introductory paragraph |
| Article Card | "اقرأ المزيد" Action Link | `91:17396` | `ArticleCard.tsx` | Static UI/content | None | None | None | `/news` | **CONFIRMED** | Links to `/news/[slug]` |
| Article View | Full Article Body (Markdown) | Task 9 Architecture | `ArticleView.tsx` | CMS-managed dynamic content | `content` | `articles` | `content` | `/news/[slug]` | **CONFIRMED** | Complete editorial text |
| Article View | Author Attribution | Task 9 Architecture | `ArticleView.tsx` | CMS-managed dynamic content | `author_name` | `articles` | `author_name` | `/news/[slug]` | **INFERRED** | Writer attribution name |

---

## 10. Booking & Inquiries (`/booking`) — User-Submitted Data

> [!IMPORTANT]
> **Strict Separation of Concerns:** Booking inquiries and newsletter signups are **User-Submitted Data**, NOT public CMS content. Submissions are write-only for visitors and managed in a secured admin CRM view.

| Area | Figma Element | Figma Node ID | Public Component | Content Classification | CMS Field | Database Entity | Database Field | Public Route | Status | Notes / Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| Header | Title: "مناسبتك تستحق..." | `91:17109` / `91:17126` | `BookingHeader.tsx` | Static UI/content | None | None | None | `/booking` | **CONFIRMED** | Fixed header title |
| Header | Subtitle Text | `91:17109` / `91:17125` | `BookingHeader.tsx` | System/configuration data | `booking_subtitle` | `site_settings` | `booking_subtitle` | `/booking` | **CONFIRMED** | Header supporting copy |
| Form Group 1 | "♪ معلوماتك الشخصية" | `91:17109` / `91:17174` | `BookingForm.tsx` | Static UI/content | None | None | None | `/booking` | **CONFIRMED** | Fieldset legend label |
| Form Field | Label: "الاسم الكامل *" | `91:17109` / `91:17180` | `BookingForm.tsx` | User-submitted data | Ingestion field | `booking_requests` | `full_name` | `/booking` | **CONFIRMED** | Required string, min 2 chars |
| Form Field | Label: "البريد الإلكتروني *" | `91:17109` / `91:17187` | `BookingForm.tsx` | User-submitted data | Ingestion field | `booking_requests` | `email` | `/booking` | **CONFIRMED** | Validated email address |
| Form Field | Label: "رقم الهاتف" | `91:17109` / `91:17194` | `BookingForm.tsx` | User-submitted data | Ingestion field | `booking_requests` | `phone` | `/booking` | **CONFIRMED** | Optional international phone string |
| Form Field | Label: "الميزانية التقريبية" | `91:17109` / `91:17201` | `BookingForm.tsx` | User-submitted data | Ingestion field | `booking_requests` | `budget_range` | `/booking` | **CONFIRMED** | e.g. "١٠٠٠ - ٥٠٠٠ دولار" |
| Form Group 2 | "♪ تفاصيل المناسبة" | `91:17109` / `91:17207` | `BookingForm.tsx` | Static UI/content | None | None | None | `/booking` | **CONFIRMED** | Fieldset legend label |
| Form Field | Label: "نوع المناسبة *" | `91:17109` / `91:17213` | `BookingForm.tsx` | User-submitted data | Ingestion field | `booking_requests` | `event_type` | `/booking` | **CONFIRMED** | Enum: حفل خاص, زفاف, مهرجان, فندق |
| Form Field | Label: "تاريخ الفعالية *" | `91:17109` / `91:17224` | `BookingForm.tsx` | User-submitted data | Ingestion field | `booking_requests` | `event_date` | `/booking` | **CONFIRMED** | Date picker value |
| Form Field | Label: "اختر الفنان / الفرقة" | `91:17109` / `91:17230` | `BookingForm.tsx` | User-submitted data | Ingestion field | `booking_requests` | `artist_id` | `/booking` | **CONFIRMED** | Dropdown options populated from `artists` |
| Form Field | Label: "تفاصيل إضافية *" | `91:17109` / `91:17241` | `BookingForm.tsx` | User-submitted data | Ingestion field | `booking_requests` | `message` | `/booking` | **CONFIRMED** | Event scope, venue, special tracks |
| Form Legal | Terms Notice | `91:17109` / `91:17246` | `BookingForm.tsx` | Static UI/content | None | None | None | `/booking` | **CONFIRMED** | Legal compliance disclaimer |
| Form Action | Button: "أرسل الطلب" | `91:17109` / `186:1827` | `BookingForm.tsx` | Static UI/content | None | None | None | `/booking` | **CONFIRMED** | Triggers Next.js Server Action |
| Sidebar Info | Heading: "♪ تواصل مباشرة" | `91:17109` / `91:17253` | `BookingSidebar.tsx` | Static UI/content | None | None | None | `/booking` | **CONFIRMED** | Sidebar section header |
| Sidebar Info | Direct Email Channel | `91:17109` / `91:17259` | `BookingSidebar.tsx` | System/configuration data | `contact_email` | `site_settings` | `contact_email` | `/booking` | **CONFIRMED** | `hello@andalusia.art` |
| Sidebar Info | Direct WhatsApp Channel | `91:17109` / `91:17266` | `BookingSidebar.tsx` | System/configuration data | `contact_phone` | `site_settings` | `contact_phone` | `/booking` | **CONFIRMED** | Official WhatsApp contact |
| Sidebar Info | Instagram Channel | `91:17109` / `91:17272` | `BookingSidebar.tsx` | System/configuration data | `social_links` | `site_settings` | `social_links` | `/booking` | **CONFIRMED** | `@andalusia.art` |
| Sidebar Steps| Heading: "ماذا يحدث بعد ذلك؟"| `91:17109` / `91:17275` | `BookingSidebar.tsx` | Static UI/content | None | None | None | `/booking` | **CONFIRMED** | Explanatory heading |
| Sidebar Step 1| "١ نستلم طلبك ونراجعه" | `91:17278` | `BookingSidebar.tsx` | Static UI/content | None | None | None | `/booking` | **CONFIRMED** | Process milestone 1 |
| Sidebar Step 2| "٢ نتواصل معك خلال ٤٨ ساعة"| `91:17283` | `BookingSidebar.tsx` | Static UI/content | None | None | None | `/booking` | **CONFIRMED** | Process milestone 2 |
| Sidebar Step 3| "٣ نقترح الفنان والبرنامج" | `91:17288` | `BookingSidebar.tsx` | Static UI/content | None | None | None | `/booking` | **CONFIRMED** | Process milestone 3 |
| Sidebar Step 4| "٤ تأكيد الحجز والتفاصيل" | `91:17293` | `BookingSidebar.tsx` | Static UI/content | None | None | None | `/booking` | **CONFIRMED** | Process milestone 4 |

---

## 11. Testimonials Module Summary

- **Public Component:** `TestimonialsSlider.tsx`
- **Figma Node:** `87:14313` / `176:5965` (`Component 22`)
- **Route:** `/`
- **Dynamic Fields:**
  - `quote` (`TEXT`, **CONFIRMED**) — Quotation endorsement text
  - `author_name` (`VARCHAR(150)`, **CONFIRMED**) — Reviewer's full name (e.g. "عمر الحاج")
  - `author_role` (`VARCHAR(150)`, **INFERRED**) — Organization or profession
  - `avatar_image_url` (`VARCHAR(500)`, **INFERRED**) — Reviewer headshot visual
  - `is_published` (`BOOLEAN`, **INFERRED**) — Admin visibility toggle
  - `display_order` (`INTEGER`, **INFERRED**) — Carousel sequence index

---

## 12. Audio Content Module Summary

- **Public Component:** `AudioPlayerWidget.tsx`
- **Figma Node:** `134:4420` (Artist Profile)
- **Route:** `/artists/[slug]`
- **Dynamic Fields:**
  - `title` (`VARCHAR(200)`, **CONFIRMED**) — Sample track title
  - `artist_id` (`UUID`, **CONFIRMED**) — Foreign key referencing `artists(id)`
  - `audio_file_url` (`VARCHAR(500)`, **CONFIRMED**) — Streamable audio file binary in Supabase Storage (`audio/`)
  - `duration_seconds` (`INTEGER`, **INFERRED**) — Track runtime in seconds for timeline scrubber
  - `is_published` (`BOOLEAN`, **INFERRED**) — Visibility toggle
  - `display_order` (`INTEGER`, **INFERRED**) — Track playlist order

---

## 13. Gallery & Media Module Summary

All visual media assets cataloged in Figma are routed into structured storage tiers:

| Asset Category | Figma Node IDs | Public Component | CMS Field | Storage Location | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| Brand Marks & Decors | `94:18729`, `91:16120` (`Group 161`) | `Navbar.tsx`, `AboutSection.tsx` | None (Static) | `/public/assets/branding/`, `/public/assets/decors/` | **CONFIRMED** |
| Hero Stage Photography | `186:1987` (`Component 20`) | `HeroSection.tsx` | `site_settings.hero_image_url` | Supabase Storage `site/hero_bg.webp` | **CONFIRMED** |
| Musician Portraits | `134:4631`, `91:18068`, `87:14240` | `ArtistHero.tsx`, `ArtistCard.tsx` | `artists.portrait_image_url` | Supabase Storage `artists/*.webp` | **CONFIRMED** |
| Event Posters | `186:880`, `186:183`, `186:1243` | `FeaturedEventBanner.tsx`, `EventCard.tsx` | `events.image_url` | Supabase Storage `events/*.webp` | **CONFIRMED** |
| Editorial Article Covers | `91:17296`, `186:183` | `NewsHero.tsx`, `ArticleCard.tsx` | `articles.cover_image_url` | Supabase Storage `articles/*.webp` | **CONFIRMED** |
| Discography Album Covers | `134:4701-44` | `ReleaseCard.tsx` | `releases.cover_image_url` | Supabase Storage `releases/*.webp` | **CONFIRMED** |
| Audio Sample Tracks | `134:4420` | `AudioPlayerWidget.tsx` | `tracks.audio_file_url` | Supabase Storage `audio/*.mp3` | **CONFIRMED** |
