import React from "react";
import { Container } from "@/components/ui/LayoutPrimitives";
import { Highlight } from "@/components/ui/Highlight";
import { PublicButton } from "./PublicButton";
import type { SiteSettings } from "@/lib/dal/site-settings";

export interface HeroSectionProps {
  settings: SiteSettings;
}

/**
 * Verified against Figma Component 20 (Node 148:3708, 1441x740):
 * - Backdrop: photo fill + 2x rgba(0,0,0,.2) + linear-gradient(180deg, #000 0%,
 *   rgba(0,0,0,.1) 78%) — the scrim is heaviest at the TOP, under the navbar.
 * - Headline (148:3671): Qahwa Arabic 64px/93px, fill #EFEBD9, with `لاكتشاف` and
 *   `المواهب` carrying a second terracotta #C54716 fill. Max width 881px, centered.
 * - Subtitle (148:3670): Cairo Medium 25px/37.5, #EFEBD9, max 693px, centered.
 * - CTAs (148:3666), 32px gap: `اكتشف الفنانين` is the SOLID primary (component
 *   115:1079) and `احجز الآن` is the OUTLINE secondary (component 115:1091).
 *   Both 207x48, 12px radius.
 */
export function HeroSection({ settings }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-brand-espresso text-brand-tint -mt-14 lg:-mt-24 pt-14 lg:pt-24 min-h-[740px] lg:h-[740px] flex items-center justify-center">
      {/* Background Stage Image & Gradient Overlay (Figma 148:3663 / 148:3664) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${settings.hero_image_url || "/assets/hero-stage.png"})`,
          }}
          aria-hidden="true"
        />
        {/* Two flat 20% black washes, as stacked in the Figma rectangle fill */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-black/20" />
        {/* linear-gradient(180deg, #000 0%, rgba(0,0,0,0.1) 78%) — dark at the top */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(0,0,0,0.1)_78%)]" />
      </div>

      <Container className="relative z-10 w-full">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-8">
          {/* Headline (Figma Node 148:3671 — Qahwa Arabic 64px/93px, 2-fill) */}
          <h1 className="font-calligraphic text-[36px] sm:text-5xl lg:text-[64px] font-normal text-[#EFEBD9] leading-[1.45] max-w-[881px]">
            <Highlight text={settings.hero_headline} />
          </h1>

          {/* Subheadline (Figma Node 148:3670 — Cairo Medium 25px, max 693px) */}
          <p className="font-sans text-lg lg:text-[25px] font-medium text-[#EFEBD9] leading-[1.5] max-w-[693px]">
            {settings.hero_subheadline}
          </p>

          {/* Action CTAs (Figma Node 148:3666 — 207x48, 32px gap) */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-4 w-full sm:w-auto">
            {/* Solid primary (Figma component 115:1079) */}
            <PublicButton href="/artists" variant="primary" size="md">
              اكتشف الفنانين
            </PublicButton>

            {/* Outline secondary (Figma component 115:1091) */}
            <PublicButton href="/booking" variant="secondary" size="md">
              احجز الآن
            </PublicButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
