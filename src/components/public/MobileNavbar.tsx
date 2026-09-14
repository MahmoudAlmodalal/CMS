"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MenuIcon } from "@/components/ui/Icons";
import { MobileDrawer, type DrawerContact } from "./MobileDrawer";
import { LocaleSwitcher } from "./LocaleSwitcher";

/**
 * Mobile Top Bar Navigation
 * Verified against Figma `Component 17/Navigation` (Node 139:12348), 369.73x56,
 * and measured 1:1 off docs/figma-reference/home-mobile.png:
 * - Floating white pill, NOT a full-bleed bar: box x=10..378, y=44..99 on the
 *   390px canvas — i.e. inset 10px inline, offset 44px from the top, h=56, r=20.
 * - Fill #FFFFFF, and no shadow: the row directly under the pill (y=100) is the
 *   untouched hero, with no darkening ramp.
 * - Inline start: `basil:menu-outline` hamburger, 24x24 box.
 * - Inline end: the raster brand logo, mirrored automatically by the document
 *   direction (`dir=ltr` for English, `dir=rtl` for Arabic).
 *
 * Figma carries NO booking CTA, NO wordmark text and NO icon tile in this bar —
 * the component has exactly two children. The booking CTA lives in the drawer
 * (`drawer.bookingCta`), and so does the locale switcher.
 *
 * The 44px top offset is measured from the home frame. The desktop bar shifts per
 * screen (33/40/50/57), so the other six mobile frames may differ; they are
 * confirmed when their specs are extracted (plan phase E).
 */
export function MobileNavbar({ contact }: { contact?: DrawerContact }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const a11y = useTranslations("a11y");
  const site = useTranslations("site");

  return (
    <>
      {/* Wrapper is inert so the hero underneath stays clickable either side of
          the pill, while keeping the bar anchored to the top of the page. */}
      <div className="pointer-events-none absolute inset-x-2.5 top-[36px] z-40 lg:hidden">
        <header
          className="pointer-events-auto flex h-14 min-w-0 items-center justify-between gap-2 rounded-[20px] bg-white px-5 shadow-subtle"
          role="banner"
        >
          {/* Inline Start: language and menu controls stay together. */}
          <div className="flex shrink-0 items-center gap-2">
            <LocaleSwitcher mobile />
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="motion-press flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-espresso/[0.04] p-1.5 text-gradscale-500 transition-colors hover:bg-primary-50 hover:text-brand-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary sm:size-11 sm:p-2"
              aria-label={a11y("openMenu")}
              aria-expanded={drawerOpen}
              aria-controls="mobile-navigation-drawer"
              data-node-id="I142:17048;134:8254"
            >
              <MenuIcon size={24} className="size-6" />
            </button>
          </div>

          {/* Inline End: brand logo, kept outside the controls group so it has a
              clear visual anchor in both directions. */}
          <Link
            href="/"
            className="-me-5 flex h-12 w-[132px] shrink-0 items-center overflow-hidden rounded-xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary sm:h-14 sm:w-[152px]"
            aria-label={a11y("brandHome")}
          >
            <Image
              src="/assets/branding/logo-navbar.png"
              alt={site("brand")}
              width={292}
              height={178}
              loading="eager"
              className="h-16 w-auto shrink-0 object-contain sm:h-[68px]"
            />
          </Link>
        </header>
      </div>

      {/* Slide-out Mobile Drawer */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} contact={contact} />
    </>
  );
}
