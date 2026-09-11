import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

import ar from "../messages/ar.json";
import en from "../messages/en.json";

/**
 * Messages are imported statically, one per locale, rather than through a
 * template-literal `import(\`../messages/${locale}.json\`)`.
 *
 * The dynamic form makes Turbopack emit a wildcard chunk covering every file the
 * expression could resolve to, and that chunk was requested at runtime but never
 * written to .next — the browser got a 500 for it, hydration threw ChunkLoadError,
 * and the page rendered as Chromium's "This page couldn't load" error instead of
 * the site. With two known locales there is nothing to gain from the dynamic form.
 */
const MESSAGES = { ar, en } as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: MESSAGES[locale],
  };
});
