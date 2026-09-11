import { defineRouting } from "next-intl/routing";

export const locales = ["ar", "en"] as const;
export type AppLocale = (typeof locales)[number];

export const localeDirection: Record<AppLocale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
};

/**
 * Arabic is the canonical locale and keeps its unprefixed URLs, so every link
 * that already exists in the wild — and every admin route — is untouched.
 * English is served from /en.
 */
export const routing = defineRouting({
  locales,
  defaultLocale: "ar",
  localePrefix: "as-needed",
});

export function isAppLocale(value: string | undefined): value is AppLocale {
  return value === "ar" || value === "en";
}
