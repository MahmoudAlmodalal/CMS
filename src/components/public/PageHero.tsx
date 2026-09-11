import React from "react";

interface PageHeroProps {
  /** Centred headline. Pass rich content to colour a phrase, as the design does. */
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: React.ReactNode;
  image?: string;
  /** Band height on desktop, straight off the frame. */
  height?: number;
  /** Distance from the band's top to the heading block, straight off the frame. */
  contentTop?: number;
}

/**
 * Full-bleed page hero, the shape every interior frame opens on.
 *
 * Measured on الحجز (91:17109) and the same in الأكاديمية, الفنانين and الفعاليات:
 * - The band starts at y=0 with the floating navbar over it, and is a photograph
 *   under a dark scrim. Nothing is inset for the navbar.
 * - One centred block: an optional pill, then the headline in Qahwa Arabic 48 on a
 *   91.5px line with one phrase in primary-500 and the rest at 80% white, then the
 *   standfirst in Cairo 25/37.5 #EFEBD9 over at most 693px, 24px below it.
 * - The frame gives the block's offset from the top of the band, not from its
 *   centre — the block is not vertically centred — so callers pass `contentTop`.
 *
 * The scrim is an SVG in the design (91:17111) and the photograph is a licensed
 * fill; neither can be exported from here, so the scrim is a CSS approximation and
 * the photograph is whatever the caller supplies. Both are recorded in
 * docs/figma/asset-map.json.
 */
export function PageHero({
  title,
  subtitle,
  eyebrow,
  image = "/assets/figma/hero-stage-landscape.png",
  height = 611,
  contentTop = 247,
}: PageHeroProps) {
  return (
    <section
      className="relative isolate h-[430px] w-full overflow-hidden bg-brand-espresso text-white sm:h-[500px] lg:h-[var(--hero-height)]"
      style={
        {
          "--hero-height": `${height}px`,
          "--hero-content-top": `${contentTop}px`,
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

      <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-6 px-5 text-center sm:bottom-16 lg:bottom-auto lg:top-[var(--hero-content-top)]">
        {eyebrow ? (
          <span className="inline-flex rounded-full border border-brand-primary/70 bg-brand-primary/85 px-4 py-1.5 text-xs font-bold tracking-wide text-white">
            {eyebrow}
          </span>
        ) : null}

        <h1 className="max-w-[924px] font-display text-[32px] leading-tight text-white/80 sm:text-[40px] lg:text-[48px] lg:leading-[91.5px]">
          {title}
        </h1>

        {subtitle ? (
          <p className="max-w-[693px] text-base leading-[28px] text-secondary-400 sm:text-lg lg:text-[25px] lg:leading-[37.5px]">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default PageHero;
