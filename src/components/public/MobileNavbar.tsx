"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "./LocaleSwitcher";

type NavIconType = "news" | "artists" | "events" | "academy" | "home";

type BottomNavItem = {
  key: NavIconType;
  href: string;
};

const BOTTOM_NAV_ITEMS: readonly BottomNavItem[] = [
  { key: "news", href: "/news" },
  { key: "artists", href: "/artists" },
  { key: "events", href: "/events" },
  { key: "academy", href: "/academy" },
  { key: "home", href: "/" },
];

function BottomNavIcon({ type, active }: { type: NavIconType; active: boolean }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  return (
    <svg
      {...common}
      className={cn(
        "transition-colors duration-300",
        active ? "text-brand-primary" : "text-gradscale-300",
      )}
    >
      {type === "news" && (
        <>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 7h8M8 11h8M8 15h5M8 18h3" />
        </>
      )}
      {type === "artists" && (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20c.5-3.3 2.3-5 5.5-5s5 1.7 5.5 5M17 4.5a3 3 0 0 1 0 6M17 14c2.2.3 3.5 2.2 3.8 4.8" />
        </>
      )}
      {type === "events" && (
        <>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16M8 14h.01M12 14h.01M16 14h.01" />
        </>
      )}
      {type === "academy" && (
        <>
          <path d="m3 9 9-5 9 5-9 5-9-5Z" />
          <path d="M6 11v5c3.3 2.7 8.7 2.7 12 0v-5M21 9v6" />
        </>
      )}
      {type === "home" && (
        <>
          <path d="m3.5 10 8.5-7 8.5 7v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-9Z" />
          <path d="M9 21v-6h6v6" />
        </>
      )}
    </svg>
  );
}

/** Mobile top bar plus the Figma bottom navigation bar. */
export function MobileNavbar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const a11y = useTranslations("a11y");
  const site = useTranslations("site");
  const [topBarVisible, setTopBarVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY.current;
      setTopBarVisible(currentScrollY < 24 || scrollingUp);
      lastScrollY.current = currentScrollY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <div
        className={cn(
          "pointer-events-none fixed inset-x-2.5 top-[36px] z-40 transition-[transform,opacity] duration-500 ease-out lg:hidden",
          topBarVisible ? "translate-y-0 opacity-100" : "-translate-y-[calc(100%+48px)] opacity-0",
        )}
      >
        <header
          className="pointer-events-auto flex h-14 min-w-0 items-center justify-between gap-3 rounded-[20px] bg-white px-4 shadow-subtle sm:px-5"
          role="banner"
        >
          <LocaleSwitcher mobile />
          <Link
            href="/"
            className="flex h-7.5 min-w-0 flex-1 items-center justify-end rounded-xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary sm:h-9"
            aria-label={a11y("brandHome")}
          >
            <Image
              src="/assets/branding/logo-navbar.png"
              alt={site("brand")}
              width={628}
              height={226}
              loading="eager"
              className="h-full w-auto max-w-[130px] object-contain sm:max-w-[145px]"
            />
          </Link>
        </header>
      </div>

      <nav
        aria-label={a11y("primaryNav")}
        className="fixed inset-x-0 bottom-0 z-50 flex h-[68px] items-stretch justify-center border-t border-[#ECECEC] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <div className="flex h-[68px] w-full max-w-[430px] items-stretch justify-center gap-1 px-2">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-[3px] px-1 pt-1 text-center font-sans transition-colors duration-300 focus-visible:z-10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset",
                  active ? "text-brand-primary" : "text-gradscale-300",
                )}
              >
                <BottomNavIcon type={item.key} active={active} />
                <span
                  className={cn(
                    "whitespace-nowrap text-[10px] leading-[10px] tracking-[0.192px]",
                    active ? "font-bold" : "font-medium",
                  )}
                >
                  {t(item.key)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
