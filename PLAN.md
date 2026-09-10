# Project Implementation Plan: Andalus Music Band Web Platform

**Figma Reference:** [موقع ويب لفرقة موسيقية](https://www.figma.com/design/xcKbTxQQhUVOFJerTrkrw2/%D9%85%D9%88%D9%82%D8%B9-%D9%88%D9%8A%D8%A8-%D9%84%D9%81%D8%B1%D9%82%D8%A9-%D9%85%D9%88%D8%B3%D9%8A%D9%82%D9%8A%D8%A9?node-id=89-15216)  
**Target Repository:** [`MahmoudAlmodalal/CMS`](https://github.com/MahmoudAlmodalal/CMS.git)  
**Specification Artifact:** [figma_audit_master_specification.md](file:///home/mahmoud/.gemini/antigravity-cli/brain/91382c33-bfa4-43ae-b64d-e3dabb4df45c/figma_audit_master_specification.md)

---

## Phase 1: Clean Project Initialization & Core Setup
- [ ] Initialize Next.js 15 (App Router, TypeScript, Tailwind CSS, ESLint) in `/home/mahmoud/Desktop/cms`.
- [ ] Configure Tailwind CSS with extracted Figma tokens:
  - Colors: `brand-primary` (`#C54716`), `brand-espresso` (`#2B1D14`), `brand-cream` (`#F9F7F0`), `brand-surface` (`#ECE6D0`), `brand-tint` (`#F9EDE8`), `brand-gold` (`#FFD900`).
  - Fonts: Google Fonts `Cairo` (Primary Arabic), `Aref Ruqaa` (Calligraphic titles), `DM Mono` (Dates/Numbers).
- [ ] Set up RTL-first directory structure (`dir="rtl"` in RootLayout).
- [ ] Configure `next-intl` scaffolding for Arabic (primary) and English (secondary).

---

## Phase 2: Design System & Global Layout Shell
- [ ] Implement reusable UI atoms in `src/components/ui/`:
  - `Button.tsx` (Pill variants, solid `#C54716`, dark `#2B1D14`, outline, sizes).
  - `Badge.tsx` (Category tags in `#F9EDE8` with `#C54716` text).
  - `SectionHeader.tsx` (Title, calligraphic subtitle, decorative icon).
- [ ] Build Global Header / Navigation:
  - Desktop: `Navbar.tsx` (Floating pill navbar, glassmorphism blur, links, CTA).
  - Mobile: `MobileNavbar.tsx` (Fixed header + slide-out drawer overlay).
- [ ] Build Global Footer:
  - `Footer.tsx` (4-column layout on desktop, stacked accordion on mobile, social links).

---

## Phase 3: Core Arabic Public Pages Implementation
- [ ] **Home Page (`/`)**:
  - `HeroSection.tsx` (`148:3708` / `136:5854`): Performance visual, headline, dual CTA buttons.
  - `EventsPreview.tsx` (`87:14400`): 4-card upcoming concerts strip with date badges.
  - `AboutSection.tsx` (`87:14466`): "من نحن" dark section with musician portrait.
  - `ArtistsHighlight.tsx` (`87:14240`): "أصوات تصنع التاريخ" member preview cards.
  - `MediaFeature.tsx` (`112:850`): "نكتب كي لا تضيع التفاصيل" story highlight.
  - `TestimonialsSection.tsx` (`87:14313`): "يقولون عن أندلسيا" interactive slider.
  - `BookingBanner.tsx` (`87:14534`): High-contrast orange CTA banner.
- [ ] **Artists Directory (`/artists`)**:
  - Filter tabs (All, Singing, Oud, Percussion, Contemporary).
  - Responsive grid of `ArtistCard.tsx` (`31:3581`).
- [ ] **Single Artist Profile (`/artists/[slug]`)**:
  - Bio section, instrument badges, gallery showcase.
  - `AudioPlayer.tsx`: Custom audio widget (Play/Pause, track progress, volume).
- [ ] **Events & Concerts (`/events`)**:
  - Category filters (Workshops, Evenings, Festivals, Concerts).
  - List of `EventCard.tsx` with date, location, booking button.
- [ ] **Academy (`/academy`)**:
  - 3 track cards: Heritage School, Oud School, Performance Arts.
  - Course details, instructor profile, registration button.
- [ ] **News & Stories (`/news`)**:
  - Featured article header + grid of cultural stories.
- [ ] **Booking & Inquiries (`/booking`)**:
  - Multi-field inquiry form with validation (Name, Phone, Event Type, Date, Venue, Message).

---

## Phase 4: CMS & Database Backend Integration
- [ ] Set up Supabase Client & Database Schema:
  - Tables: `artists`, `events`, `courses`, `articles`, `booking_requests`, `testimonials`.
  - Row Level Security (RLS) policies for public reading & secure booking submissions.
- [ ] Connect Server Components to Supabase queries with fallback mock data for offline development.
- [ ] Implement Server Action for booking submissions with email/notification triggers.

---

## Phase 5: English Translation (LTR) & Responsive Polish
- [ ] Implement English counterparts for all 8 routes under `/[locale]/...`.
- [ ] Add LTR/RTL dynamic switching via `html dir` attribute.
- [ ] Responsive inspection & refinement across Mobile (`390px`), Tablet (`768px` - `1024px`), and Desktop (`1440px`).

---

## Phase 6: Verification, Performance & Quality Gate
- [ ] Run automated responsive checks via Playwright MCP across mobile, tablet, and desktop viewports.
- [ ] Verify zero console errors, zero broken assets, and fluid animations.
- [ ] Final commit & push to GitHub repository `MahmoudAlmodalal/CMS`.
