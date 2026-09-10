import React from "react";
import Link from "next/link";
import { ArrowEndIcon } from "@/components/ui/Icons";
import { formatArabicDate } from "@/lib/formatters";
import type { Article } from "@/lib/dal/articles";

export interface ArticleCardProps {
  article: Article;
}

const CATEGORY_LABELS: Record<Article["category"], string> = {
  culture: "ثقافة وفكر",
  artists: "حوارات فنية",
  academy: "تعليم وتراث",
  events: "تغطيات وفعاليات",
};

/**
 * Article Card Component
 * Verified against Figma Component 16 (Nodes 186:182, 186:187, 186:189, 186:192, 186:195):
 * - Card radius: 16px (rounded-card)
 * - 16:9 Aspect ratio thumbnail
 * - Category badge with distinct styling
 * - Arabic formatted date in DM Mono / Cairo
 * - Headline with hover transition to brand-primary
 * - Excerpt bounded to 2 lines
 */
export function ArticleCard({ article }: ArticleCardProps) {
  const categoryLabel = CATEGORY_LABELS[article.category] || "ثقافة";
  const dateFormatted = formatArabicDate(article.published_at);

  return (
    <article className="group flex flex-col bg-white rounded-card overflow-hidden border border-brand-espresso/10 shadow-card hover:shadow-card-hover hover:border-brand-primary/40 transition-all duration-300 text-start">
      <Link href={`/news/${article.slug}`} className="flex flex-col flex-1">
        {/* Cover Image Thumbnail */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-surface">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{
              backgroundImage: `url(${article.cover_image_url || "/assets/articles/default-article.png"})`,
            }}
            aria-label={article.title}
            role="img"
          />

          {/* Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/50 via-transparent to-transparent pointer-events-none" />

          {/* Category Pill */}
          <div className="absolute top-3 end-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-espresso/80 backdrop-blur-xs text-brand-tint text-xs font-semibold border border-white/10">
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col flex-1 justify-between gap-3">
          <div className="space-y-2">
            {/* Meta row: Date */}
            <div className="text-xs text-brand-espresso/60 font-mono">
              <time dateTime={article.published_at}>{dateFormatted}</time>
            </div>

            {/* Headline */}
            <h3 className="font-sans text-base sm:text-lg font-bold text-brand-espresso group-hover:text-brand-primary transition-colors leading-snug">
              {article.title}
            </h3>

            {/* Excerpt */}
            <p className="font-sans text-xs sm:text-sm text-brand-espresso/75 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Read More link cue */}
          <div className="pt-2 border-t border-brand-espresso/5 flex items-center justify-between text-xs font-bold text-brand-primary">
            <span>اقرأ المقال</span>
            <span className="transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1">
              <ArrowEndIcon size={14} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
