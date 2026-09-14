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
      <div className="relative mx-auto w-full max-w-[1454px] px-6 pb-[26.333px] pt-[21px] lg:pb-8 lg:pt-16 lg:px-10 xl:px-16">
        {/* Mobile (136:7847): one column of four fixed boxes broken out of the
            footer's own padding to span the full 390. Desktop (94:18509): the
            same four columns at absolute offsets in a 736x190 block. */}
        <div className="-mx-6 flex flex-col items-start px-6 lg:relative lg:mx-auto lg:block lg:h-[190px] lg:w-[736px] lg:px-0">
          <div className="ms-px mb-[46.5px] flex w-[345px] max-w-full min-w-0 flex-col items-start lg:absolute lg:left-[594px] lg:top-0 lg:mb-0 lg:w-[220px]">
            <Image src="/assets/branding/logo-footer.png" alt={a11y("brandHome")} width={211} height={86} sizes="211px" className="h-auto w-[min(211px,70vw)] object-contain" />
            <p className="max-w-[260px] pt-4 text-sm leading-relaxed text-primary-50">{mission}</p>
            <p className="pt-4 text-sm font-bold text-brand-primary">{t("motto")}</p>
          </div>
          <div className="ms-3 flex h-[190px] w-[156px] min-w-0 flex-col items-start lg:absolute lg:left-[290px] lg:top-0 lg:ms-0">
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
          <div className="ms-3 mb-[29px] flex h-[137px] w-[156px] min-w-0 flex-col items-start lg:absolute lg:left-[90px] lg:top-0 lg:mb-0 lg:ms-0">
            <h4 className="text-sm font-bold text-brand-primary">{t("contactHeading")}</h4>
            <div className="mt-2 flex flex-col items-start text-sm font-medium leading-6 text-primary-50">
              <a href={`mailto:${email}`} dir="ltr" className={linkClass}><bdi>{email}</bdi></a>
              {socials.length > 0 ? <span dir="ltr" className="flex min-h-11 items-center gap-2">{socials.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary">{social.label}</a>)}</span> : <span className="flex min-h-11 items-center">{t("contactSocial")}</span>}
              <span className="flex min-h-11 items-center">{regions}</span>
            </div>
          </div>
          <div className="ms-[25px] flex h-[190px] w-[321px] max-w-full min-w-0 flex-col items-start lg:absolute lg:left-[-193px] lg:top-0 lg:ms-0">
            <h4 className="max-w-[240px] text-base font-bold text-[#ECE6D0]">{t("bookingHeading")}</h4>
            <p className="max-w-[280px] pt-2.5 pb-5 text-sm leading-relaxed text-primary-50">{t("bookingBody")}</p>
            <Link href="/booking" className="inline-flex min-h-11 w-full max-w-[180px] items-center justify-center rounded-xl bg-brand-primary px-5 text-base font-bold text-[#ECE6D0] transition-colors hover:bg-brand-primary-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary">{t("bookingCta")}</Link>
          </div>
        </div>
        {/* Bottom bar: strapline at the inline start, copyright at the inline end —
            reversed against the reading direction at every width, never stacked. */}
        <div className="mt-5 flex flex-row-reverse items-center justify-between gap-3 border-t border-white/15 pt-5 text-primary-50 lg:mt-14">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">{t("strapline")}</span>
          <span className="text-xs">{copyright}</span>
        </div>
      </div>
    </footer>
  );
}
