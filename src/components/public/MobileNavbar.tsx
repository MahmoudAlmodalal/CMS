"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { MenuIcon } from "@/components/ui/Icons";
import { MobileDrawer, type DrawerContact } from "./MobileDrawer";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { cn } from "@/lib/utils";

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

  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    lastScrollY.current = latest;

    setIsScrolled(latest > 40);

    if (latest > 90 && latest > previous + 5) {
      setHidden(true);
    } else if (latest < previous - 5 || latest <= 40) {
      setHidden(false);
    }
  });

  return (
    <>
      {/* Wrapper is inert so the hero underneath stays clickable either side of
          the pill, while keeping the bar anchored to the top of the page. */}
      <motion.div
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: -80, opacity: 0 },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none fixed inset-x-2.5 top-[24px] z-40 lg:hidden"
      >
        <header
          className={cn(
            "pointer-events-auto flex h-14 min-w-0 items-center justify-between gap-2 rounded-[20px] px-4 shadow-subtle transition-all duration-300 sm:px-5",
            isScrolled
              ? "bg-white/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
              : "bg-white shadow-subtle"
          )}
          role="banner"
        >
          {/* Inline Start: language and menu controls stay together. */}
          <div className="flex shrink-0 items-center gap-2">
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
            <LocaleSwitcher mobile />
          </div>

          {/* Inline End: brand logo, kept outside the controls group so it has a
              clear visual anchor in both directions. It sits inside the pill's own
              padding — the fixed width and overflow-hidden this used to carry cropped
              the wordmark, and the translate nudges only existed to compensate for
              transparent margin the logo asset no longer has. */}
          <Link
            href="/"
            className="flex h-9 min-w-0 shrink items-center rounded-xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary sm:h-11"
            aria-label={a11y("brandHome")}
          >
            <Image
              src="/assets/branding/logo-navbar.png"
              alt={site("brand")}
              width={628}
              height={226}
              loading="eager"
              className="h-full w-auto max-w-[140px] object-contain sm:max-w-[168px]"
            />
          </Link>
        </header>
      </motion.div>

      {/* Slide-out Mobile Drawer */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} contact={contact} />
    </>
  );
}
