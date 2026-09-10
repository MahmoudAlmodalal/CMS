"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronEndIcon } from "@/components/ui/Icons";
import { getAdminBreadcrumbs } from "./adminNavConfig";

export function AdminBreadcrumbs({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const crumbs = getAdminBreadcrumbs(pathname);

  return (
    <nav aria-label="مسار التنقل" className={`flex items-center text-sm ${className}`}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="text-brand-espresso/60 hover:text-brand-primary transition-colors text-xs font-medium"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={`text-xs ${isLast ? "font-bold text-brand-espresso" : "text-brand-espresso/60"}`}>
                  {crumb.label}
                </span>
              )}
              {!isLast && (
                <span className="text-brand-espresso/30 rtl:-scale-x-100 inline-flex items-center" aria-hidden="true">
                  <ChevronEndIcon size={12} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
