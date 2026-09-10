import React from "react";
import { Container } from "@/components/ui/LayoutPrimitives";
import { PublicButton } from "./PublicButton";
import type { SiteSettings } from "@/lib/dal/site-settings";

interface BookingBannerProps {
  settings: SiteSettings;
}

/**
 * Verified against Figma Section 87:14534 (Nodes 87:14535, 87:14537, 87:14539, 87:14541, 89:15225):
 * - Canvas Dimensions: Fixed 1449x498px desktop height (min-h-[498px] lg:h-[498px])
 * - Background Composite: Espresso #2B1D14 at 88% overlay over texture (caeb7e57... + da60c985...)
 * - Musical Glyph: Cairo Regular 44px "♪" in brand-primary terracotta #C54716 (Node 87:14537)
 * - Headline: Qahwa Arabic Regular 60px (font-calligraphic text-[60px], Node 87:14539)
 * - Subtitle: Cairo Regular 16px in warm tint #F9EDE8/90 (Node 87:14541)
 * - CTA Action: Canonical PublicButton (variant="primary", size="md", 48px->56px hover expansion)
 */
export function BookingBanner({ settings }: BookingBannerProps) {
  const headline = settings.booking_banner_title || "مناسبتك تستحق موسيقى حقيقية";
  const body =
    settings.booking_banner_body ||
    "احجز فرقة أندلسيا لحفلتك، مطعمك، مهرجانك — واصنع لحظة لا تُنسى.";

  return (
    <section
      className="relative min-h-[498px] lg:h-[498px] bg-[#2B1D14] text-brand-tint overflow-hidden flex items-center justify-center"
      aria-label="حجز فرقة أندلسيا"
    >
      {/* 1. Base Photo Texture Fill (Figma ref: caeb7e573a02cd1ecf364f1737b1246ad2984677) */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none"
        style={{
          backgroundImage: "url('/assets/branding/concert-stage.webp')",
        }}
        data-texture-ref="caeb7e573a02cd1ecf364f1737b1246ad2984677"
        aria-hidden="true"
      />

      {/* 2. Andalusian Arabesque Stretch Pattern (Figma Node 87:14535, ref: da60c98546b43a3524b1bbd7667d8f518e1c7ee3) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-screen"
        aria-hidden="true"
        data-texture-ref="da60c98546b43a3524b1bbd7667d8f518e1c7ee3"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="booking-banner-arabesque"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M40 0 L80 40 L40 80 L0 40 Z"
                fill="none"
                stroke="#F9EDE8"
                strokeWidth="1"
              />
              <circle cx="40" cy="40" r="14" fill="none" stroke="#F9EDE8" strokeWidth="1" />
              <path
                d="M40 14 L40 66 M14 40 L66 40"
                stroke="#F9EDE8"
                strokeWidth="0.75"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#booking-banner-arabesque)" />
        </svg>
      </div>

      {/* 3. Solid Espresso #2B1D14 Overlay at strictly 88% opacity (Figma 87:14534) */}
      <div
        className="absolute inset-0 bg-[#2B1D14]/88 pointer-events-none"
        aria-hidden="true"
      />

      {/* 4. Foreground Content (Max width 3xl centered) */}
      <Container className="relative z-10 py-12 lg:py-0">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-6">
          {/* Musical Glyph (Figma Node 87:14537 — Cairo Regular 44px in Terracotta #C54716) */}
          <div
            className="font-sans text-[44px] font-normal leading-none text-brand-primary select-none"
            aria-hidden="true"
          >
            ♪
          </div>

          {/* Headline (Figma Node 87:14539 — Qahwa Arabic Regular 60px) */}
          <h2 className="font-calligraphic text-3xl sm:text-4xl lg:text-[60px] font-normal text-brand-tint leading-[1.25] tracking-tight">
            {headline}
          </h2>

          {/* Subtitle / Body (Figma Node 87:14541 — Cairo Regular 16px) */}
          <p className="font-sans text-sm sm:text-base text-brand-tint/90 leading-relaxed max-w-xl">
            {body}
          </p>

          {/* CTA Action: Canonical PublicButton with 12px radius and 48px->56px hover expansion */}
          <div className="pt-2">
            <PublicButton href="/booking" variant="primary" size="md">
              ابدأ حجزك الآن ♪
            </PublicButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
