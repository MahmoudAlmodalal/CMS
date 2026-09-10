# Figma Design Fidelity Master Audit & Remediation Plan

**Document:** `FIGMA_DESIGN_AUDIT_PLAN.md`  
**Date:** September 10, 2026  
**Auditor:** Senior Frontend & Design Systems Architect  
**Status:** ACTIVE AUDIT PLAN (Zero Code Writes Mandate)  
**Target Repository:** `/home/mahmoud/Desktop/cms`  
**Figma Canvas:** `موقع ويب لفرقة موسيقية` (`node-id=0-1`, reference node `89:15216` / `141:16533`)  
**Figma Data Sources:** `figma_full_inventory.json` (1568 nodes), `figma_nodes_extracted.json` (30.2 MB comprehensive tree)

---

## 1. Executive Summary & Audit Mandate

### 1.1 Context
- **Current Build & Test State:** The Next.js 16 production build compiles 24/24 routes cleanly (`next build` exit 0), and all 81 Node test suite assertions pass (`81/81 pass`).
- **The Core Problem:** Passing functional and DAL unit tests does not guarantee visual or structural parity with the canonical Figma file. Several public pages and components show divergences in typography, container sizing, background textures, color hexes, decorative flourishes, and layout geometries compared to Figma design nodes.
- **Audit Mandate:** Establish a comprehensive, node-traceable audit plan that inventories all divergences across all 8 public routes, locks the extracted design tokens, documents missing asset dependencies, and defines a step-by-step remediation roadmap.
- **Zero-Code Constraint:** In accordance with user directives, **no application code (`.tsx`, `.ts`, `.css`, `.sql`) will be modified during this audit phase**. This document serves exclusively as the single source of truth and plan of action.

---

## 2. Canonical Canvas & Screen Inventory

The canonical design defines two primary viewports:
- **Desktop:** `1440px` fixed canvas width.
- **Mobile:** `390px` reflowed canvas width (fluid vertical stacking).
- *Note on Tablet:* Tablet viewports (e.g. `768px` - `1024px`) are engineering reflow decisions and do not have dedicated Figma artboards; they must gracefully transition between 390px and 1440px tokens.

### 2.1 Screen Map: 8 Canonical Public Routes

| Route | Arabic Screen Name | Figma Desktop Node | Desktop Dimensions | Figma Mobile Node | Mobile Dimensions |
|---|---|---|---|---|---|
| `/` | الرئيسية (Home) | `89:15216` | 1440 × 5165 px | `91:15339` | 390 × 6528 px |
| `/artists` | الفنانين (Artists Directory) | `91:17844` | 1440 × 2290 px | `134:3918` | 390 × 3310 px |
| `/artists/[slug]` | الفنان (Artist Profile) | `134:4420` | 1440 × 2968 px | `134:4746` | 390 × 3658 px |
| `/events` | الفعاليات (Events Catalog) | `91:16532` | 1440 × 2290 px | `134:2558` | 390 × 2889 px |
| `/academy` | الأكاديمية (Music Academy) | `91:16119` | 1440 × 2503 px | `134:1874` | 390 × 3891 px |
| `/news` | الأخبار (Editorial / News Grid) | `91:17296` | 1440 × 1953 px | `134:3238` | 390 × 2410 px |
| `/news/[slug]` | قراءة المقال (Article Detail) | *Derived from Editorial Component specs* | 1440 × Auto px | *Derived* | 390 × Auto px |
| `/booking` | الحجز (Booking / CRM) | `91:17109` | 1440 × 1953 px | `134:1190` | 390 × 2670 px |
| `/events/[slug]` | **EXCLUDED (NO ROUTE)** | *N/A* | *Use `/booking?event_id=...`* | *N/A* | *Deep link only* |

---

## 3. Extracted Design Tokens & Value Reconciliation

Analysis of `figma_nodes_extracted.json` resolves previous uncertainties regarding tokens, fills, and radii:

### 3.1 Color Palette Truth Table

