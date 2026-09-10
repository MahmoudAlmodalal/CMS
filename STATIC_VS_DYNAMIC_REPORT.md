# Andalusia Music Platform — Static vs Dynamic Content Report

**Audit Reference:** Verified Figma Node `89:15216` (`الرئيسية`) and child screens  
**Architectural Rule:** *Do not turn every text element into a CMS field.*  
Hardcoding structural UI labels preserves typography balance, eliminates unnecessary database reads, enables instant static site generation (SSG), and keeps the editorial CMS dashboard focused on actual dynamic business content.

---

## 1. The Four-Tier Classification System

| Classification Tier | Storage / Architecture | Mutability | Security / Visibility | Architectural Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **1. Static UI/content** | Hardcoded in Next.js JSX components | Immutable without code push | Public | Preserves layout stability, RTL bidirectional flow, design tokens, and optimal TTFB. |
| **2. CMS-managed dynamic content** | Supabase PostgreSQL tables + Storage | Editable via CMS dashboard | Public read (via RLS / SSG) | Powers evolving catalogs (artists, releases, audio, concerts, news stories, testimonials). |
| **3. System/configuration data** | Singleton `site_settings` table (1 row) | Editable by Site Admin | Public read | High-level marketing copy, brand manifesto, official email, phone, and social handles. |
| **4. User-submitted data** | Secured Supabase tables (`booking_requests`) | Write-only by visitors | Private (Admin RLS only) | High-security isolation for customer leads, private event inquiries, and newsletter signups. |

---

## 2. Granular Screen-by-Screen Breakdown

### A. Global Shell (Navbar & Footer)
- **Static UI/content:**
  - Brand Logo SVG asset (`/public/assets/branding/logo.svg`).
  - Navigation route links ("الرئيسية", "الأكاديمية", "الفنانين", "الأخبار", "الفعاليات").
  - Primary CTA button "أحجز الآن" directing to `/booking`.
  - Footer column headings ("استكشف", "تواصل") and sitemap link items.
  - Taglines ("♪ من رحم المعاناة ولدت الموسيقى", "موسيقى · ثقافة · قدرة").
  - Mobile hamburger toggle icon and drawer overlay shell.
- **System/configuration data:**
  - Footer narrative text: `site_settings.footer_mission`.
  - Direct contact email: `site_settings.contact_email` (`hello@andalusia.art`).
  - Social media accounts: `site_settings.social_links` (Instagram, TikTok).
  - Regional hubs: `site_settings.operational_regions` ("لبنان · المغرب · الخليج").
  - Copyright line: `site_settings.copyright_text` ("© أندلسيا ٢٠٢٥ — جميع الحقوق محفوظة").

### B. Home Page (`/`)
- **Static UI/content:**
  - Hero action buttons ("احجز الآن", "اكتشف الفنانين").
  - Section decorative headers ("نلتقي في المكان. في اللحظة", "أصوات تصنع التاريخ", "نكتب كي لا تضيع التفاصيل", "يقولون عن أندلسيا").
  - Section kicker badges ("من نحن", "♪").
  - Navigation action links ("عرض كل الفعاليات", "عرض جميع الفنانين ←", "ابدأ حجزك الآن ♪").
  - Testimonial slider navigation arrows (`Component 22`).
- **System/configuration data:**
  - Hero headline & subtitle: `site_settings.hero_headline`, `site_settings.hero_subheadline`.
  - Manifesto headline & body: `site_settings.about_headline`, `site_settings.about_body`.
  - Orange booking CTA banner copy: `site_settings.booking_banner_title`, `site_settings.booking_banner_body`.
- **CMS-managed dynamic content:**
  - Hero stage photography: `site_settings.hero_image_url`.
  - About section musician portrait: `site_settings.about_image_url`.
  - Upcoming events cards (x3): Dynamic query against `events` table (`order: event_date ASC, limit: 3`).
  - Featured artists strip (x4): Dynamic query against `artists` table (`is_featured = true, limit: 4`).
  - Editorial stories cards (x3): Dynamic query against `articles` table (`is_featured = true, limit: 3`).
  - Testimonial review cards: Dynamic query against `testimonials` table (`is_published = true`).

### C. Artists Directory (`/artists`)
- **Static UI/content:**
  - Page title: "أصوات تصنع التاريخ".
  - Filter tab labels ("الكل", "غناء", "عود وموسيقى", "إيقاع", "معاصر", "تراث").
- **System/configuration data:**
  - Directory lead subtitle: `site_settings.artists_subtitle`.
- **CMS-managed dynamic content:**
  - Artist cards: `artists` table records (`name`, `genre_tag`, `city`, `portrait_image_url`, `slug`).

