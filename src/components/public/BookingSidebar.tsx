import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Bdi } from "@/components/ui/Bidi";
import { toArabicDigits } from "@/lib/formatters";

interface BookingSidebarProps {
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
}

/** Only the step titles appear in the design; the bodies are not drawn. */
const STEPS = ["step1Title", "step2Title", "step3Title", "step4Title"] as const;

/**
 * Booking sidebar — Figma node 91:17250 in frame 91:17109.
 *
 * 412 wide, two cards 20px apart, every row flush to the inline start:
 * - Contact card (91:17251): #2B1D14 under the arabesque mark, 32px padding,
 *   12px radius. Heading "♪ تواصل مباشرة" in primary-500 at 16/24, then three
 *   label/value pairs — label Cairo Bold 10/15, value Cairo SemiBold 14.08/21.12,
 *   3.2px apart — spaced 24, 17.6 and 17.6/17.6 down the card over 256px.
 * - Steps card (91:17273): primary-500, same padding and radius. Heading at 16/24,
 *   then four rows of Cairo 13.6/22.44 each led by a 24px numeral chip on a 20%
 *   secondary-500 wash at a 12px radius, 12px from the text.
 *
 * The design draws no channel icons, no contact paragraph and no prepayment note,
 * and it states the step numerals in Western digits except the third, which is
 * Arabic-Indic. That is a slip in the file, not a rule, so all four are rendered
 * in the reader's own script.
 */
export function BookingSidebar({
  contactEmail,
  contactPhone,
  instagramUrl,
}: BookingSidebarProps) {
  const t = useTranslations("booking");
  const locale = useLocale();
  const rawPhoneDigits = contactPhone.replace(/\D/g, "");
  const whatsappHref = rawPhoneDigits ? `https://wa.me/${rawPhoneDigits}` : "#";
  const instagramHandle = "@andalusia.art";

  const channels = [
    {
      label: t("contactEmailShort"),
      value: contactEmail,
      href: `mailto:${contactEmail}`,
      ariaLabel: t("contactEmailAction", { email: contactEmail }),
      spacing: "pt-6",
    },
    {
      label: t("contactWhatsappShort"),
      value: contactPhone,
      href: whatsappHref,
      ariaLabel: t("contactWhatsappAction", { phone: contactPhone }),
      spacing: "pt-[17.6px]",
    },
    {
      label: t("contactInstagramShort"),
      value: instagramHandle,
      href: instagramUrl,
      ariaLabel: t("contactInstagramAction"),
      spacing: "py-[17.6px]",
    },
  ];

  return (
    <aside className="ms-8 flex w-[288px] flex-col gap-5 text-start lg:ms-0 lg:w-[412px]">
      <div className="relative isolate overflow-hidden rounded-[12px] bg-brand-espresso p-8">
        <div
          aria-hidden="true"
          data-texture-ref="da60c98546b43a3524b1bbd7667d8f518e1c7ee3"
          className="absolute left-0 top-0 h-[21.35%] w-[18.75%] bg-[url('/assets/branding/card-mark.png')] bg-contain bg-no-repeat"
        />

        <h2 className="text-[16px] font-bold leading-[24px] text-brand-primary">
          ♪ {t("contactHeading")}
        </h2>

        {channels.map((channel) => (
          <div key={channel.label} className={`w-[256px] ${channel.spacing}`}>
            <p className="text-[10px] font-bold leading-[15px] text-brand-tint">
              {channel.label}
            </p>
            <a
              href={channel.href}
              aria-label={channel.ariaLabel}
              className="block pt-[3.2px] text-[14.08px] font-semibold leading-[21.12px] text-brand-tint hover:text-brand-primary"
            >
              <Bdi dir="ltr">{channel.value}</Bdi>
            </a>
          </div>
        ))}
      </div>

      <div className="rounded-[12px] bg-brand-primary p-8">
        <h2 className="text-[16px] font-bold leading-[24px] text-brand-tint">
          {t("stepsHeading")}
        </h2>

        <ol className="m-0 list-none p-0">
          {STEPS.map((key, index) => (
            <li
              key={key}
              className={`flex w-[256px] items-start gap-3 ${
                index === 0 ? "pt-5" : index === STEPS.length - 1 ? "py-[13.6px]" : "pt-[13.6px]"
              }`}
            >
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-[12px] bg-[rgba(236,230,208,0.2)] text-[11.2px] font-black leading-[16.8px] text-brand-tint"
              >
                {locale === "ar" ? toArabicDigits(index + 1) : index + 1}
              </span>
              <p className="text-[13.6px] leading-[22.44px] text-brand-tint">{t(key)}</p>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