| Token Role | Extracted Hex | RGB Normalized | Figma Occurrences | Current Implementation Value | Status |
|---|---|---|---|---|---|
| **Brand Primary (Terracotta)** | `#C54716` | `0.7725, 0.2784, 0.0863` | 721 | `#C54716` / `var(--color-brand-primary)` | **MATCH** |
| **Brand Primary Hover** | `#B34114` | `0.7020, 0.2549, 0.0784` | 15 | `#A63A11` (approximate) | **DISCREPANCY** (Update hover to `#B34114`) |
| **Brand Terracotta Light** | `#D16C45` | `0.8196, 0.4235, 0.2706` | 13 | `#E87A50` | **DISCREPANCY** |
| **Brand Soft Tint** | `#F9EDE8` | `0.9765, 0.9294, 0.9098` | 132 | `#FDF8F5` | **DISCREPANCY** (Figma uses `#F9EDE8` heavily for secondary strokes & cards) |
| **Dark Charcoal / Text** | `#130F26` | `0.0745, 0.0588, 0.1490` | 264 | `#18181B` | **DISCREPANCY** (Figma deep dark has slight indigo undertone `#130F26`) |
| **Espresso Dark Surface** | `#2B1D14` | `0.1686, 0.1137, 0.0784` | 38 | `#1A120B` | **DISCREPANCY** (Overlay & footer base is `#2B1D14`) |
| **Parchment Surface / Warm White** | `#F9F7F0` | `0.9765, 0.9686, 0.9412` | 26 | `#F7F4EE` | **DISCREPANCY** (Testimonials & interior backgrounds use `#F9F7F0`) |
| **Pure White** | `#FFFFFF` | `1.0, 1.0, 1.0` | 3741 | `#FFFFFF` | **MATCH** |
| **Border / Divider Grey** | `#DADADA` | `0.8549, 0.8549, 0.8549` | 16 | `#E4E4E7` | **DISCREPANCY** |

### 3.2 Typography Rules & Font Stacks

| Typography Role | Figma Font Family | Weight | Sizes Specified | Line Height / Align | Implementation Fallback Strategy |
|---|---|---|---|---|---|
| **Display Headings** | `Qahwa Arabic` | Regular (400) / Bold (700) | 64px, 60px, 48px, 40px, 32px | 1.2 - 1.3 / Center & Right | Custom font; fallback `--font-display: "Qahwa Arabic", var(--font-cairo-bold)`. *Never use Ruqaa!* |
| **Hero Headline** | `Cairo` | Bold (700) | 64px (`186:2000`) | 1.3 / Center | `Cairo Bold 64px` desktop, `40px` mobile. |
| **Hero Subtitle** | `Cairo` | Medium (500) | 25px (`186:1999`) | 1.5 / Center, max-w 693px | `Cairo Medium 25px` desktop, `18px` mobile. |
| **Section Headings (Cairo exceptions)** | `Cairo` | Bold (700) | 64px (Testimonials `87:14314`), 61px (About kicker `186:284`) | 1.2 / Center (Testimonials), Right (About) | Direct Cairo Bold. |
| **Academy Headings** | `Cairo` | Black (900) | 40px / 48px (`91:16347`) | 1.2 / Right | Cairo Black 40px. |
| **Body & Paragraphs** | `Cairo` | Regular (400) / Medium (500) | 16px, 14px, 13px | 1.6 - 1.7 / Right & Center | Standard body tokens. |
| **Buttons & Action Links** | `SF Pro` / `Cairo` | Bold (700) | 16px | Auto / Center | In Arabic RTL, renders via `Cairo Bold 16px` system fallback. |
| **Mono Accents / Badges** | `DM Mono` | Regular (400) | 11px, 12px | Auto | Preserved for metadata and time indicators. |

### 3.3 Component Elevation & Shape Geometry

- **Buttons (Component Set `115:1080` & `115:2176`):**
  - Corner Radius: **`12px`** (`rounded-xl` in Tailwind).
  - Primary Default: `207 × 48 px`, Fill `#C54716`, text 16px Bold White.
  - Primary Hover: `207 × 56 px`, Fill `#B34114`, smooth 150ms height transition.
  - Secondary / Outline Default: `207 × 48 px`, Fill transparent, Stroke `1px solid #F9EDE8`, text `#F9EDE8`.
  - Secondary Hover: `207 × 56 px`, Stroke `1px solid #F9EDE8`, subtle background tint `rgba(249, 237, 232, 0.1)`.
