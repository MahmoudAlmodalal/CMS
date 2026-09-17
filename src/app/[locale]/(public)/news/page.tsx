import React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsHero } from "@/components/public/NewsHero";
import { NewsGrid } from "@/components/public/NewsGrid";
import { NewsPagination } from "@/components/public/NewsPagination";
import {
  NEWS_GRID_PER_PAGE,
  type Article,
  getPublishedArticles,
  getFeaturedArticles,
  getPublishedArticlesPage,
} from "@/lib/dal/articles";
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

function parsePageParam(param: string | string[] | undefined): number {
  const raw = Array.isArray(param) ? param[0] : param;
  if (!raw) return 1;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return 1;
  const floored = Math.floor(parsed);
  return floored < 1 ? 1 : floored;
}

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedPage = parsePageParam(resolvedSearchParams?.page);

  // Hero is stable DB featured top3 on all pages; if fewer than 3 featured exist,
  // query published articles independently to fill the hero slots.
  const [featuredArticles, settings] = await Promise.all([
    getFeaturedArticles(3),
    getSiteSettings(),
  ]);

  const heroFill =
    featuredArticles.length < 3 ? await getPublishedArticles({ limit: 3 }) : [];
  const heroArticles: Article[] = [
    ...featuredArticles,
    ...heroFill.filter((art) => !featuredArticles.some((h) => h.id === art.id)),
  ].slice(0, 3);

  const primaryArticle = heroArticles[0] || null;
  const secondaryArticles = heroArticles.slice(1, 3);
  const heroRenderedIds = [primaryArticle, ...secondaryArticles]
    .filter((a): a is Article => Boolean(a))
    .map((a) => a.id);

  // Exclude exactly the hero-rendered IDs BEFORE database count and range so
  // every remaining story (including extra featured) is reachable.
  const articlesPage = await getPublishedArticlesPage({
    page: requestedPage,
    perPage: NEWS_GRID_PER_PAGE,
    excludeIds: heroRenderedIds,
  });

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
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-[60.5px] pt-[47px] sm:px-6 lg:px-0 lg:pb-[151.5px] lg:pt-[240px]">
        <div className="w-full lg:ms-[103px] lg:w-[1208px] lg:max-w-[calc(100%-103px)]">
          <NewsGrid
            articles={articlesPage.items}
            title={settings.news_title || undefined}
            kicker={settings.news_kicker || undefined}
            subtitle={settings.news_subtitle || undefined}
          />
          {articlesPage.totalPages > 1 && (
            <NewsPagination
              currentPage={articlesPage.page}
              totalPages={articlesPage.totalPages}
              searchParams={resolvedSearchParams}
            />
          )}
        </div>
      </div>
    </div>
  );
}
