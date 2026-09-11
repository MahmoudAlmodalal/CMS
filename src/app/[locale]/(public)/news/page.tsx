import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/LayoutPrimitives";
import { NewsHero } from "@/components/public/NewsHero";
import { NewsGrid } from "@/components/public/NewsGrid";
import { PageHero } from "@/components/public";
import { getPublishedArticles, getFeaturedArticles } from "@/lib/dal/articles";

export const revalidate = 1800; // 30 minutes ISR as specified in APPLICATION_ARCHITECTURE.md

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = locale === "ar" ? "/news" : "/en/news";
  return {
    title: t("newsTitle"),
    description: t("newsDescription"),
    alternates: { canonical: path },
    openGraph: {
      title: t("newsTitle"),
      description: t("newsDescription"),
      url: path,
      locale: locale === "ar" ? "ar_AR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("newsTitle"),
      description: t("newsDescription"),
    },
  };
}

export default async function NewsPage() {
  const [articles, featuredArticles, t] = await Promise.all([
    getPublishedArticles(),
    getFeaturedArticles(3),
    getTranslations("page"),
  ]);

  const primaryArticle = featuredArticles[0] || articles[0];
  const secondaryArticles =
    featuredArticles.length > 1
      ? featuredArticles.slice(1, 3)
      : articles.filter((a) => a.id !== primaryArticle?.id).slice(0, 2);

  return (
    <div className="space-y-12 sm:space-y-16">
      <PageHero
        eyebrow={t("newsEyebrow")}
        title={t("newsTitle")}
        subtitle={t("newsSubtitle")}
      />
      <Container>
        {/* Page Header Header Kicker & Title */}
        <div className="sr-only space-y-3 text-start mb-8 sm:mb-12">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
            {t("newsEyebrow")}
          </span>
          <h1 className="font-calligraphic text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-espresso">
            {t("newsHiddenTitle")}
          </h1>
          <p className="text-sm sm:text-base text-brand-espresso/80 max-w-2xl leading-relaxed">
            {t("newsHiddenSubtitle")}
          </p>
        </div>

        {/* Featured News Hero (Figma Node 91:17296) */}
        {primaryArticle && (
          <div className="mb-12 sm:mb-16">
            <NewsHero
              primaryArticle={primaryArticle}
              secondaryArticles={secondaryArticles}
            />
          </div>
        )}

        {/* All Articles Grid with Instant Filtering (Figma Frame 34 / Node 91:17798).
            Suspense boundary required: NewsGrid reads useSearchParams, which
            forbids static prerendering without one. */}
        <Suspense
          fallback={
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              aria-hidden="true"
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-72 rounded-card bg-brand-surface/50 border border-brand-espresso-subtle animate-pulse"
                />
              ))}
            </div>
          }
        >
          <NewsGrid initialArticles={articles} />
        </Suspense>
      </Container>
    </div>
  );
}
