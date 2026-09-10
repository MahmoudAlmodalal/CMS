import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/LayoutPrimitives";
import { ArrowEndIcon } from "@/components/ui/Icons";
import type { SiteSettings } from "@/lib/dal/site-settings";

interface AboutSectionProps {
  settings: SiteSettings;
}

/**
 * Verified against Figma Component 9 (Nodes 112:850, 186:284, 186:281, 186:279, 186:278):
 * - Kicker: "من نحن" Cairo Bold 61px (headline-size, NOT a pill badge)
 * - Statement: "نكتشف · نصل · نحتفي" display face (Qahwa Regular) 48px
 * - Body: Cairo Medium 25px, text-brand-espresso/85
 * - CTA: "تعرّف على فنانينا ←" SF Pro Bold 16px -> /artists
 * - Visual: Musician Studio Portrait (Node 87:14467)
 */
export function AboutSection({ settings }: AboutSectionProps) {
  return (
    <section className="py-20 lg:py-28 bg-[#F7F4EE] overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Content Column (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col items-start text-start space-y-6">
            {/* Kicker (Figma Node 186:284 — Cairo Bold 61px) */}
            <p className="font-sans text-3xl sm:text-4xl lg:text-[61px] font-bold text-brand-espresso leading-tight">
              من نحن
            </p>

            {/* Statement (Figma Node 186:281 — display face 48px) */}
            <h2 className="font-display text-4xl lg:text-[48px] font-normal text-brand-espresso leading-[1.3]">
              {settings.about_headline}
            </h2>

            {/* Manifesto Body (Figma Node 186:279 — Cairo Medium 25px) */}
            <p className="font-sans text-lg lg:text-[25px] font-medium text-brand-espresso/85 leading-relaxed">
              {settings.about_body}
            </p>

            {/* CTA Link (Figma Node 186:278 — 16px) */}
            <div className="pt-2">
              <Link
                href="/artists"
                className="inline-flex items-center gap-2 text-base font-bold text-brand-primary hover:text-brand-primary-hover active:text-brand-primary-pressed transition-colors group"
              >
                <span>تعرّف على فنانينا</span>
                <span className="transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1">
                  <ArrowEndIcon size={18} />
                </span>
              </Link>
            </div>
          </div>

          {/* Visual Column (5 cols on desktop) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[460px] aspect-[4/5] rounded-3xl overflow-hidden shadow-lg border border-brand-espresso/10 bg-brand-surface">
              {/* Studio Portrait Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                style={{
                  backgroundImage: `url(${settings.about_image_url || "/assets/about-musician.webp"})`,
                }}
                aria-label="عازف من فرقة أندلسيا في استوديو العزف"
                role="img"
              />

              {/* Decorative Brand Accent Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/50 via-transparent to-transparent pointer-events-none" />

              {/* Inset Badge */}
              <div className="absolute bottom-5 start-5 end-5 p-4 rounded-2xl bg-[#F2EEE0]/90 backdrop-blur-md border border-brand-surface text-brand-espresso text-xs sm:text-sm font-medium">
                <span className="font-bold text-brand-primary">أصالة وإتقان:</span> نوثق المقامات ونعيد تقديمها للأجيال بروح حية.
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
