import React from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/LayoutPrimitives";
import { Highlight } from "@/components/ui/Highlight";
import { PublicButton } from "./PublicButton";
import type { SiteSettings } from "@/lib/dal/site-settings";

export interface HeroSectionProps {
  settings: SiteSettings;
  /** Admin override for the primary CTA label. Falls back to built-in copy. */
  primaryCtaLabel?: string;
  /** Admin override for the secondary CTA label. Falls back to built-in copy. */
  secondaryCtaLabel?: string;
}

/**
 * Verified against Figma Component 20 (Node 148:3708, 1441x740):
 * - The band starts at y=0 with the floating navbar over it. It carries no top
 *   offset of its own: the public layout stopped padding for the navbar, so the
 *   negative margin that used to cancel that padding would now lift the whole
 *   page 96px out of alignment with the frame.
 * - Backdrop: photo fill + 2x rgba(0,0,0,.2) + linear-gradient(180deg, #000 0%,
 *   rgba(0,0,0,.1) 78%) — the scrim is heaviest at the TOP, under the navbar.
 * - Headline (148:3671): Qahwa Arabic Regular 64px/93px desktop and 32px/55px mobile, fill #EFEBD9, with `لاكتشاف` and
 *   `المواهب` carrying a second terracotta #C54716 fill. Max width 881px, centered.
 * - Subtitle (148:3670): Cairo Medium 25px/37.5 desktop and 16px/37.5 mobile, #EFEBD9, max 693px, centered.
 * - CTAs (148:3666), 32px gap: `اكتشف الفنانين` is the SOLID primary (component
 *   115:1079) and `احجز الآن` is the OUTLINE secondary (component 115:1091).
 *   Both 207x48, 12px radius.
 */
function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) ||
    url.includes("/video/") ||
    url.includes("video")
  );
}

export function HeroSection({ settings, primaryCtaLabel, secondaryCtaLabel }: HeroSectionProps) {
  const t = useTranslations("home");
  const heroUrl = settings.hero_image_url;
  const isVideo = isVideoUrl(heroUrl);

  return (
    <section className="relative flex min-h-[min(70svh,42rem)] w-full items-center justify-center overflow-hidden bg-brand-espresso py-24 text-brand-tint sm:min-h-[min(72svh,46rem)] sm:py-28 lg:min-h-[min(100svh,46.25rem)] lg:py-32">
      {/* Background Stage Video/Image & Gradient Overlay (Figma 148:3663 / 148:3664) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {isVideo ? (
          <video
            src={heroUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroUrl || "/assets/figma/hero-stage-landscape.png"})`,
            }}
            aria-hidden="true"
          />
        )}
        {/* Two flat 20% black washes, as stacked in the Figma rectangle fill */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-black/20" />
        {/* Figma Rectangle 1: linear-gradient(151.78deg, #000 12.8%, rgba(0,0,0,.1) 66.88%) */}
        <div className="absolute inset-0 bg-[linear-gradient(151.78deg,rgba(0,0,0,1)_12.8%,rgba(0,0,0,0.1)_66.88%)]" />
      </div>

      <Container className="relative z-10 w-full">
        <div className="mx-auto flex w-full max-w-[881px] flex-col items-center justify-center space-y-6 text-center sm:space-y-8">
          {/* Headline (Figma Node 148:3671 — Qahwa Arabic Regular 64px/93px, 2-fill) */}
          <h1 className="font-display text-[clamp(1.75rem,5vw,4rem)] font-normal leading-[1.3] text-[#EFEBD9]">
            <Highlight text={settings.hero_headline} />
          </h1>

          {/* Subheadline (Figma Node 148:3670 — Cairo Medium 25px, max 693px) */}
          <p className="max-w-[693px] text-[clamp(0.9375rem,2vw,1.5625rem)] font-medium leading-relaxed text-[#EFEBD9]">
            {settings.hero_subheadline}
          </p>

          {/* Action CTAs (Figma Node 148:3666 — 207x48, 32px gap) */}
          <div className="flex w-full flex-col items-center justify-center gap-3 pt-2 sm:w-auto sm:flex-row sm:gap-6">
            {/* Solid primary (Figma component 115:1079, fixed 207x48) */}
            <PublicButton href={settings.home_hero_primary_href || "/artists"} variant="primary" size="md" expandOnHover={false}>
              {primaryCtaLabel || t("heroPrimaryCta")}
            </PublicButton>

            {/* Outline secondary (Figma component 115:1091, fixed 207x48) */}
            <PublicButton href={settings.home_hero_secondary_href || "/booking"} variant="secondary" size="md" expandOnHover={false}>
              {secondaryCtaLabel || t("heroSecondaryCta")}
            </PublicButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