- **Cards (Artists, Events, Articles):**
  - Radius: **`24px`** (`rounded-3xl` or `1.5rem`) on desktop, `16px` (`rounded-2xl`) on mobile.
  - Border: `1px solid rgba(43, 29, 20, 0.08)` or `1px solid #DADADA`.
  - Shadows: Subtle warm ambient drop-shadow (`0 10px 30px -10px rgba(43, 29, 20, 0.08)`), avoiding cold grey Tailwind defaults.

---

## 4. Route-by-Route Discrepancy & Fidelity Audit

### 4.1 Shell Components (Global Header, Navigation, Footer)

1. **Desktop Navigation (`Component 17/Navigation`, Node `370 × 56 px`):**
   - *Figma Behavior:* Floating pill container or centered bar with backdrop blur.
   - *Current Implementation:* Full-width sticky header.
   - *Audit Finding:* The inner navigation container must adhere to the 56px height specification with `rounded-full` or `rounded-2xl` styling and proper brand typography.
2. **Mobile Drawer (`Navbar`, Node `370 × 335 px`):**
   - *Figma Behavior:* Compact modal/drawer sheet anchored from top/end with clean item separation.
   - *Audit Finding:* Ensure drawer aligns with the 335px frame proportion on 390px viewports with Cairo Bold 16px links.
3. **Footer (`Node 94:18289`, 1454 × 384.67 px):**
   - *Figma Specs:* Background fill `#2B1D14` combined with background image texture (`da60c98546b43a3524b1bbd7667d8f518e1c7ee3`), stretch mode.
   - *Audit Finding:* Footer currently uses a flat dark background without the subtle ornamental texture overlay present in the Figma instance.
4. **Partner / Logo Marquee Strip (`Node 94:18729`, Frame 31, 1123 × 85 px):**
   - *Figma Specs:* 1123px width, 85px height, centered horizontally.
   - *Audit Finding:* Currently omitted or unreliable in placement. Needs structured container with graceful placeholder slots for partner/cultural sponsor logos.

---

### 4.2 Route 1: Home (`/`, Node `89:15216`, 1440 × 5165 px)

Figma Home consists of 8 vertically ordered sections (sorted by Y-coordinate):

```
1. Hero (148:3708, y=0, h=740px)
2. About/Manifesto (112:850, y=718, h=879px)
3. Featured Artists (87:14240, y=1619, h=615px)
4. Testimonials (87:14313, y=2218, h=597px)
5. Editorial (87:14400, y=2815, h=709px)
6. Events (87:14466, y=3550, h=678px)
7. Booking CTA (87:14534, y=4282, h=498px)
8. Footer (94:18289, y=4780, h=385px)
```

#### Section-by-Section Divergence Checklist:
- **Hero (`148:3708`):**
  - [x] Headline Cairo Bold 64px (`186:2000`).
  - [x] Subtitle Cairo Medium 25px max 693px (`186:1999`).
  - [x] CTAs 207×48px with hover 207×56px.
  - [ ] **Gap:** Background image fill requires authentic high-res stage graphic; currently fallback to generic gradient/webp.
- **About (`112:850`):**
  - [x] Kicker Cairo Bold 61px (`من نحن`).
  - [x] Statement 48px Qahwa (`نكتشف · نصل · نحتفي`).
  - [x] Body Cairo Medium 25px.
  - [ ] **Gap:** Background surface color is `#F9F7F0` in Figma, currently rendering `#F7F4EE`.
- **Featured Artists (`87:14240`):**
  - [x] Heading Qahwa 64px (`أصوات تصنع التاريخ`).
  - [x] Clean header (no invented pill tags or subtitle).
  - [ ] **Gap:** Horizontal carousel / grid aspect ratios must strictly match 4:5 portrait crop with `#F9EDE8` badge accents.
- **Testimonials (`87:14313`):**
  - [x] Heading Cairo Bold 64px (`يقولون عن أندلسيا`).
  - [ ] **Gap:** Section background fill must be `#F9F7F0`.
  - [ ] **Gap:** Testimonial quote card frame `176:6169` (805 × 161 px) has specific centered quote geometry and author lockup that differs from standard multi-card sliders.
