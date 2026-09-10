"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MusicIcon, GlobeIcon } from "@/components/ui/Icons";
import { useDirection } from "@/lib/direction";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
}

export const CONFIRMED_NAV_ITEMS: readonly NavItem[] = [
  { label: "الرئيسية", href: "/" },
  { label: "الأكاديمية", href: "/academy" },
  { label: "الفنانين", href: "/artists" },
  { label: "الأخبار", href: "/news" },
  { label: "الفعاليات", href: "/events" },
] as const;

/**
 * Desktop Floating Navbar
 * Verified against Figma Frame 7 (Nodes 186:1519, 186:2, 94:18729):
 * - Dimensions: Max width 1123px, Height 85px
 * - Radii: 32px (var(--radius-bar))
 * - Background: Solid #F2EEE0 with backdrop blur
 * - Structure: Start brand mark, Center 5 route links, End booking CTA + lang toggle
 */
export function Navbar() {
  const pathname = usePathname();
  const { isRTL, toggleDirection } = useDirection();

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="hidden lg:flex fixed top-6 start-0 end-0 z-50 justify-center px-4 pointer-events-none transition-all">
      <header
        className="pointer-events-auto w-full max-w-[1123px] h-[85px] bg-[#F2EEE0]/90 backdrop-blur-md rounded-[32px] border border-brand-surface shadow-nav flex items-center justify-between px-8"
        role="banner"
      >
        {/* Inline Start: Brand Identity (Right in RTL) */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-2xl p-1"
            aria-label="فرقة أندلسيا — الصفحة الرئيسية"
          >
            <div className="w-11 h-11 rounded-2xl bg-brand-primary flex items-center justify-center text-brand-tint shadow-xs group-hover:scale-105 transition-transform">
              <MusicIcon size={22} />
            </div>
            <div className="flex flex-col text-start">
              <span className="font-calligraphic text-2xl font-bold text-brand-espresso leading-none">
                فرقة أندلسيا
              </span>
              <span className="text-[11px] font-semibold text-brand-primary tracking-wide mt-1">
                للتراث والموسيقى العربية
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (Frame 2: 427x24) */}
        <nav
          className="flex items-center gap-2 xl:gap-4"
          aria-label="التنقل الرئيسي"
        >
          {CONFIRMED_NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-base font-bold transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary",
                  active
                    ? "text-brand-primary bg-brand-primary/10 shadow-2xs font-extrabold"
                    : "text-brand-espresso/85 hover:text-brand-primary hover:bg-black/5"
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Inline End: CTA Button & Direction Switcher (Left in RTL) */}
        <div className="flex items-center gap-3">
          {/* Direction / Language Toggle */}
          <button
            type="button"
            onClick={toggleDirection}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-surface bg-white/80 hover:bg-white text-xs font-semibold text-brand-espresso transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
            title="تبديل اتجاه المستند لاختبار المرونة"
            aria-label="تبديل اتجاه المستند لاختبار المرونة"
          >
            <GlobeIcon size={14} className="text-brand-primary" />
            <span>{isRTL ? "RTL (عربي)" : "LTR (English)"}</span>
          </button>

          {/* Primary CTA: أحجز الآن (Figma Node 186:1523 / 20:4405) */}
          <Link
            href="/booking"
            className="inline-flex items-center justify-center h-[44px] px-6 rounded-2xl bg-brand-primary text-brand-tint text-base font-bold shadow-xs hover:bg-brand-primary-hover active:bg-brand-primary-pressed transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <span>أحجز الآن</span>
          </Link>
        </div>
      </header>
    </div>
  );
}
