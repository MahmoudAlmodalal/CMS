import React from "react";
import Link from "next/link";
import { MusicIcon } from "@/components/ui/Icons";

/**
 * Global Public Footer
 * Verified against Figma Node 94:18289 / 186:2072 / 87:14546:
 * - Dimensions: Width 1454px, inner Container 1280px
 * - Background: Solid #2B1D14 (bg-brand-espresso), text #F9EDE8 (text-brand-tint)
 * - 4-Column Layout: Mission & Tagline, Explore links, Contact & Presence, Booking CTA
 * - Bottom Bar: Motto + Copyright notice
 */
export function Footer() {
  return (
    <footer
      className="w-full bg-brand-espresso text-brand-tint border-t border-brand-surface/20"
      role="contentinfo"
    >
      <div className="w-full max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 text-start">
          {/* Column 1: Brand & Mission (Node 186:2074) */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-brand-tint shadow-xs">
                <MusicIcon size={22} />
              </div>
              <span className="font-calligraphic text-3xl font-bold text-[#ECE6D0] leading-none">
                فرقة أندلسيا
              </span>
            </div>

            <p className="text-[13px] leading-relaxed text-[#F9EDE8]/80 font-normal pt-2">
              مجموعة فنانين يؤمنون أن الإبداع هو الحياة والموسيقى هي الشعلة.
            </p>

            <p className="text-[13px] font-bold text-brand-primary">
              ♪ من رحم المعاناة ولدت الموسيقى
            </p>
          </div>

          {/* Column 2: Explore Navigation (Node 186:2080) */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-bold text-brand-primary tracking-wide">
              استكشف
            </h4>
            <nav className="flex flex-col space-y-2.5" aria-label="روابط استكشف">
              <Link
                href="/artists"
                className="text-[13px] text-[#F9EDE8]/90 hover:text-brand-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs w-fit"
              >
                الفنانون
              </Link>
              <Link
                href="/events"
                className="text-[13px] text-[#F9EDE8]/90 hover:text-brand-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs w-fit"
              >
                الفعاليات
              </Link>
              <Link
                href="/news"
                className="text-[13px] text-[#F9EDE8]/90 hover:text-brand-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs w-fit"
              >
                الأخبار
              </Link>
              <Link
                href="/academy"
                className="text-[13px] text-[#F9EDE8]/90 hover:text-brand-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs w-fit"
              >
                الأكاديمية
              </Link>
            </nav>
          </div>

          {/* Column 3: Contact & Regional Presence (Node 186:2091) */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-bold text-brand-primary tracking-wide">
              تواصل
            </h4>
            <div className="flex flex-col space-y-2.5 text-[13px] text-[#F9EDE8]/90">
              <a
                href="mailto:hello@andalusia.art"
                dir="ltr"
                className="hover:text-brand-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs w-fit text-start"
              >
                <bdi>hello@andalusia.art</bdi>
              </a>
              <span className="text-[#F9EDE8]/80">Instagram · TikTok</span>
              <span className="text-[#F9EDE8]/80">لبنان · المغرب · الخليج</span>
            </div>
          </div>

          {/* Column 4: Booking Pitch & CTA (Node 186:2102) */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-base font-bold text-[#ECE6D0]">
              حفلتك القادمة تبدأ من هنا.
            </h4>
            <p className="text-[13px] leading-relaxed text-[#F9EDE8]/80">
              نتفاعل مع الجمهور، نبني شعوراً جديداً — موسيقى، فن، مشاعر، وحدة.
            </p>
            <div className="pt-2">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-pressed text-[#ECE6D0] text-sm font-bold shadow-md transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-espresso"
              >
                <span>ابدأ حجزك الآن ♪</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Motto & Copyright (Node 87:14584) */}
        <div className="border-t border-[#ECE6D0]/15 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F9EDE8]/60">
          <span className="font-semibold tracking-wide">
            موسيقى · ثقافة · قدرة
          </span>
          <span>© أندلسيا ٢٠٢٥ — جميع الحقوق محفوظة</span>
        </div>
      </div>
    </footer>
  );
}
