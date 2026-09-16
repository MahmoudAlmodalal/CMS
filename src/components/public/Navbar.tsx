"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useBandTone } from "./motion/useBandTone";
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

  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // The pill crosses cream and espresso bands alike; this is what lets it
  // acknowledge the one it is currently over instead of staying cream throughout.
  const bandTone = useBandTone();
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    lastScrollY.current = latest;

    setIsScrolled(latest > 50);

    // Only trigger hide/reveal after passing threshold
    if (latest > 120 && latest > previous + 5) {
      // Scrolling DOWN
      setHidden(true);
    } else if (latest < previous - 5 || latest <= 50) {
      // Scrolling UP
      setHidden(false);
    }
  });

  const isEn = locale === "en";
  const navItems = isEn ? ENGLISH_NAV_ITEMS : CONFIRMED_NAV_ITEMS;

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

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
    <motion.div
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: -100, opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "hidden lg:flex fixed start-0 end-0 z-50 justify-center px-4 pointer-events-none transition-all sm:px-6 lg:px-12 xl:px-20",
        offset,
      )}
      data-node-id={isEn ? "144:19176" : undefined}
    >
      <header
        className={cn(
          "pointer-events-auto flex h-16 w-full max-w-[1123px] items-center justify-between rounded-[24px] px-4 shadow-[0px_4px_15px_rgba(0,0,0,0.25)] transition-all duration-300 lg:gap-4 xl:h-[85px] xl:rounded-[32px] xl:px-[42.5px]",
          // Over an espresso band the pill lifts: a warmer tint, a heavier
          // shadow and a terracotta hairline, so it reads as floating above the
          // dark rather than sitting flat on it.
          //
          // Deliberately NOT a full colour inversion. The pill's fill is a
          // Figma-locked #F2EEE0, the nav links are dark ink, and the logo is a
          // raster drawn for a cream ground — inverting the pill would make the
          // logo and every link disappear into it.
          bandTone === "dark"
            ? "border border-brand-primary/30 bg-[#F7F3E6]/92 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.55)]"
            : isScrolled
              ? "bg-[#F2EEE0]/85 backdrop-blur-md border border-[#ECE6D0]/50 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              : "bg-[#F2EEE0]"
        )}
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
            width={628}
            height={226}
            // `priority` is deprecated in Next 16; the docs point at loading="eager"
            // for an above-the-fold image that is not the LCP element.
            loading="eager"
            // 196x85 is the slot the frame reserves, not the artwork: sized to the slot
            // the logo sat flush with the pill's own edges. It is capped to the slot's
            // width and given room to breathe inside it instead.
            className="h-7.5 w-auto max-w-[165px] object-contain xl:h-11"
            style={{ aspectRatio: "628 / 226" }}
          />
        </Link>

        {/* Center: Desktop Navigation Links (Figma Node 20:4406 / 134:8258 — gap 32) */}
        <nav
          className="flex min-w-0 items-center gap-4 xl:gap-[32px]"
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
                  "whitespace-nowrap rounded-xs text-sm leading-6 transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary xl:text-[16px]",
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
          className="flex shrink-0 items-center gap-2 xl:gap-4"
          data-node-id={isEn ? "I142:17048;134:8254" : "I94:18677;134:8170"}
        >
          {/* Language switch (Figma Node 134:8271 / 134:8256 — 24px box) */}
          <LocaleSwitcher />

          {/* Primary CTA (Figma Node 20:4405 / 134:8255 — 149x44, radius 16) */}
          <Link
            href="/booking"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary px-4 text-sm font-bold leading-6 text-primary-50 transition-colors hover:bg-brand-primary-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary xl:w-[149px] xl:px-0 xl:text-[16px]"
            data-node-id={isEn ? "I142:17048;134:8255" : "I94:18677;20:4405"}
          >
            {t("bookNow")}
          </Link>
        </div>
      </header>
    </motion.div>
  );
}
