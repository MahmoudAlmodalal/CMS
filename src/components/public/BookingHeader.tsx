import React from "react";

interface BookingHeaderProps {
  subtitle: string;
}

/**
 * Booking Header Component
 * Verified against Figma Screen "الحجز" (Node 91:17109 / Frame 11: 91:17123 & 91:17126)
 * - Headline: "مناسبتك تستحق موسيقى حقيقية. ♪"
 * - Subtitle: configurable via site_settings.booking_subtitle
 * - Font: Calligraphic / Aref Ruqaa headline with warm brand colors
 */
export function BookingHeader({ subtitle }: BookingHeaderProps) {
  return (
    <div className="relative w-full pt-10 pb-8 sm:pt-14 sm:pb-12 text-center">
      {/* Decorative Musical Accent */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold mb-4">
        <span>♪</span>
        <span>حجز الفعاليات والعروض الخاصة</span>
      </div>

      <h1 className="font-calligraphic text-3xl sm:text-4xl md:text-5xl font-bold text-brand-espresso leading-tight tracking-tight mb-4">
        مناسبتك تستحق موسيقى حقيقية. ♪
      </h1>

      <p className="max-w-2xl mx-auto text-base sm:text-lg text-brand-espresso/80 leading-relaxed font-normal">
        {subtitle}
      </p>
    </div>
  );
}
