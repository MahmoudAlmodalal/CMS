# Figma Design Spec — Andalusia Music Platform

Source: `figma_full_inventory.json` + `figma_nodes_extracted.json` (extracted from
`موقع ويب لفرقة موسيقية`, node-id 0-1). All node IDs below are Figma node IDs.
Canvas is Arabic-RTL-first with mirrored English variants. Design width: **1440px**
desktop, **390px** mobile. This doc is the canonical design reference; do not
eyeball values that are specified here.

## 1. Canvas map

| Section | Content |
|---|---|
| `الرئيسية` (FRAME 1440×5165) | Assembled Arabic desktop home (sections below, §2) |
| `شاشات لابتوب /عربي` | 7 desktop screens: الرئيسية 1440×5165, الأكاديمية 1440×2503, الفعاليات 1440×2290, الحجز 1440×1953, الأخبار 1440×1953, الفنانين 1440×2290, الفنان 1440×2968 |
| `شاشات الهاتف /عربي` | 7 mobile screens at 390px width (home 390×6528, academy 390×3891, events 390×2889, artists ×3, artist detail 390×3658) |
| `english desktop` / `english mobile` | Mirrored English variants, same dimensions |
| `design system components` | Buttons, nav symbols, footers, section/component sheets (§4) |

## 2. Home page order (الرئيسية, top → bottom, sorted by frame y)

1. **Hero — Component 20** `148:3708`, y=0, 1441×740: headline `منصتك الأولى لاكتشاف ودعم المواهب الفنية والثقافية` Cairo **Bold 64px** `186:2000`; sub `أندلسيا منصة متخصصة…` Cairo **Medium 25px** `186:1999` (max ~693px wide, centered); two CTAs 207×48 each (`186:1991` button, `186:1994` Component 11, 32px gap). No pill/tag above headline.
2. **About/manifesto — Component 9** `112:850`, y=718, 1426×879: kicker `من نحن` Cairo Bold 61px; statement `نكتشف · نصل · نحتفي` Qahwa Arabic Regular 48px; body Cairo Medium 25px; link `تعرّف على فنانينا ←` SF Pro Bold 16px.
3. **Featured artists — Frame 14** `87:14240`, y=1619, 1440×615: heading `أصوات تصنع التاريخ` Qahwa Arabic Regular 64px; link `عرض جميع الفنانين ←` SF Pro Bold 16px.
4. **Testimonials — Section** `87:14313`, y=2218, 1447×597: heading `يقولون عن أندلسيا` Cairo Bold 64px (NOT Qahwa).
5. **Editorial — Frame 26** `87:14400`, y=2815, 1440×709: heading `نكتب كي لا تضيع التفاصيل` Qahwa Arabic Regular 64px.
6. **Events — Frame 28** `87:14466`, y=3550, 1439×678 (card-driven, no headline text node).
7. **Booking CTA — Section** `87:14534`, y=4282, 1449×498: `♪` Cairo Regular 44px; heading `مناسبتك تستحق موسيقى حقيقية` Qahwa Arabic Regular 60px `87:14539`; body Cairo Regular 16px; CTA `ابدأ حجزك الآن ♪` SF Pro Bold 16px.
8. **Footer** instance `94:18289`, y=4780, 1454×385 (total canvas 5165px).
9. **Strip — Frame 31** `94:18729`, 1123×85, centered (logo/partner marquee, no text). Inventory places it at y=118 (inside hero bounds) — coordinates for this instance are unreliable; treat as a strip element pending logo assets, do not guess placement.

Frames 14/26 carry no pill badge and no subtitle — headers are H2 + action link only.

## 3. Typography system

| Role | Font | Sizes seen |
|---|---|---|
| Display headlines (hero) | Cairo Bold | 64px |
| Section headings (Qahwa) | Qahwa Arabic Regular | 64 / 60 / 48 / 40 / 32px |
| Section heading (Cairo) | Cairo Bold | 64px (testimonials), 61px (من نحن kicker) |
| Body / lead | Cairo Medium 25px, Cairo Regular 16px | — |
| Links / small CTAs | SF Pro Bold 16px (Arabic UI renders via system fallback) | — |
| Mono accents | DM Mono | — |

