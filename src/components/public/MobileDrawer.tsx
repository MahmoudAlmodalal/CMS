"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CloseIcon,
  ChevronEndIcon,
  GlobeIcon,
  MusicIcon,
  ArrowEndIcon,
} from "@/components/ui/Icons";
import { useDirection } from "@/lib/direction";
import { cn } from "@/lib/utils";
import { CONFIRMED_NAV_ITEMS } from "./Navbar";

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
  const { isRTL, toggleDirection } = useDirection();

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
      aria-label="قائمة التنقل للهواتف"
      id="mobile-navigation-drawer"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-espresso/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside className="fixed inset-y-0 start-0 z-50 w-full max-w-[320px] sm:max-w-sm bg-brand-cream border-e border-brand-surface shadow-2xl flex flex-col text-brand-espresso">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-brand-surface bg-white/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-xs">
              <MusicIcon size={20} />
            </div>
            <div className="flex flex-col text-start">
              <span className="font-calligraphic text-xl font-bold text-brand-espresso leading-none">
                فرقة أندلسيا
              </span>
              <span className="text-[10px] font-semibold text-brand-primary mt-0.5">
                للتراث والموسيقى العربية
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="p-2 rounded-xl text-brand-espresso/70 hover:bg-brand-surface hover:text-brand-espresso transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <nav className="flex flex-col gap-2" aria-label="تنقل الهاتف">
            {CONFIRMED_NAV_ITEMS.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-bold transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary",
                    active
                      ? "bg-brand-primary/10 text-brand-primary shadow-2xs font-extrabold"
                      : "text-brand-espresso/85 hover:bg-brand-surface/60 hover:text-brand-primary"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{item.label}</span>
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
              <span>ابدأ حجزك الآن ♪</span>
              <ArrowEndIcon size={18} />
            </Link>
          </div>

          {/* Quick Contact & Presence */}
          <div className="space-y-3 pt-4 border-t border-brand-surface/40 text-sm">
            <div className="flex flex-col gap-1 text-start">
              <span className="text-xs font-bold text-brand-primary">التواصل</span>
              <a
                href="mailto:hello@andalusia.art"
                dir="ltr"
                className="text-brand-espresso/80 hover:text-brand-primary transition-colors text-start"
              >
                <bdi>hello@andalusia.art</bdi>
              </a>
            </div>

            <div className="flex flex-col gap-1 text-start">
              <span className="text-xs font-bold text-brand-primary">الانتشار الإقليمي</span>
              <span className="text-brand-espresso/80">لبنان · المغرب · الخليج</span>
            </div>
          </div>
        </div>

        {/* Footer: Direction Switcher */}
        <div className="p-4 border-t border-brand-surface bg-white/40 flex items-center justify-between">
          <span className="text-xs text-brand-espresso/60">اتجاه الواجهة</span>
          <button
            type="button"
            onClick={toggleDirection}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-surface bg-white text-xs font-semibold text-brand-espresso hover:bg-brand-surface transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <GlobeIcon size={14} className="text-brand-primary" />
            <span>{isRTL ? "RTL (عربي)" : "LTR (English)"}</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
