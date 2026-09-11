import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CalendarIcon, MusicIcon, CloseIcon } from "@/components/ui/Icons";
import type { BookingEventContext } from "@/lib/dal/booking";

interface BookingContextBannerProps {
  eventContext?: BookingEventContext | null;
  preferredArtistName?: string | null;
  courseSlug?: string | null;
}

/**
 * Context Banner displayed when the visitor arrives via deep link:
 * - /booking?event_id=[id]
 * - /booking?artist=[slug]
 * - /booking?course=[slug]
 */
export function BookingContextBanner({
  eventContext,
  preferredArtistName,
  courseSlug,
}: BookingContextBannerProps) {
  const t = useTranslations("booking");

  if (!eventContext && !preferredArtistName && !courseSlug) {
    return null;
  }

  return (
    <div className="mb-6 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-4 text-start">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
            {eventContext ? <CalendarIcon size={18} /> : <MusicIcon size={18} />}
          </div>
          <div>
            <span className="text-xs font-bold text-brand-primary">{t("contextHeading")}</span>
            {eventContext && (
              <div className="mt-1">
                <p className="text-sm font-bold text-brand-espresso">
                  {t("contextEvent", { title: eventContext.title })}
                </p>
                <p className="text-xs text-brand-espresso/70 mt-0.5">
                  {eventContext.venue ? `${eventContext.venue} — ` : ""}
                  {eventContext.performer_name ? t("contextPerformer", { name: eventContext.performer_name }) : ""}
                </p>
              </div>
            )}
            {preferredArtistName && !eventContext && (
              <p className="text-sm font-bold text-brand-espresso mt-1">
                {t("contextArtist", { name: preferredArtistName })}
              </p>
            )}
            {courseSlug && !eventContext && !preferredArtistName && (
              <p className="text-sm font-bold text-brand-espresso mt-1">
                {t("contextCourse", { slug: courseSlug })}
              </p>
            )}
          </div>
        </div>

        {/* Clear Preselection Link */}
        <Link
          href="/booking"
          className="inline-flex items-center gap-1 text-xs text-brand-espresso/60 hover:text-brand-primary transition-colors py-1 px-2 rounded-md hover:bg-white/50"
          title={t("contextClearTitle")}
        >
          <CloseIcon size={14} />
          <span>{t("contextClear")}</span>
        </Link>
      </div>
    </div>
  );
}
