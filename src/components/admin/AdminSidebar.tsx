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
}

export function AdminSidebar({ className = "", onItemClick }: AdminSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      aria-label="القائمة الجانبية للوحة التحكم"
      className={`w-64 bg-white border-e border-brand-espresso-subtle flex flex-col h-full select-none ${className}`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-brand-espresso-subtle/60 flex items-center justify-between">
        <Link
          href="/admin"
          onClick={onItemClick}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <MusicIcon size={20} />
          </div>
          <div className="flex flex-col text-start">
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
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {ADMIN_NAV_SECTIONS.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h2 className="px-3 text-[11px] font-bold text-gradscale-400 tracking-wider uppercase">
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
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? "bg-brand-primary/10 text-brand-primary font-bold shadow-2xs border-s-2 border-brand-primary"
                        : "text-brand-espresso/80 hover:text-brand-primary hover:bg-brand-surface/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={active ? "text-brand-primary" : "text-gradscale-400"}>
                        <AdminIconDispatcher name={item.iconName} size={16} />
                      </span>
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary font-bold">
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
      <div className="p-3 border-t border-brand-espresso-subtle/60 bg-[#FAF9F5]">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg border border-brand-espresso-subtle/60 bg-white text-xs font-semibold text-brand-espresso/80 hover:text-brand-primary hover:border-brand-primary/30 transition-colors shadow-2xs"
        >
          <span>عرض الموقع العام</span>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </Link>
      </div>
    </aside>
  );
}
