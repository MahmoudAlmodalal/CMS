# Andalusia Music Platform — CMS Module Matrix

**Specification Reference:** `CONTENT_INVENTORY.md`  
**Rule Adherence:** No generic page-builder, arbitrary block editors, or synthetic modules. Every module directly maps to verified Figma screens and components.

---

## 1. Verified CMS Modules Matrix

| CMS Module | Needed? | Design Justification | Main Entity | Public Routes | Editable Fields | Status | Publishable? | Ordering? | Media Support? |
| :--- | :---: | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **1. Artists** | **Yes** | Manages ensemble member profiles, instrument disciplines, lead quotes, bios, and portraits displayed on Home (`87:14240`), Artists Directory (`91:17844`), and Artist Profile (`134:4420`). | `artists` | `/`, `/artists`, `/artists/[slug]` | `name`, `slug`, `category`, `genre_tag`, `city`, `quote`, `short_bio`, `full_bio`, `specialties`, `portrait_image_url`, `is_featured`, `is_published`, `display_order` | **CONFIRMED** | **Yes** (`is_published`) | **Yes** (`display_order`, `is_featured`) | **Yes** (Musician portrait photo) |
| **2. Audio & Tracks** | **Yes** | Powers the interactive audio player widget on Artist Profile (`134:4420`), allowing visitors to stream sample audio recordings. | `tracks` | `/artists/[slug]` | `title`, `artist_id`, `audio_file_url`, `duration_seconds`, `cover_image_url`, `is_published`, `display_order` | **CONFIRMED** | **Yes** (`is_published`) | **Yes** (`display_order`) | **Yes** (Audio stream MP3 + cover art) |
| **3. Releases / Discography** | **Yes** | Powers the artist discography tabs ("مسيرتها الفنية" -> "ألبومات") on `/artists/[slug]`, showcasing albums, studio releases, track counts, and years. | `releases` | `/artists/[slug]` | `artist_id`, `title`, `release_type`, `track_count`, `release_year`, `cover_image_url`, `is_published`, `display_order` | **CONFIRMED** | **Yes** (`is_published`) | **Yes** (`release_year DESC`, `display_order`) | **Yes** (Album cover artwork) |
| **4. Events & Concerts** | **Yes** | Schedules live concerts, festivals, musical evenings, and masterclasses across Home strip (`87:14400`) and the `/events` catalog with category filtering. | `events` | `/`, `/events` | `title`, `slug`, `category`, `event_date`, `location`, `city`, `performer_name`, `artist_id`, `description`, `image_url`, `ticket_url`, `is_featured`, `status`, `is_published`, `display_order` | **CONFIRMED** | **Yes** (`is_published`) | **Yes** (`event_date ASC`, `is_featured`) | **Yes** (Event poster / cover art) |
| **5. Academy Tracks** | **Yes** | Manages the 3 verified learning tracks ("ثلاثة مسارات، موهبة واحدة") on `/academy` (Oud School, Performance Arts, Vocal Arts). | `academy_courses` | `/academy` | `title`, `slug`, `track_category`, `description`, `instructor_name`, `instructor_id`, `image_url`, `is_published`, `display_order` | **CONFIRMED** | **Yes** (`is_published`) | **Yes** (`display_order` 1, 2, 3) | **Yes** (Track artwork visual) |
| **6. Cultural News & Stories** | **Yes** | Manages cultural articles, band stories, and press releases featured on Home (`87:14400`) and the `/news` catalog (`91:17296`). | `articles` | `/`, `/news`, `/news/[slug]` | `title`, `slug`, `category`, `excerpt`, `content`, `cover_image_url`, `published_at`, `is_featured`, `is_published`, `author_name`, `featured_artist_id` | **CONFIRMED** | **Yes** (`is_published`) | **Yes** (`published_at DESC`, `is_featured`) | **Yes** (Editorial photo / cover) |
| **7. Testimonials** | **Yes** | Manages client praise and attendee endorsements featured on the Home page slider ("يقولون عن أندلسيا", `87:14313`). | `testimonials` | `/` | `quote`, `author_name`, `author_role`, `avatar_image_url`, `is_published`, `display_order` | **CONFIRMED** | **Yes** (`is_published`) | **Yes** (`display_order`) | **Yes** (Avatar / portrait) |
| **8. Site Settings & Shell** | **Yes** | Singleton module for site-wide brand settings, hero messaging, manifesto text, contact channels, social handles, and footer metadata. | `site_settings` | All routes | `hero_headline`, `hero_subheadline`, `hero_image_url`, `about_headline`, `about_body`, `about_image_url`, `booking_banner_title`, `booking_banner_body`, `contact_email`, `contact_phone`, `social_links`, `operational_regions`, `footer_mission`, `copyright_text` | **CONFIRMED** | **No** (Singleton row) | **No** (Single row) | **Yes** (Hero & About background images) |
| **9. Booking CRM (Inquiries)** | **Yes** | Administrative module to review and triage incoming user-submitted booking requests (`booking_requests`) and newsletter leads (`newsletter_subscribers`). | `booking_requests`, `newsletter_subscribers` | `/booking`, `/academy` (Ingestion only) | *Admin-only triage fields:* `status` ('pending', 'contacted', 'confirmed', 'archived'), `admin_notes`. *Public submissions are immutable.* | **CONFIRMED** | **No** (Private CRM records) | **Yes** (`created_at DESC`) | **No** |

---

## 2. Explicitly Excluded & Rejected Modules

To maintain architectural purity and prevent over-engineering:

1. **Generic Drag-and-Drop Page Builder:**
   - **Verdict:** **REJECTED**
   - **Reason:** Figma provides pixel-perfect, tailored layouts for all 7 routes. A dynamic block/page builder introduces unnecessary database complexity, degrades performance, and risks breaking Arabic typography and RTL spacing.
2. **E-Commerce / Cart / Checkout Module:**
   - **Verdict:** **REJECTED**
   - **Reason:** The Figma design contains zero cart icons, checkout buttons, or payment processing flows. All concert attendance and band engagements operate via inquiry routing to `/booking`.
3. **User Authentication & Fan Portals:**
   - **Verdict:** **REJECTED**
   - **Reason:** Figma contains zero login, sign-up, or user profile screens. The site is a public-facing cultural portfolio with guest inquiry submission.
4. **Interactive LMS & Student Portals:**
   - **Verdict:** **REJECTED**
   - **Reason:** Academy tracks in Figma (`91:16119`) present static informational program cards with registration buttons directing to inquiry booking. There is no curriculum gating, quiz engine, or video classroom.
