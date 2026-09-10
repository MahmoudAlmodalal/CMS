# Andalusia Music Platform — Content & Data Open Questions

**Context:** Verified Figma Root Node `89:15216` (`الرئيسية`) & child screens  
**Purpose:** Formally document confirmed, inferred, and unknown elements before database schema creation (Task 12).

---

## 1. Requirement Status Matrix

| Domain | Feature / Field | Status in Figma | Architectural Impact & Recommendation |
| :--- | :--- | :---: | :--- |
| **Artists** | Band member profiles, instruments, quotes, portraits, bios | **CONFIRMED** | Stored in `artists` table with `portrait_image_url`. |
| **Discography** | Studio/live albums, track counts, release years | **CONFIRMED** | Stored in `releases` table referencing `artists(id)`. |
| **Audio Tracks** | Track title, audio duration, timeline scrubber | **CONFIRMED** | Stored in `tracks` table referencing `artists(id)`. |
| **Audio Storage** | Stream binary source (Supabase Storage vs SoundCloud/Spotify) | **UNKNOWN** | Supabase Storage `audio/` bucket with standard HTML5 `<audio>` player. |
| **Events** | Concert titles, dates, day/month badges, cities, performers | **CONFIRMED** | Stored in `events` table with category enum. |
| **Event Ticketing** | Internal booking route vs third-party ticketing provider | **UNKNOWN** | Support optional `ticket_url`; fallback to `/booking?event_id=[id]`. |
| **Academy Tracks** | 3 learning tracks (Oud, Performance, Voice) with descriptions | **CONFIRMED** | Stored in `academy_courses` with `display_order` 1, 2, 3. |
| **Academy Checkout** | Payment gateway or student portal | **UNCONFIRMED (REJECTED)** | Route "سجّل الآن ←" to `/booking?course=[slug]` inquiry flow. |
| **News / Stories** | Headline, category, date, excerpt, cover photo, full markdown | **CONFIRMED** | Stored in `articles` table with `is_featured` toggle. |
| **Testimonials** | Quote text, reviewer name, role, avatar, slider controls | **CONFIRMED** | Stored in `testimonials` table. |
| **Booking Inquiries** | Name, email, phone, budget, event type, date, message | **CONFIRMED** | Stored in `booking_requests` with status workflow ('pending', etc.). |
| **Newsletter** | Single email input on Academy page | **CONFIRMED** | Stored in `newsletter_subscribers` table. |
| **Multi-Lingual CMS** | Arabic and English content entries | **INFERRED** | Dual column pairing (`_ar` / `_en`) in PostgreSQL tables. |

---

## 2. Key Architectural Open Questions

### Question 1: Audio File Storage & Streaming Source
- **Context:** Node `134:4420` specifies a custom audio player widget on artist profile pages with Play/Pause, duration, and scrubber controls.
- **The Ambiguity:** Does the client prefer hosting `.mp3` / `.ogg` audio files directly in Supabase Storage, or embedding third-party streaming links (SoundCloud, Spotify, Apple Music)?
- **Architectural Impact:** Supabase Storage requires CORS configuration and byte-range request streaming (`Accept-Ranges: bytes`). Third-party embeds require external SDKs and restrict custom Figma UI styling.
- **Status:** **UNKNOWN**
- **Default Recommendation:** Supabase Storage `audio/` bucket with native HTML5 `<audio>` playback for 100% adherence to the Figma player design.

### Question 2: Event Booking vs External Ticketing Flow
- **Context:** On `/events`, event cards feature an "احجز" button, and the featured banner features "أحجز الآن".
- **The Ambiguity:** For large theater concerts (e.g. "حفل بيروت"), should clicking "احجز" redirect to an external ticketing platform (e.g., Virgin Ticketing / Platinumlist), or should it route to the internal `/booking` inquiry form?
- **Architectural Impact:** If external ticketing is needed, `events` requires a nullable `ticket_url` field.
- **Status:** **UNKNOWN**
- **Default Recommendation:** Implement nullable `ticket_url VARCHAR(500) NULL`. If present, render as an external ticket link; if null, route to `/booking?event_id=[id]`.

### Question 3: Academy Registration Action Flow
- **Context:** Node `91:16119` displays 3 learning track cards with action buttons labeled "سجّل الآن ←". Figma has zero LMS, cart, or payment screens.
- **The Ambiguity:** How should "سجّل الآن ←" behave?
  - Option A: Direct to `/booking?course=[slug]` with the selected course pre-populated in the inquiry form.
  - Option B: Trigger a quick registration modal dialog on `/academy`.
- **Architectural Impact:** Option A leverages the unified booking CRM pipeline without extra client UI code. Option B requires a separate modal component.
- **Status:** **INFERRED**
- **Default Recommendation:** Option A (`/booking?course=[slug]`) for minimal code footprint and unified CRM triage.

### Question 4: Multi-Lingual (Arabic / English) Database Architecture
- **Context:** Figma provides complete Arabic screens (`141:16533`) and English screens (`142:17723`).
- **The Ambiguity:** What is the preferred database strategy for bilingual content?
  - Approach 1: Dual columns per table (`title_ar`, `title_en`, `content_ar`, `content_en`).
  - Approach 2: Row-level locale isolation (`locale = 'ar' | 'en'`) with separate records per language.
  - Approach 3: JSONB localized fields (`title: {"ar": "...", "en": "..."}`).
- **Architectural Impact:** Approach 1 avoids foreign key fragmentation and join overhead. Approach 2 allows independent publishing workflows.
- **Status:** **INFERRED**
- **Default Recommendation:** Approach 1 (dual columns with Arabic fallback) for speed, schema simplicity, and atomic publishing.

### Question 5: Booking Notification Dispatch Channel
- **Context:** When a visitor submits an inquiry on `/booking`, staff must receive immediate notification.
- **The Ambiguity:** Which notification channel should the Next.js Server Action trigger?
  - Channel A: Transactional email via Resend to `hello@andalusia.art`.
  - Channel B: WhatsApp message via Twilio or Meta WhatsApp Business API.
  - Channel C: Database-only record creation for staff review in the admin dashboard.
- **Architectural Impact:** Channel A requires configuring `RESEND_API_KEY` in environment variables. Channel B requires third-party SMS/WhatsApp provider setup.
- **Status:** **INFERRED**
- **Default Recommendation:** Channel A (transactional email to `hello@andalusia.art` via Resend) with fallback to database record logging.
