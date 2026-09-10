import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/LayoutPrimitives";
import { ArrowEndIcon } from "@/components/ui/Icons";
import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/lib/dal/articles";

interface EditorialFeatureProps {
  articles: Article[];
}

/**
 * Verified against Figma Frame 26 (Nodes 87:14400, 87:14402):
 * - Section Title: display face (Qahwa Regular) 64px "نكتب كي لا تضيع التفاصيل"
 * - Frame carries no pill badge and no subtitle — header is H2 + action link only
 * - Action Link: "عرض كل المقالات ←" SF Pro Bold 16px -> /news
 * - 3-Column Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop
 */
export function EditorialFeature({ articles }: EditorialFeatureProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-28 bg-[#F2EEE0] border-t border-brand-espresso/5">
      <Container>
        {/* Section Header (Figma Frame 26 — H2 64px + link, no badge/subtitle) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-12">
          <h2 className="font-display text-4xl lg:text-[64px] font-normal text-brand-espresso leading-[1.25] text-start">
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

        {/* 3-Item Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {articles.slice(0, 3).map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </Container>
    </section>
  );
}
