"use client";

import React from "react";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { LogoutButton } from "./LogoutButton";
import { MenuIcon } from "@/components/ui/Icons";

interface AdminHeaderProps {
  userEmail?: string | null;
  onMenuToggle?: () => void;
  className?: string;
}

export function AdminHeader({
  userEmail,
  onMenuToggle,
  className = "",
}: AdminHeaderProps) {
  return (
    <header
      className={`bg-white border-b border-brand-espresso-subtle px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger button */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg border border-brand-espresso-subtle/70 text-brand-espresso hover:bg-brand-surface/50 transition-colors cursor-pointer"
          aria-label="فتح القائمة الجانبية"
        >
          <MenuIcon size={20} />
        </button>

        {/* Dynamic Breadcrumbs */}
        <AdminBreadcrumbs />
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden sm:flex flex-col text-end">
          {userEmail && (
            <span className="text-xs font-medium text-brand-espresso leading-tight" dir="ltr">
              {userEmail}
            </span>
          )}
          <span className="text-[10px] text-brand-primary font-semibold">
            مدير النظام
          </span>
        </div>

        <span className="hidden sm:inline-block w-px h-6 bg-brand-espresso-subtle" aria-hidden="true" />

        <LogoutButton />
      </div>
    </header>
  );
}
