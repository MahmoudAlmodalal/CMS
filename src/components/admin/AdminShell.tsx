"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { CloseIcon } from "@/components/ui/Icons";

interface AdminShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
}

export function AdminShell({ children, userEmail }: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#F9F7F0] text-brand-espresso flex flex-row" dir="rtl">
      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen z-20">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-brand-espresso/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container (sliding from start/right in RTL) */}
          <div className="fixed inset-y-0 start-0 max-w-xs w-full bg-white shadow-2xl z-10 flex flex-col animate-in slide-in-from-start duration-200">
            <div className="absolute top-4 end-4 z-20">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-brand-espresso/70 hover:text-brand-espresso hover:bg-brand-surface transition-colors cursor-pointer"
                aria-label="إغلاق القائمة الجانبية"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <AdminSidebar onItemClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AdminHeader
          userEmail={userEmail}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />
        <main id="admin-main" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
