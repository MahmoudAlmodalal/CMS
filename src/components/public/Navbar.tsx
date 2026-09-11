"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlobeIcon } from "@/components/ui/Icons";
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
 * Verified against Figma Node 94:18729 / 20:4403:
 * - Dimensions: 1123x85, padding 24, radius 32px
 * - Fill: Foundation/secondary-300 #F2EEE0, shadow 0 4px 30px rgba(0,0,0,.25)
 * - Inline start: raster brand logo 196x85
 * - Center: 5 route links, Cairo Bold 16 — #1B1B1B inactive, #C54716 active (no chip)
 * - Inline end: `أحجز الآن` CTA 149x44 radius 16, plus the 24x24 language glyph
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
        className="pointer-events-auto w-full max-w-[1123px] h-[85px] bg-[#F2EEE0] rounded-[32px] shadow-dropdown flex items-center justify-between px-6"
        role="banner"
      >
        {/* Inline Start: Brand Logo (Figma Node 20:4412 — raster 196x85) */}
        <Link
          href="/"
          className="flex items-center shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xl"
          aria-label="فرقة أندلسيا — الصفحة الرئيسية"
        >
          <Image
            src="/assets/branding/logo-navbar.png"
            alt="فرقة أندلسيا"
            width={196}
            height={85}
            priority
            className="h-[85px] w-auto object-contain"
            style={{ width: "auto" }}
          />
        </Link>

        {/* Center: Desktop Navigation Links (Figma Node 20:4406 — gap 32) */}
        <nav
          className="flex items-center gap-6 xl:gap-8"
          aria-label="التنقل الرئيسي"
        >
          {CONFIRMED_NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-base font-bold transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs",
                  active
                    ? "text-brand-primary"
                    : "text-gradscale-900 hover:text-brand-primary"
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Inline End: CTA + language glyph (Figma Node 134:8170 — gap 16) */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Primary CTA (Figma Node 20:4405 — 149x44, radius 16) */}
          <Link
            href="/booking"
            className="inline-flex items-center justify-center w-[149px] h-[44px] rounded-[16px] bg-brand-primary text-primary-50 text-base font-bold hover:bg-brand-primary-hover active:bg-brand-primary-pressed transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            أحجز الآن
          </Link>

          {/* Direction / Language Toggle (Figma Node 134:8271 — 24x24 glyph) */}
          <button
            type="button"
            onClick={toggleDirection}
            className="w-6 h-6 inline-flex items-center justify-center text-brand-espresso hover:text-brand-primary transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs"
            title="تبديل اتجاه المستند"
            aria-label={isRTL ? "التبديل إلى الإنجليزية (LTR)" : "التبديل إلى العربية (RTL)"}
          >
            <GlobeIcon size={24} />
          </button>
        </div>
      </header>
    </div>
  );
}
