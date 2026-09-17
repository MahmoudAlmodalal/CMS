import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatLocalizedDate } from "@/lib/formatters";
import { type Article } from "@/lib/dal/articles";
import { ARTICLE_CATEGORY_MESSAGE_KEYS } from "@/lib/articles";
import { SafeImage } from "@/components/ui/SafeImage";
import { ScrollReveal } from "./ScrollReveal";
import { StrokeUnderline } from "./motion/StrokeUnderline";
import { TextReveal } from "./motion/TextReveal";

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
  const c = useTranslations("categories");
  const locale = useLocale();

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#1F0900] py-12 md:py-16 lg:h-[709px] lg:py-0">
      {/* Heading 87:14401 */}
      <div className="w-full px-5 text-center lg:px-0">
        {/* One line only: the frame sets lg:whitespace-nowrap on this heading,
            so splitting it into stacked lines would break the band's geometry. */}
        <TextReveal
          as="h2"
          text={heading || t("editorialHeading")}
          wordsPerLine={99}
          className="text-center font-display text-3xl font-normal leading-relaxed text-[#F9EDE8] sm:text-4xl md:text-5xl lg:whitespace-nowrap lg:text-[64px]"
        />
        <ScrollReveal variant="soft" delay={0.12}>
          <StrokeUnderline className="mx-auto mt-2" />
        </ScrollReveal>
      </div>

      {/* Cards 115:2436…115:2439 — motion-stagger cascades them in */}
      <div className="motion-stagger mx-auto mt-8 grid grid-cols-1 justify-items-center gap-6 w-full max-w-7xl px-4 sm:mt-10 md:px-6 lg:grid-cols-4 xl:mt-12 xl:gap-7">
        {articles.slice(0, 4).map((article) => {
          return (
            <article
              key={article.id}
              className="group w-full h-full min-w-0 rounded-[16px] bg-white text-start shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <Link
                href={`/news/${article.slug}`}
                className="flex h-full min-h-[19rem] w-full flex-col overflow-hidden rounded-[14px] bg-white"
              >
                {/* Cover I115:2439;87:14439 */}
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-brand-surface">
                  <SafeImage
                    src={article.cover_image_url || "/assets/articles/default-article.png"}
                    alt={article.title}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 25vw"
                    quality={90}
                    fallbackText={article.title}
                    className="motion-image object-cover object-center"
                  />
                </div>

                {/* Body I115:2439;87:14440 */}
                <div className="flex min-w-0 w-full flex-col items-start p-4 sm:p-5 lg:p-6">
                  {/* Meta row I115:2439;87:14441 — category leads, date opposite. */}
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-xs font-bold uppercase leading-5 tracking-wide text-primary-500">
                      {c(ARTICLE_CATEGORY_MESSAGE_KEYS[article.category] ?? "articleFallback")}
                    </span>
                    <time
                      dateTime={article.published_at}
                      className="shrink-0 text-[10px] leading-[15px] text-gradscale-400"
                    >
                      {formatLocalizedDate(article.published_at, locale)}
                    </time>
                  </div>

                  {/* Title I115:2439;87:14446 */}
                  <div className="w-full pt-3">
                    <h3 className="line-clamp-2 w-full text-base font-bold leading-6 text-brand-espresso transition-colors group-hover:text-brand-primary">
                      {article.title}
                    </h3>
                  </div>

                  {/* Standfirst I115:2439;87:14448 */}
                  <div className="w-full pt-1.5">
                    <p className="line-clamp-2 text-[13px] font-medium leading-5 text-gradscale-300">
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
