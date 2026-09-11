"use client";

import React from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";

/**
 * Figma shows a plain text switch in the navbar ("En" on the Arabic screens),
 * not an icon. It links to the same route in the other locale rather than
 * flipping direction in place, so the page is actually translated.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const t = useTranslations("locale");
  const other: AppLocale = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={pathname}
      locale={other}
      hrefLang={other}
      aria-label={t("switchLabel")}
      className={cn(
        "inline-flex items-center justify-center min-w-6 h-6 text-base font-bold text-brand-espresso hover:text-brand-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs",
        className,
      )}
    >
      {t("switchTo")}
    </Link>
  );
}
