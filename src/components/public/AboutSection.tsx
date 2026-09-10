import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/LayoutPrimitives";
import { Highlight } from "@/components/ui/Highlight";
import { PublicButton } from "./PublicButton";
import type { SiteSettings } from "@/lib/dal/site-settings";

interface AboutSectionProps {
  settings: SiteSettings;
}

/**
 * Verified against Figma Component 9 (Node 112:850, 1426x879):
 * - Title (112:626): `من نحن` Cairo Bold 61px/91.5, CENTERED full-width, `نحن` in #C54716
 * - Statement (112:623): Qahwa Arabic 48px/66, start-aligned, #2B1D14
 * - Body (112:621): Cairo Medium 25px/37.5, end-aligned, #1B1B1B, 495px column
 * - CTA (112:620): SOLID 207x48 primary button, not a text link
 * - Visual (112:624): bare 551x491 image bleeding off the inline-start edge — no card
 *   chrome, no border, no overlay badge
 * - Ornaments (112:627, 112:732): 122.7x111.56 vector, opposite corners
 */
export function AboutSection({ settings }: AboutSectionProps) {
  return (
    <section className="relative py-16 lg:py-0 min-h-[879px] lg:h-[879px] bg-[#F9F7F0] overflow-hidden flex flex-col justify-center">
      {/* Decorative corner ornaments (Figma Nodes 112:627 / 112:732) */}
      <Image
        src="/assets/branding/ornament.svg"
        alt=""
        aria-hidden="true"
        width={123}
        height={112}
        className="pointer-events-none select-none absolute -left-[38px] top-[163px] hidden lg:block"
      />
      <Image
        src="/assets/branding/ornament.svg"
        alt=""
        aria-hidden="true"
        width={123}
        height={112}
        className="pointer-events-none select-none absolute right-0 bottom-6 hidden lg:block rotate-180"
      />

      <Container className="relative z-10">
        {/* Section Title (Figma Node 112:626 — Cairo Bold 61px, CENTERED) */}
        <h2 className="font-sans text-3xl sm:text-4xl lg:text-[61px] font-bold text-black leading-[1.5] text-center">
          <Highlight text="من *نحن*" />
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center pt-10 lg:pt-12">
          {/* Visual Column — bare bleed off the physical LEFT edge (Figma Node 112:624 @ x=-16) */}
          <div className="lg:col-span-6 lg:order-2 flex justify-center lg:justify-start">
            <Image
              src={settings.about_image_url || "/assets/about-musician.png"}
              alt="عازف من فرقة أندلسيا"
              width={551}
              height={491}
              className="w-full max-w-[551px] h-auto lg:h-[491px] object-cover lg:-ml-4"
            />
          </div>

          {/* Content Column (Figma Node 112:619 — 495px, gap 32) */}
          <div className="lg:col-span-6 lg:order-1 flex flex-col items-start gap-8 max-w-[495px] lg:ms-auto">
            {/* Statement (Figma Node 112:623 — Qahwa 48px/66) */}
            <h3 className="font-calligraphic text-3xl sm:text-4xl lg:text-[48px] font-bold text-brand-espresso leading-[1.375] text-start">
              {settings.about_headline}
            </h3>

            {/* Manifesto Body (Figma Node 112:621 — Cairo Medium 25px/37.5, end-aligned) */}
            <p className="font-sans text-lg lg:text-[25px] font-medium text-gradscale-900 leading-[1.5] text-end">
              {settings.about_body}
            </p>

            {/* CTA (Figma Node 112:620 — solid 207x48 primary) */}
            <PublicButton href="/artists" variant="primary" size="md">
              تعرّف على فنانينا ←
            </PublicButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
