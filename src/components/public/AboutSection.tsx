import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Highlight } from "@/components/ui/Highlight";
import type { SiteSettings } from "@/lib/dal/site-settings";

interface AboutSectionProps {
  settings: SiteSettings;
  ctaLabel?: string;
}

export function AboutSection({ settings, ctaLabel }: AboutSectionProps) {
  const t = useTranslations("home");
  return (
    <section className="relative w-full bg-brand-cream py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
        <h2 className="text-center font-sans text-[clamp(2rem,5vw,3.8125rem)] font-bold leading-tight text-black">
          <Highlight
            text={settings.home_about_heading || t("aboutHeading")}
            highlightClassName="text-primary-500"
          />
        </h2>
        <div className="mt-8 grid min-w-0 grid-cols-1 items-center gap-8 sm:mt-10 md:grid-cols-2 md:gap-10 lg:mt-12 xl:gap-16">
          <div className="order-1 min-w-0 md:order-2">
            <Image
              src={settings.about_image_url || "/assets/figma/about-musician.png"}
              alt={t("aboutImageAlt")}
              width={551}
              height={491}
              sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 551px"
              className="mx-auto h-auto w-full max-w-[551px] object-cover"
            />
          </div>
          <div className="order-2 flex min-w-0 flex-col items-start gap-6 text-start md:order-1 md:gap-7 lg:gap-8">
            <h3 className="font-display text-[clamp(1.75rem,4vw,3rem)] font-normal leading-tight text-primary-500">
              {settings.about_headline}
            </h3>
            <p className="max-w-prose text-[clamp(1rem,1.8vw,1.5625rem)] font-medium leading-relaxed text-[#1b1b1b]">
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