- **Editorial (`87:14400`):**
  - [x] Heading Qahwa 64px (`نكتب كي لا تضيع التفاصيل`).
  - [ ] **Gap:** Card layout in Frame 26 shows asymmetric editorial feature (large primary article + 2 secondary stack), whereas implementation currently displays a uniform 3-card grid.
- **Events (`87:14466`):**
  - [ ] **Gap:** Frame 28 (1439 × 678 px) in Figma is visual and card-driven with left visual banner (`87:14467`, 509 × 678 px) and right event list container (`87:14468`, 939 × 678 px). Implementation currently uses a centered header with vertical grid.
- **Booking CTA (`87:14534`):**
  - [x] Glyph `♪` Cairo Regular 44px.
  - [x] Heading Qahwa 60px (`مناسبتك تستحق موسيقى حقيقية`).
  - [ ] **Gap:** Background requires image `caeb7e573a02cd1ecf364f1737b1246ad2984677` tinted with `#2B1D14` at 88% opacity.

---

### 4.3 Interior Pages Shared Architecture & Motif

All interior pages (`/artists`, `/artists/[slug]`, `/events`, `/academy`, `/news`, `/booking`) share a verified Figma layout pattern:
1. **Hero Header Frame (`Frame 11` or similar):**
   - Top background banner: `From Klickpin.com...` (`1581 × 655 px` image fill).
   - Overlay vector: `Rectangle 1` (`1440 - 1529 × 611 px`).
   - Breadcrumb/Strip: `Frame 30` (`1123 × 85 px` centered).
2. **Decorative Corner Ornaments:**
   - `Group 161` (`x: -23952, y: 5891, 122.7 × 111.6 px`).
   - `Group 162` (`x: -22514, y: 6879, 122.7 × 111.6 px`).
   - These are arabesque floral/geometric vector motifs framing content sections. Currently missing from all code implementations.

---

### 4.4 Route 2: Artists Directory (`/artists`, Node `91:17844`, 1440 × 2290 px)

- **Header:** Frame 11 with display title `فنانونا` / `أصوات أندلسيا` framed by decorative ornaments.
- **Filter Tabs (`Frame 21`, Node `91:18061`):**
  - Pill tabs with active fill `#C54716` and inactive border `#DADADA`.
  - Categories: All (`الكل`), Vocals (`غناء`), Instruments/Strings (`آلات وترية`), Percussion (`إيقاع`), Western Classical/Fusion (`موسيقى غربية/فيوجن`).
- **Grid Container (`Container`, Node `91:18144`):**
  - 3 columns on desktop (1440px), 1 column on mobile (390px).
  - Card specs: 360 - 380px card width, portrait 4:5 image ratio, hover zoom, name in Cairo Bold 20px, bio excerpt Cairo Regular 14px.

---

### 4.5 Route 3: Artist Profile (`/artists/[slug]`, Node `134:4420`, 1440 × 2968 px)

- **Hero Header (`134:4634` - `134:4639`):**
  - Heading 1: Display face 48px / Cairo Bold (`134:4634`).
  - Artist Tagline/Bio: Cairo Medium 20px / Regular 16px (`134:4638`).
  - Action container: Booking CTA button `احجز هذا الفنان` deep-linking to `/booking?artist_id=...`.
- **Audio Showcase & Discography (`Section 134:4644`, 1280 × 450.98 px):**
  - Custom track player card with waveform/progress bar, track duration in DM Mono 12px, play/pause toggle.
- **Releases & Works Sections (`134:4671`, `134:4682`):**
  - Grid of album/single artwork with release year and genre tags.
- **Bottom Booking Section (`Section 134:4660`, 1449 × 498 px):**
  - Persistent booking prompt tailored to the specific artist.

---

### 4.6 Route 4: Events Catalog (`/events`, Node `91:16532`, 1440 × 2290 px)

- **Header Banner:** Shared interior banner structure.
- **Filter Component (`Component 8`, Node `91:16930`):**
  - Date and category filter tabs (Upcoming `القادمة`, Concerts `حفلات`, Festivals `مهرجانات`, Workshops `ورش عمل`).
