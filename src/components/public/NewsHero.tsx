import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowEndIcon } from "@/components/ui/Icons";
import { formatArabicDate } from "@/lib/formatters";
import { getArticleCategoryLabel, type Article } from "@/lib/articles";

export interface NewsHeroProps {
  primaryArticle: Article;
  secondaryArticles?: Article[];
  className?: string;
}

/**
 * NewsHero Component
 * Mapped to Figma Node 91:17296:
 * - Featured News Main Banner (91:17298 / 91:17304 / 91:17306)
 * - Side Highlights Stack (91:17307 / 91:17314 / 91:17321)
 * - RTL-first grid with responsive stacking on mobile
 */
export function NewsHero({
  primaryArticle,
  secondaryArticles = [],
  className = "",
}: NewsHeroProps) {
  const t = useTranslations("news");
  const primaryCategory = getArticleCategoryLabel(primaryArticle.category);
  const primaryDate = formatArabicDate(primaryArticle.published_at);

  return (
    <section aria-label={t("featuredRegion")} className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Primary Featured Story (8 of 12 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col">
          <Link
            href={`/news/${primaryArticle.slug}`}
            className="group relative flex flex-col justify-end min-h-[420px] sm:min-h-[480px] lg:min-h-[540px] rounded-card overflow-hidden border border-brand-espresso/15 shadow-card hover:shadow-card-hover transition-all duration-300 p-6 sm:p-8 md:p-10 text-start"
          >
            {/* Background Cover Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
              style={{
                backgroundImage: `url(${primaryArticle.cover_image_url || "/assets/articles/default-hero.png"})`,
                backgroundColor: "#2B1D14",
              }}
              aria-label={primaryArticle.title}
              role="img"
            />

            {/* Subtle Texture & Atmospheric Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso via-brand-espresso/70 to-transparent opacity-90 transition-opacity group-hover:opacity-85" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-espresso/40 via-transparent to-brand-primary/20 pointer-events-none" />

            {/* Content Layer */}
            <div className="relative z-10 space-y-4 max-w-2xl">
              {/* Meta row: Category Pill + Date */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-brand-primary text-white text-xs font-bold shadow-subtle">
                  {primaryCategory}
                </span>
                <span className="text-xs text-brand-tint/80 font-mono">
                  <time dateTime={primaryArticle.published_at}>{primaryDate}</time>
                </span>
              </div>

              {/* Headline */}
              <h2 className="font-calligraphic text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight drop-shadow-xs group-hover:text-brand-tint transition-colors">
                {primaryArticle.title}
              </h2>

              {/* Excerpt */}
              <p className="text-sm sm:text-base text-brand-tint/90 line-clamp-3 leading-relaxed">
                {primaryArticle.excerpt}
              </p>

              {/* Action Link Button */}
              <div className="pt-2 flex items-center gap-2 text-sm font-bold text-brand-tint group-hover:text-white transition-colors">
                <span>{t("readFull")}</span>
                <span className="transition-transform duration-200 group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1">
                  <ArrowEndIcon size={16} />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Side Highlights Column (4 of 12 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
          {secondaryArticles.slice(0, 2).map((article, idx) => {
            const category = getArticleCategoryLabel(article.category);
            const date = formatArabicDate(article.published_at);

            return (
              <Link
                key={article.id || article.slug || idx}
                href={`/news/${article.slug}`}
                className="group relative flex-1 flex flex-col justify-between bg-white rounded-card overflow-hidden border border-brand-espresso/10 p-5 sm:p-6 shadow-card hover:shadow-card-hover hover:border-brand-primary/40 transition-all duration-300 text-start"
              >
                {/* Header Meta */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand-surface text-brand-primary text-xs font-bold border border-brand-espresso/10">
                      {category}
                    </span>
                    <span className="text-xs text-brand-espresso/60 font-mono">
                      <time dateTime={article.published_at}>{date}</time>
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="font-sans text-base sm:text-lg font-bold text-brand-espresso group-hover:text-brand-primary transition-colors leading-snug">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs sm:text-sm text-brand-espresso/75 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                {/* Bottom Read Action */}
                <div className="pt-3 mt-3 border-t border-brand-espresso/5 flex items-center justify-between text-xs font-bold text-brand-primary">
                  <span>{t("continueReading")}</span>
                  <span className="transition-transform duration-200 group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1">
                    <ArrowEndIcon size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
