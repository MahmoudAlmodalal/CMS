"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ArticleCard } from "./ArticleCard";
import { NewsFilterTabs } from "./NewsFilterTabs";
import { ARTICLE_CATEGORIES, type Article } from "@/lib/articles";

export interface NewsGridProps {
  initialArticles: Article[];
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * NewsGrid Component
 * Verified against Figma Frame 34 (Node 91:17798):
 * - Heading 2: "آخر الأخبار" (Node 91:17795)
 * - Section - Grid Layout (Node 91:17377)
 * - 3-column responsive grid on desktop, 2-column on tablet, 1-column on mobile
 * - Client-side instant category filtering & empty state handling
 */
export function NewsGrid({
  initialArticles,
  title = "آخر الأخبار والمقالات",
  subtitle = "اكتشف أحدث التغطيات الثقافية، الحوارات الفنية، وورش العمل التدريبية.",
  className = "",
}: NewsGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const paramCategory = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState<string>(paramCategory);

  useEffect(() => {
    if (paramCategory) {
      setSelectedCategory(paramCategory);
    }
  }, [paramCategory]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: initialArticles.length };
    for (const cat of ARTICLE_CATEGORIES) {
      if (cat.id !== "all") {
        map[cat.id] = initialArticles.filter((a) => a.category === cat.id).length;
      }
    }
    return map;
  }, [initialArticles]);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);

    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === "all") {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }

    const query = params.toString();
    const target = query ? `${pathname}?${query}` : pathname;
    router.replace(target, { scroll: false });
  };

  const filteredArticles = useMemo(() => {
    if (selectedCategory === "all") {
      return initialArticles;
    }
    return initialArticles.filter((a) => a.category === selectedCategory);
  }, [initialArticles, selectedCategory]);

  return (
    <section aria-labelledby="news-grid-heading" className={`space-y-8 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-espresso/10 pb-6 text-start">
        <div className="space-y-1">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
            الأرشيف الصحفي
          </span>
          <h2
            id="news-grid-heading"
            className="font-calligraphic text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-espresso"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm sm:text-base text-brand-espresso/75 max-w-xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="w-full sm:w-auto">
          <NewsFilterTabs
            activeCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            counts={counts}
          />
        </div>
      </div>

      {/* Grid Content or Empty State */}
      <div id="news-grid-panel" role="tabpanel" aria-labelledby={`news-tab-${selectedCategory}`}>
        {filteredArticles.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white/50 rounded-card border border-dashed border-brand-espresso/20 p-8">
            <span className="text-3xl">📰</span>
            <h3 className="font-bold text-lg text-brand-espresso">
              لا توجد مقالات متوفرة في هذا التصنيف حالياً
            </h3>
            <p className="text-sm text-brand-espresso/70 max-w-md mx-auto">
              يمكنك اختيار تصنيف آخر أو العودة إلى عرض جميع المقالات لمتابعة جديد فرقة أندلسيا.
            </p>
            <button
              type="button"
              onClick={() => handleSelectCategory("all")}
              className="mt-2 inline-flex items-center px-4 py-2 rounded-full bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 transition-colors"
            >
              عرض جميع المقالات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id || article.slug} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
