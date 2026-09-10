# TASK 1–20 TRACEABILITY MATRIX — Figma → Screen → Section → Component → Content → CMS → DB → Storage → Public → Admin
Source: figma_full_inventory.json (1568 nodes) + CONTENT/CMS/DB/STORAGE/APP docs. `?` = UNVERIFIED live (gateway unstable). EN mirrors omitted (1:1 of AR).

| Figma (AR laptop 1440) | Screen-section | Component | Content (tier) | CMS module | DB entity.field | Storage | Public route | Admin route (CANONICAL-proposed) |
|---|---|---|---|---|---|---|---|---|
| 89:15216 الرئيسية 1440×5165 | Hero stage | HeroWidget | hero copy (dyn) + bg photo (dyn) | Site Settings | `site_settings.hero_title/hero_image_url` | `site/` 5MB | `/` | `/admin/settings` |
| 89:15216 child Frame 26/28 | About/manifesto | AboutSection | portrait + mission (dyn) | Site Settings | `site_settings.about_image_url/mission` | `site/` | `/` | `/admin/settings` |
| 89:15216 | Featured artists strip (limit 4) | ArtistCard grid | artist cards (dyn query `is_featured`) | Artists | `artists.*` | `artists/` | `/` → `/artists` | `/admin/artists` |
| 89:15216 | Editorial feature ×3 | ArticleCard (`87:14400` cited ?) | featured articles (dyn) | News & Stories | `articles.*` | `articles/` | `/` → `/news` | `/admin/articles` |
| 89:15216 Component 22 | Testimonial slider | TestimonialCarousel | quotes (dyn) | Testimonials | `testimonials.quote/author_role?` | `site/avatars/` (?) | `/` | `/admin/testimonials` |
| 91:17844 الفنانين 1440×2290 | Directory + filter pills | ArtistGrid + filters (static pills) | artist rows (dyn) | Artists | `artists.*` | `artists/` | `/artists` | `/admin/artists` |
| 134:4420 الفنان 1440×2968 | Profile + discography + player | AudioPlayerWidget, ReleaseList | tracks/releases (dyn, parent-published gate) | Tracks & Discography | `tracks.audio_file_url`, `releases.*` | `audio/` 30MB, `releases/` | `/artists/[slug]` | `/admin/artists`, `/admin/tracks` |
| 91:16532 الفعاليات 1440×2290 | Catalog list | EventCard | events (dyn) + `ticket_url` (?) | Events & Concerts | `events.*` | `events/` | `/events` | `/admin/events` |
| 91:16119 الأكاديمية 1440×2503 | 3 tracks + newsletter form | CourseCard, NewsletterForm | courses (dyn) + lead (write-only) | Academy Tracks | `academy_courses.*`, `newsletter_subscribers.email` | `academy/` | `/academy` | `/admin/academy` |
| 91:17296 الأخبار 1440×1953 | Hero + grid | NewsHero, ArticleCard 91:17396 ? | articles (dyn) | News & Stories | `articles.*` | `articles/` | `/news` | `/admin/articles` |
| (no dedicated frame) | Reader body (markdown) | ArticleView | `content, author_name` (dyn) | News & Stories | `articles.content/slug UNIQUE` | `articles/` (inline md) | `/news/[slug]` PARTIAL | `/admin/articles` |
| 91:17109 الحجز 1440×1953 | Booking forms | BookingForm (artist dropdown, `?event_id/?artist/?course=`) | inquiry (write-only) | Booking & Leads CRM | `booking_requests.*` (`artist_id` + `preferred_artist` TRIPLE — BLOCKER C8) | — | `/booking` | `/admin/bookings` |
| Global shell | Navbar/drawer/footer | Navbar, Footer (SYMBOL 1454×384) | links/buttons (static), contact/social (dyn `site_settings`) | Site Settings | `site_settings.contact/social_links JSONB/footer` | — | all | `/admin/settings` |

Notes: `/events/[slug]` REMOVED (no frame, speculative). Mobile 390 frames mirror each row (heights scale, e.g. 5165→6528). `/booking?course=oud-school` (CONTENT_INVENTORY.md:202) vs generic `[slug]` (CMS_SCOPE.md:169) — canonical = generic `[slug]`.
