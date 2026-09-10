# Andalusia Music Platform — Data Relationship Map

**Specification Reference:** `CONTENT_INVENTORY.md` & `CMS_MODULE_MATRIX.md`  
**Root Node:** `89:15216` (`الرئيسية`)  
**Design Justification Principle:** Only entities and relations directly visible or required by the verified Figma design are introduced. Speculative foreign keys and unnecessary join tables are strictly omitted.

---

## 1. Visual Entity Hierarchy

```text
Site Settings (Singleton: 1 Row) [CONFIRMED]
 ├── Global Navigation & Shell Parameters
 ├── Home Hero & About Manifesto Copy
 └── Operational Hubs & Social Handles

Artists (Core Musician Profile Entity) [CONFIRMED]
 ├── Tracks (1:N — Audio Samples for Player Widget on /artists/[slug]) [CONFIRMED]
 ├── Releases (1:N — Discography Albums on /artists/[slug]) [CONFIRMED]
 ├── Events (1:N Optional — Lead Performer on Concerts/Evenings) [CONFIRMED]
 ├── Articles (1:N Optional — Featured Musician in Cultural Stories) [INFERRED]
 ├── Academy Courses (1:N Optional — Track Instructor) [INFERRED]
 └── Booking Requests (1:N Optional — Requested Artist) [CONFIRMED]

Events (Live Performances Catalog) [CONFIRMED]
 └── Booking Requests (1:N Optional — Inquiries referencing specific Event) [CONFIRMED]

Academy Courses (3 Educational Tracks on /academy) [CONFIRMED]
 └── Booking Requests (1:N Optional — Registration inquiries) [INFERRED]

Articles (Cultural Stories & Press) [CONFIRMED]

Testimonials (Social Proof Quotes on Home Slider) [CONFIRMED]

Booking Requests (User-Submitted Inquiries — Write-Only / Admin CRM) [CONFIRMED]

Newsletter Subscribers (User-Submitted Email Leads from /academy) [CONFIRMED]
```

---

## 2. Mermaid Entity-Relationship Diagram

```mermaid
erDiagram
    SITE_SETTINGS {
        uuid id PK "CONFIRMED"
        string hero_headline "CONFIRMED"
        string hero_subheadline "CONFIRMED"
        string hero_image_url "CONFIRMED"
        string about_headline "CONFIRMED"
        text about_body "CONFIRMED"
        string about_image_url "CONFIRMED"
        string booking_banner_title "CONFIRMED"
        string booking_banner_body "CONFIRMED"
        string contact_email "CONFIRMED"
        string contact_phone "CONFIRMED"
        jsonb social_links "CONFIRMED"
        string operational_regions "CONFIRMED"
        text footer_mission "CONFIRMED"
        string copyright_text "CONFIRMED"
    }

    ARTISTS {
        uuid id PK "CONFIRMED"
        string name "CONFIRMED"
        string slug "INFERRED"
        string category "CONFIRMED"
        string genre_tag "CONFIRMED"
        string city "CONFIRMED"
        string quote "CONFIRMED"
        text short_bio "CONFIRMED"
        text full_bio "CONFIRMED"
        string specialties "CONFIRMED"
        string portrait_image_url "CONFIRMED"
        string spotlight_quote "INFERRED"
        boolean is_featured "CONFIRMED"
        boolean is_published "INFERRED"
        int display_order "INFERRED"
        timestamp created_at "INFERRED"
    }

    TRACKS {
        uuid id PK "CONFIRMED"
        uuid artist_id FK "CONFIRMED"
        string title "CONFIRMED"
        string audio_file_url "CONFIRMED"
        int duration_seconds "INFERRED"
        string cover_image_url "INFERRED"
        int display_order "INFERRED"
        boolean is_published "INFERRED"
    }

    RELEASES {
        uuid id PK "CONFIRMED"
        uuid artist_id FK "CONFIRMED"
        string title "CONFIRMED"
        string release_type "CONFIRMED"
        int track_count "CONFIRMED"
        int release_year "CONFIRMED"
        string cover_image_url "CONFIRMED"
        int display_order "INFERRED"
        boolean is_published "INFERRED"
    }

    EVENTS {
        uuid id PK "CONFIRMED"
        uuid artist_id FK "INFERRED"
        string performer_name "CONFIRMED"
        string title "CONFIRMED"
        string slug "INFERRED"
        string category "CONFIRMED"
        timestamp event_date "CONFIRMED"
        string location "CONFIRMED"
        string city "CONFIRMED"
        text description "INFERRED"
        string image_url "CONFIRMED"
        string ticket_url "UNKNOWN"
        boolean is_featured "CONFIRMED"
        string status "INFERRED"
        boolean is_published "INFERRED"
        int display_order "INFERRED"
    }

    ACADEMY_COURSES {
        uuid id PK "CONFIRMED"
        uuid instructor_id FK "INFERRED"
        string instructor_name "INFERRED"
        string title "CONFIRMED"
        string slug "INFERRED"
        string track_category "CONFIRMED"
        text description "CONFIRMED"
        string image_url "INFERRED"
        int display_order "CONFIRMED"
        boolean is_published "INFERRED"
    }

    ARTICLES {
        uuid id PK "CONFIRMED"
        uuid featured_artist_id FK "INFERRED"
        string title "CONFIRMED"
        string slug "INFERRED"
        string category "CONFIRMED"
        text excerpt "CONFIRMED"
        text content "CONFIRMED"
        string cover_image_url "CONFIRMED"
        timestamp published_at "CONFIRMED"
        string author_name "INFERRED"
        boolean is_featured "CONFIRMED"
        boolean is_published "INFERRED"
    }

    TESTIMONIALS {
        uuid id PK "CONFIRMED"
        text quote "CONFIRMED"
        string author_name "CONFIRMED"
        string author_role "INFERRED"
        string avatar_image_url "INFERRED"
        int display_order "INFERRED"
        boolean is_published "INFERRED"
    }

    BOOKING_REQUESTS {
        uuid id PK "CONFIRMED"
        uuid artist_id FK "CONFIRMED"
        uuid event_id FK "INFERRED"
        string full_name "CONFIRMED"
        string email "CONFIRMED"
        string phone "CONFIRMED"
        string budget_range "CONFIRMED"
        string event_type "CONFIRMED"
        date event_date "CONFIRMED"
        string preferred_artist "CONFIRMED"
        text message "CONFIRMED"
        string status "INFERRED"
        text admin_notes "INFERRED"
        timestamp created_at "INFERRED"
    }

    NEWSLETTER_SUBSCRIBERS {
        uuid id PK "CONFIRMED"
        string email "CONFIRMED"
        timestamp subscribed_at "INFERRED"
        boolean is_active "INFERRED"
    }

    ARTISTS ||--o{ TRACKS : "produces"
    ARTISTS ||--o{ RELEASES : "releases"
    ARTISTS ||--o{ EVENTS : "performs_at"
    ARTISTS ||--o{ ARTICLES : "featured_in"
    ARTISTS ||--o{ ACADEMY_COURSES : "teaches"
    ARTISTS ||--o{ BOOKING_REQUESTS : "requested_in"
    EVENTS ||--o{ BOOKING_REQUESTS : "inquired_about"
```

