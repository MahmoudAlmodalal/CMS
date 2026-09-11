"use client";

import React, { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  CloseIcon,
  ChevronEndIcon,
  MusicIcon,
  ArrowEndIcon,
} from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { CONFIRMED_NAV_ITEMS } from "./Navbar";
import { LocaleSwitcher } from "./LocaleSwitcher";

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile Drawer Navigation
 * Verified against Figma Navbar Drawer (Node 139:12368 / 139:8809):
 * - Slides from inline-start (right side in RTL, left side in LTR)
 * - Traps focus, manages Escape key, locks body scroll
 * - Closes automatically upon route transition
 * - Displays 5 confirmed route links + booking CTA + contact info
 */
export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
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
      <aside ref={panelRef} className="fixed inset-y-0 start-0 z-50 w-full max-w-[370px] bg-white border-e border-brand-surface shadow-2xl flex flex-col text-brand-espresso rounded-e-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-brand-surface bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-xs">
              <MusicIcon size={20} />
            </div>
            <div className="flex flex-col text-start">
              <span className="font-calligraphic text-xl font-bold text-brand-espresso leading-none">
                {site("brand")}
              </span>
              <span className="text-[10px] font-semibold text-brand-primary mt-0.5">
                {t("tagline")}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={a11y("closeMenu")}
            className="p-2 rounded-xl text-brand-espresso/70 hover:bg-brand-surface hover:text-brand-espresso transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <nav className="flex flex-col gap-2" aria-label={t("nav")}>
            {CONFIRMED_NAV_ITEMS.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between h-11 px-4 rounded-[10px] text-sm font-semibold transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary",
                    active
                      ? "bg-brand-primary/10 text-brand-primary font-bold"
                      : "text-brand-espresso/85 hover:bg-brand-surface/50 hover:text-brand-primary"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{nav(item.key)}</span>
                  <ChevronEndIcon
                    size={18}
                    className={cn(
                      "transition-colors",
                      active ? "text-brand-primary" : "text-brand-espresso/30"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Booking CTA Button */}
          <div className="pt-2 border-t border-brand-surface/60">
            <Link
              href="/booking"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-brand-primary text-white text-base font-bold shadow-md hover:bg-brand-primary-hover active:bg-brand-primary-pressed transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <span>{t("bookingCta")}</span>
              <ArrowEndIcon size={18} />
            </Link>
          </div>

          {/* Quick Contact & Presence */}
          <div className="space-y-3 pt-4 border-t border-brand-surface/40 text-sm">
            <div className="flex flex-col gap-1 text-start">
              <span className="text-xs font-bold text-brand-primary">{t("contactHeading")}</span>
              <a
                href={`mailto:${footer("contactEmail")}`}
                dir="ltr"
                className="text-brand-espresso/80 hover:text-brand-primary transition-colors text-start"
              >
                <bdi>{footer("contactEmail")}</bdi>
              </a>
            </div>

            <div className="flex flex-col gap-1 text-start">
              <span className="text-xs font-bold text-brand-primary">{t("regionsHeading")}</span>
              <span className="text-brand-espresso/80">{footer("contactRegions")}</span>
            </div>
          </div>
        </div>

        {/* Footer: Language switch */}
        <div className="p-4 border-t border-brand-surface bg-white/40 flex items-center justify-between">
          <span className="text-xs text-brand-espresso/60">{t("languageHeading")}</span>
          <LocaleSwitcher className="px-3 py-1.5 rounded-full border border-brand-surface bg-white text-xs font-semibold h-auto" />
        </div>
      </aside>
    </div>
  );
}
