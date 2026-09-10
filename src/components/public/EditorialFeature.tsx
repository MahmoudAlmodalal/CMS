import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/LayoutPrimitives";
import { formatArabicDate } from "@/lib/formatters";
import { getArticleCardCategoryLabel, type Article } from "@/lib/dal/articles";

interface EditorialFeatureProps {
  articles: Article[];
}

/**
 * Verified against Figma Frame 26 (Node 87:14400, 1440x709):
 * - Surface: solid #1F0900 (near-black), heading #F9EDE8
 * - Heading (87:14402): Qahwa Arabic 64px, CENTERED
 * - Cards (115:2436…115:2439): FOUR equal 273.1x317.16 white tiles, radius 14,
 *   laid out at x=108/409/710/1011 — not an asymmetric 1-large-plus-2-small split
 * - Card anatomy: 170.69px image → 24px padded body → row(date / category) →
 *   title (pt 12) → kicker (pt 6.4). No overlay pill, no scrim, no read-more row.
 * - Category micro-type: Cairo Bold 12.28px, 0.0907em tracking, uppercase, #C54716
 */
export function EditorialFeature({ articles }: EditorialFeatureProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="min-h-[709px] lg:h-[709px] bg-[#1F0900] flex flex-col justify-center py-16 lg:py-0 overflow-hidden">
      <Container>
        {/* Section Header (Figma Node 87:14402 — Qahwa 64px, centered) */}
        <h2 className="font-calligraphic text-3xl sm:text-4xl lg:text-[64px] font-normal text-[#F9EDE8] leading-[1.25] text-center pb-10">
          نكتب كي لا تضيع التفاصيل
        </h2>

        {/* Four equal cards (Figma Nodes 115:2436…115:2439 — 273x317, 28px gap) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 justify-items-center">
          {articles.slice(0, 4).map((article) => (
            <article
              key={article.id}
              className="group w-full max-w-[273px] lg:h-[317px] flex flex-col bg-white rounded-[14px] overflow-hidden transition-shadow duration-300 hover:shadow-card-hover text-start"
            >
              <Link href={`/news/${article.slug}`} className="flex flex-col h-full">
                {/* Cover Image (Figma EL-44c2fae9 — 170.69px tall) */}
                <div className="relative h-[170.69px] w-full shrink-0 overflow-hidden bg-brand-surface">
                  <Image
                    src={article.cover_image_url || "/assets/articles/default-article.png"}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 273px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Body (Figma EL-7d7fdedb — 24px padding) */}
                <div className="p-6 flex flex-col">
                  {/* Meta row (Figma EL-bb582553 — space-between) */}
                  <div className="flex items-center justify-between gap-2">
                    <time
                      dateTime={article.published_at}
                      className="font-sans text-[10px] font-normal leading-[1.5] text-gradscale-400"
                    >
                      {formatArabicDate(article.published_at)}
                    </time>
                    <span className="font-sans text-[12.28px] font-bold leading-[1.13] tracking-[0.0907em] uppercase text-brand-primary">
                      {getArticleCardCategoryLabel(article.category)}
                    </span>
                  </div>

                  {/* Title (Figma EL-8e175aae — pt 12, Cairo Bold 16px) */}
                  <h3 className="pt-3 font-sans text-base font-bold leading-[1.5] text-brand-espresso group-hover:text-brand-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Kicker (Figma EL-ddc5918d — pt 6.4, Cairo Medium 13px) */}
                  <p className="pt-1.5 font-sans text-[13px] font-medium leading-[1.5] text-gradscale-300 line-clamp-1">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