---

## 3. Relational Foreign Keys & Integrity Constraints

| Parent Entity | Child Entity | Foreign Key Column | Cardinality | Constraint / On Delete Action | Status | Design Justification |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| `artists` | `tracks` | `tracks.artist_id` | 1 : N | `ON DELETE CASCADE` | **CONFIRMED** | Sample tracks loaded into the `/artists/[slug]` audio widget belong strictly to an artist profile. Deleting an artist removes their audio samples. |
| `artists` | `releases` | `releases.artist_id` | 1 : N | `ON DELETE CASCADE` | **CONFIRMED** | Studio and live albums are cataloged per artist under "مسيرتها الفنية". |
| `artists` | `events` | `events.artist_id` | 1 : N (Optional) | `ON DELETE SET NULL` | **INFERRED** | Live events feature ensemble members (e.g. "أحمد العود"), but band-wide or ensemble events can exist without a single musician FK. |
| `artists` | `academy_courses` | `academy_courses.instructor_id` | 1 : N (Optional) | `ON DELETE SET NULL` | **INFERRED** | Masterclasses can be taught by a featured ensemble musician. |
| `artists` | `articles` | `articles.featured_artist_id` | 1 : N (Optional) | `ON DELETE SET NULL` | **INFERRED** | Cultural stories on `/news` often spotlight a band member (e.g. "حوار مع النحات/الفنان"). |
| `artists` | `booking_requests` | `booking_requests.artist_id` | 1 : N (Optional) | `ON DELETE SET NULL` | **CONFIRMED** | When booking from `/artists/[slug]`, the artist is preset. Retaining booking records upon artist deletion preserves business audit history. |
| `events` | `booking_requests` | `booking_requests.event_id` | 1 : N (Optional) | `ON DELETE SET NULL` | **INFERRED** | When booking from an event card, the inquiry captures the target event. |

---

## 4. Complexities Intentionally Avoided (YAGNI)

1. **No Taxonomy / Tag Join Tables:** The categories in Figma ("غناء", "عود", "حفلات", "مهرجانات") are static, small sets of 4–5 values. They are stored directly as enum strings on records, avoiding 4 redundant join tables (`categories`, `tags`, `post_tags`, `event_categories`).
2. **No Multi-Tier Course Hierarchy:** Academy in Figma consists of exactly 3 distinct cards ("ثلاثة مسارات، موهبة واحدة"). No complex `curriculum_modules`, `lessons`, or `enrollments` tables are created.
3. **No Public User Profile Relations:** Booking requests and newsletter signups do not link to a `users` table because visitors submit inquiries as guest leads without accounts.
