import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/LayoutPrimitives";
import { localeDirection, routing, type AppLocale } from "@/i18n/routing";

/** The sections worth offering someone who landed on a dead link. */
const SECTIONS = [
  { path: "/artists", key: "artists" },
  { path: "/events", key: "events" },
  { path: "/academy", key: "academy" },
  { path: "/news", key: "news" },
] as const;

/**
 * Not-found boundary for the public site, covering both an unknown URL (routed
 * here by (public)/[...rest]) and an explicit notFound() from a detail page
 * whose slug no longer resolves.
 *
 * Known limitation: this app has no src/app/layout.tsx — [locale], (admin) and
 * (auth) are separate root layouts — so Next renders any not-found in its own
 * client error shell (<html id="__next_error__">) instead of inside
 * [locale]/layout.tsx. The response status is a correct 404 and the markup
 * arrives in the RSC payload, but it paints on hydration rather than in the
 * server HTML, and the shell carries no lang/dir. dir is therefore set here
 * explicitly so Arabic still lays out right-to-left.
 *
 * For the same reason the locale-aware Link from @/i18n/navigation is avoided:
 * it has no router context in that shell. Plain next/link with a prefix derived
 * from the locale keeps every suggestion inside the visitor's own language.
 */
export default function PublicNotFound() {
  const t = useTranslations("notFound");
  const tNav = useTranslations("nav");
  const locale = useLocale();

  // Mirrors localePrefix "as-needed": the default locale stays unprefixed.
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;

  return (
    <div
      lang={locale}
      dir={localeDirection[locale as AppLocale]}
      className="flex min-h-[60vh] items-center py-16 lg:py-24"
    >
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p
            aria-hidden="true"
            className="font-calligraphic text-[88px] font-bold leading-none text-brand-primary/25 sm:text-[120px]"
          >
            {t("code")}
          </p>

          <h1 className="mt-2 font-calligraphic text-3xl font-bold text-brand-espresso sm:text-4xl">
            {t("title")}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-gradscale-400">
            {t("body")}
          </p>

          <Link
            href={prefix || "/"}
            className="mt-8 inline-flex items-center justify-center rounded-button bg-brand-primary px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            {t("home")}
          </Link>

          <div className="mt-12 w-full border-t border-brand-espresso-subtle pt-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.09em] text-gradscale-300">
              {t("exploreHeading")}
            </h2>
            <nav className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {SECTIONS.map((section) => (
                <Link
                  key={section.path}
                  href={`${prefix}${section.path}`}
                  className="rounded-button border border-brand-espresso-subtle bg-white px-5 py-2.5 text-sm font-bold text-brand-espresso transition-colors hover:border-brand-primary/50 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                >
                  {tNav(section.key)}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </Container>
    </div>
  );
}
