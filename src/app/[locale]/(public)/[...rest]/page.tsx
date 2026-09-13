import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

/**
 * Catch-all that turns an unmatched public URL into a localized 404.
 *
 * Without it an unknown path never enters the [locale] segment, so Next falls
 * back to its built-in not-found page — a bare <html> with no lang, no dir and
 * no site chrome. Routing it through here instead means the visitor gets
 * (public)/not-found.tsx inside the normal shell, in their own language.
 *
 * Real routes are more specific than a catch-all, so this never shadows them.
 */
export default async function PublicCatchAll({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  notFound();
}
