import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowEndIcon } from "@/components/ui/Icons";
import { formatArabicDate } from "@/lib/formatters";
import { getNewsCardCategoryLabel, type Article } from "@/lib/dal/articles";

export interface ArticleCardProps {
  article: Article;
}

/**
 * News grid card — Figma node 91:17378 in frame 91:17296.
 *
 * Geometry read from the design:
 * - White card, 1px #DFC0B5 at 40% border, 16px radius, columns stretch to equal
 *   height and clip their content.
 * - Cover strip is a flat 192px, not an aspect ratio, so all three cards line up
 *   regardless of column width.
 * - Date sits on the cover: 16px down and 16px in from the inline start — the
 *   right-hand corner of the Arabic frame — on a 90% #FFF8F6 wash with a 4px
 *   backdrop blur and a 2px radius, 12px/16 with 0.6px tracking. The covers are
 *   cropped out of the reference render, so scripts/extract-reference-assets.py
 *   paints the design's own copy of this wash out of them first.
 * - Body is 24px padded and distributes its rows: eyebrow 13/19.5, heading
 *   20/30 #251915, excerpt 16/24 #58423A, then the read-more link, 10/15 with a
 *   10.667px arrow. Every row reads from the inline start, so in the Arabic frame
 *   the whole body is flush right, the read-more link included.
 *
 * Figma alternates the eyebrow between #9F3600 and #625E51 across the three cards
 * with no rule behind it; the branded value is used for all of them.
 */
export function ArticleCard({ article }: ArticleCardProps) {
  const t = useTranslations("article");
  const dateFormatted = formatArabicDate(article.published_at);

  // Card 91:17378 is a flat 423.5px on the desktop frame — 1px border, a 192px
  // cover, a 229.5px body and 1px border. Below lg the card hugs its content,
  // since the 390px frame stacks the cards and sets its own height.
  return (
    <article className="group flex h-[422.5px] min-w-0 flex-1 flex-col self-stretch overflow-hidden rounded-[16px] border border-border-card bg-white text-start transition-shadow duration-300 hover:shadow-card lg:h-[423.5px]">
      <Link href={`/news/${article.slug}`} className="flex flex-1 flex-col">
        <div className="relative h-[192px] w-full shrink-0 overflow-hidden bg-brand-surface">
          <Image
            src={article.cover_image_url || "/assets/articles/default-article.png"}
            alt=""
            fill
            sizes="(min-width: 1024px) 387px, (min-width: 640px) 50vw, 100vw"
            quality={90}
            className="object-cover"
          />
          <span className="absolute start-4 top-4 rounded-[2px] bg-[rgba(255,248,246,0.9)] px-2 py-1 text-[12px] leading-[16px] tracking-[0.6px] text-ink-heading backdrop-blur-[4px]">
            {dateFormatted}
          </span>
        </div>

        {/* The excerpt is the row that gives way, not a spacer distribution. Figma
            holds heading + excerpt at a constant 138.5px across all three cards:
            card 91:17378 pairs a 72px two-line heading with a 66.5px excerpt block,
            while 91:17397 and 91:17416 pair a 42px one-line heading with a 96.5px
            one. So the heading takes what it needs and the excerpt absorbs the
            remainder — which is flex-1 on the excerpt, clipped.

            justify-between did the opposite: it spread the slack across every gap,
            so a two-line heading grew the whole row to 445px instead of 423.5 and
            pushed each card's rows out of alignment with its neighbours (headings
            landed at y=1166 and y=1176 in the same row). */}
        <div className="flex flex-1 flex-col p-6 text-start">
          <span className="shrink-0 pb-2 text-[13px] font-bold leading-[19.5px] text-eyebrow">
            {getNewsCardCategoryLabel(article.category)}
          </span>

          <h3 className="shrink-0 pb-3 text-[20px] font-bold leading-[30px] text-ink-heading transition-colors group-hover:text-brand-primary">
            {article.title}
          </h3>

          <p className="min-h-0 flex-1 overflow-hidden pb-4 text-[16px] leading-[24px] text-ink-body">
            {article.excerpt}
          </p>

          <span className="flex shrink-0 items-center justify-start gap-1 text-[10px] font-bold leading-[15px] text-eyebrow">
            {t("readMore")}
            <ArrowEndIcon size={10.667} className="shrink-0" />
          </span>
        </div>
      </Link>
    </article>
  );
}
