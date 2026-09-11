import React from "react";
import { useTranslations } from "next-intl";

export interface ValuePropItem {
  id: string;
  /** Key under the `academy` message namespace. */
  titleKey: string;
  descriptionKey: string;
  /** Paragraph width the design gives this column, in px. */
  bodyWidth: number;
}

/**
 * The three pillars of node 91:16354, in reading order — the design's grid places
 * them col-3, col-2, col-1, which right to left is this order.
 */
export const CANONICAL_VALUE_PROPS: ValuePropItem[] = [
  { id: "small-groups", titleKey: "value1Title", descriptionKey: "value1Body", bodyWidth: 260 },
  { id: "active-artists", titleKey: "value2Title", descriptionKey: "value2Body", bodyWidth: 259 },
  { id: "live-performance", titleKey: "value3Title", descriptionKey: "value3Body", bodyWidth: 265 },
];

/**
 * Academy value propositions — Figma node 91:16348 in frame 91:16119.
 *
 * A full-bleed #2B1D14 band 443.3 tall, 96px of padding top and bottom, carrying
 * the arabesque corner mark once at the top-left at 6.39% x 12.4% — the same mark
 * the footer draws, cropped for this band's height.
 *
 * Everything inside is centred: the heading (91:16352) in Qahwa Arabic 40/48
 * #F9EDE8, then 56px down a 888-wide grid of three 270.44 columns 40px apart. Each
 * column is a ♪ in Cairo 28/42 primary-500, the pillar in Cairo Bold 16.8/25.2
 * #ECE6D0 16px under it, and the body in Cairo 14.08/26.048 at 70% #ECE6D0 a
 * further 12px down, held to the width the design gives that column.
 *
 * The design draws no kicker, no standfirst, no cards and no numerals here.
 */
export function AcademyValueProps() {
  const t = useTranslations("academy");

  return (
    <section
      aria-labelledby="academy-values-heading"
      className="relative isolate w-full overflow-hidden bg-brand-espresso px-6 py-16 lg:py-24"
    >
      <div
        aria-hidden="true"
        data-texture-ref="da60c98546b43a3524b1bbd7667d8f518e1c7ee3"
        className="pointer-events-none absolute left-0 top-0 h-[12.4%] w-[92px] bg-[url('/assets/branding/band-mark.png')] bg-contain bg-no-repeat"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col items-center lg:w-[916px]">
        <h2
          id="academy-values-heading"
          className="text-center font-display text-[32px] leading-[1.2] text-brand-tint sm:text-[40px] lg:whitespace-nowrap lg:leading-[48px]"
        >
          {t("valuesHeading")}
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 lg:mt-14 lg:w-[888px] lg:grid-cols-[270.44px_270.45px_270.44px]">
          {CANONICAL_VALUE_PROPS.map((prop) => (
            <div key={prop.id} className="flex flex-col items-center text-center">
              <span aria-hidden="true" className="text-[28px] leading-[42px] text-brand-primary">
                ♪
              </span>

              <h3 className="pt-4 text-[16.8px] font-bold leading-[25.2px] text-brand-surface">
                {t(prop.titleKey)}
              </h3>

              <p
                className="pt-3 text-[14.08px] leading-[26.048px] text-[rgba(236,230,208,0.7)]"
                style={{ maxWidth: `${prop.bodyWidth}px` }}
              >
                {t(prop.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
