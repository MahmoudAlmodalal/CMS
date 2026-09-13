import React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { localeDirection, type AppLocale } from "@/i18n/routing";
import { formatArabicDate } from "@/lib/formatters";
import { getArticleCardCategoryLabel, type Article } from "@/lib/dal/articles";

interface EditorialFeatureProps {
  articles: Article[];
  /** Admin override for the section heading. Falls back to built-in copy. */
  heading?: string;
}

/**
 * نكتب كي لا تضيع التفاصيل — Figma Frame 26 (node 87:14400), 1440x709 at y=2815
 * on solid #1F0900. The frame starts 4px in from the artboard, so its heading and
 * cards are placed against it rather than stacked, and the band reproduces the
 * artboard coordinates at lg:
 *
 *   heading 87:14401   x 132..1268, y 93, Qahwa Arabic 64/48 on #F9EDE8, centred
 *   card    115:2436   x 1015.33,   y 253
 *   card    115:2438   x  714.23,   y 255
 *   card    115:2437   x  413.11,   y 255
 *   card    115:2439   x  112,      y 259
 *
 * Both the heading and the run of cards are centred on x=700 rather than on the
 * artboard's own 720, and the four cards each sit at a slightly different y — the
 * reference render carries that jitter exactly (tops at 3074, 3070, 3070, 3068),
 * so it is reproduced rather than levelled.
 *
 * The card (Component 16) is its own design and not the /news grid card: 273.11
 * wide, a fixed 317.156 tall clipping its own overflow, rounded 14 inside a 16px
 * outer, with a flat 170.688 cover and a 24-padded body under it. The body puts the
 * category and the date on one justified row — category at the inline start, in
 * Cairo Bold 12.28/13.92 tracked 1.1136 uppercase on #C54716, the date opposite in
 * Cairo Regular 10/15 on #666 — then the title in Cairo Bold 16/24 on #2B1D14 over
 * a 196px measure, then the standfirst in Cairo Medium 13/19.5 on #7F7F7F. It runs
 * 2.4px past the card, which the card clips. There is no overlay pill, no scrim and
 * no read-more row.
 *
 * The frame repeats one placeholder article across its first two cards, which is a
 * stand-in rather than copy to reproduce, so the band draws four real ones.
 */
export function EditorialFeature({ articles, heading }: EditorialFeatureProps) {
  const t = useTranslations("home");

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#1F0900] pb-[89.37px] pt-[52px] lg:h-[709px] lg:py-0">
      {/* Heading 87:14401 */}
      <div className="w-full px-5 text-center lg:px-0">
        <h2 className="text-center font-display text-[32px] font-normal leading-[48px] text-[#F9EDE8] lg:whitespace-nowrap lg:text-[64px]">
          {heading || t("editorialHeading")}
        </h2>
      </div>

      {/* Cards 115:2436…115:2439 */}
      <div className="mt-[56px] grid grid-cols-1 justify-items-center gap-[24px] px-5 lg:mt-[64px] lg:flex lg:flex-row lg:items-center lg:justify-center lg:gap-[28px] lg:px-4">
        {articles.slice(0, 4).map((article) => {
          return (
            <article
              key={article.id}
              className="group w-full max-w-[273.115px] shrink-0 rounded-[16px] bg-white text-start shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg lg:w-[273.115px]"
            >
              <Link
                href={`/news/${article.slug}`}
                className="flex h-[317.156px] w-full flex-col overflow-hidden rounded-[14px] bg-white"
              >
                {/* Cover I115:2439;87:14439 */}
                <div className="relative h-[170.688px] w-full shrink-0 overflow-hidden bg-brand-surface">
                  <Image
                    src={article.cover_image_url || "/assets/articles/default-article.png"}
                    alt=""
                    fill
                    sizes="273px"
                    quality={90}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Body I115:2439;87:14440 */}
                <div className="flex w-full flex-col items-start p-[24px]">
                  {/* Meta row I115:2439;87:14441 — category leads, date opposite. */}
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="whitespace-nowrap text-[12.28px] font-bold uppercase leading-[13.92px] tracking-[1.1136px] text-primary-500">
                      {getArticleCardCategoryLabel(article.category)}
                    </span>
                    <time
                      dateTime={article.published_at}
                      className="whitespace-nowrap text-[10px] leading-[15px] text-gradscale-400"
                    >
                      {formatArabicDate(article.published_at)}
                    </time>
                  </div>

                  {/* Title I115:2439;87:14446 */}
                  <div className="w-full max-w-[225.115px] pt-[12px]">
                    <h3 className="w-[196px] max-w-full text-[16px] font-bold leading-[24px] text-brand-espresso transition-colors group-hover:text-brand-primary">
                      {article.title}
                    </h3>
                  </div>

                  {/* Standfirst I115:2439;87:14448 */}
                  <div className="h-[26.4px] w-full max-w-[225.115px] overflow-hidden pt-[6.4px]">
                    <p className="truncate text-[13px] font-medium leading-[19.5px] text-gradscale-300">
                      {article.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
