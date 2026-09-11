import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowEndIcon } from "@/components/ui/Icons";
import { formatArabicDate } from "@/lib/formatters";
import { getArticleCategoryLabel, type Article } from "@/lib/articles";
import { ArticleCard } from "./ArticleCard";

export interface ArticleViewProps {
  article: Article;
  relatedArticles?: Article[];
}

/**
 * ArticleView Component
 * Dedicated reader page for /news/[slug].
 * Provides semantic article reading layout, typography hierarchy,
 * author attribution, date badges, and related articles feed.
 */
export function ArticleView({ article, relatedArticles = [] }: ArticleViewProps) {
  const t = useTranslations("news");
  const nav = useTranslations("nav");
  const categoryLabel = getArticleCategoryLabel(article.category);
  const dateFormatted = formatArabicDate(article.published_at);

  // Estimate reading time in Arabic (approx 180-200 words per minute)
  const wordCount = (article.content || "").trim().split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 180));

  // Parse markdown-like content blocks (headers, quotes, lists, paragraphs)
  const renderContent = (raw: string) => {
    const paragraphs = raw.split(/\n\n+/);

    return paragraphs.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // H1 / H2
      if (trimmed.startsWith("## ")) {
        return (
          <h2
            key={idx}
            className="font-calligraphic text-2xl sm:text-3xl font-bold text-brand-espresso mt-8 mb-4 border-r-4 border-brand-primary pe-4"
          >
            {trimmed.replace(/^##\s+/, "")}
          </h2>
        );
      }
      if (trimmed.startsWith("# ")) {
        return (
          <h2
            key={idx}
            className="font-calligraphic text-2xl sm:text-3xl font-bold text-brand-espresso mt-8 mb-4 border-r-4 border-brand-primary pe-4"
          >
            {trimmed.replace(/^#\s+/, "")}
          </h2>
        );
      }
      if (trimmed.startsWith("### ")) {
        return (
          <h3
            key={idx}
            className="font-sans text-xl sm:text-2xl font-bold text-brand-espresso mt-6 mb-3"
          >
            {trimmed.replace(/^###\s+/, "")}
          </h3>
        );
      }

      // Blockquote
      if (trimmed.startsWith(">")) {
        const quoteLines = trimmed
          .split("\n")
          .map((l) => l.replace(/^>\s?/, "").trim())
          .join(" ");
        return (
          <blockquote
            key={idx}
            className="my-6 p-5 sm:p-6 bg-brand-surface rounded-card border-r-4 border-brand-primary text-brand-espresso/90 italic font-sans text-base sm:text-lg leading-relaxed"
          >
            {quoteLines}
          </blockquote>
        );
      }

      // Numbered List
      if (/^\d+\.\s/.test(trimmed)) {
        const items = trimmed.split("\n").map((line) => line.replace(/^\d+\.\s*/, "").trim());
        return (
          <ol key={idx} className="my-4 space-y-2 list-decimal list-inside text-brand-espresso/85">
            {items.map((it, iIdx) => (
              <li key={iIdx} className="leading-relaxed">
                {it}
              </li>
            ))}
          </ol>
        );
      }

      // Standard Paragraph
      return (
        <p
          key={idx}
          className="text-base sm:text-lg leading-loose text-brand-espresso/85 font-sans mb-4"
        >
          {trimmed}
        </p>
      );
    });
  };

  return (
    <article className="space-y-12 sm:space-y-16 text-start">
      {/* 1. Header & Navigation Breadcrumb */}
      <header className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation Cue */}
        <div className="flex items-center justify-between gap-4 text-xs font-bold text-brand-primary">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 hover:text-brand-primary/80 transition-colors py-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs"
          >
            <span className="rotate-180 inline-block rtl:rotate-0">
              <ArrowEndIcon size={14} />
            </span>
            <span>{t("backToList")}</span>
          </Link>

          <nav aria-label={t("breadcrumb")} className="text-brand-espresso/50 hidden sm:flex items-center gap-2 font-medium">
            <Link href="/" className="hover:text-brand-espresso transition-colors">
              {nav("home")}
            </Link>
            <span>/</span>
            <Link href="/news" className="hover:text-brand-espresso transition-colors">
              {nav("news")}
            </Link>
            <span>/</span>
            <span className="text-brand-espresso truncate max-w-xs">{article.title}</span>
          </nav>
        </div>

        {/* Category + Date + Reading Time Row */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-primary text-white text-xs font-bold">
            {categoryLabel}
          </span>
          <span className="text-xs text-brand-espresso/60 font-mono">
            <time dateTime={article.published_at}>{dateFormatted}</time>
          </span>
          <span className="text-xs text-brand-espresso/40">•</span>
          <span className="text-xs text-brand-espresso/60 font-mono">
            {t("readingTime", { minutes: readingMinutes })}
          </span>
        </div>

        {/* Article Headline */}
        <h1 className="font-calligraphic text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-espresso leading-tight">
          {article.title}
        </h1>

        {/* Lead Excerpt */}
        <p className="text-lg sm:text-xl text-brand-espresso/80 font-medium leading-relaxed border-s-2 border-brand-primary/40 ps-4">
          {article.excerpt}
        </p>

        {/* Author Byline */}
        <div className="pt-2 flex items-center gap-3 text-xs sm:text-sm text-brand-espresso/70 border-t border-brand-espresso/10">
          <div className="w-8 h-8 rounded-full bg-brand-surface border border-brand-espresso/15 flex items-center justify-center font-bold text-brand-primary">
            ✍️
          </div>
          <div>
            <div className="font-bold text-brand-espresso">{article.author_name}</div>
            <div className="text-xs text-brand-espresso/50">{t("editorial")}</div>
          </div>
        </div>
      </header>

      {/* 2. Featured Cover Image */}
      <div className="max-w-5xl mx-auto rounded-card overflow-hidden shadow-card border border-brand-espresso/10 bg-brand-surface aspect-[16/9] sm:aspect-[21/9] relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${article.cover_image_url || "/assets/articles/default-article.png"})`,
            backgroundColor: "#2B1D14",
          }}
          aria-label={article.title}
          role="img"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 3. Main Reading Body */}
      <div className="max-w-3xl mx-auto prose prose-lg prose-amber">
        <div className="space-y-4">{renderContent(article.content)}</div>
      </div>

      {/* 4. Article Footer & Share/Tag Info */}
      <footer className="max-w-3xl mx-auto pt-8 border-t border-brand-espresso/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-brand-espresso/70">{t("categoryLabel")}</span>
          <Link
            href={`/news?category=${article.category}`}
            className="text-xs font-bold px-3 py-1 rounded-full bg-brand-surface text-brand-primary hover:bg-brand-primary hover:text-white transition-colors border border-brand-espresso/10"
          >
            {categoryLabel}
          </Link>
        </div>

        <Link
          href="/news"
          className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
        >
          <span>{t("browseAll")}</span>
          <ArrowEndIcon size={14} />
        </Link>
      </footer>

      {/* 5. Related Articles Section */}
      {relatedArticles.length > 0 && (
        <section
          aria-label={t("relatedRegion")}
          className="pt-12 sm:pt-16 border-t border-brand-espresso/10 space-y-8"
        >
          <div className="max-w-5xl mx-auto space-y-2">
            <span className="text-xs font-bold text-brand-primary uppercase">{t("relatedKicker")}</span>
            <h2 className="font-calligraphic text-2xl sm:text-3xl font-bold text-brand-espresso">
              {t("relatedHeading")}
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((related) => (
              <ArticleCard key={related.id || related.slug} article={related} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
