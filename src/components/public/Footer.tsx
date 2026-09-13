import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { SiteSettings } from "@/lib/dal/site-settings";

function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch { return null; }
}

export function Footer({ settings }: { settings?: SiteSettings }) {
  const t = useTranslations("footer");
  const a11y = useTranslations("a11y");
  const mission = settings?.footer_mission?.trim() || t("mission");
  const email = settings?.contact_email?.trim() || t("contactEmail");
  const regions = settings?.operational_regions?.trim() || t("contactRegions");
  const copyright = settings?.copyright_text?.trim() || t("copyright");
  const socials = [
    { label: "Instagram", href: safeExternalUrl(settings?.social_links?.instagram) },
    { label: "TikTok", href: safeExternalUrl(settings?.social_links?.tiktok) },
  ].filter((s): s is { label: string; href: string } => s.href !== null);
  const linkClass = "flex min-h-11 items-center text-sm font-medium text-primary-50 transition-colors hover:text-brand-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs";

  return (
    <footer className="relative w-full overflow-hidden bg-brand-espresso text-brand-tint" role="contentinfo">
      <div className="pointer-events-none absolute inset-0 bg-[url('/assets/branding/arabesque-texture.png')] bg-repeat opacity-[0.06]" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16 xl:px-16">
        <div className="grid grid-cols-1 gap-8 text-start sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="flex min-w-0 flex-col items-start">
            <Image src="/assets/branding/logo-footer.png" alt={a11y("brandHome")} width={211} height={86} sizes="211px" className="h-auto w-[min(211px,70vw)] object-contain" />
            <p className="max-w-[260px] pt-4 text-sm leading-relaxed text-primary-50">{mission}</p>
            <p className="pt-4 text-sm font-bold text-brand-primary">{t("motto")}</p>
          </div>
          <div className="flex min-w-0 flex-col items-start">
            <h4 className="text-sm font-bold text-brand-primary">{t("exploreHeading")}</h4>
            <nav className="mt-2 flex flex-col items-start" aria-label={a11y("exploreLinks")}>
              {([
                { href: "/artists", key: "exploreArtists" },
                { href: "/events", key: "exploreEvents" },
                { href: "/news", key: "exploreNews" },
                { href: "/academy", key: "exploreAcademy" },
              ] as const).map((item) => <Link key={item.href} href={item.href} className={linkClass}>{t(item.key)}</Link>)}
            </nav>
          </div>
          <div className="flex min-w-0 flex-col items-start">
            <h4 className="text-sm font-bold text-brand-primary">{t("contactHeading")}</h4>
            <div className="mt-2 flex flex-col items-start text-sm font-medium leading-6 text-primary-50">
              <a href={`mailto:${email}`} dir="ltr" className={linkClass}><bdi>{email}</bdi></a>
              {socials.length > 0 ? <span dir="ltr" className="flex min-h-11 items-center gap-2">{socials.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary">{social.label}</a>)}</span> : <span className="flex min-h-11 items-center">{t("contactSocial")}</span>}
              <span className="flex min-h-11 items-center">{regions}</span>
            </div>
          </div>
          <div className="flex min-w-0 flex-col items-start">
            <h4 className="max-w-[240px] text-base font-bold text-[#ECE6D0]">{t("bookingHeading")}</h4>
            <p className="max-w-[280px] pt-2.5 pb-5 text-sm leading-relaxed text-primary-50">{t("bookingBody")}</p>
            <Link href="/booking" className="inline-flex min-h-11 w-full max-w-[180px] items-center justify-center rounded-xl bg-brand-primary px-5 text-base font-bold text-[#ECE6D0] transition-colors hover:bg-brand-primary-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary">{t("bookingCta")}</Link>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/15 pt-5 text-primary-50 sm:flex-row sm:items-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">{t("strapline")}</span>
          <span className="text-xs">{copyright}</span>
        </div>
      </div>
    </footer>
  );
}
