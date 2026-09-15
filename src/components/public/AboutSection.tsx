import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Highlight } from "@/components/ui/Highlight";
import type { SiteSettings } from "@/lib/dal/site-settings";
import { SafeImage } from "@/components/ui/SafeImage";

interface AboutSectionProps {
  settings: SiteSettings;
  ctaLabel?: string;
}

export function AboutSection({ settings, ctaLabel }: AboutSectionProps) {
  const t = useTranslations("home");
  return (
    <section className="relative w-full bg-[#F9F7F0] py-12 sm:py-16 md:py-20 lg:min-h-[879px] lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
        {/* Kicker copy: من نحن */}
        <h2 className="text-center font-sans text-[36px] font-bold leading-[1.2] text-black sm:text-[48px] sm:leading-[1.3] lg:text-[61px] lg:leading-[91.5px]">
          <Highlight
            text={settings.home_about_heading || t("aboutHeading")}
            highlightClassName="text-primary-500"
          />
        </h2>
        <div className="mt-8 grid min-w-0 grid-cols-1 items-center gap-8 sm:mt-10 md:grid-cols-2 md:gap-10 lg:mt-12 xl:gap-16">
          <div className="order-1 min-w-0 md:order-2">
            <div className="relative mx-auto aspect-square h-auto w-full max-w-[335px] overflow-hidden rounded-full md:max-w-[551px]">
              <SafeImage
                src={settings.about_image_url || "/assets/figma/about-musician.png"}
                alt={t("aboutImageAlt")}
                fill
                sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 551px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="order-2 flex min-w-0 w-full max-w-[324px] flex-col items-start gap-6 text-start md:order-1 md:w-auto md:max-w-none md:gap-7 lg:gap-8">
            <h3 className="font-display text-4xl font-normal leading-tight text-primary-500 lg:text-[48px] lg:leading-tight">
              {settings.about_headline}
            </h3>
            <p className="max-w-prose font-medium leading-[37.5px] text-[16px] text-[#1b1b1b] lg:text-[25px] lg:leading-relaxed">
              {settings.about_body}
            </p>
            <Link
              href={settings.home_about_href || "/artists"}
              className="inline-flex min-h-11 w-full max-w-[207px] items-center justify-center rounded-xl bg-primary-500 px-5 text-center font-system text-base font-bold text-primary-50 transition-colors hover:bg-brand-primary-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              {ctaLabel || t("aboutCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
