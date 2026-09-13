import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Global Public Footer
 * Verified against Figma Node 94:18289 / 91:18221:
 * - Canvas: max width 1454px, canonical desktop height 385px
 * - Background: #2B1D14 + arabesque texture (ref da60c98546b43a3524b1bbd7667d8f518e1c7ee3)
 * - Container padding 64px 24px 32px; inner content block 736x190
 * - 4 columns, RTL reading order: brand · استكشف · تواصل · booking CTA
 * - Bottom bar: motto (Cairo SemiBold 9.92px / 0.14em / uppercase) + copyright
 *
 * Figma carries NO partner/patron marquee and NO social icon buttons here — contact
 * is a single plain text line. Both were removed as unverified inventions.
 */
export function Footer() {
  const t = useTranslations("footer");
  const a11y = useTranslations("a11y");

  return (
    <footer
      className="w-full bg-[#2B1D14] bg-brand-espresso text-brand-tint relative overflow-hidden"
      role="contentinfo"
    >
      {/* Arabesque corner mark. The design draws it once at the top-left at 6.39%
          x 14.14% of a 1454-wide footer that starts 14px off the artboard, not as
          a repeating field over the whole surface. Cropped 1:1 out of the
          reference render, so it carries its own espresso ground. */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-[14.14%] w-[79px] bg-[url('/assets/branding/footer-mark.png')] bg-contain bg-no-repeat"
        aria-hidden="true"
        data-texture-ref="da60c98546b43a3524b1bbd7667d8f518e1c7ee3"
      />

      {/* Outer container (Figma Node 87:14546 — padding 64px 24px 32px, max 1454px).
          The mobile instance 140:14746 is a different rhythm, not a reflow of the
          desktop one: 390x882 bottom-anchored, opening on 21px of padding and
          closing on 26.333. Its bottom bar is the only block that lands on the
          24px side padding (x=24 w=342), which is what confirms px-6 for both. */}
      <div className="relative z-10 mx-auto w-full max-w-[1454px] px-6 pb-[26.333px] pt-[21px] lg:pb-8 lg:pt-16 lg:[transform:translateX(-7px)]">
        {/* max-w-desktop is --container-desktop (1280px), confirmed by this very
            node: the footer instance is 1454 wide and its inner Container is 1280. */}
        <div className="mx-auto w-full max-w-desktop">
          {/* Content block 87:14547 is 736x190 and its four columns are placed at
              absolute offsets inside it — two of them overhanging it, at -193 and
              at 594+297 — so the row is neither an even grid nor centred.
              On mobile the same four blocks are a column, each with its own width
              and its own inset from the inline start (right, in Arabic): brand
              345 at 1, explore and contact 156 at 12, booking 321 at 25. Those
              insets are smaller than the footer's own 24px padding, so the column
              has to span the full 390 — hence -mx-6 here and ms-* per block. */}
          <div className="-mx-6 flex flex-col items-start text-start lg:relative lg:mx-auto lg:block lg:h-[190px] lg:w-[736px]">
            {/* Column 1: Brand & Mission (Figma Node 87:14548; mobile 136:7852,
                345x179.5 at y=21, everything flush to the inline start). */}
            <div className="ms-px mb-[46.5px] flex w-[345px] flex-col items-start text-start lg:absolute lg:left-[594px] lg:top-0 lg:mb-0 lg:ms-0 lg:w-[297px] lg:max-w-none lg:items-center lg:text-center">
              <Image
                src="/assets/branding/logo-footer.png"
                alt={a11y("brandHome")}
                width={211}
                height={86}
                className="h-[85px] w-auto object-contain"
              />

              {/* 136:7854 is 230 wide on mobile against 206 on desktop; both hold
                  the mission to the two 19.5px lines the design draws. */}
              <p className="text-[13px] leading-[1.5] text-primary-50 font-normal pt-4 max-w-[230px] lg:max-w-[206px]">
                {t("mission")}
              </p>

              <p className="text-[13px] font-bold text-brand-primary pt-5">
                {t("motto")}
              </p>
            </div>

            {/* Column 2: Explore Navigation (Figma Node 87:14554; mobile 136:7819,
                156x190 at y=247, its own text centred inside that width). The 190
                is taller than the 152.4 the heading and links occupy: the design
                fixes the box and the slack below it is what separates this column
                from the contact one, which starts flush at 437. */}
            <div className="ms-3 flex h-[190px] w-[156px] flex-col items-center text-center lg:absolute lg:left-[290px] lg:top-0 lg:ms-0 lg:h-auto lg:w-[156px]">
              <h4 className="text-[13px] font-bold leading-[20px] text-brand-primary">{t("exploreHeading")}</h4>
              <nav className="flex flex-col items-center pt-5 gap-[10.8px]" aria-label={a11y("exploreLinks")}>
                {([
                  { href: "/artists", key: "exploreArtists" },
                  { href: "/events", key: "exploreEvents" },
                  { href: "/news", key: "exploreNews" },
                  { href: "/academy", key: "exploreAcademy" },
                ] as const).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-[13px] font-medium leading-[20px] text-primary-50 hover:text-brand-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs"
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Column 3: Contact & Presence (Figma Node 87:14565; mobile 136:7830,
                156x137 at y=437 — flush under the explore column, no gap). */}
            <div className="ms-3 mb-[29px] flex h-[137px] w-[156px] flex-col items-center text-center lg:absolute lg:left-[90px] lg:top-0 lg:mb-0 lg:ms-0 lg:h-auto lg:w-[156px]">
              <h4 className="text-[13px] font-bold leading-[20px] text-brand-primary">{t("contactHeading")}</h4>
              <div className="flex flex-col items-center pt-5 gap-2 text-[13px] font-medium leading-[20px] text-primary-50">
                <a
                  href={`mailto:${t("contactEmail")}`}
                  dir="ltr"
                  className="hover:text-brand-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs"
                >
                  <bdi>{t("contactEmail")}</bdi>
                </a>
                <span>{t("contactSocial")}</span>
                <span>{t("contactRegions")}</span>
              </div>
            </div>

            {/* Column 4: Booking Pitch & CTA (Figma Node 87:14574 — 235px; mobile
                136:7839, 321x190 at y=603). The 213 heading cap is the same in
                both instances, but the body runs to 308 on mobile against 201 on
                desktop — two lines either way. */}
            <div className="ms-[25px] flex h-[190px] w-[321px] flex-col lg:absolute lg:left-[-193px] lg:top-0 lg:ms-0 lg:h-auto lg:w-[235px] lg:max-w-none">
              <h4 className="text-base font-bold text-[#ECE6D0] max-w-[213px]">
                {t("bookingHeading")}
              </h4>
              <p className="text-[13px] font-medium leading-[1.5] text-primary-50 pt-2.5 pb-6 max-w-[308px] lg:max-w-[201px]">
                {t("bookingBody")}
              </p>
              <Link
                href="/booking"
                className="inline-flex items-center justify-center w-[150px] h-12 rounded-[12px] bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-pressed text-[#ECE6D0] text-base font-bold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-espresso"
              >
                {t("bookingCta")}
              </Link>
            </div>
          </div>

          {/* Bottom Bar (Figma Node 87:14584 — 0.667px rule, 24px top padding) */}
          {/* Bottom bar 87:14584. The strapline is drawn on the physical left and
              the copyright on the right, which in Arabic is the reverse of source
              order — hence flex-row-reverse rather than a swapped DOM.
              The mobile instance 136:7847 is the same single 342x42.667 row, not a
              stack: 125 and 205 wide with 12 between them, both sitting on the
              row's bottom edge. So the row is unconditional, and it opens 20px
              under the booking column rather than the desktop 56. */}
          <div className="mt-5 flex flex-row-reverse items-end justify-between gap-3 border-t-[0.667px] border-[rgba(236,230,208,0.15)] pt-6 text-primary-50 lg:mt-14">
            <span className="text-[9.92px] font-semibold uppercase leading-[14.88px] tracking-[0.14em]">
              {t("strapline")}
            </span>
            <span className="text-[12px] font-normal leading-[18px]">
              {t("copyright")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
