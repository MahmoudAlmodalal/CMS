import React from "react";
import { useTranslations } from "next-intl";
import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/lib/articles";

export interface NewsGridProps {
  articles: Article[];
  title?: string;
  className?: string;
}

/**
 * Latest-news section — Figma node 91:17798 in frame 91:17296.
 *
 * Heading (91:17795) is Qahwa Arabic 48 on a 40px line, #1B1B1B, flush to the
 * inline start over 8px of lead-in — the right edge of the grid in the Arabic
 * frame. The grid (91:17377) is three equal columns with 24px gutters and 72px of
 * trailing space, and its cards stretch to equal height.
 *
 * The design carries no kicker, standfirst, rule or category filter on this
 * section, so none are rendered. NewsFilterTabs is left in the tree unused rather
 * than deleted, since restoring filtering is a product decision, not a design one.
 */
export function NewsGrid({ articles, title, className = "" }: NewsGridProps) {
  const t = useTranslations("news");

  return (
    <section aria-labelledby="news-grid-heading" className={`flex flex-col gap-6 ${className}`}>
      <div className="flex flex-col items-start pt-2">
        <h2
          id="news-grid-heading"
          className="text-start font-display text-[32px] leading-[1.1] text-gradscale-900 sm:text-[40px] lg:text-[48px] lg:leading-[40px]"
        >
          {title ?? t("gridHeading")}
        </h2>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-card border border-dashed border-brand-espresso/20 bg-white/50 p-8 py-16 text-center">
          <h3 className="text-lg font-bold text-brand-espresso">{t("emptyTitle")}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-brand-espresso/70">{t("emptyBody")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 pb-[72px] md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id || article.slug} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