### D. Single Artist Profile (`/artists/[slug]`)
- **Static UI/content:**
  - Action buttons: "احجز الفنان ♪", "تواصل مباشرة".
  - Section titles: "الفن في لحظته الأصدق", "مسيرتها الفنية".
  - Personalized CTA pitch body: "تواصل معنا وسنصمم لك تجربة موسيقية لا تُنسى."
  - Personalized CTA button: "ابدأ حجزك الآن ♪".
  - Discography filter tabs: "أغاني", "حفلات", "ألبومات".
  - Audio player widget controls (Play/Pause, scrub bar, volume).
- **CMS-managed dynamic content:**
  - Musician name, quote, short bio, full bio, specialties: `artists` table.
  - Musician hero portrait photo: `artists.portrait_image_url`.
  - Discography albums & recordings: `releases` table (`title`, `release_type`, `track_count`, `release_year`, `cover_image_url`).
  - Audio player sample track: `tracks` table (`title`, `audio_file_url`, `duration_seconds`).

### E. Events Catalog (`/events`)
- **Static UI/content:**
  - Page title: "مواعيد تترك أثراً جميلاً."
  - Filter tab labels ("الكل", "حفلات", "مهرجانات", "أمسيات", "ورش").
  - Card button labels: "احجز", "أحجز الآن".
  - Featured event kicker badge: "الفعالية الأبرز".
- **System/configuration data:**
  - Catalog subtitle: `site_settings.events_subtitle`.
- **CMS-managed dynamic content:**
  - Featured banner event: `events` record (`is_featured = true`).
  - Events catalog list: `events` records (`title`, `category`, `performer_name`, `location`, `city`, `event_date`, `image_url`, `ticket_url`).

### F. Educational Academy (`/academy`)
- **Static UI/content:**
  - Page title: "تعلّم من اليد التي تعرف الطريق".
  - Value propositions header and 3 core pillars ("مجموعات صغيرة", "فنانون من الواقع", "أداء حقيقي").
  - Tracks section title: "ثلاثة مسارات، موهبة واحدة".
  - Track action buttons: "سجّل الآن ←".
  - Newsletter section copy: "رسالة واحدة في الشهر. ♪ لكنها تستحق كل الانتظار."
  - Newsletter submit button: "اشترك".
- **System/configuration data:**
  - Academy lead subtitle: `site_settings.academy_subtitle`.
- **CMS-managed dynamic content:**
  - 3 course tracks: `academy_courses` records (`display_order`, `track_category`, `title`, `description`, `instructor_name`, `image_url`).
- **User-submitted data:**
  - Newsletter subscriber email: `newsletter_subscribers` table (`email`).

### G. Cultural News & Stories (`/news` & `/news/[slug]`)
- **Static UI/content:**
  - News grid section title: "آخر الأخبار".
  - Card action link: "اقرأ المزيد".
- **CMS-managed dynamic content:**
  - Featured hero story: `articles` record (`is_featured = true`).
  - Side highlight stories: `articles` records (recent 2 items).
  - News grid cards: `articles` records (`published_at`, `category`, `title`, `excerpt`, `cover_image_url`, `slug`).
  - Full article view: `articles` record (`content` in markdown, `author_name`).

### H. Booking & Inquiries (`/booking`)
- **Static UI/content:**
  - Page title: "مناسبتك تستحق موسيقى حقيقية. ♪".
  - Form section titles: "♪ معلوماتك الشخصية", "♪ تفاصيل المناسبة".
  - Input field labels, help texts, and terms notice.
  - Submit button: "أرسل الطلب".
  - Sidebar title: "♪ تواصل مباشرة".
  - Sidebar "ماذا يحدث بعد ذلك؟" heading and 4 process milestones.
- **System/configuration data:**
  - Subtitle copy: `site_settings.booking_subtitle`.
  - Sidebar direct email, phone, and Instagram: `site_settings`.
- **User-submitted data (Isolated CRM):**
  - Form submission record: `booking_requests` table (`full_name`, `email`, `phone`, `budget_range`, `event_type`, `event_date`, `artist_id`, `message`).

---

## 3. Media Asset Routing Architecture

```text
/public/assets/ (Bundled with static build)
 ├── branding/
 │    ├── logo.svg
 │    └── mark.svg
 ├── icons/
 │    ├── music-note.svg (♪)
 │    ├── arrow-left.svg (←)
 │    ├── arrow-right.svg (→)
 │    ├── calendar.svg
 │    └── location-pin.svg
 └── decors/
      └── andalusian-arch-pattern.svg (Group 161, 72 vector dots)

Supabase Storage Buckets (Uploaded & Managed via CMS)
 ├── /artists/ (Musician portraits, webp 800x1000)
 ├── /events/ (Concert posters & thumbnails, webp 1200x800)
 ├── /articles/ (Editorial story imagery, webp 1200x800)
 ├── /academy/ (Course track artwork, webp 800x600)
 ├── /audio/ (Artist sample audio recordings, mp3 / ogg)
 └── /site/ (Hero stage background, About section portrait)
```
