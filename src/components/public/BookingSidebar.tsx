import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { MailIcon, PhoneIcon, GlobeIcon, CheckIcon } from "@/components/ui/Icons";
import { toArabicDigits } from "@/lib/formatters";
import { Bdi } from "@/components/ui/Bidi";

interface BookingSidebarProps {
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
}

/** Copy lives in the `booking` namespace; the step numeral is rendered in the reader's script. */
const STEPS = [
  { index: 1, titleKey: "step1Title", descriptionKey: "step1Body" },
  { index: 2, titleKey: "step2Title", descriptionKey: "step2Body" },
  { index: 3, titleKey: "step3Title", descriptionKey: "step3Body" },
  { index: 4, titleKey: "step4Title", descriptionKey: "step4Body" },
];

/**
 * Booking Sidebar Component
 * Verified against Figma Screen "الحجز" (Node 91:17109 / Frame 91:17250)
 * - Direct contact card: Email, WhatsApp/Phone, Instagram
 * - "What happens next?" 4-step milestone progression
 */
export function BookingSidebar({
  contactEmail,
  contactPhone,
  instagramUrl,
}: BookingSidebarProps) {
  const t = useTranslations("booking");
  const locale = useLocale();
  const stepNumeral = (index: number) => (locale === "ar" ? toArabicDigits(index) : String(index));
  // Normalize phone for WhatsApp link
  const rawPhoneDigits = contactPhone.replace(/\D/g, "");
  const whatsappHref = rawPhoneDigits ? `https://wa.me/${rawPhoneDigits}` : "#";

  return (
    <aside className="w-full lg:w-[380px] xl:w-[412px] flex flex-col gap-6 text-start">
      {/* Direct Contact Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-brand-espresso/10 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-5 border-b border-brand-espresso/10">
          <span className="text-brand-primary font-bold">♪</span>
          <h2 className="font-calligraphic text-xl font-bold text-brand-espresso">
            {t("contactHeading")}
          </h2>
        </div>

        <p className="text-sm text-brand-espresso/70 mb-5 leading-relaxed">
          {t("contactBody")}
        </p>

        <div className="flex flex-col gap-4">
          {/* Email Channel */}
          <a
            href={`mailto:${contactEmail}`}
            className="group flex items-center gap-3.5 p-3 rounded-xl bg-brand-cream/60 hover:bg-brand-cream transition-colors border border-brand-espresso/5"
            aria-label={t("contactEmailAction", { email: contactEmail })}
          >
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 group-hover:bg-brand-primary group-hover:text-white transition-colors">
              <MailIcon size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-brand-espresso/60">{t("contactEmailLabel")}</span>
              <span className="text-sm font-semibold text-brand-espresso truncate font-mono" dir="ltr">
                <Bdi dir="ltr">{contactEmail}</Bdi>
              </span>
            </div>
          </a>

          {/* WhatsApp / Phone Channel */}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3.5 p-3 rounded-xl bg-brand-cream/60 hover:bg-brand-cream transition-colors border border-brand-espresso/5"
            aria-label={t("contactWhatsappAction", { phone: contactPhone })}
          >
            <div className="w-10 h-10 rounded-lg bg-green-600/10 text-green-700 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <PhoneIcon size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-brand-espresso/60">{t("contactWhatsappLabel")}</span>
              <span className="text-sm font-semibold text-brand-espresso font-mono" dir="ltr">
                <Bdi dir="ltr">{contactPhone}</Bdi>
              </span>
            </div>
          </a>

          {/* Instagram Channel */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3.5 p-3 rounded-xl bg-brand-cream/60 hover:bg-brand-cream transition-colors border border-brand-espresso/5"
            aria-label={t("contactInstagramAction")}
          >
            <div className="w-10 h-10 rounded-lg bg-brand-espresso/10 text-brand-espresso flex items-center justify-center shrink-0 group-hover:bg-brand-primary group-hover:text-white transition-colors">
              <GlobeIcon size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-brand-espresso/60">{t("contactInstagramLabel")}</span>
              <span className="text-sm font-semibold text-brand-espresso font-mono" dir="ltr">
                <Bdi dir="ltr">@andalusia.art</Bdi>
              </span>
            </div>
          </a>
        </div>
      </div>

      {/* What Happens Next Card */}
      <div className="bg-brand-espresso text-brand-cream rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-5 border-b border-brand-cream/15">
          <span className="text-brand-primary font-bold">♪</span>
          <h2 className="font-calligraphic text-xl font-bold text-white">
            {t("stepsHeading")}
          </h2>
        </div>

        <ol className="flex flex-col gap-5 list-none p-0 m-0">
          {STEPS.map((step) => (
            <li key={step.index} className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0 font-bold text-sm font-mono mt-0.5">
                {stepNumeral(step.index)}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-white">
                  {t(step.titleKey)}
                </h3>
                <p className="text-xs text-brand-cream/75 leading-relaxed">
                  {t(step.descriptionKey)}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 pt-4 border-t border-brand-cream/15 flex items-center gap-2 text-xs text-brand-cream/60">
          <CheckIcon size={14} className="text-brand-primary shrink-0" />
          <span>{t("noPrepayment")}</span>
        </div>
      </div>
    </aside>
  );
}
