"use client";

import React, { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  CloseIcon,
  ChevronEndIcon,
  MusicIcon,
  ArrowEndIcon,
  CalendarIcon,
  PlayIcon,
  SearchIcon,
} from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { CONFIRMED_NAV_ITEMS, ENGLISH_NAV_ITEMS } from "./Navbar";

/** Admin-controlled contact details (site settings); blank falls back to translations. */
export interface DrawerContact {
  email?: string | null;
  regions?: string | null;
}

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: DrawerContact;
}

/**
 * Mobile Drawer Navigation
 * Verified against Figma Navbar Drawer (Node 139:12368 / 139:8809):
 * - Slides from inline-start (right side in RTL, left side in LTR)
 * - Traps focus, manages Escape key, locks body scroll
 * - Closes automatically upon route transition
 * - Displays 5 confirmed route links + booking CTA + contact info
 */
export function MobileDrawer({ isOpen, onClose, contact }: MobileDrawerProps) {
  const pathname = usePathname();
  const navItems = useLocale() === "en" ? ENGLISH_NAV_ITEMS : CONFIRMED_NAV_ITEMS;
  const t = useTranslations("drawer");
  const nav = useTranslations("nav");
  const site = useTranslations("site");
  const footer = useTranslations("footer");
  const a11y = useTranslations("a11y");
  const panelRef = useRef<HTMLElement>(null);

  // Close on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Keep keyboard focus inside the open drawer, as required by the mobile modal state.
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const panel = panelRef.current;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || focusable.length === 0) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    panel.addEventListener("keydown", trapFocus);
    return () => panel.removeEventListener("keydown", trapFocus);
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const email = contact?.email?.trim() || footer("contactEmail");

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
      id="mobile-navigation-drawer"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-espresso/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside ref={panelRef} className="fixed inset-y-0 start-0 z-50 flex w-full max-w-[370px] flex-col rounded-e-[28px] border-e border-[#E9DDCE] bg-[linear-gradient(180deg,#FFFDFC_0%,#F8F2E9_100%)] text-brand-espresso shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDCE]/80 px-6 py-6 sm:px-7">
          <div className="flex items-center gap-3" dir="rtl">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#F3E5C8] text-[#B88935] shadow-sm">
              <MusicIcon size={22} />
            </div>
            <div className="flex flex-col text-start">
              <span className="font-calligraphic text-[23px] font-bold leading-none text-brand-espresso">
                {site("brand")}
              </span>
              <span className="mt-1 text-[10px] font-semibold tracking-[0.02em] text-brand-primary">
                {t("tagline")}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={a11y("closeMenu")}
            className="cursor-pointer rounded-xl p-2 text-brand-espresso/60 transition-colors hover:bg-[#F3E5C8]/60 hover:text-brand-espresso focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-7">
          <nav className="flex flex-col gap-2.5" aria-label={t("nav")}>
            {navItems.map((item) => {
              const active = isLinkActive(item.href);
              const ItemIcon = item.key === "events" ? CalendarIcon : item.key === "academy" ? PlayIcon : item.key === "news" ? SearchIcon : MusicIcon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex h-14 items-center justify-between rounded-2xl px-4 text-[15px] font-semibold transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary",
                    active
                      ? "bg-[#F3E5C8]/70 font-bold text-brand-primary"
                      : "text-brand-espresso/85 hover:bg-white/70 hover:text-brand-primary"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="flex items-center gap-3" dir="rtl">
                    <ItemIcon size={19} className={cn(active ? "text-brand-primary" : "text-[#B88935]/80")} />
                    <span>{nav(item.key)}</span>
                  </span>
                  <ChevronEndIcon size={17} className={cn("transition-colors", active ? "text-brand-primary" : "text-brand-espresso/25")} />
                </Link>
              );
            })}
          </nav>

          {/* Booking CTA Button */}
          <div className="mt-7 border-t border-[#E9DDCE]/80 pt-6">
            <Link
              href="/booking"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary py-4 text-base font-bold text-white shadow-[0_8px_20px_rgba(197,71,22,0.18)] transition-all hover:bg-brand-primary-hover active:bg-brand-primary-pressed focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <span>{t("bookingCta")}</span>
              <ArrowEndIcon size={18} />
            </Link>
          </div>

          {/* Quick Contact & Presence */}
          <div className="mt-6 space-y-5 border-t border-[#E9DDCE]/70 pt-6 text-sm">
            <div className="flex flex-col gap-1 text-start">
              <span className="text-xs font-bold tracking-wide text-brand-primary">{t("contactHeading")}</span>
              <a
                href={`mailto:${email}`}
                dir="ltr"
                className="text-brand-espresso/80 hover:text-brand-primary transition-colors text-start"
              >
                <bdi>{email}</bdi>
              </a>
            </div>

            <div className="flex flex-col gap-1 text-start">
              <span className="text-xs font-bold tracking-wide text-brand-primary">{t("regionsHeading")}</span>
              <span className="text-brand-espresso/80">{contact?.regions?.trim() || footer("contactRegions")}</span>
            </div>
          </div>
        </div>

      </aside>
    </div>
  );
}
