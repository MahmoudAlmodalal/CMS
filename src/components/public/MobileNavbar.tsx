"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MenuIcon, MusicIcon } from "@/components/ui/Icons";
import { MobileDrawer } from "./MobileDrawer";

/**
 * Mobile Top Bar Navigation
 * Verified against Figma Component 17/Navigation (Node 139:12348):
 * - Height: 56px
 * - Responsive: Visible on mobile/tablet (lg:hidden)
 * - Start: Brand logo + "فرقة أندلسيا"
 * - End: Quick booking CTA button + Hamburger drawer toggle
 */
export function MobileNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header
        className="lg:hidden fixed top-0 start-0 end-0 z-40 h-14 bg-white/95 backdrop-blur-md border-b border-brand-surface/70 px-4 sm:px-6 flex items-center justify-between"
        role="banner"
      >
        {/* Inline Start: Brand Identity */}
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xl p-1"
          aria-label="فرقة أندلسيا — الصفحة الرئيسية"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow-2xs">
            <MusicIcon size={18} />
          </div>
          <span className="font-calligraphic text-xl font-bold text-brand-espresso leading-none">
            فرقة أندلسيا
          </span>
        </Link>

        {/* Inline End: CTA + Hamburger Toggle */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/booking"
            className="inline-flex items-center justify-center h-[34px] px-3.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-2xs hover:bg-brand-primary-hover active:bg-brand-primary-pressed transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <span>احجز الآن</span>
          </Link>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl border border-brand-surface bg-white text-brand-espresso hover:bg-brand-surface transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="فتح القائمة الرئيسية"
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
