import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsHero } from "@/components/public/NewsHero";
import { NewsGrid } from "@/components/public/NewsGrid";
import { getPublishedArticles, getFeaturedArticles } from "@/lib/dal/articles";
import { getSiteSettings } from "@/lib/dal/site-settings";

export const revalidate = 1800; // 30 minutes ISR as specified in APPLICATION_ARCHITECTURE.md

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const [settings, t] = await Promise.all([
    getSiteSettings(),
    getTranslations({ locale, namespace: "meta" }),
  ]);
  const title = settings.seo_news_title?.trim() || t("newsTitle");
  const description = settings.seo_news_description?.trim() || t("newsDescription");
  const path = locale === "ar" ? "/news" : "/en/news";
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      locale: locale === "ar" ? "ar_AR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [articles, featuredArticles, settings] = await Promise.all([
    getPublishedArticles(),
    getFeaturedArticles(3),
    getSiteSettings(),
  ]);

  const primaryArticle = featuredArticles[0] || articles[0];
  const secondaryArticles =
    featuredArticles.length > 1
      ? featuredArticles.slice(1, 3)
      : articles.filter((a) => a.id !== primaryArticle?.id).slice(0, 2);

  // The design shows exactly three cards below the fold, and the three it shows
  // are the ones the featured band does not carry. Excluding only the three the
  // band happens to render is not enough: a fourth featured article would fall
  // through into the grid and displace one of the three the design specifies.
  const featuredIds = new Set(
    [primaryArticle, ...secondaryArticles].filter(Boolean).map((a) => a!.id)
  );
  const gridArticles = articles
    .filter((a) => !a.is_featured && !featuredIds.has(a.id))
    .slice(0, 3);

  return (
    <div className="w-full bg-brand-cream">
      {primaryArticle && (
        <NewsHero primaryArticle={primaryArticle} secondaryArticles={secondaryArticles} />
      )}

      {/* Figma node 91:17798 sits 1208px wide, 103px from the inline end of the
          1440 frame — deliberately off-centre, so it is offset rather than
          centred at the design width and falls back to a fluid gutter below it. */}
      {/* Trailing space is 151.5px, not 154: node 91:17798 ends at y=1416.5 and the
          footer instance 94:18553 starts at 1568. */}
      {/* On the 390 frame (141:15199) `Frame 34` opens at 715 — 47 under the hero's
          reserved 668 box — and the footer is at 2163 with the cards closing at
          2102.5, so 60.5 closes the band. The 24 of side padding is what makes the
          grid the 342 the frame draws; there is no tablet frame to step it up at
          sm:, so it holds until the 1440 one takes over. */}
      <div className="mx-auto w-full max-w-[1440px] px-6 pb-[60.5px] pt-[47px] lg:px-0 lg:pb-[151.5px] lg:pt-[181px]">
        <div className="w-full lg:ms-[103px] lg:w-[1208px] lg:max-w-[calc(100%-103px)]">
          <NewsGrid
            articles={gridArticles}
            title={settings.news_title || undefined}
            kicker={settings.news_kicker || undefined}
            subtitle={settings.news_subtitle || undefined}
          />
        </div>
      </div>
    </div>
  );
}
