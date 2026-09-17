"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";

/**
 * Creative animated language switcher:
 * A 3D dual-sided medallion that flips 180° between Latin ("En") and the
 * Arabic heritage calligraphy mark ("ع"), illuminated by a warm terracotta glow.
 *
 * Preserves Figma node 134:8271 (En icon) on Arabic and ic:baseline-language on English.
 */
export function LocaleSwitcher({ className, mobile = false }: { className?: string; mobile?: boolean }) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const t = useTranslations("locale");
  const other: AppLocale = locale === "ar" ? "en" : "ar";
  const [clicked, setClicked] = useState(false);

  return (
    <Link
      href={pathname}
      locale={other}
      hrefLang={other}
      aria-label={t("switchLabel")}
      onClick={() => setClicked(true)}
      className={cn(
        "group locale-switcher-badge relative inline-flex items-center justify-center shrink-0 select-none rounded-full transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary",
        mobile
          ? "h-9 min-w-[58px] gap-1.5 rounded-xl border border-brand-espresso/15 bg-brand-cream/80 px-2.5 py-1 text-[11px] font-bold text-brand-espresso hover:border-brand-primary/40 hover:bg-brand-cream active:scale-95"
          : "size-8 border border-brand-espresso/15 bg-brand-cream/80 hover:border-brand-primary/50 hover:bg-white active:scale-90",
        className,
      )}
    >
      {/* 3D Flipping Script Medallion */}
      <div
        className={cn(
          "locale-coin relative flex items-center justify-center rounded-full",
          mobile ? "size-5" : "size-full",
          clicked && "locale-coin-spin",
        )}
      >
        {/* Front Face: Current Invitation (En on AR / Globe on EN) */}
        <span
          className="locale-coin-face absolute inset-0 flex items-center justify-center rounded-full text-brand-espresso transition-colors group-hover:text-brand-primary"
          aria-hidden="true"
        >
          {locale === "ar" ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="size-5"
            >
              <path d="M14 10H16V10.757C16.6777 10.3042 17.4656 10.044 18.2796 10.0041C19.0936 9.96414 19.9032 10.146 20.6219 10.5303C21.3406 10.9147 21.9415 11.4869 22.3603 12.1861C22.7791 12.8852 23.0002 13.685 23 14.5V20H21V14.5C21 13.07 19.826 12 18.5 12C17.174 12 16 13.07 16 14.5V20H14V10ZM12 4V6H4V11H12V13H4V18H12V20H2V4H12Z" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="size-5"
              data-name="ic:baseline-language"
            >
              <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM18.92 8H15.97C15.6565 6.76161 15.1931 5.56611 14.59 4.44C16.4141 5.068 17.9512 6.33172 18.92 8ZM12 4.04C12.83 5.24 13.48 6.57 13.91 8H10.09C10.52 6.57 11.17 5.24 12 4.04ZM4.26 14C4.1 13.36 4 12.69 4 12C4 11.31 4.1 10.64 4.26 10H7.64C7.56 10.66 7.5 11.32 7.5 12C7.5 12.68 7.56 13.34 7.64 14H4.26ZM5.08 16H8.03C8.35 17.25 8.81 18.45 9.41 19.56C7.58455 18.9344 6.04674 17.67 5.08 16ZM8.03 8H5.08C6.04674 6.32995 7.58455 5.06561 9.41 4.44C8.80688 5.56611 8.34346 6.76161 8.03 8ZM12 19.96C11.17 18.76 10.52 17.43 10.09 16H13.91C13.48 17.43 12.83 18.76 12 19.96ZM14.34 14H9.66C9.57 13.34 9.5 12.68 9.5 12C9.5 11.32 9.57 10.65 9.66 10H14.34C14.43 10.65 14.5 11.32 14.5 12C14.5 12.68 14.43 13.34 14.34 14ZM14.59 19.56C15.19 18.45 15.65 17.25 15.97 16H18.92C17.9512 17.6683 16.4141 18.932 14.59 19.56ZM16.36 14C16.44 13.34 16.5 12.68 16.5 12C16.5 11.32 16.44 10.66 16.36 10H19.74C19.9 10.64 20 11.31 20 12C20 12.69 19.9 13.36 19.74 14H16.36Z" />
            </svg>
          )}
        </span>

        {/* Back Face: Revealed on 180° Flip with Terracotta Heritage Calligraphy */}
        <span
          className="locale-coin-face locale-coin-back absolute inset-0 flex items-center justify-center rounded-full bg-brand-primary text-white shadow-xs"
          aria-hidden="true"
        >
          {locale === "ar" ? (
            /* Reveals English Latin mark */
            <span className="font-sans text-[11px] font-extrabold uppercase tracking-tight">
              EN
            </span>
          ) : (
            /* Reveals Arabic calligraphy Ayn mark */
            <span className="font-display text-[15px] font-bold leading-none select-none">
              ع
            </span>
          )}
        </span>
      </div>

      {mobile ? (
        <span
          className="font-sans text-[11px] font-bold text-brand-espresso transition-colors group-hover:text-brand-primary"
          aria-hidden="true"
        >
          {other.toUpperCase()}
        </span>
      ) : null}

      {/* Subtle Terracotta Script Glow Aura */}
      <span
        className="pointer-events-none absolute -inset-1 rounded-full bg-brand-primary/25 opacity-0 blur-xs transition-opacity duration-300 group-hover:opacity-100 -z-10"
        aria-hidden="true"
      />
    </Link>
  );
}