- **Event Cards Grid (`Container 91:16793`, `Container 91:16914`):**
  - Event date pill: DM Mono day/month stack (`#C54716` accent).
  - Event location: City / Venue badge with pin icon.
  - Action button: Direct deep-link CTA `احجز تذكرتك / احجز مقعدك` routing to `/booking?event_id=...` (**Strictly zero `/events/[slug]`**).

---

### 4.7 Route 5: Academy (`/academy`, Node `91:16119`, 1440 × 2503 px)

- **Headline (`Node 91:16347`):**
  - Text: `ثلاثة مسارات، موهبة واحدة`.
  - Typography: **Cairo Black 40px** (`font-black text-[40px]`), right-aligned. (Note: NOT Qahwa!).
- **Three Tracks Grid (`Section 91:16348`):**
  - 3 dedicated track cards representing Musical Performance (`الأداء الموسيقي`), Composition & Maqam (`التأليف والمقامات`), Audio Engineering (`الهندسة الصوتية`).
  - Track card metrics: duration, instructor level, curriculum points.
- **Curriculum & Registration Section (`Container 91:16432`):**
  - Admission criteria and enrollment form deep-link.

---

### 4.8 Route 6: News / Editorial (`/news`, Node `91:17296`, 1440 × 1953 px)

- **Featured Hero Article:**
  - Full-width or 2-column split hero card with article cover, reading time, published date, author credit.
- **Category Filter Tabs:**
  - All (`الكل`), Articles (`مقالات`), Interviews (`حوارات`), Coverage (`تغطيات`).
- **Articles Grid (`Frame 34`, Node `91:17798`):**
  - Clean card grid with image ratio 16:9, category pill, title in Cairo Bold 18px, CTA `اقرأ المقال ←`.

---

### 4.9 Route 7: Article Detail (`/news/[slug]`)

- **Typography Scale:**
  - Headline: Display face 40px / Cairo Bold.
  - Lead paragraph: Cairo Medium 20px with `#2B1D14` text.
  - Body text: Cairo Regular 16px with 1.8 line height for optimal Arabic readability.
  - Blockquotes: Terracotta right border (`border-r-4 border-brand-primary`) with italicized Cairo Medium.
- **Related Articles Strip:** 3-card bottom recommendation carousel.

---

### 4.10 Route 8: Booking Page (`/booking`, Node `91:17109`, 1440 × 1953 px)

- **Header (`Frame 11`, Node `91:17123`, 986 × 191 px):**
  - Title: Qahwa / Cairo Bold `طلب حجز فنان أو استشارة موسيقية`.
  - Subtitle: Cairo Regular 16px clarifying booking workflow.
- **Interactive Form & Summary (`Frame 33`, Node `91:17792`, 1142 × 829 px):**
  - Split grid: 7 columns for multi-step booking form, 5 columns for live summary sidebar (`BookingSidebar.tsx`).
  - Input fields: Cairo Regular 14px, border `#DADADA`, focus ring `#C54716`.
  - Deep-link Banner (`BookingContextBanner.tsx`): Displays when `?event_id=...` or `?artist_id=...` is present.

---

## 5. Asset & Font Dependency Register

| Asset Description | Figma Source / Ref | Status | Required Action |
|---|---|---|---|
| **`Qahwa Arabic` Font (WOFF2/WOFF)** | Used in H2 headers across all screens | **BLOCKED (Missing)** | Awaiting designer font asset files. Cairo Bold fallback is currently active. |
| **Hero Stage Background** | Component 20 (`148:3708`) | **MISSING** | Extract or provide high-res WebP for desktop hero. |
| **Interior Header Texture** | `From Klickpin.com...` (`1581 × 655 px`) | **INFERRED** | Export vector/raster texture for `/artists`, `/events`, `/academy`, `/booking`. |
| **Footer Pattern Texture** | Image ref `da60c98546b43a3524b1bbd7667d8f518e1c7ee3` | **EXTRACTABLE** | Export raster pattern and bind to Footer background. |
| **Booking CTA Texture** | Image ref `caeb7e573a02cd1ecf364f1737b1246ad2984677` | **EXTRACTABLE** | Export raster photo for home booking section overlay. |
| **Arabesque Corners** | `Group 161` & `Group 162` | **EXTRACTABLE** | Export SVG vector ornaments for interior header framing. |
| **Partner Logos** | Frame 31 / Frame 30 (`1123 × 85 px`) | **PLACEHOLDER** | Create SVG monochrome logo placeholders until final sponsor vector files. |

