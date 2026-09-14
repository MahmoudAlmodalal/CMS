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
 * - Inline start: raster brand logo, 104x32 box at component x=245.73 y=12
 *   (its right edge sits 20px off the component's end, mirroring the hamburger).
 * - Inline end: `basil:menu-outline` hamburger, 24x24 box at component x=20 y=16.
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
      <div className="pointer-events-none absolute inset-x-2.5 top-[44px] z-40 lg:hidden">
        <header
          className="pointer-events-auto flex h-14 min-w-0 items-center justify-between gap-2 rounded-[20px] bg-white px-5 shadow-subtle"
          role="banner"
        >
          {/* Inline Start: brand logo (Figma Node 139:12341 — 104x32 raster) */}
          <Link
            href="/"
            className="flex h-12 w-[120px] shrink-0 items-center overflow-hidden rounded-xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary sm:h-14 sm:w-[140px]"
            aria-label={a11y("brandHome")}
          >
            {/* The wordmark is raster, so the band name is carried by the alt text
                rather than a second visible text node. `priority` is deprecated in
                Next 16; the docs point at loading="eager" for a non-LCP image.
                The file is 292x178 (1.64:1), so it renders at its natural aspect:
                forcing the 104x32 box (3.25:1) letterboxed it to ~52px with 26px
                of dead space each side. */}
            <Image
              src="/assets/branding/logo-navbar.png"
              alt={site("brand")}
              width={292}
              height={178}
              loading="eager"
              className="h-14 w-auto object-contain shrink-0"
            />
          </Link>

          {/* Inline End: drawer toggle (Figma Node 139:12338 — 24x24 box).
              Component 17 carries exactly two children: the hamburger and the
              logo. The booking CTA and the locale switcher live in the drawer. */}
          <div
            className="flex shrink-0 items-center gap-2"
            data-node-id="I142:17048;134:8254"
          >
            <LocaleSwitcher mobile />
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl p-1.5 text-gradscale-500 transition-colors hover:text-brand-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary sm:size-11 sm:p-2"
              aria-label={a11y("openMenu")}
              aria-expanded={drawerOpen}
              aria-controls="mobile-navigation-drawer"
            >
              <MenuIcon size={24} className="size-6" />
            </button>
          </div>
        </header>
      </div>

      {/* Slide-out Mobile Drawer */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} contact={contact} />
    </>
  );
}
