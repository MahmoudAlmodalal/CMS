"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "./LocaleSwitcher";

/** Mobile top bar based on the supplied reference, intentionally without a menu button. */
export function MobileNavbar() {
  const a11y = useTranslations("a11y");
  const site = useTranslations("site");

  return (
    <div className="pointer-events-none absolute inset-x-2.5 top-[36px] z-40 lg:hidden">
      <header
        className="pointer-events-auto flex h-14 min-w-0 items-center justify-between gap-3 rounded-[20px] bg-white px-4 shadow-subtle sm:px-5"
        role="banner"
      >
        <LocaleSwitcher mobile />

        <Link
          href="/"
          className={cn(
            "flex h-9 min-w-0 flex-1 items-center justify-end rounded-xl",
            "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary sm:h-11",
          )}
          aria-label={a11y("brandHome")}
        >
          <Image
            src="/assets/branding/logo-navbar.png"
            alt={site("brand")}
            width={628}
            height={226}
            loading="eager"
            className="h-full w-auto max-w-[168px] object-contain"
          />
        </Link>
      </header>
    </div>
  );
}
