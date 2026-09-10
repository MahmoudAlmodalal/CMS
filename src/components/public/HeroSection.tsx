import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/LayoutPrimitives";
import { MusicIcon, ArrowEndIcon } from "@/components/ui/Icons";
import type { SiteSettings } from "@/lib/dal/site-settings";

interface HeroSectionProps {
  settings: SiteSettings;
}

/**
 * Verified against Figma Component 20 (Nodes 148:3708, 186:2000, 186:1999, 186:1991, 186:1994):
 * - Height: 740px desktop (min-h-[740px]), 1441px wide canvas
 * - Headline: Cairo Bold 64px, white, centered (NO calligraphic face, NO tag pill)
 * - Subtitle: Cairo Medium 25px, #F9EDE8/90, max 693px, centered
 * - CTAs: 207x48 each (hover 207x56), 32px gap — primary "احجز الآن" -> /booking,
 *   secondary "اكتشف الفنانين" -> /artists
 */
export function HeroSection({ settings }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-brand-espresso text-brand-tint -mt-16 lg:-mt-32 pt-32 lg:pt-44 pb-24 lg:pb-28 min-h-[640px] lg:min-h-[740px] flex items-center">
      {/* Background Stage Image & Gradient Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Subtle patterned vignette */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url(${settings.hero_image_url || "/assets/hero-stage.webp"})`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso via-brand-espresso/80 to-brand-espresso/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(197,71,22,0.18),transparent_70%)]" />
      </div>

      <Container className="relative z-10 w-full">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-8">
          {/* Headline (Figma Node 186:2000 — Cairo Bold 64px) */}
          <h1 className="font-sans text-[40px] sm:text-5xl lg:text-[64px] font-bold text-white tracking-tight leading-[1.3] drop-shadow-sm">
            {settings.hero_headline}
          </h1>

          {/* Subheadline (Figma Node 186:1999 — Cairo Medium 25px, max 693px) */}
          <p className="font-sans text-lg lg:text-[25px] font-medium text-[#F9EDE8]/90 leading-relaxed max-w-[693px]">
            {settings.hero_subheadline}
          </p>

          {/* Action CTAs (Figma Nodes 186:1991, 186:1994 — 207x48, hover 207x56, 32px gap) */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-4 w-full sm:w-auto">
            {/* Primary Action */}
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-2.5 w-[207px] h-12 hover:h-[56px] px-6 rounded-button bg-brand-primary text-white font-bold text-base shadow-md hover:bg-brand-primary-hover active:bg-brand-primary-pressed transition-all"
            >
              <MusicIcon size={20} />
              <span>احجز الآن</span>
            </Link>

            {/* Secondary Action */}
            <Link
              href="/artists"
              className="inline-flex items-center justify-center gap-2 w-[207px] h-12 hover:h-[56px] px-6 rounded-button bg-white/10 hover:bg-white/20 text-brand-tint font-bold text-base backdrop-blur-xs border border-white/20 transition-all"
            >
              <span>اكتشف الفنانين</span>
              <ArrowEndIcon size={18} />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
