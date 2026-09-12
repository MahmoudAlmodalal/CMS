import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Highlight } from "@/components/ui/Highlight";
import type { SiteSettings } from "@/lib/dal/site-settings";

interface AboutSectionProps {
  settings: SiteSettings;
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
 */
const BAND_OPACITY = "lg:opacity-50";

const ORNAMENT = { src: "/assets/branding/ornament.svg", width: 123, height: 112 };

export function AboutSection({ settings }: AboutSectionProps) {
  const t = useTranslations("home");

  return (
    <section className="relative w-full overflow-hidden bg-brand-cream py-16 lg:h-[879px] lg:py-0">
      <div className={`relative size-full ${BAND_OPACITY}`}>
        {/* Dot mark I112:850;112:627 — hangs 24px off the artboard. */}
        <Image
          {...ORNAMENT}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -left-[24px] top-[163px] hidden h-[111.557px] w-[122.702px] max-w-none lg:block"
        />

        {/* من نحن — I112:850;112:625, centred over a 1251px box, 61/91.5 Cairo Bold. */}
        <div className="px-5 lg:absolute lg:left-[92px] lg:right-[97px] lg:top-[214px] lg:px-0">
          <h2 className="text-center text-[34px] font-bold leading-[51px] text-black sm:text-[48px] sm:leading-[72px] lg:text-[61px] lg:leading-[91.5px]">
            <Highlight text={t("aboutHeading")} highlightClassName="text-primary-500" />
          </h2>
        </div>

        {/* Blob portrait I112:850;112:624 — hangs 2px off the artboard. */}
        <div className="mt-10 flex justify-center px-5 lg:absolute lg:-left-[2px] lg:top-[240px] lg:mt-0 lg:block lg:px-0">
          <Image
            src={settings.about_image_url || "/assets/figma/about-musician.png"}
            alt={t("aboutImageAlt")}
            width={551}
            height={491}
            quality={95}
            className="h-auto w-full max-w-[551px] lg:h-[491px] lg:w-[551px] lg:max-w-none"
          />
        </div>

        {/* Text column I112:850;112:619 — 495 wide, three blocks 32px apart. */}
        <div className="mt-10 flex flex-col items-start gap-[32px] px-5 text-start lg:absolute lg:left-[923px] lg:top-[265px] lg:mt-0 lg:w-[495px] lg:px-0">
          {/* Statement I112:850;112:623 */}
          <h3 className="font-display text-[32px] leading-tight text-brand-espresso sm:text-[40px] lg:h-[66px] lg:whitespace-nowrap lg:text-[48px] lg:leading-[66px]">
            {settings.about_headline}
          </h3>

          {/* Manifesto I112:850;112:621 */}
          <p className="text-[18px] leading-[30px] text-gradscale-900 sm:text-[21px] lg:h-[263px] lg:w-full lg:text-[25px] lg:leading-[37.5px]">
            {settings.about_body}
          </p>

          {/* CTA I112:850;112:620 */}
          <Link
            href="/artists"
            className="inline-flex h-[48px] w-[207px] items-center justify-center rounded-[12px] bg-primary-500 font-system text-[16px] font-bold leading-[22.4px] text-primary-50 transition-colors hover:bg-brand-primary-hover active:bg-brand-primary-pressed focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            {t("aboutCta")}
          </Link>
        </div>

        {/* Dot mark I112:850;112:732 — overflows the artboard by 39.7px. */}
        <Image
          {...ORNAMENT}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-[1357px] top-[741px] hidden h-[111.556px] w-[122.702px] max-w-none lg:block"
        />
      </div>
    </section>
  );
}