Rules: letter-spacing 0%; headlines center-aligned; hero H1 Cairo Bold 64px
(not a calligraphic face); section H2s are Qahwa Regular except testimonials
(`يقولون عن أندلسيا`) and the `من نحن` kicker, which are Cairo Bold.
**Qahwa Arabic is a custom font, not on Google Fonts** — woff2 files must be
obtained from the designer and self-hosted; until then Cairo Bold is the
approved fallback, not a decorative Ruqaa-style face.

## 4. Components

- **Buttons:** 207×48 default (`115:1079`, `115:2174`); hover grows to 207×56. Secondary button `337.74×44` (`139:12301`).
- **Nav:** `Component 17/Navigation` 370×56 (desktop bar), `Navbar` 370×335 (expanded/mobile menu sheet).
- **Footer:** desktop symbol 1454×385 `94:18289`; mobile symbol 390×882.
- **Cards:** artist/event/article cards are image-led; exact card specs live in per-screen frames (see §1 dimensions), not the component sheet.

## 5. Responsive

Desktop frames are fixed 1440px; mobile frames are 390px with taller
compositions (home 6528px vs 5165px) — mobile is a reflowed layout, not a
scaled one. `شاشات الهاتف` strip frames are annotation sheets, not screens.

## 6. Asset gaps (needed for pixel fidelity)

1. `Qahwa Arabic` woff2/woff (Regular; check designer for Bold) — blocks all Qahwa headings.
2. Hero stage photo (Figma image fill in Component 20) + artist/event/article imagery — CMS uploads replace these at runtime, but placeholders are needed for empty states.
3. Text fills/colors were not present in the extracted inventory — read exact hex values from Figma before finalizing brand tokens.
4. Button corner radius / fills live inside unexpanded instances — verify in Figma (component sheet frames `115:1080`, `115:2176`, `139:12302`).

## 7. Implementation status (code vs this spec)

Fixed on branch `figma-fidelity` (home + shared headers):
- `--font-display` token (`"Qahwa Arabic"` first, Cairo fallback — drop-in ready for woff2)
- Hero H1 Cairo Bold 64px desktop, sub Cairo Medium 25px / 693px, pill removed, 740px height, 207×48 CTAs (hover 56px)
- About kicker Cairo Bold 61px (was pill), statement display 48px, body 25px Medium
- Artists / editorial H2s display 64px; invented pills + subtitles removed (frames carry none)
- Testimonials H2 Cairo Bold 64px; quote glyph + body to Cairo
- Booking glyph ♪ Cairo 44px text node, H2 display 60px, body/CTA 16px, 498px min-height
- Events H2 display 64px (frame has no text nodes — copy kept as team content decision)
- ArtistsHeader H1 + artist-detail H1 display face; card/empty-state fallbacks to Cairo

Still pending (need assets or other-session files — do NOT guess):
- Qahwa Arabic woff2/woff (all display headings currently render Cairo)
- Hero stage photo + card imagery (CMS-driven; placeholders until uploads/exports)
- Text-fill hexes (not in extract — read from Figma before finalizing tokens)
- Frame 31 strip (needs logo assets + confirmed placement)
- Academy screen heading `ثلاثة مسارات، موهبة واحدة` is Cairo Black 40px (not Qahwa) — academy pages are other-session dirty files, untouched
- Dirty-file boundary: `artists/page`, `academy/page`, `booking/page`, `news/page`, `news/[slug]/page`, `(public)/page`, `Bidi.tsx`, `supabase/types.ts` belong to the parallel session — fidelity pass did not touch them
- Shell wordmarks (Navbar/MobileNavbar/MobileDrawer/Footer brand spans) still Aref — spec has no wordmark face; left for Task-31 owner
