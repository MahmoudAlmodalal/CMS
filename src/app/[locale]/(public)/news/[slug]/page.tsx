import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/LayoutPrimitives";
import { ArticleView } from "@/components/public/ArticleView";
import {
  getArticleBySlug,
  getRelatedArticles,
  getAllPublishedArticleSlugs,
} from "@/lib/dal/articles";

export const revalidate = 1800; // 30 minutes ISR as locked in APPLICATION_ARCHITECTURE.md
export const dynamicParams = true;

/**
 * Pre-render all published article slugs at build time.
 */
export async function generateStaticParams() {
  const slugs = await getAllPublishedArticleSlugs();
  return slugs.map((item) => ({
    slug: item.slug,
  }));
}

/**
 * Generate dynamic SEO metadata and canonical URLs for the article.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: t("articleNotFound"),
      description: t("articleNotFoundDescription"),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = locale === "ar" ? `/news/${article.slug}` : `/en/news/${article.slug}`;

  return {
    title: t("articleTitle", { title: article.title }),
    description: article.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: t("articleTitle", { title: article.title }),
      description: article.excerpt,
      url: canonicalUrl,
      type: "article",
      publishedTime: article.published_at,
      authors: [article.author_name],
      locale: locale === "ar" ? "ar_AR" : "en_US",
      images: [
        {
          url: article.cover_image_url || "/assets/articles/default-article.png",
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("articleTitle", { title: article.title }),
      description: article.excerpt,
      images: [article.cover_image_url || "/assets/articles/default-article.png"],
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  // If article not found or unpublished/scheduled for future, trigger 404
  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(slug, article.category, 3);

  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <Container>
        <ArticleView article={article} relatedArticles={relatedArticles} />
      </Container>
    </div>
  );
}