---

## 6. Phased Remediation Plan & Execution Roadmap

Execution of code changes must follow this strict sequence once approved:

```
Phase 1: Token & Asset Foundation (Hexes, 12px radii, extracted SVGs)
   ↓
Phase 2: Shell & Home Reconciliation (740px hero, section Y-order, background fills)
   ↓
Phase 3: Catalogs Reconciliation (/artists, /events, /news filter tabs & aspect ratios)
   ↓
Phase 4: Interactive & Dynamic Detail Pages (/artists/[slug], /academy, /booking)
   ↓
Phase 5: Visual QA Gate & Non-Regression Verification (1440px desktop & 390px mobile)
```

### Phase 1: Tokens, Global Styles & Layout Shell
1. Update `globals.css` and Tailwind theme tokens:
   - Primary Hover: `#B34114`.
   - Brand Dark Surface: `#2B1D14`.
   - Parchment Surface: `#F9F7F0`.
   - Soft Tint: `#F9EDE8`.
   - Button Radius: `12px`.
2. Extract and mount the interior header background banner and corner ornaments (`Group 161`, `Group 162`).
3. Reconcile `Footer.tsx` background with texture overlay (`da60c985...`).
4. Reconcile `Navbar.tsx` to exact 56px height specification.

### Phase 2: Home Page Visual Reconciliation (`/`)
1. Reconcile section background fills:
   - About: `#F9F7F0`.
   - Testimonials: `#F9F7F0` with single quote card geometry (`176:6169`, 805 × 161 px).
   - Booking CTA: `#2B1D14` at 88% opacity over image `caeb7e57...`.
2. Reconcile Events section (`87:14466`) into left visual banner (509px) and right card list (939px).
3. Reconcile Editorial section (`87:14400`) asymmetric layout.
4. Mount Frame 31 partner strip (1123 × 85 px).

### Phase 3: Catalogs Reconciliation (`/artists`, `/events`, `/news`)
1. Align interior header banner across all three directory routes.
2. Unify Category Filter Tabs to match Figma `Component 8` / `Frame 21` specs.
3. Verify 4:5 image ratio on `ArtistCard.tsx` and 16:9 on `ArticleCard.tsx`.
4. Ensure all Event CTA deep-links target `/booking?event_id=...` with zero broken links.

### Phase 4: Dynamic & Interactive Pages (`/artists/[slug]`, `/academy`, `/news/[slug]`, `/booking`)
1. Artist Profile (`134:4420`):
   - Style custom audio player with DM Mono counters and terracotta scrubber.
   - Implement releases showcase grid.
2. Academy (`91:16119`):
   - Ensure headline is Cairo Black 40px (`ثلاثة مسارات، موهبة واحدة`).
   - Format 3-track course cards with syllabus highlights.
3. Booking (`91:17109`):
   - Position multi-step form within 1142 × 829 px boundary.
   - Bind dynamic artist/event query params to sticky `BookingSidebar.tsx`.

### Phase 5: Verification Gate & Visual QA Checklist
1. **Automated Verification:**
   - `npm run build` must produce 24/24 routes without errors.
   - `npm test` must run 81/81 assertions clean.
   - `npm run typecheck` must report 0 TypeScript diagnostics.
2. **Visual Verification:**
   - Desktop 1440px canvas review against Figma node screenshots.
   - Mobile 390px responsive reflow review with no horizontal overflow.
   - RTL text alignment and bidi character isolation verification.

---

## 7. Acceptance Criteria & Audit Sign-Off Gate

To close the Figma visual fidelity audit:
- [ ] Every color token matches the extracted Figma hex value.
- [ ] Every headline adheres to the typography matrix (Cairo 64/25, Qahwa 64/60/48, Cairo Black 40).
- [ ] Button hover heights expand smoothly from 48px to 56px with 12px border radius.
- [ ] All 8 public routes maintain exact vertical section ordering.
- [ ] Production build and test suite remain 100% green throughout all changes.
