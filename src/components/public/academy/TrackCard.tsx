import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toArabicDigits } from "@/lib/formatters";
import type { AcademyCourse } from "@/lib/dal/academy";

interface TrackCardProps {
  course: AcademyCourse;
  index?: number;
}

/**
 * Academy track card — Figma node 91:16439 in frame 91:16119.
 *
 * White, a 0.833px #EFEBD9 hairline, a 20px radius and 32px of padding over a
 * 362.67 column. The rows read from the inline start — the right-hand edge of the
 * Arabic frame — except the two the design pushes to the far side:
 * - Top row (91:16440): the track label in Cairo Bold 14/20 primary-500 with
 *   1.4px of tracking at the inline start, and the sequence numeral in Cairo Black
 *   60/60 secondary-400 at the inline end.
 * - Heading (91:16445): Cairo Bold 25/37.5 #2B1D14, 20px down.
 * - Body (91:16447): Cairo 13/19.5 at 70% #2B1D14, 16px down and 24px clear.
 * - Register link (91:16449): Cairo Bold 13/19.5 primary-500 at the inline end,
 *   pinned to the bottom of the card so the three columns line up.
 *
 * The design draws no instructor line and no image on these cards, and it sets the
 * third numeral in Arabic-Indic while the first two are Western — a slip in the
 * file, so all three are rendered in the reader's own script.
 */
export function TrackCard({ course, index }: TrackCardProps) {
  const t = useTranslations("academy");
  const locale = useLocale();
  const position = course.display_order ?? (index !== undefined ? index + 1 : 1);
  const displayNum = locale === "ar" ? toArabicDigits(position) : String(position);

  return (
    <article className="flex min-w-0 flex-col self-stretch rounded-[20px] border-[0.833px] border-secondary-400 bg-white p-8 text-start">
      <div className="flex items-start justify-between gap-4">
        <span className="text-[14px] font-bold uppercase leading-[20px] tracking-[1.4px] text-brand-primary">
          {course.track_category}
        </span>
        <span aria-hidden="true" className="text-[60px] font-black leading-[60px] text-secondary-400">
          {displayNum}
        </span>
      </div>

      <h3 className="pt-5 text-[25px] font-bold leading-[37.5px] text-brand-espresso">
        {course.title}
      </h3>

      <p className="pb-6 pt-4 text-[13px] leading-[19.5px] text-[rgba(43,29,20,0.7)]">
        {course.description}
      </p>

      <Link
        href={`/booking?course=${encodeURIComponent(course.slug)}`}
        aria-label={t("enrollLabel", { title: course.title })}
        className="mt-auto self-end text-[13px] font-bold leading-[19.5px] text-brand-primary transition-colors hover:text-brand-primary-hover"
      >
        {t("enroll")} <span aria-hidden="true">←</span>
      </Link>
    </article>
  );
}
