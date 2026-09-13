"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MenuIcon, MusicIcon } from "@/components/ui/Icons";
import { MobileDrawer } from "./MobileDrawer";

/**
 * Mobile Top Bar Navigation
 * Verified against Figma Component 17/Navigation (Node 139:12348):
 * - Height: 56px
 * - Responsive: Visible on mobile/tablet (lg:hidden)
 * - Start: Brand logo + brand wordmark
 * - End: Quick booking CTA button + Hamburger drawer toggle
 */
export function MobileNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const t = useTranslations("nav");
  const a11y = useTranslations("a11y");
  const site = useTranslations("site");

  return (
    <>
      <header
        className="lg:hidden fixed top-3 start-2 end-2 z-40 h-12 rounded-2xl bg-white/95 backdrop-blur-md border border-brand-surface/70 px-3 sm:px-5 shadow-subtle flex items-center justify-between"
        role="banner"
      >
        {/* Inline Start: Brand Identity */}
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xl p-1"
          aria-label={a11y("brandHome")}
        >
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow-2xs">
            <MusicIcon size={18} />
          </div>
          <span className="font-calligraphic text-base sm:text-xl font-bold text-brand-espresso leading-none truncate max-w-[150px]">
            {site("brand")}
          </span>
        </Link>

        {/* Inline End: CTA + Hamburger Toggle */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <Link
            href="/booking"
            className="inline-flex items-center justify-center h-8 px-2.5 sm:px-3.5 rounded-xl bg-brand-primary text-white text-[11px] sm:text-xs font-bold shadow-2xs hover:bg-brand-primary-hover active:bg-brand-primary-pressed transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <span>{t("bookNow")}</span>
          </Link>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl border border-brand-surface bg-white text-brand-espresso hover:bg-brand-surface transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label={a11y("openMenu")}
            aria-expanded={drawerOpen}
            aria-controls="mobile-navigation-drawer"
          >
            <MenuIcon size={20} />
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Drawer */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
