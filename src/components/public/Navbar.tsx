"use client";

import React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
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

export const ENGLISH_NAV_ITEMS: readonly NavItem[] = [
  { key: "home", href: "/" },
  { key: "events", href: "/events" },
  { key: "academy", href: "/academy" },
  { key: "artists", href: "/artists" },
  { key: "news", href: "/news" },
] as const;

/**
 * Desktop Floating Navbar
 * Verified against Figma Node 94:18729 / 20:4403 (Arabic) & Node 142:17048 /
 * Frame 38 (English, node 144:19176 — Artists active state):
 * - Dimensions: 1123x85, padding 24, radius 32px
 * - Fill: Foundation/secondary-300 #F2EEE0, shadow 0 4px 15px rgba(0,0,0,.25)
 * - Inline start: raster brand logo 196x85
 * - Center: 5 route links, Cairo 16/24 — #1B1B1B inactive (bold), #C54716 active (medium/bold)
 * - English link sequence: Home -> Events -> Academy -> Artists -> News
 * - Inline end: `Book Now` / `أحجز الآن` CTA 149x44 radius 16, plus 24x24 language glyph
 */
export function Navbar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const a11y = useTranslations("a11y");

  const isEn = locale === "en";
  const navItems = isEn ? ENGLISH_NAV_ITEMS : CONFIRMED_NAV_ITEMS;

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
    <div
      className={cn(
        "hidden lg:flex fixed start-0 end-0 z-50 justify-center px-4 pointer-events-none transition-all",
        offset,
      )}
      data-node-id={isEn ? "144:19176" : undefined}
    >
      <header
        className="pointer-events-auto w-full max-w-[1123px] h-[85px] bg-[#F2EEE0] rounded-[32px] shadow-[0px_4px_15px_rgba(0,0,0,0.25)] flex items-center justify-between px-6 xl:px-[42.5px]"
        role="banner"
        data-node-id={isEn ? "142:17048" : "94:18677"}
      >
        {/* Inline Start: Brand Logo (Figma Node 20:4412 / 134:8264 — raster 196x85) */}
        <Link
          href="/"
          className="flex items-center shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xl"
          aria-label={a11y("brandHome")}
          data-node-id={isEn ? "I142:17048;134:8264" : "I94:18677;20:4412"}
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

        {/* Center: Desktop Navigation Links (Figma Node 20:4406 / 134:8258 — gap 32) */}
        <nav
          className="flex items-center gap-6 xl:gap-[32px]"
          aria-label={a11y("primaryNav")}
          data-node-id={isEn ? "I142:17048;134:8258" : "I94:18677;20:4406"}
        >
          {navItems.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[16px] leading-[24px] transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs whitespace-nowrap",
                  active
                    ? cn("text-brand-primary", isEn ? "font-medium" : "font-bold")
                    : "text-gradscale-900 hover:text-brand-primary font-bold"
                )}
                aria-current={active ? "page" : undefined}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* Inline End: CTA + language glyph (Figma Node 134:8170 / 134:8254 — gap 16) */}
        <div
          className="flex items-center gap-[16px] shrink-0"
          data-node-id={isEn ? "I142:17048;134:8254" : "I94:18677;134:8170"}
        >
          {/* Language switch (Figma Node 134:8271 / 134:8256 — 24px box) */}
          <LocaleSwitcher />

          {/* Primary CTA (Figma Node 20:4405 / 134:8255 — 149x44, radius 16) */}
          <Link
            href="/booking"
            className="inline-flex items-center justify-center w-[149px] h-[44px] rounded-[16px] bg-brand-primary text-primary-50 text-[16px] leading-[24px] font-bold hover:bg-brand-primary-hover active:bg-brand-primary-pressed transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 shrink-0"
            data-node-id={isEn ? "I142:17048;134:8255" : "I94:18677;20:4405"}
          >
            {t("bookNow")}
          </Link>
        </div>
      </header>
    </div>
  );
}
