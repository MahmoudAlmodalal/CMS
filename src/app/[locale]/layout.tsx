import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { DirectionProvider } from "@/lib/direction";
import { fontVariables } from "@/lib/fonts";
import { localeDirection, routing, type AppLocale } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Required for the public pages to keep rendering statically.
  setRequestLocale(locale);
  const direction = localeDirection[locale as AppLocale];

  return (
    <html lang={locale} dir={direction} className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-brand-cream text-brand-espresso">
        <NextIntlClientProvider>
          <DirectionProvider locale={locale as AppLocale}>{children}</DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
