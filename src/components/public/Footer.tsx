import React from "react";
import Link from "next/link";
import { MusicIcon } from "@/components/ui/Icons";

/**
 * Global Public Footer
 * Verified against Figma Nodes 94:18289 / 91:18221 / 94:18729 / 136:7859:
 * - Canvas Dimensions: Max width 1454px, Canonical Height 385px desktop (390x882px mobile)
 * - Inner Content Container: 1280px centered
 * - Background Composite: Solid #2B1D14 (bg-brand-espresso) + Arabesque geometric texture overlay (da60c98546b43a3524b1bbd7667d8f518e1c7ee3)
 * - Partner Strip: Frame 31 (1123x85px) cultural patron marquee
 * - 4-Column Layout: Mission & Tagline, Explore links, Contact & Presence, Booking CTA
 * - Bottom Bar: Motto + Copyright notice
 */
export function Footer() {
  return (
    <footer
      className="w-full bg-[#2B1D14] bg-brand-espresso text-brand-tint border-t border-brand-surface/20 relative overflow-hidden"
      role="contentinfo"
    >
      {/* 1. Andalusian Arabesque Geometric Texture Overlay (Figma ref: da60c98546b43a3524b1bbd7667d8f518e1c7ee3) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.045] mix-blend-screen"
        aria-hidden="true"
        data-texture-ref="da60c98546b43a3524b1bbd7667d8f518e1c7ee3"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="footer-arabesque-pattern"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M40 0 L80 40 L40 80 L0 40 Z"
                fill="none"
                stroke="#F9EDE8"
                strokeWidth="1"
              />
              <circle cx="40" cy="40" r="14" fill="none" stroke="#F9EDE8" strokeWidth="1" />
              <path
                d="M40 14 L40 66 M14 40 L66 40"
                stroke="#F9EDE8"
                strokeWidth="0.75"
              />
              <path
                d="M20 20 L60 60 M20 60 L60 20"
                stroke="#F9EDE8"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
              <circle cx="40" cy="0" r="6" fill="none" stroke="#F9EDE8" strokeWidth="0.75" />
              <circle cx="40" cy="80" r="6" fill="none" stroke="#F9EDE8" strokeWidth="0.75" />
              <circle cx="0" cy="40" r="6" fill="none" stroke="#F9EDE8" strokeWidth="0.75" />
              <circle cx="80" cy="40" r="6" fill="none" stroke="#F9EDE8" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-arabesque-pattern)" />
        </svg>
      </div>

      {/* 2. Main Outer Container (Max width 1454px, min-h-[385px] desktop / min-h-[882px] mobile stack) */}
      <div className="w-full max-w-[1454px] mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16 relative z-10 min-h-[385px]">
        {/* 3. Partner / Cultural Patrons Marquee Strip (Figma Frame 31: 1123x85px) */}
        <div className="w-full max-w-[1123px] mx-auto min-h-[85px] border-b border-[#ECE6D0]/10 pb-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-xs font-semibold text-brand-primary tracking-wider uppercase">
            شركاء الثقافة والموسيقى
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[#ECE6D0]/70">
            <div className="flex items-center gap-2 text-xs font-medium border border-[#ECE6D0]/15 rounded-lg px-3.5 py-1.5 bg-white/5 hover:bg-white/10 transition-colors">
              <span>وزارة الثقافة</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium border border-[#ECE6D0]/15 rounded-lg px-3.5 py-1.5 bg-white/5 hover:bg-white/10 transition-colors">
              <span>معهد التراث الموسيقي العربي</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium border border-[#ECE6D0]/15 rounded-lg px-3.5 py-1.5 bg-white/5 hover:bg-white/10 transition-colors">
              <span>بيت العود العربي</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium border border-[#ECE6D0]/15 rounded-lg px-3.5 py-1.5 bg-white/5 hover:bg-white/10 transition-colors">
              <span>مؤسسة الفكر العربي</span>
            </div>
          </div>
        </div>

        {/* 4. Inner Content Columns (1280px Container) */}
        <div className="w-full max-w-[1280px] mx-auto">
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

            {/* Column 3: Contact & Presence & Social Icons (Node 186:2091) */}
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

                {/* Social Icons Strip */}
                <div className="flex items-center gap-3 pt-2 text-[#ECE6D0]/80">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-[#ECE6D0]/15 hover:border-brand-primary hover:text-brand-primary transition-colors"
                    aria-label="إنستغرام"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-[#ECE6D0]/15 hover:border-brand-primary hover:text-brand-primary transition-colors"
                    aria-label="تيك توك"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                    </svg>
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-[#ECE6D0]/15 hover:border-brand-primary hover:text-brand-primary transition-colors"
                    aria-label="يوتيوب"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                      <polygon points="10 15 15 12 10 9" />
                    </svg>
                  </a>
                </div>
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
                  className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-pressed text-[#ECE6D0] text-sm font-bold shadow-md transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-espresso"
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
      </div>
    </footer>
  );
}
