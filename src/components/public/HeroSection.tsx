import React from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/LayoutPrimitives";
import { Highlight } from "@/components/ui/Highlight";
import { ScrollReveal } from "./ScrollReveal";
import { Parallax } from "./motion/Parallax";
import { FloatParticles } from "./motion/FloatParticles";
import { CursorGlow } from "./motion/CursorGlow";
import { MagneticButton } from "./motion/MagneticButton";
import { PublicButton } from "./PublicButton";
import { parseYouTubeId, youTubeBackdropEmbedUrl } from "@/lib/youtube";
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
 * - The band starts at y=0 with the floating navbar over it. The public layout
 *   pads nothing, so the band itself reserves --header-offset at the top: the
 *   frame centres the block in a 740px band that the navbar does not reach, and
 *   without that reservation the headline rides under the pill on any viewport
 *   shorter than the frame.
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
  const configuredSecondaryHref = settings.home_hero_secondary_href || "/booking";
  const secondaryHref = configuredSecondaryHref.startsWith("/") ? configuredSecondaryHref : "/booking";
  const heroUrl = settings.hero_image_url;
  // A YouTube link wins over the image column: the image stays underneath as the
  // poster the band shows before the frame paints, and as the whole backdrop
  // under reduced motion, where .hero-youtube-backdrop is display:none.
  const backdropVideoId = parseYouTubeId(settings.hero_video_url);
  const isVideo = !backdropVideoId && isVideoUrl(heroUrl);

  return (
    <section
      // The band reserves the navbar's clearance up top rather than letting the
      // centred block ride underneath the floating pill, and 740 is a floor rather
      // than a fixed height so a longer headline lengthens the band instead of
      // colliding with the row below it.
      className="relative flex min-h-[min(70svh,42rem)] w-full items-center justify-center overflow-hidden bg-brand-espresso pt-[var(--header-offset)] pb-24 text-brand-tint sm:min-h-[min(72svh,46rem)] sm:pb-28 lg:min-h-[740px]"
    >
      {/* Background Stage Video/Image & Gradient Overlay (Figma 148:3663 / 148:3664) */}
      <Parallax className="absolute inset-0 z-0 pointer-events-none" rate={0.22}>
        {isVideo ? (
          <video
            src={heroUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover object-center"
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

        {/* YouTube backdrop. The frame is sized to cover 16:9 against either
            axis and then overscaled, so the watermark and the hover title card
            fall outside this overflow-hidden box: what is left reads as footage,
            not as an embed. pointer-events-none and tabIndex=-1 keep the player
            unreachable, so no interaction can summon its chrome back. */}
        {backdropVideoId ? (
          <div className="hero-youtube-backdrop absolute inset-0 overflow-hidden" aria-hidden="true">
            <iframe
              src={youTubeBackdropEmbedUrl(backdropVideoId)}
              title="Hero backdrop"
              tabIndex={-1}
              loading="eager"
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.35] border-0"
            />
          </div>
        ) : null}
        {/* Two flat 20% black washes, as stacked in the Figma rectangle fill */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-black/20" />
        {/* Figma Rectangle 1: linear-gradient(151.78deg, #000 12.8%, rgba(0,0,0,.1) 66.88%) */}
        <div className="absolute inset-0 bg-[linear-gradient(151.78deg,rgba(0,0,0,1)_12.8%,rgba(0,0,0,0.1)_66.88%)]" />
      </Parallax>

      {/* Ambient floating particles — terracotta embers drifting upward */}
      <FloatParticles count={9} color="rgba(197, 71, 22, 0.55)" zClassName="z-[1]" />

      {/* Cursor-following radial spotlight over the dark overlay */}
      <CursorGlow color="rgba(197, 71, 22, 0.09)" size={500} className="z-[2]" />

      <Container className="relative z-10 w-full">
        <div className="mx-auto flex w-full max-w-[881px] flex-col items-center justify-center space-y-6 text-center sm:space-y-8">
          {/* Headline (Figma Node 148:3671 — Qahwa Arabic Regular 64px/93px, 2-fill)
              ScrollReveal handles the entrance animation.
              Highlight renders the *word* terracotta colour markup from the CMS. */}
          <ScrollReveal variant="up" className="w-full">
            <h1 className="font-display text-3xl font-normal leading-relaxed text-[#EFEBD9] sm:text-4xl md:text-5xl lg:text-6xl lg:leading-snug">
              <Highlight text={settings.hero_headline} />
            </h1>
          </ScrollReveal>

          {/* Subheadline (Figma Node 148:3670 — Cairo Medium 25px, max 693px) */}
          <ScrollReveal variant="soft" delay={0.08} className="w-full">
            <p className="mx-auto max-w-[693px] text-base font-medium leading-relaxed text-[#EFEBD9] sm:text-lg md:text-xl lg:text-[25px] lg:leading-[37.5px]">
              {settings.hero_subheadline}
            </p>
          </ScrollReveal>

          {/* Action CTAs (Figma Node 148:3666 — 207x48, 32px gap)
              MagneticButton gives desktop cursors a subtle pull toward each button. */}
          <ScrollReveal variant="soft" delay={0.16} className="w-full">
            <div className="flex w-full flex-col items-center justify-center gap-3 pt-2 sm:flex-row sm:gap-6">
              {/* Solid primary (Figma component 115:1079, fixed 207x48) */}
              <MagneticButton strength={10}>
                <PublicButton href={settings.home_hero_primary_href || "/artists"} variant="primary" size="md" expandOnHover={false}>
                  {primaryCtaLabel || t("heroPrimaryCta")}
                </PublicButton>
              </MagneticButton>

              {/* Outline secondary (Figma component 115:1091, fixed 207x48) */}
              <MagneticButton strength={10}>
                <PublicButton
                  href={secondaryHref}
                  variant="secondary"
                  size="md"
                  expandOnHover={false}
                >
                  {secondaryCtaLabel || t("heroSecondaryCta")}
                </PublicButton>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}

