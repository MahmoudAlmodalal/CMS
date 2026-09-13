import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Highlight } from "@/components/ui/Highlight";
import type { SiteSettings } from "@/lib/dal/site-settings";

interface AboutSectionProps {
  settings: SiteSettings;
  /** Admin override for the CTA label. Falls back to built-in copy. */
  ctaLabel?: string;
}

/**
 * من نحن — Figma Component 9 (node 112:850), a 1426x879 instance at x=14, y=718
 * of الرئيسية. Nothing in it is laid out in flow: every child is placed against the
 * artboard, so the band reproduces those coordinates at lg and falls back to a
 * stack below it.
 *
 *   dot mark       left -24, top 163, 122.702 x 111.557   (I112:850;112:627)
 *   blob portrait  left  -2, top 240, 551 x 491           (I112:850;112:624)
 *   من نحن          left  92, top 214, 1251 wide, centred  (I112:850;112:625)
 *   text column    left 923, top 265, 495 wide            (I112:850;112:619)
 *   dot mark       left 1357, top 741, same size          (I112:850;112:732)
 *
 * The column stacks 32px apart: the statement in Qahwa Arabic 48/66 espresso, the
 * manifesto in Cairo Medium 25/37.5 gradscale-900 over seven lines (7 x 37.5 = 263),
 * and a 207x48 12px-rounded primary button at 1376 whose label the design sets in
 * SF Pro Bold 16/22.4 — a baked-in fallback in the file itself, so the system stack
 * is what gets asked for, as on the الرئيسية booking CTA. Everything is aligned to
 * the column's inline start, which is its right edge at 1418.
 *
 * DEVIATION — the band is drawn at half strength. Component 9 is a button instance
 * left in its disabled state, and the frame renders the whole of it through one
 * opacity of 0.5. Sampling the render confirms it on every colour in the band:
 * #C54716 lands on (223,159,131), #000000 on (124,123,120), #1B1B1B on
 * (138,137,134) and #2B1D14 on (146,138,130), each exactly 0.5 over the #F9F7F0
 * ground. It is reproduced here because it is what the design draws, but it reads
 * as a slip rather than an intention: it puts the site's own manifesto copy at
 * about 2.4:1 against its ground, which fails WCAG AA, and it fades the CTA and its
 * focus ring with it. The الرئيسية mobile frame (136:5854) settles it — that frame
 * draws the same band at full strength, carrying no half-strength #C54716 anywhere
 * down its 6528px — so the opacity is scoped to lg, where the frame that has it
 * applies. Dropping BAND_OPACITY restores full strength there too.
 *
 * The portrait is an organic blob mask, so the asset carries the band's own ground
 * in its corners rather than transparency (see scripts/extract-reference-assets.py)
 * — it is cut for this band's #F9F7F0 and should not be reused on another ground.
 * A photograph swapped in through site settings will render as a plain rectangle,
 * since the mask lives in the asset and not in CSS.
 *
 * The 390 frame (136:5854) stacks the same band in flow, 740..1741: 48 to من نحن
 * at the same 61/91.5, 30 to a 335x304 portrait, 30 to the 324-wide column
 * (136:7443), 56 to close — 1001 in all. That column keeps the 32px gap the 1440
 * one has and re-sets only its type: the statement is Qahwa 32/66 and the manifesto
 * Cairo Medium 16/37.5, which is the same seven lines and so the same 263 box.
 * Figma draws the column with every child rotated 180 inside a rotated parent —
 * the file's own RTL flip — so its DOM order there runs button, body, heading; the
 * visual order is the one reproduced here.
 */
const BAND_OPACITY = "";

const ORNAMENT = { src: "/assets/branding/ornament.svg", width: 123, height: 112 };

export function AboutSection({ settings, ctaLabel }: AboutSectionProps) {
  const t = useTranslations("home");

  return (
    <section className="relative w-full overflow-hidden bg-brand-cream pb-[56px] pt-[48px] lg:h-[879px] lg:py-0">
      {/* Centering wrapper: keeps the 1440px artboard centered on ultra-wide screens */}
      <div className="relative mx-auto size-full max-w-[1440px] lg:h-[879px]">
      <div className={`relative size-full ${BAND_OPACITY}`}>
        {/* Decorative corner ornament - start/left */}
        <Image
          {...ORNAMENT}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -left-[24px] top-[163px] hidden h-[111.557px] w-[122.702px] max-w-none lg:block"
        />

        {/* Decorative corner ornament - end/right */}
        <Image
          {...ORNAMENT}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-[20px] top-[720px] hidden h-[111.556px] w-[122.702px] max-w-none lg:block"
        />

        <div className="mx-auto flex h-full max-w-[1440px] flex-col px-4 sm:px-6 lg:px-12 lg:pt-[40px]">
          {/* من نحن — Heading centered */}
          <div className="w-full text-center">
            <h2 className="text-center text-[61px] font-bold leading-[91.5px] text-black">
              <Highlight text={settings.home_about_heading || t("aboutHeading")} highlightClassName="text-primary-500" />
            </h2>
          </div>

          {/* Main content row: In RTL with flex-row, first child (Image) is on the RIGHT, second child (Text) is on the LEFT */}
          <div className="mt-8 flex flex-col items-center justify-between gap-8 lg:mt-[24px] lg:flex-row lg:items-center lg:gap-12">
            {/* Blob portrait — on mobile appears below heading; on desktop placed on the right in RTL */}
            <div className="flex w-full justify-center lg:w-auto lg:justify-end">
              <div className="w-[335px] max-w-full overflow-hidden lg:w-auto">
                <Image
                  src={settings.about_image_url || "/assets/figma/about-musician.png"}
                  alt={t("aboutImageAlt")}
                  width={551}
                  height={491}
                  quality={95}
                  className="h-[304px] w-[335px] object-cover sm:h-auto sm:max-w-[450px] lg:h-[491px] lg:w-[551px]"
                />
              </div>
            </div>

            {/* Text column — on desktop placed on the LEFT in RTL */}
            <div className="flex w-[324px] flex-col items-start gap-[32px] max-w-full text-start lg:w-[495px]">
              {/* Statement */}
              <h3 className="min-h-[66px] font-display text-[32px] font-normal leading-[66px] text-brand-espresso sm:whitespace-nowrap lg:text-[48px]">
                {settings.about_headline}
              </h3>

              {/* Manifesto */}
              <p className="min-h-[263px] font-medium leading-[37.5px] text-[16px] text-gradscale-900 lg:w-full lg:text-[25px]">
                {settings.about_body}
              </p>

              {/* CTA */}
              <Link
                href={settings.home_about_href || "/artists"}
                className="inline-flex h-[48px] w-[207px] items-center justify-center rounded-[12px] bg-primary-500 font-system text-[16px] font-bold leading-[22.4px] text-primary-50 transition-colors hover:bg-brand-primary-hover active:bg-brand-primary-pressed focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                {ctaLabel || t("aboutCta")}
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
