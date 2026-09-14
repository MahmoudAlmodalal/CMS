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
    <footer className="relative w-full overflow-hidden bg-brand-espresso text-brand-tint lg:min-h-[385px]" role="contentinfo">
      {/* Arabesque corner mark, cropped once from the reference (94:18289) — the
          design draws a single mark, not a repeating field. Texture ref
          da60c98546b43a3524b1bbd7667d8f518e1c7ee3. */}
      <div
        aria-hidden="true"
        data-texture-ref="da60c98546b43a3524b1bbd7667d8f518e1c7ee3"
        className="pointer-events-none absolute left-0 top-0 h-[120px] w-[120px] bg-[url('/assets/branding/footer-mark.png')] bg-contain bg-no-repeat opacity-10"
      />
      <div className="relative mx-auto w-full max-w-[1454px] px-5 pb-10 pt-8 lg:px-10 lg:pb-8 lg:pt-16 xl:px-16">
        {/* Mobile (136:7847): one column of four fixed boxes broken out of the
            footer's own padding to span the full 390. Desktop (94:18509): the
            same four columns at absolute offsets in a 736x190 block. */}
        <div className="flex flex-col items-center gap-8 lg:relative lg:mx-auto lg:block lg:h-[190px] lg:w-[736px]">
          <div className="flex w-full max-w-[345px] min-w-0 flex-col items-center text-center lg:absolute lg:left-[594px] lg:top-0 lg:items-start lg:text-start">
            <Image src="/assets/branding/logo-footer.png" alt={a11y("brandHome")} width={211} height={86} sizes="211px" className="h-auto w-[min(211px,70vw)] object-contain" />
            <p className="max-w-[260px] pt-4 text-sm leading-relaxed text-primary-50">{mission}</p>
            <p className="pt-4 text-sm font-bold text-brand-primary">{t("motto")}</p>
          </div>
          <div className="w-full max-w-[345px] border-t border-white/10 pt-6 lg:absolute lg:left-[290px] lg:top-0 lg:h-[190px] lg:w-[156px] lg:max-w-none lg:border-0 lg:pt-0">
            <div className="flex flex-col items-center lg:items-start">
            <h4 className="text-sm font-bold text-brand-primary">{t("exploreHeading")}</h4>
            <nav className="mt-3 flex flex-col items-center gap-1 lg:items-start" aria-label={a11y("exploreLinks")}>
              {([
                { href: "/artists", key: "exploreArtists" },
                { href: "/events", key: "exploreEvents" },
                { href: "/news", key: "exploreNews" },
                { href: "/academy", key: "exploreAcademy" },
              ] as const).map((item) => <Link key={item.href} href={item.href} className={linkClass}>{t(item.key)}</Link>)}
            </nav>
            </div>
          </div>
          <div className="w-full max-w-[345px] border-t border-white/10 pt-6 lg:absolute lg:left-[90px] lg:top-0 lg:h-[137px] lg:w-[156px] lg:max-w-none lg:border-0 lg:pt-0">
            <div className="flex flex-col items-center lg:items-start">
            <h4 className="text-sm font-bold text-brand-primary">{t("contactHeading")}</h4>
            <div className="mt-3 flex flex-col items-center text-sm font-medium leading-6 text-primary-50 lg:items-start">
              <a href={`mailto:${email}`} dir="ltr" className={linkClass}><bdi>{email}</bdi></a>
              {socials.length > 0 ? <span dir="ltr" className="flex min-h-11 items-center gap-2">{socials.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary">{social.label}</a>)}</span> : <span className="flex min-h-11 items-center">{t("contactSocial")}</span>}
              <span className="flex min-h-11 items-center">{regions}</span>
            </div>
            </div>
          </div>
          <div className="w-full max-w-[345px] border-t border-white/10 pt-6 text-center lg:absolute lg:left-[-193px] lg:top-0 lg:h-[190px] lg:w-[321px] lg:max-w-none lg:border-0 lg:pt-0 lg:text-start">
            <h4 className="max-w-[240px] text-base font-bold text-[#ECE6D0]">{t("bookingHeading")}</h4>
            <p className="max-w-[280px] pt-2.5 pb-5 text-sm leading-relaxed text-primary-50">{t("bookingBody")}</p>
            <Link href="/booking" className="mx-auto inline-flex min-h-12 w-full max-w-[300px] items-center justify-center rounded-xl bg-brand-primary px-5 text-base font-bold text-[#ECE6D0] transition-colors hover:bg-brand-primary-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary lg:mx-0 lg:max-w-[180px]">{t("bookingCta")}</Link>
          </div>
        </div>
        {/* Bottom bar: strapline at the inline start, copyright at the inline end —
            reversed against the reading direction at every width, never stacked. */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 border-t border-white/15 pt-6 text-center text-primary-50 lg:mt-14 lg:flex-row-reverse lg:justify-between lg:pt-5 lg:text-start">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">{t("strapline")}</span>
          <span className="text-xs">{copyright}</span>
        </div>
      </div>
    </footer>
  );
}
