"use client";

import React, { useState } from "react";
import { Drawer } from "./Drawer";
import {
  MenuIcon,
  ChevronEndIcon,
  GlobeIcon,
  MusicIcon,
  CalendarIcon,
  PhoneIcon,
  ArrowEndIcon,
} from "./Icons";
import { useDirection } from "@/lib/direction";

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "الرئيسية", href: "#home", active: true },
  { label: "فنانو الفرقة", href: "#artists" },
  { label: "الحفلات والأمسيات", href: "#events" },
  { label: "أكاديمية الموسيقى", href: "#academy" },
  { label: "مدونة التراث", href: "#news" },
  { label: "حجز الفعاليات", href: "#booking" },
];

export function Navigation({
  items = DEFAULT_NAV_ITEMS,
  className = "",
}: {
  items?: NavItem[];
  className?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { direction, isRTL, toggleDirection } = useDirection();

  return (
    <header className={`sticky top-0 z-40 w-full bg-brand-cream/90 backdrop-blur-md border-b border-brand-surface ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Inline Start: Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-xs">
              <MusicIcon size={22} />
            </div>
            <div className="flex flex-col text-start">
              <span className="font-calligraphic text-2xl font-bold text-brand-espresso leading-none">
                فرقة أندلسيا
              </span>
              <span className="text-[11px] font-semibold text-brand-primary tracking-wide mt-0.5">
                للتراث والموسيقى العربية
              </span>
            </div>
          </div>

          {/* Center / Start Flow: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-brand-surface text-brand-primary font-bold shadow-2xs"
                    : "text-brand-espresso/80 hover:text-brand-primary hover:bg-brand-surface/40"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Inline End: CTA, Direction Switcher & Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Direction toggle button: demonstration of architecture supporting both directions */}
            <button
              type="button"
              onClick={toggleDirection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-surface bg-white/80 hover:bg-brand-surface text-xs font-medium text-brand-espresso transition-colors cursor-pointer"
              title="تبديل اتجاه المستند لاختبار المرونة"
            >
              <GlobeIcon size={15} className="text-brand-primary" />
              <span>{isRTL ? "RTL (عربي)" : "LTR (English)"}</span>
            </button>

            <a
              href="#booking"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-primary text-white text-sm font-bold shadow-sm hover:bg-brand-primary/90 transition-all cursor-pointer"
            >
              <span>احجز فعاليتك</span>
              <ArrowEndIcon size={16} />
            </a>

            {/* Mobile drawer trigger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-brand-surface bg-white text-brand-espresso hover:bg-brand-surface transition-colors cursor-pointer"
              aria-label="فتح القائمة الرئيسية"
            >
              <MenuIcon size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Side sheet sliding from inline-start) */}
      <Drawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        side="start"
        title="قائمة التنقل"
      >
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                item.active
                  ? "bg-brand-surface text-brand-primary font-bold"
                  : "text-brand-espresso hover:bg-brand-surface/40"
              }`}
            >
              <span>{item.label}</span>
              <ChevronEndIcon size={16} className="text-brand-espresso/40" />
            </a>
          ))}

          <div className="pt-6 mt-4 border-t border-brand-surface/60 flex flex-col gap-3">
            <a
              href="#booking"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-primary text-white text-base font-bold shadow-sm"
            >
              <span>طلب حجز حفل</span>
              <ArrowEndIcon size={18} />
            </a>
          </div>
        </div>
      </Drawer>
    </header>
  );
}

/**
 * RTL Breadcrumbs component with directional chevron separators
 */
export function Breadcrumbs({
  items,
  className = "",
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav
      aria-label="مسار التصفح"
      className={`flex items-center gap-2 text-sm text-brand-espresso/70 ${className}`}
    >
      <ol className="flex items-center gap-2">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="hover:text-brand-primary transition-colors hover:underline"
                >
                  {item.label}
                </a>
              ) : (
                <span className={isLast ? "font-bold text-brand-espresso" : ""}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="text-brand-espresso/40">
                  <ChevronEndIcon size={14} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
