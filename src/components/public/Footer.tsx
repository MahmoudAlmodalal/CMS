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

      {/* Outer container (Figma Node 87:14546 — padding 64px 24px 32px, max 1454px) */}
      <div className="relative z-10 mx-auto w-full max-w-[1454px] px-6 pb-8 pt-16 lg:[transform:translateX(-7px)]">
        <div className="mx-auto w-full max-w-[1280px]">
          {/* Content block 87:14547 is 736x190 and its four columns are placed at
              absolute offsets inside it — two of them overhanging it, at -193 and
              at 594+297 — so the row is neither an even grid nor centred. Below
              lg it falls back to a plain stack. */}
          <div className="grid grid-cols-1 gap-10 text-start md:grid-cols-2 lg:relative lg:mx-auto lg:block lg:h-[190px] lg:w-[736px] lg:gap-0">
            {/* Column 1: Brand & Mission (Figma Node 87:14548) */}
            <div className="flex flex-col items-center text-center lg:absolute lg:left-[594px] lg:top-0 lg:w-[297px] lg:max-w-none">
              <Image
                src="/assets/branding/logo-footer.png"
                alt={a11y("brandHome")}
                width={211}
                height={86}
                className="h-[85px] w-auto object-contain"
              />

              <p className="text-[13px] leading-[1.5] text-primary-50 font-normal pt-4 max-w-[206px]">
                {t("mission")}
              </p>

              <p className="text-[13px] font-bold text-brand-primary pt-5">
                {t("motto")}
              </p>
            </div>

            {/* Column 2: Explore Navigation (Figma Node 87:14554) */}
            <div className="flex flex-col items-center text-center lg:absolute lg:left-[290px] lg:top-0 lg:w-[156px]">
              <h4 className="text-[13px] font-bold text-brand-primary">{t("exploreHeading")}</h4>
              <nav className="flex flex-col items-center pt-5 gap-[9px]" aria-label={a11y("exploreLinks")}>
                {([
                  { href: "/artists", key: "exploreArtists" },
                  { href: "/events", key: "exploreEvents" },
                  { href: "/news", key: "exploreNews" },
                  { href: "/academy", key: "exploreAcademy" },
                ] as const).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-[13px] font-medium text-primary-50 hover:text-brand-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs"
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Column 3: Contact & Presence (Figma Node 87:14565) */}
            <div className="flex flex-col items-center text-center lg:absolute lg:left-[90px] lg:top-0 lg:w-[156px]">
              <h4 className="text-[13px] font-bold text-brand-primary">{t("contactHeading")}</h4>
              <div className="flex flex-col items-center pt-5 gap-2 text-[13px] font-medium text-primary-50">
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

            {/* Column 4: Booking Pitch & CTA (Figma Node 87:14574 — 235px) */}
            <div className="flex flex-col lg:absolute lg:left-[-193px] lg:top-0 lg:w-[235px] lg:max-w-none">
              <h4 className="text-base font-bold text-[#ECE6D0] max-w-[213px]">
                {t("bookingHeading")}
              </h4>
              <p className="text-[13px] font-medium leading-[1.5] text-primary-50 pt-2.5 pb-6 max-w-[201px]">
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
              order — hence flex-row-reverse rather than a swapped DOM. */}
          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t-[0.667px] border-[rgba(236,230,208,0.15)] pt-6 text-primary-50 sm:flex-row-reverse">
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
