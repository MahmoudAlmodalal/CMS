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
 * Verified against Figma Component 17 (Node 139:12348):
 * - Dimensions: Max width 1123px, Canonical Height 56px (reconciled from legacy 85px)
 * - Radii: 20px (rounded-[20px])
 * - Background: Solid #FFFFFF with backdrop blur
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
        className="pointer-events-auto w-full max-w-[1123px] h-[56px] bg-white/95 backdrop-blur-md rounded-[20px] border border-brand-surface/70 shadow-sm flex items-center justify-between px-6"
        role="banner"
      >
        {/* Inline Start: Brand Identity (Right in RTL) */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xl p-0.5"
            aria-label="فرقة أندلسيا — الصفحة الرئيسية"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <MusicIcon size={18} />
            </div>
            <div className="flex flex-col text-start">
              <span className="font-calligraphic text-xl font-bold text-brand-espresso leading-none">
                فرقة أندلسيا
              </span>
              <span className="text-[10px] font-semibold text-brand-primary tracking-wide mt-0.5">
                للتراث والموسيقى العربية
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (5 Confirmed Routes) */}
        <nav
          className="flex items-center gap-1.5 xl:gap-3"
          aria-label="التنقل الرئيسي"
        >
          {CONFIRMED_NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary",
                  active
                    ? "text-brand-primary bg-brand-primary/10 font-extrabold"
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
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-brand-surface bg-brand-cream/60 hover:bg-white text-xs font-semibold text-brand-espresso transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
            title="تبديل اتجاه المستند لاختبار المرونة"
            aria-label="تبديل اتجاه المستند لاختبار المرونة"
          >
            <GlobeIcon size={13} className="text-brand-primary" />
            <span>{isRTL ? "RTL (عربي)" : "LTR (English)"}</span>
          </button>

          {/* Primary CTA: أحجز الآن (Figma Component 17 / 139:12340) */}
          <Link
            href="/booking"
            className="inline-flex items-center justify-center h-[38px] px-5 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-xs hover:bg-brand-primary-hover active:bg-brand-primary-pressed transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <span>أحجز الآن</span>
          </Link>
        </div>
      </header>
    </div>
  );
}
