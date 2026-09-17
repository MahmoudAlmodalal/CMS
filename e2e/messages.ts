import fs from "node:fs";
import path from "node:path";

export type Locale = "ar" | "en";

/** The locale prefix each locale's URLs carry: Arabic is the unprefixed default. */
export const LOCALE_PREFIX: Record<Locale, string> = { ar: "", en: "/en" };

export const LOCALES: readonly Locale[] = ["ar", "en"];

const catalogs = new Map<Locale, Record<string, unknown>>();

function catalog(locale: Locale): Record<string, unknown> {
  let loaded = catalogs.get(locale);
  if (!loaded) {
    loaded = JSON.parse(
      fs.readFileSync(path.resolve(`src/messages/${locale}.json`), "utf-8"),
    ) as Record<string, unknown>;
    catalogs.set(locale, loaded);
  }
  return loaded;
}

/**
 * The string a component renders for `t("key")`, read from the same catalog the
 * app uses.
 *
 * Specs used to hardcode the Arabic copy ("تصنيفات الفنانين"), which meant a
 * copy edit broke the test and the English side went uncovered. Resolving the
 * key instead keeps a spec honest in both locales, and throws here — where the
 * message names the key — rather than failing later as a selector that matches
 * nothing.
 */
export function t(locale: Locale, key: string, params?: Record<string, string>): string {
  let node: unknown = catalog(locale);
  for (const segment of key.split(".")) {
    if (typeof node !== "object" || node === null) {
      throw new Error(`messages: "${key}" is not a path in ${locale}.json`);
    }
    node = (node as Record<string, unknown>)[segment];
  }
  if (typeof node !== "string") {
    throw new Error(`messages: "${key}" is missing from ${locale}.json`);
  }
  return params
    ? Object.entries(params).reduce((acc, [name, value]) => acc.replaceAll(`{${name}}`, value), node)
    : node;
}

/** Both locales' copy for one key, for a selector that should match either. */
export function anyLocale(key: string): RegExp {
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(LOCALES.map((l) => escape(t(l, key))).join("|"));
}

/** Rich-text markers like <em> are markup in the catalog, not literal text. */
export function plain(locale: Locale, key: string): string {
  return t(locale, key).replace(/<[^>]+>/g, "");
}
