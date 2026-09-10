import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/LayoutPrimitives";
import type { SiteSettings } from "@/lib/dal/site-settings";

interface BookingBannerProps {
  settings: SiteSettings;
}

/**
 * Verified against Figma Section 87:14534 (Nodes 87:14537, 87:14539, 87:14541, 186:1782):
 * - Section 1449x498: high-contrast warm terracotta banner bg-brand-primary (#C54716)
 * - Glyph "♪" Cairo Regular 44px (text node, not an icon)
 * - Headline: display face (Qahwa Regular) 60px, white
 * - Subtitle: Cairo Regular 16px, text-brand-tint/90
 * - Button: "ابدأ حجزك الآن ♪" SF Pro Bold 16px -> /booking
 */
export function BookingBanner({ settings }: BookingBannerProps) {
  return (
    <section className="relative py-16 lg:py-24 bg-brand-primary text-white overflow-hidden lg:min-h-[498px] flex items-center">
      {/* Subtle decorative background glow and acoustic wave pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute -top-24 -start-24 w-96 h-96 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-24 -end-24 w-96 h-96 rounded-full bg-brand-espresso blur-3xl" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-6">
          {/* Note glyph (Figma Node 87:14537 — Cairo Regular 44px) */}
          <div className="font-sans text-[44px] font-normal leading-none text-white/90" aria-hidden="true">
            ♪
          </div>

          {/* Headline (Figma Node 87:14539 — display face 60px) */}
          <h2 className="font-display text-4xl lg:text-[60px] font-normal text-white leading-[1.25]">
            {settings.booking_banner_title}
          </h2>

          {/* Subtitle / Pitch (Figma Node 87:14541 — Cairo Regular 16px) */}
          <p className="font-sans text-base text-brand-tint/90 leading-relaxed max-w-xl">
            {settings.booking_banner_body}
          </p>

          {/* CTA Action */}
          <div className="pt-3">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl bg-brand-espresso text-brand-tint font-bold text-base shadow-lg hover:bg-brand-espresso/90 active:scale-98 transition-all"
            >
              <span>ابدأ حجزك الآن ♪</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
