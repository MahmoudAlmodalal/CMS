import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { SiteSettings } from "@/lib/dal/site-settings";

/**
 * Two frames draw this band and they are not the same drawing, so the shape is
 * one component with two measured variants.
 *
 * Both are a 1449x498 section hung 5px off the artboard's inline start: a
 * photograph under a flat rgba(43,29,20,0.88) wash, with the arabesque mark at
 * 8% over its top-left corner at 6.39% x 12.05% of the band. Every content block
 * is absolutely placed and none is centred on the artboard — the 1433px columns
 * they sit in put the stack 8.5px left of centre. A start margin of 2d inside a
 * centring flex row moves its content d towards the inline start, which is how
 * each block's own offset is reproduced.
 *
 * - "home" (87:14534, nodes 87:14535-89:15225): the ♪ at 80.2, the headline at
 *   131.2 in Qahwa Arabic 60/60 brand-tint over 636px, the body at 294 in Cairo
 *   16/30.4 brand-tint, and a 207x48 12px-rounded button at 348.4 whose label is
 *   SF Pro Bold 16/22.4 — a baked-in font fallback in the design itself, so the
 *   system stack is what gets asked for.
 * - "artist" (134:4660, nodes 134:4661-134:4670): the ♪ at 57.2, the headline at
 *   177 in Qahwa Arabic 48/49.315 tracked -0.6575 brand-surface and 54px further
 *   left again, the body at 271 in Cairo 16/30.4 at 45% brand-surface, and a
 *   16px-rounded button at 342 padded 40/15.2 with a Cairo Bold 16/24 label.
 *
 * The photograph is a licensed fill that cannot be exported from here; it is
 * recorded in docs/figma/asset-map.json.
 */
export type BookingBannerVariant = "home" | "artist";

interface BookingBannerProps {
  settings?: SiteSettings;
  variant?: BookingBannerVariant;
  /** Overrides the settings copy — الفنان addresses the artist by name. */
  headline?: string;
  body?: string;
  ctaHref?: string;
}

const VARIANTS = {
  home: {
    glyphTop: 80.2,
    headingTop: 155.2,
    headingShift: 17,
    ctaShift: 17,
    heading: "text-[28px] leading-tight text-brand-tint sm:text-[40px] lg:text-[60px] lg:leading-[60px]",
    bodyTop: 294,
    body: "text-brand-tint",
    ctaTop: 348.4,
    cta: "h-[48px] w-[207px] rounded-[12px] font-system leading-[22.4px]",
  },
  artist: {
    glyphTop: 57.2,
    headingTop: 201,
    headingShift: 125,
    ctaShift: 18,
    heading:
      "text-[28px] leading-tight tracking-[-0.6575px] text-brand-surface sm:text-[36px] lg:text-[48px] lg:leading-[49.315px]",
    bodyTop: 271,
    body: "text-brand-surface/45",
    ctaTop: 342,
    cta: "rounded-[16px] px-[40px] py-[15.2px] leading-[24px]",
  },
} as const;

export function BookingBanner({
  settings,
  variant = "home",
  headline,
  body,
  ctaHref = "/booking",
}: BookingBannerProps) {
  const t = useTranslations("home");
  const ev = useTranslations("event");
  const v = VARIANTS[variant];
  const title = headline || settings?.booking_banner_title || t("bookingHeadingFallback");
  const copy = body || settings?.booking_banner_body || t("bookingBodyFallback");

  return (
    <section
      className="relative isolate h-auto w-full overflow-hidden bg-brand-espresso py-14 text-brand-tint lg:h-[498px] lg:py-0"
      aria-label={ev("bookingRegion")}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/assets/branding/concert-stage.png')] bg-cover bg-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[rgba(43,29,20,0.88)]" />
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 h-[12.05%] w-[6.39%] bg-[url('/assets/branding/band-mark.png')] bg-cover bg-no-repeat opacity-[0.08]"
      />

      <div className="relative flex flex-col items-center gap-6 px-5 text-center lg:block lg:gap-0 lg:px-0">
        {/* ♪ — 87:14537 / 134:4663 */}
        <div
          className="lg:absolute lg:inset-x-0 lg:flex lg:justify-center"
          style={{ top: `${v.glyphTop}px` }}
        >
          <p aria-hidden="true" className="text-[44px] leading-[66px] text-primary-500 opacity-70 lg:ms-[17px]">
            ♪
          </p>
        </div>

        {/* Headline — 87:14539 / 134:4665 */}
        <div
          className="lg:absolute lg:inset-x-0 lg:flex lg:justify-center"
          style={{ top: `${v.headingTop}px` }}
        >
          <h2
            className={`max-w-[636px] font-display lg:ms-[var(--shift)] lg:w-[636px] ${v.heading}`}
            style={{ "--shift": `${v.headingShift}px` } as React.CSSProperties}
          >
            {title}
          </h2>
        </div>

        {/* Body — 87:14541 / 134:4667 */}
        <div
          className="lg:absolute lg:inset-x-0 lg:flex lg:justify-center"
          style={{ top: `${v.bodyTop}px` }}
        >
          <p
            className={`max-w-[636px] text-[15px] leading-[26px] lg:ms-[17px] lg:max-w-none lg:text-[16px] lg:leading-[30.4px] ${v.body}`}
          >
            {copy}
          </p>
        </div>

        {/* CTA — 89:15225 / 134:4669 */}
        <div
          className="lg:absolute lg:inset-x-0 lg:flex lg:justify-center"
          style={{ top: `${v.ctaTop}px` }}
        >
          <Link
            href={ctaHref}
            className={`inline-flex items-center justify-center bg-primary-500 text-[16px] font-bold text-brand-surface lg:ms-[var(--shift)] ${v.cta}`}
            style={{ "--shift": `${v.ctaShift}px` } as React.CSSProperties}
          >
            {t("bookingCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default BookingBanner;
