import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Highlight } from "@/components/ui/Highlight";
import type { SiteSettings } from "@/lib/dal/site-settings";
import { SafeImage } from "@/components/ui/SafeImage";
import { ScrollReveal } from "./ScrollReveal";
import { StrokeUnderline } from "./motion/StrokeUnderline";

import { TurntablePlayer } from "@/components/ui/TurntablePlayer";
import type { Track } from "@/lib/dal/tracks";
import { parseYouTubeId, youTubeThumbnailUrl } from "@/lib/youtube";

interface AboutSectionProps {
  settings: SiteSettings;
  ctaLabel?: string;
  audioUrl?: string;
  featuredTrack?: (Track & { artist_name?: string | null }) | null;
}

export function AboutSection({ settings, ctaLabel, audioUrl, featuredTrack }: AboutSectionProps) {
  const t = useTranslations("home");
  const videoId = parseYouTubeId(featuredTrack?.youtube_url);
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
          <div className="order-1 min-w-0 md:order-2 w-full">
            <ScrollReveal variant="image">
              <div className="relative mx-auto aspect-square w-full max-w-[335px] overflow-hidden rounded-full border-4 border-white/80 shadow-xl md:max-w-[480px]">
                <TurntablePlayer
                  initialTrack={{
                    title: featuredTrack?.title || t("aboutMusicEmpty"),
                    artist: featuredTrack?.artist_name || t("aboutMusicArtist"),
                    coverUrl: featuredTrack?.cover_image_url || (videoId ? youTubeThumbnailUrl(videoId) : "/assets/figma/about-musician.png"),
                    synthMode: "andalusia",
                  }}
                  audioUrl={featuredTrack ? undefined : audioUrl || (settings as unknown as { about_audio_url?: string }).about_audio_url}
                  youtubeUrl={featuredTrack?.youtube_url}
                  className="absolute inset-0"
                />
              </div>
            </ScrollReveal>
          </div>
          <div className="order-2 flex min-w-0 w-full max-w-[324px] flex-col items-start gap-6 text-start md:order-1 md:w-auto md:max-w-none md:gap-7 lg:gap-8">
            <ScrollReveal variant="up" className="w-full flex flex-col items-start gap-6 md:gap-7 lg:gap-8">
              <h3 className="font-display text-2xl font-normal leading-snug text-primary-500 sm:text-3xl lg:text-[48px] lg:leading-tight">
                {settings.about_headline}
              </h3>

              <p className="max-w-prose text-base font-medium leading-relaxed text-[#1b1b1b] sm:text-lg lg:text-[25px] lg:leading-relaxed">
                {settings.about_body}
              </p>
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
