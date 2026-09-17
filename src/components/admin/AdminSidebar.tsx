"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_SECTIONS } from "./adminNavConfig";
import { AdminIconDispatcher } from "./AdminIcons";
import { MusicIcon } from "@/components/ui/Icons";

interface AdminSidebarProps {
  className?: string;
  onItemClick?: () => void;
  variant?: "full" | "responsive";
}

export function AdminSidebar({ className = "", onItemClick, variant = "full" }: AdminSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isResponsive = variant === "responsive";

  return (
    <aside
      aria-label="القائمة الجانبية للوحة التحكم"
      className={`${isResponsive ? "w-16 lg:w-64" : "w-64"} bg-white border-e border-brand-espresso-subtle flex flex-col h-full select-none ${className}`}
    >
      {/* Brand Header */}
      <div className={`p-3 lg:p-5 border-b border-brand-espresso-subtle/60 flex items-center ${isResponsive ? "justify-center lg:justify-between" : "justify-between"}`}>
        <Link
          href="/admin"
          onClick={onItemClick}
          className="flex items-center gap-3 group min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xl"
          title="أندلسيا - لوحة التحكم الإدارية"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <MusicIcon size={20} />
          </div>
          <div className={`flex flex-col text-start ${isResponsive ? "hidden lg:flex" : "flex"}`}>
            <span className="font-calligraphic text-xl font-bold text-brand-espresso leading-none">
              أندلسيا
            </span>
            <span className="text-[11px] font-semibold text-brand-primary mt-1">
              لوحة التحكم الإدارية
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-2 lg:px-3 py-4 space-y-6 scrollbar-thin">
        {ADMIN_NAV_SECTIONS.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h2 className={`px-2 lg:px-3 text-[11px] font-bold text-gradscale-400 tracking-wider uppercase ${isResponsive ? "hidden lg:block" : "block"}`}>
              {section.title}
            </h2>
            <div className="space-y-0.5 mt-1">
              {section.items.map((item) => {
                const active = isItemActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onItemClick}
                    title={item.title}
                    className={`flex items-center ${isResponsive ? "justify-center lg:justify-between px-2 lg:px-3" : "justify-between px-3"} min-h-[44px] py-2 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? "bg-brand-primary/10 text-brand-primary font-bold shadow-2xs border-s-2 border-brand-primary"
                        : "text-brand-espresso/80 hover:text-brand-primary hover:bg-brand-surface/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`${active ? "text-brand-primary" : "text-gradscale-400"} shrink-0`}>
                        <AdminIconDispatcher name={item.iconName} size={18} />
                      </span>
                      <span className={isResponsive ? "hidden lg:inline" : "inline"}>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary font-bold ${isResponsive ? "hidden lg:inline-block" : "inline-block"}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer: View Public Site */}
      <div className="p-2 lg:p-3 border-t border-brand-espresso-subtle/60 bg-[#FAF9F5]">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="عرض الموقع العام"
          className={`flex items-center justify-center gap-2 w-full min-h-[44px] py-2 ${isResponsive ? "px-2 lg:px-3" : "px-3"} rounded-lg border border-brand-espresso-subtle/60 bg-white text-xs font-semibold text-brand-espresso/80 hover:text-brand-primary hover:border-brand-primary/30 transition-colors shadow-2xs`}
        >
          <span className={isResponsive ? "hidden lg:inline" : "inline"}>عرض الموقع العام</span>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </Link>
      </div>
    </aside>
  );
}

