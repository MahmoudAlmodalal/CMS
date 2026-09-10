import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  ARTICLE_CATEGORIES,
  CATEGORY_LABELS,
  getArticleCategoryLabel,
  CANONICAL_ARTICLES,
  getPublishedArticles,
  getFeaturedArticles,
  getArticleBySlug,
  getRelatedArticles,
  getAllPublishedArticleSlugs,
} from "../src/lib/dal/articles.ts";

const root = path.resolve(".");

test("Task 37 — 1. News Architecture & Required File Artifacts", () => {
  const expectedFiles = [
    "src/app/(public)/news/page.tsx",
    "src/app/(public)/news/[slug]/page.tsx",
    "src/components/public/NewsHero.tsx",
    "src/components/public/NewsGrid.tsx",
    "src/components/public/NewsFilterTabs.tsx",
    "src/components/public/ArticleCard.tsx",
    "src/components/public/ArticleView.tsx",
    "src/lib/dal/articles.ts",
  ];

  for (const rel of expectedFiles) {
    const fullPath = path.join(root, rel);
    assert.ok(fs.existsSync(fullPath), `Expected news file to exist: ${rel}`);
  }

  // Verify public barrel export contains all news components
  const barrel = fs.readFileSync(
    path.join(root, "src/components/public/index.ts"),
    "utf-8"
  );
  assert.match(barrel, /export \{ NewsHero/);
  assert.match(barrel, /export \{ NewsGrid/);
  assert.match(barrel, /export \{ NewsFilterTabs/);
  assert.match(barrel, /export \{ ArticleCard/);
  assert.match(barrel, /export \{ ArticleView/);
});

test("Task 37 — 2. News Listing Page ISR & Metadata Specifications", () => {
  const newsPageContent = fs.readFileSync(
    path.join(root, "src/app/(public)/news/page.tsx"),
    "utf-8"
  );

  // ISR revalidation locked to 1800 (30 mins) in APPLICATION_ARCHITECTURE.md
  assert.match(
    newsPageContent,
    /export const revalidate\s*=\s*1800;/,
    "News listing page must export revalidate = 1800 for ISR"
  );

  // Canonical URL and SEO metadata
  assert.match(
    newsPageContent,
    /canonical:\s*["']\/news["']/,
    "News listing page must declare canonical URL '/news'"
  );
  assert.match(
    newsPageContent,
    /الأخبار والمقالات الثقافية/,
    "News listing metadata must contain primary title in Arabic"
  );

  // Semantics and component composition
  assert.match(newsPageContent, /<NewsHero/);
  assert.match(newsPageContent, /<NewsGrid/);
});

test("Task 37 — 3. Article Reader Page ISR, 404, & Canonical URLs", () => {
  const slugPageContent = fs.readFileSync(
    path.join(root, "src/app/(public)/news/[slug]/page.tsx"),
    "utf-8"
  );

  // ISR revalidation locked to 1800
  assert.match(
    slugPageContent,
    /export const revalidate\s*=\s*1800;/,
    "Article reader page must export revalidate = 1800 for ISR"
  );

  // Dynamic params enabled for on-demand generation
  assert.match(
    slugPageContent,
    /export const dynamicParams\s*=\s*true;/,
    "Article reader page must export dynamicParams = true"
  );

  // generateStaticParams must be exported for pre-rendering
  assert.match(
    slugPageContent,
    /export async function generateStaticParams\(/,
    "Article reader page must export generateStaticParams"
  );

  // generateMetadata must be exported with canonical /news/[slug]
  assert.match(
    slugPageContent,
    /export async function generateMetadata\(/,
    "Article reader page must export generateMetadata"
  );
  assert.match(
    slugPageContent,
    /canonical:\s*canonicalUrl/,
    "generateMetadata must set canonical URL for the article"
  );

  // Missing article must trigger notFound() (404)
  assert.match(
    slugPageContent,
    /notFound\(\)/,
    "Reader page must trigger notFound() when article does not exist"
  );
  assert.match(
    slugPageContent,
    /import\s*\{\s*notFound\s*\}\s*from\s*["']next\/navigation["']/,
    "Reader page must import notFound from next/navigation"
  );
});

test("Task 37 — 4. Figma Content Inventory Verification", () => {
  // Figma Node 91:17304 - Hero Story Title
  const heroArticle = CANONICAL_ARTICLES.find(
    (a) => a.slug === "annual-andalusia-art-exhibition"
  );
  assert.ok(heroArticle, "Figma Hero Story article must exist in canonical data");
  assert.equal(
    heroArticle?.title,
    "افتتاح المعرض الفني السنوي في الأندلس",
    "Hero title must match Figma Node 91:17304"
  );
  assert.equal(
    heroArticle?.category,
    "culture",
    "Hero story category must be 'culture'"
  );

  // Figma Node 91:17314 - Side Highlight 1: "حوار مع النحات أحمد محمود"
  const highlight1 = CANONICAL_ARTICLES.find(
    (a) => a.slug === "interview-sculptor-ahmed-mahmoud"
  );
  assert.ok(highlight1, "Figma Side Highlight 1 must exist");
  assert.equal(
    highlight1?.title,
    "حوار مع النحات أحمد محمود",
    "Side Highlight 1 title must match Figma Node 91:17314"
  );
  assert.equal(
    highlight1?.category,
    "artists",
    "Side Highlight 1 category must match Figma Node 91:17312 ('قصص الفنانين')"
  );

  // Figma Node 91:17321 - Side Highlight 2: "ورشة عمل جديدة في النحت الكلاسيكي"
  const highlight2 = CANONICAL_ARTICLES.find(
    (a) => a.slug === "classical-sculpture-workshop"
  );
  assert.ok(highlight2, "Figma Side Highlight 2 must exist");
  assert.equal(
    highlight2?.title,
    "ورشة عمل جديدة في النحت الكلاسيكي",
    "Side Highlight 2 title must match Figma Node 91:17321"
  );
  assert.equal(
    highlight2?.category,
    "academy",
    "Side Highlight 2 category must match Figma Node 91:17319 ('الأكاديمية')"
  );
});

test("Task 37 — 5. Category System & Arabic Localization", () => {
  assert.equal(getArticleCategoryLabel("culture"), "الأخبار الثقافية");
  assert.equal(getArticleCategoryLabel("artists"), "قصص الفنانين");
  assert.equal(getArticleCategoryLabel("academy"), "الأكاديمية");
  assert.equal(getArticleCategoryLabel("events"), "الفعاليات");
  assert.equal(getArticleCategoryLabel("all"), "الكل");

  assert.equal(ARTICLE_CATEGORIES.length, 5);
  assert.ok(ARTICLE_CATEGORIES.some((c) => c.id === "all"));
  assert.ok(ARTICLE_CATEGORIES.some((c) => c.id === "culture"));
  assert.ok(ARTICLE_CATEGORIES.some((c) => c.id === "artists"));
  assert.ok(ARTICLE_CATEGORIES.some((c) => c.id === "academy"));
  assert.ok(ARTICLE_CATEGORIES.some((c) => c.id === "events"));
});

test("Task 37 — 6. Articles DAL Data Access Methods", async () => {
  // getPublishedArticles (all)
  const allArticles = await getPublishedArticles();
  assert.ok(allArticles.length >= 7, "Should return at least 7 canonical articles");
  for (const a of allArticles) {
    assert.equal(a.is_published, true, "Every returned article must be published");
    assert.ok(
      new Date(a.published_at).getTime() <= Date.now(),
      "Future-dated articles must not be returned to public visitors"
    );
  }

  // getPublishedArticles (category filter)
  const cultureArticles = await getPublishedArticles({ category: "culture" });
  assert.ok(cultureArticles.length > 0);
  assert.ok(cultureArticles.every((a) => a.category === "culture"));

  // getFeaturedArticles
  const featured = await getFeaturedArticles(3);
  assert.equal(featured.length, 3);
  assert.ok(featured.every((a) => a.is_featured === true));

  // getArticleBySlug (valid)
  const article = await getArticleBySlug("annual-andalusia-art-exhibition");
  assert.ok(article);
  assert.equal(article?.slug, "annual-andalusia-art-exhibition");

  // getArticleBySlug (invalid -> null for 404)
  const missing = await getArticleBySlug("non-existent-article-slug");
  assert.equal(missing, null, "Non-existent slug must return null");

  // getRelatedArticles
  const related = await getRelatedArticles(
    "annual-andalusia-art-exhibition",
    "culture",
    3
  );
  assert.ok(related.length > 0 && related.length <= 3);
  assert.ok(!related.some((a) => a.slug === "annual-andalusia-art-exhibition"));

  // getAllPublishedArticleSlugs
  const slugs = await getAllPublishedArticleSlugs();
  assert.ok(slugs.length >= 7);
  assert.ok(slugs.some((s) => s.slug === "annual-andalusia-art-exhibition"));
});
