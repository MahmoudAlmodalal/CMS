# Original User Request

## 2026-09-10T11:13:35Z

Execute the 5-phase visual and structural remediation plan defined in `FIGMA_DESIGN_AUDIT_PLAN.md` across the Arabic RTL-first Andalusia music platform, achieving pixel-accurate fidelity with canonical Figma specs (1440px desktop / 390px mobile) while keeping the production Next.js build and test suite green.

Working directory: `/home/mahmoud/Desktop/cms`
Integrity mode: development

## Reference Materials
- Audit & Remediation Spec: `/home/mahmoud/Desktop/cms/FIGMA_DESIGN_AUDIT_PLAN.md`
- Figma inventory: `/home/mahmoud/Desktop/cms/figma_full_inventory.json`
- Extracted nodes: `/home/mahmoud/Desktop/cms/figma_nodes_extracted.json`
- Canonical Design Spec: `/home/mahmoud/Desktop/cms/FIGMA_DESIGN_SPEC.md`

## Requirements

### R1. Design Token & Shell Reconciliation
Apply verified design tokens across CSS variables and Tailwind themes: primary terracotta `#C54716`, primary hover `#B34114`, secondary border `#F9EDE8`, dark espresso `#2B1D14`, and warm parchment `#F9F7F0`. Reconcile button geometry (12px radius, 48px→56px hover expansion) and shell navigation components (56px navbar, textured footer).

### R2. Home Page Hierarchy & Section Geometries
Reconcile the home route (`/`) to follow the exact Figma 8-stage vertical coordinate sequence: Hero (740px height, Cairo Bold 64px / Cairo Medium 25px max 693px) → About (Cairo Bold 61px kicker, Qahwa 48px statement) → Featured Artists (Qahwa 64px, 4:5 cards) → Testimonials (`#F9F7F0` surface, Cairo Bold 64px heading) → Editorial (Qahwa 64px heading) → Events (split banner/card layout) → Booking CTA (`#2B1D14` overlay, ♪ glyph, Qahwa 60px) → Footer (1454×385px with background pattern).

### R3. Catalogs & Directory Alignment
Align the directory catalog routes (`/artists`, `/events`, `/news`) with Figma specs: apply the interior header motif, category filter tabs, 4:5 artist card aspect ratios, 16:9 news card ratios, and enforce deep-link ticket booking CTAs routing directly to `/booking?event_id=...` with strictly zero speculative `/events/[slug]` routes.

### R4. Dynamic Detail & Interactive Workflows
Reconcile detail screens: `/artists/[slug]` (audio player styling, discography grid, artist booking prompt), `/academy` (Cairo Black 40px headline, 3-track course cards), and `/booking` (multi-step form within 1142×829px boundaries and live sticky sidebar).

### R5. Non-Regression & Automated Quality Gates
All code changes must preserve system stability with zero regressions in the build, typecheck, and test pipelines.

## Acceptance Criteria

### Build & Test Quality Gates
- [ ] `npm run build` exits with code 0 with all 24 routes compiling clean.
- [ ] `npm test` passes 100% of test assertions (all 81+ tests pass).
- [ ] `npm run typecheck` reports 0 TypeScript diagnostics.

### Visual & Architectural Parity
- [ ] Color tokens, button radii (12px), and hover transitions match extracted Figma values.
- [ ] Home page vertical section sequence strictly mirrors the Figma Y-order.
- [ ] Deep-link booking flows preserve query parameters (`?event_id=...`, `?artist_id=...`) without introducing `/events/[slug]`.
- [ ] All 8 public routes render cleanly at 1440px desktop and 390px mobile without horizontal scroll or layout shifts.
