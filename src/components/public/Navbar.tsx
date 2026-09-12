"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { cn } from "@/lib/utils";

export interface NavItem {
  /** Key under the `nav` message namespace. */
  key: "home" | "academy" | "artists" | "news" | "events";
  href: string;
}

export const CONFIRMED_NAV_ITEMS: readonly NavItem[] = [
  { key: "home", href: "/" },
  { key: "academy", href: "/academy" },
  { key: "artists", href: "/artists" },
  { key: "news", href: "/news" },
  { key: "events", href: "/events" },
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
  const t = useTranslations("nav");
  const a11y = useTranslations("a11y");

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // The floating bar sits at a slightly different offset on each frame. These are
  // measured off the 1:1 reference renders in docs/figma-reference (the first row
  // of the #F2EEE0 band), not read from get_metadata: the bar is wrapped in a
  // double rotate-180 for RTL mirroring, so its reported node coordinates are not
  // frame-relative and put it ~85px too low.
  const NAVBAR_TOP: Record<string, string> = {
    "/": "top-[33px]",
    "/events": "top-[40px]",
    "/academy": "top-[57px]",
  };
  const offset =
    NAVBAR_TOP[pathname] ??
    // Artist profiles sit 10px higher than the artists index.
    (/^\/artists\/.+/.test(pathname) ? "top-[40px]" : "top-[50px]");

  return (
    <div className={cn(
      "hidden lg:flex fixed start-0 end-0 z-50 justify-center px-4 pointer-events-none transition-all",
      offset,
    )}>
      <header
        className="pointer-events-auto w-full max-w-[1123px] h-[85px] bg-[#F2EEE0] rounded-[32px] shadow-dropdown flex items-center justify-between px-6"
        role="banner"
      >
        {/* Inline Start: Brand Logo (Figma Node 20:4412 — raster 196x85) */}
        <Link
          href="/"
          className="flex items-center shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xl"
          aria-label={a11y("brandHome")}
        >
          <Image
            src="/assets/branding/logo-navbar.png"
            alt={a11y("brandHome")}
            width={196}
            height={85}
            // `priority` is deprecated in Next 16; the docs point at loading="eager"
            // for an above-the-fold image that is not the LCP element.
            loading="eager"
            className="h-[85px] w-auto object-contain"
            style={{ width: "auto" }}
          />
        </Link>

        {/* Center: Desktop Navigation Links (Figma Node 20:4406 — gap 32) */}
        <nav
          className="flex items-center gap-6 xl:gap-8"
          aria-label={a11y("primaryNav")}
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
                {t(item.key)}
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
            {t("bookNow")}
          </Link>

          {/* Language switch (Figma Node 134:8271 — plain "En" label, 24px box) */}
          <LocaleSwitcher />
        </div>
      </header>
    </div>
  );
}
