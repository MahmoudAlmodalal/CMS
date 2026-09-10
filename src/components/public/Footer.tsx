import React from "react";
import Image from "next/image";
import Link from "next/link";

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
  return (
    <footer
      className="w-full bg-[#2B1D14] bg-brand-espresso text-brand-tint relative overflow-hidden"
      role="contentinfo"
    >
      {/* Andalusian arabesque texture overlay (Figma ref: da60c98546b43a3524b1bbd7667d8f518e1c7ee3) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-screen bg-repeat bg-[url('/assets/branding/arabesque-texture.png')]"
        aria-hidden="true"
        data-texture-ref="da60c98546b43a3524b1bbd7667d8f518e1c7ee3"
      />

      {/* Outer container (Figma Node 87:14546 — padding 64px 24px 32px, max 1454px) */}
      <div className="w-full max-w-[1454px] mx-auto px-6 pt-16 pb-8 relative z-10 min-h-[385px] flex flex-col justify-center">
        <div className="w-full max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 text-start">
            {/* Column 1: Brand & Mission (Figma Node 87:14548) */}
            <div className="flex flex-col items-center text-center lg:max-w-[297px]">
              <Image
                src="/assets/branding/logo-footer.png"
                alt="فرقة أندلسيا"
                width={211}
                height={86}
                className="h-[85px] w-auto object-contain"
              />

              <p className="text-[13px] leading-[1.5] text-primary-50 font-normal pt-4 max-w-[206px]">
                مجموعة فنانين يؤمنون أن الإبداع هو الحياة والموسيقى هي الشعلة.
              </p>

              <p className="text-[13px] font-bold text-brand-primary pt-5">
                ♪ من رحم المعاناة ولدت الموسيقى
              </p>
            </div>

            {/* Column 2: Explore Navigation (Figma Node 87:14554) */}
            <div className="flex flex-col items-center text-center">
              <h4 className="text-[13px] font-bold text-brand-primary">استكشف</h4>
              <nav className="flex flex-col items-center pt-5 gap-[9px]" aria-label="روابط استكشف">
                {[
                  { href: "/artists", label: "الفنانون" },
                  { href: "/events", label: "الفعاليات" },
                  { href: "/news", label: "الأخبار" },
                  { href: "/academy", label: "الأكاديمية" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-[13px] font-medium text-primary-50 hover:text-brand-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Column 3: Contact & Presence (Figma Node 87:14565) */}
            <div className="flex flex-col items-center text-center">
              <h4 className="text-[13px] font-bold text-brand-primary">تواصل</h4>
              <div className="flex flex-col items-center pt-5 gap-2 text-[13px] font-medium text-primary-50">
                <a
                  href="mailto:hello@andalusia.art"
                  dir="ltr"
                  className="hover:text-brand-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs"
                >
                  <bdi>hello@andalusia.art</bdi>
                </a>
                <span>Instagram · TikTok</span>
                <span>لبنان · المغرب · الخليج</span>
              </div>
            </div>

            {/* Column 4: Booking Pitch & CTA (Figma Node 87:14574 — 235px) */}
            <div className="flex flex-col lg:max-w-[235px]">
              <h4 className="text-base font-bold text-[#ECE6D0] max-w-[213px]">
                حفلتك القادمة تبدأ من هنا.
              </h4>
              <p className="text-[13px] font-medium leading-[1.5] text-primary-50 pt-2.5 pb-6 max-w-[201px]">
                نتفاعل مع الجمهور، نبني شعوراً جديداً — موسيقى، فن، مشاعر، وحدة.
              </p>
              <Link
                href="/booking"
                className="inline-flex items-center justify-center w-[150px] h-12 rounded-[12px] bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-pressed text-[#ECE6D0] text-base font-bold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-espresso"
              >
                ابدأ حجزك الآن ♪
              </Link>
            </div>
          </div>

          {/* Bottom Bar (Figma Node 87:14584 — 0.667px rule, 24px top padding) */}
          <div className="mt-14 pt-6 border-t-[0.667px] border-[rgba(236,230,208,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4 text-primary-50">
            <span className="font-semibold text-[9.92px] tracking-[0.14em] uppercase">
              موسيقى · ثقافة · قدرة
            </span>
            <span className="text-xs font-normal">
              © أندلسيا ٢٠٢٥ — جميع الحقوق محفوظة
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
