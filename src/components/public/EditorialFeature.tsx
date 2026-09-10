import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/LayoutPrimitives";
import { ArrowEndIcon } from "@/components/ui/Icons";
import { formatArabicDate } from "@/lib/formatters";
import type { Article } from "@/lib/dal/articles";

interface EditorialFeatureProps {
  articles: Article[];
}

const CATEGORY_LABELS: Record<string, string> = {
  culture: "ثقافة وفكر",
  artists: "حوارات فنية",
  academy: "تعليم وتراث",
  events: "تغطيات وفعاليات",
};

/**
 * Verified against Figma Frame 26 (Nodes 87:14400, 87:14401, 87:14402):
 * - Canvas Dimensions: Fixed 1440x709px desktop height (min-h-[709px] lg:h-[709px])
 * - Heading: Qahwa Arabic Regular 64px (font-calligraphic text-[64px])
 * - Header format: Clean H2 + "عرض كل المقالات ←" link (strictly NO pill badge / subtitle)
 * - Asymmetric layout: 1 large primary article (lg:col-span-7) + 2 secondary stack (lg:col-span-5)
 * - Aspect ratios: 16:9 thumbnail ratio matching Figma Component 16 (115:2435)
 */
export function EditorialFeature({ articles }: EditorialFeatureProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  const primaryArticle = articles[0];
  const secondaryArticles = articles.slice(1, 3);

  const primaryCategory = CATEGORY_LABELS[primaryArticle.category] || "ثقافة وفكر";
  const primaryDate = formatArabicDate(primaryArticle.published_at);

  return (
    <section className="min-h-[709px] lg:h-[709px] bg-[#F2EEE0] border-t border-brand-espresso/5 flex flex-col justify-center py-16 lg:py-0 overflow-hidden">
      <Container>
        {/* Section Header (Figma Frame 26 — Qahwa 64px H2 + Link, NO badge/subtitle) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-10">
          <h2 className="font-calligraphic text-3xl sm:text-4xl lg:text-[64px] font-normal text-brand-espresso leading-[1.25] text-start">
            نكتب كي لا تضيع التفاصيل
          </h2>

          {/* View All Link */}
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-base font-bold text-brand-primary hover:text-brand-primary-hover active:text-brand-primary-pressed transition-colors group shrink-0"
          >
            <span>عرض كل المقالات</span>
            <span className="transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1">
              <ArrowEndIcon size={18} />
            </span>
          </Link>
        </div>

        {/* Asymmetric Layout (Figma Frame 26: 1 Primary + 2 Secondary Stack) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Primary Featured Article (lg:col-span-7) */}
          <article className="lg:col-span-7 group flex flex-col bg-white rounded-3xl overflow-hidden border border-brand-espresso/10 shadow-card hover:shadow-card-hover hover:border-brand-primary/40 transition-all duration-300 text-start">
            <Link href={`/news/${primaryArticle.slug}`} className="flex flex-col flex-1 h-full">
              {/* Cover Image */}
              <div className="relative aspect-video w-full overflow-hidden bg-brand-surface">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${primaryArticle.cover_image_url || "/assets/articles/default-article.webp"})`,
                  }}
                  aria-label={primaryArticle.title}
                  role="img"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-4 end-4">
                  <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-brand-espresso/80 backdrop-blur-xs text-brand-tint text-xs font-semibold border border-white/10">
                    {primaryCategory}
                  </span>
                </div>
              </div>

              {/* Content Details */}
              <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="text-xs text-brand-espresso/60 font-mono">
                    <time dateTime={primaryArticle.published_at}>{primaryDate}</time>
                  </div>
                  <h3 className="font-sans text-xl sm:text-2xl font-bold text-brand-espresso group-hover:text-brand-primary transition-colors leading-snug">
                    {primaryArticle.title}
                  </h3>
                  <p className="font-sans text-sm text-brand-espresso/75 line-clamp-3 leading-relaxed">
                    {primaryArticle.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-brand-espresso/5 flex items-center justify-between text-sm font-bold text-brand-primary">
                  <span>اقرأ المقال كاملة</span>
                  <span className="transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1">
                    <ArrowEndIcon size={16} />
                  </span>
                </div>
              </div>
            </Link>
          </article>

          {/* Secondary Articles Stack (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            {secondaryArticles.map((article) => {
              const catLabel = CATEGORY_LABELS[article.category] || "ثقافة وفكر";
              const dateStr = formatArabicDate(article.published_at);

              return (
                <article
                  key={article.id}
                  className="group flex-1 flex flex-col bg-white rounded-3xl overflow-hidden border border-brand-espresso/10 shadow-card hover:shadow-card-hover hover:border-brand-primary/40 transition-all duration-300 text-start"
                >
                  <Link href={`/news/${article.slug}`} className="flex flex-col sm:flex-row h-full">
                    {/* Thumbnail */}
                    <div className="relative aspect-video sm:aspect-square sm:w-44 shrink-0 overflow-hidden bg-brand-surface">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{
                          backgroundImage: `url(${article.cover_image_url || "/assets/articles/default-article.webp"})`,
                        }}
                        aria-label={article.title}
                        role="img"
                      />
                      <div className="absolute top-2.5 end-2.5 sm:hidden">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand-espresso/80 backdrop-blur-xs text-brand-tint text-xs font-semibold border border-white/10">
                          {catLabel}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1 justify-between gap-2">
                      <div className="space-y-1.5">
                        <div className="hidden sm:flex items-center justify-between gap-2 text-xs">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand-surface text-brand-primary font-bold border border-brand-espresso/10">
                            {catLabel}
                          </span>
                          <span className="text-brand-espresso/60 font-mono">
                            <time dateTime={article.published_at}>{dateStr}</time>
                          </span>
                        </div>
                        <h3 className="font-sans text-base sm:text-lg font-bold text-brand-espresso group-hover:text-brand-primary transition-colors leading-snug line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="font-sans text-xs text-brand-espresso/75 line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>
                      </div>

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
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
