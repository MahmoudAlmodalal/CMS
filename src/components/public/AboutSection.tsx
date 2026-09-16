import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Highlight } from "@/components/ui/Highlight";
import type { SiteSettings } from "@/lib/dal/site-settings";
import { SafeImage } from "@/components/ui/SafeImage";
import { ScrollReveal } from "./ScrollReveal";
import { StrokeUnderline } from "./motion/StrokeUnderline";
import { Tilt3D } from "./motion/Tilt3D";
import { NumberCounter } from "./motion/NumberCounter";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";

interface AboutSectionProps {
  settings: SiteSettings;
  ctaLabel?: string;
}

export function AboutSection({ settings, ctaLabel }: AboutSectionProps) {
  const t = useTranslations("home");
  return (
    <section className="relative w-full bg-[#F9F7F0] py-12 md:py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
        {/* Kicker copy: من نحن */}
        <ScrollReveal variant="up">
          <h2 className="text-center font-sans text-3xl font-bold leading-relaxed text-black sm:text-4xl md:text-5xl lg:text-[61px] lg:leading-[91.5px]">
            <Highlight
              text={settings.home_about_heading || t("aboutHeading")}
              highlightClassName="text-primary-500"
            />
          </h2>
          <StrokeUnderline className="mx-auto mt-2" />
        </ScrollReveal>
        <div className="mt-8 grid min-w-0 grid-cols-1 items-center gap-8 sm:mt-10 md:grid-cols-2 md:gap-10 lg:mt-12 xl:gap-16">
          <div className="order-1 min-w-0 md:order-2">
            <ScrollReveal variant="image">
              {/* Tilt3D wraps the circular portrait for a subtle depth effect on desktop */}
              <Tilt3D max={4} className="mx-auto w-full max-w-[335px] md:max-w-[551px]">
                <div className="relative aspect-square h-auto w-full overflow-hidden rounded-full border-4 border-white/80 shadow-md">
                  <SafeImage
                    src={settings.about_image_url || "/assets/figma/about-musician.png"}
                    alt={t("aboutImageAlt")}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 551px"
                    className="object-cover object-center"
                  />
                </div>
              </Tilt3D>
            </ScrollReveal>
          </div>
          <div className="order-2 flex min-w-0 w-full max-w-[324px] flex-col items-start gap-6 text-start md:order-1 md:w-auto md:max-w-none md:gap-7 lg:gap-8">
            <ScrollReveal variant="up" className="w-full flex flex-col items-start gap-6 md:gap-7 lg:gap-8">
              <h3 className="font-display text-2xl font-normal leading-snug text-primary-500 sm:text-3xl lg:text-[48px] lg:leading-tight">
                {settings.about_headline}
              </h3>

              {/* Animated stats row — counts up when scrolled into view */}
              <div className="motion-stats-row">
                <div className="motion-stat-item">
                  <span className="text-2xl font-bold text-brand-primary lg:text-4xl">
                    <NumberCounter target={300} suffix="+" duration={1.6} />
                  </span>
                  <span className="text-xs font-medium text-gradscale-400 lg:text-sm">{t("statArtists")}</span>
                </div>
                <div className="motion-stat-item">
                  <span className="text-2xl font-bold text-brand-primary lg:text-4xl">
                    <NumberCounter target={50} suffix="+" duration={1.4} />
                  </span>
                  <span className="text-xs font-medium text-gradscale-400 lg:text-sm">{t("statEvents")}</span>
                </div>
                <div className="motion-stat-item">
                  <span className="text-2xl font-bold text-brand-primary lg:text-4xl">
                    <NumberCounter target={12} duration={1.2} />
                  </span>
                  <span className="text-xs font-medium text-gradscale-400 lg:text-sm">{t("statCountries")}</span>
                </div>
              </div>

              <p className="max-w-prose text-base font-medium leading-relaxed text-[#1b1b1b] sm:text-lg lg:text-[25px] lg:leading-relaxed">
                {settings.about_body}
              </p>
              {/* The one playable copy of the hero video on this page: the band
                  above it now paints the same link only as a muted backdrop, so
                  the visitor is not offered the same video twice on one screen. */}
              <YouTubeEmbed
                url={settings.hero_video_url}
                title={t("videoTitle")}
                className="w-full rounded-2xl shadow-lg"
              />
              <Link
                href={settings.home_about_href || "/artists"}
                className="inline-flex min-h-11 w-full max-w-[207px] items-center justify-center rounded-xl bg-primary-500 px-5 text-center font-system text-base font-bold text-primary-50 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                {ctaLabel || t("aboutCta")}
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
