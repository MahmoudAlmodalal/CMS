import React from "react";

interface PageHeroProps {
  /** Centred headline. Pass rich content to colour a phrase, as the design does. */
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: React.ReactNode;
  image?: string;
  /** Band height on desktop, straight off the frame. */
  height?: number;
  /**
   * Band height on the 390 frame, straight off it. The mobile frames each set their
   * own — الفنانين draws 678 — so this has no shared value to fall back on. The 430
   * default is the invented figure the component carried before any 390 frame was
   * measured, and is what the frames that have not been built yet still render.
   */
  mobileHeight?: number;
  /** Distance from the band's top to the first row of the block, off the frame. */
  contentTop?: number;
  /** Headline size and line box on desktop; the frames do not agree on these. */
  titleSize?: number;
  titleLeading?: number;
  /** Colour of the headline's uncoloured run. الفعاليات sets primary-50, not secondary-400. */
  titleTone?: string;
}

/**
 * Full-bleed page hero, the shape every interior frame opens on.
 *
 * Measured on الحجز (91:17109) and الأكاديمية (91:16119):
 * - The band starts at y=0 with the floating navbar over it, and is a photograph
 *   under a dark scrim. Nothing is inset for the navbar.
 * - One centred block: an optional pill (91:16432 — 8px backdrop blur on 10% white
 *   inside a 0.833px 20% white hairline, a primary-500 ♪ then the label in Cairo
 *   Medium 14/20), 20.33px of air, the headline in Qahwa Arabic with one phrase in
 *   primary-500 and the rest in secondary-400, then the standfirst in Cairo 25/37.5
 *   secondary-400 over at most 693px, 24px below it.
 * - The frame gives the block's offset from the top of the band, not from its
 *   centre — the block is not vertically centred — so callers pass `contentTop`.
 * - الحجز sets the headline 48/91.5, الأكاديمية 72/90 and الفعاليات 64/91.5, so
 *   both are props, as is the tone of the run the design leaves uncoloured.
 *
 * The scrim is an SVG in the design (91:17111, 91:16331) and the photograph is a
 * licensed fill; neither can be exported from here, so the scrim is a CSS
 * approximation and the photograph is whatever the caller supplies. Both are
 * recorded in docs/figma/asset-map.json.
 */
export function PageHero({
  title,
  subtitle,
  eyebrow,
  image = "/assets/figma/hero-stage-landscape.png",
  height = 611,
  mobileHeight = 430,
  contentTop = 247,
  titleSize = 48,
  titleLeading = 91.5,
  titleTone = "text-secondary-400",
}: PageHeroProps) {
  return (
    <section
      // The 500 that used to sit at sm: was invented — Figma has no tablet frame —
      // so the band holds its measured 390 height until the 1440 one takes over,
      // rather than passing through a figure no frame declares.
      className="relative isolate h-[var(--hero-mobile-height)] w-full overflow-hidden bg-brand-espresso text-white lg:h-[var(--hero-height)]"
      style={
        {
          "--hero-height": `${height}px`,
          "--hero-mobile-height": `${mobileHeight}px`,
          "--hero-content-top": `${contentTop}px`,
          "--hero-title-size": `${titleSize}px`,
          "--hero-title-leading": `${titleLeading}px`,
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,17,.52),rgba(43,29,20,.94))]"
      />

      {/* The 390 frames carry their headline block off-canvas (الفنانين puts it at
          x=376 on a 390 artboard), so the mobile offset of this block is not
          measurable from them and keeps the bottom anchor it already had. */}
      <div className="absolute inset-x-0 bottom-10 flex flex-col items-center px-5 text-center lg:bottom-auto lg:top-[var(--hero-content-top)]">
        {eyebrow ? (
          <span className="inline-flex items-center gap-2 rounded-full border-[0.833px] border-white/20 bg-white/10 px-5 py-2 backdrop-blur-[8px]">
            <span aria-hidden="true" className="text-[16px] leading-[24px] text-brand-primary">
              ♪
            </span>
            <span className="text-[14px] font-medium leading-[20px] text-secondary-400">
              {eyebrow}
            </span>
          </span>
        ) : null}

        <h1
          className={`max-w-[924px] font-display text-[32px] leading-tight ${titleTone} sm:text-[40px] lg:text-[length:var(--hero-title-size)] lg:leading-[var(--hero-title-leading)] ${
            eyebrow ? "mt-5 lg:mt-[20.33px]" : ""
          }`}
        >
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-6 max-w-[693px] text-base leading-[28px] text-secondary-400 sm:text-lg lg:text-[25px] lg:leading-[37.5px]">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default PageHero;
