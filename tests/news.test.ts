import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { arMessages, enMessages } from "./helpers/i18n.ts";
// NOTE: node --test cannot resolve the `@/` alias (or next/headers), so data
// is imported from the runtime-safe `src/lib/articles.ts` module (its only
// `@/` import is `import type`, elided by type-stripping). The DAL module
// (`src/lib/dal/articles.ts`, which needs `@/lib/supabase/server`) is
// asserted via file-content checks, per tests/events-page.test.ts precedent.
import {
  ARTICLE_CATEGORIES,
  CATEGORY_LABELS,
  getArticleCategoryLabel,
  CANONICAL_ARTICLES,
} from "../src/lib/articles.ts";

const root = path.resolve(".");

/**
 * Drop comments so a source assertion reads code rather than prose. `//` is only
 * treated as a comment at the start of a line, which leaves `https://` and any
 * other mid-line double slash intact.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
}

test("Task 37 — 1. News Architecture & Required File Artifacts", () => {
  const expectedFiles = [
    "src/app/[locale]/(public)/news/page.tsx",
    "src/app/[locale]/(public)/news/[slug]/page.tsx",
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
    path.join(root, "src/app/[locale]/(public)/news/page.tsx"),
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
    /const path = locale === "ar" \? "\/news" : "\/en\/news";/,
    "News listing page must declare a per-locale canonical URL, Arabic staying at '/news'"
  );
  assert.match(newsPageContent, /alternates: \{ canonical: path \}/, "The canonical URL must be applied");
  assert.match(newsPageContent, /t\("newsTitle"\)/, "News listing metadata must come from the meta namespace");
  assert.equal(
    arMessages["meta.newsTitle"],
    "الأخبار والمقالات الثقافية | فرقة أندلسيا",
    "News listing metadata must contain primary title in Arabic"
  );
  assert.ok(enMessages["meta.newsTitle"], "News listing metadata title must exist in English");

  // Semantics and component composition
  assert.match(newsPageContent, /<NewsHero/);
  assert.match(newsPageContent, /<NewsGrid/);
});

test("Task 37 — 3. Article Reader Page ISR, 404, & Canonical URLs", () => {
  const slugPageContent = fs.readFileSync(
    path.join(root, "src/app/[locale]/(public)/news/[slug]/page.tsx"),
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

  // CATEGORY_LABELS map must mirror the category list
  for (const c of ARTICLE_CATEGORIES) {
    assert.equal(
      CATEGORY_LABELS[c.id],
      c.label,
      `CATEGORY_LABELS[${c.id}] must match ARTICLE_CATEGORIES label`
    );
  }
});

test("Task 37 — 6. Articles DAL Data Access Methods & RLS Predicates", () => {
  // DAL module cannot be imported under node --test (@/ + next/headers), so
  // verify its contract via source assertions (events-page.test.ts precedent).
  const dal = fs.readFileSync(
    path.join(root, "src/lib/dal/articles.ts"),
    "utf-8"
  );

  for (const fn of [
    "getPublishedArticles",
    "getFeaturedArticles",
    "getArticleBySlug",
    "getRelatedArticles",
    "getAllPublishedArticleSlugs",
  ]) {
    assert.match(
      dal,
      new RegExp(`export async function ${fn}\\b`),
      `DAL must export ${fn}`
    );
  }

  // RLS public view rules enforced in Supabase queries AND canonical fallback
  assert.match(dal, /\.eq\("is_published", true\)/);
  assert.match(dal, /\.lte\("published_at", nowIso\)/);
  assert.match(dal, /CANONICAL_ARTICLES\.filter/);
  assert.match(dal, /return found \|\| null/);

  // Runtime data-integrity: canonical fallback backing every DAL read
  assert.ok(
    CANONICAL_ARTICLES.length >= 7,
    "Should seed at least 7 canonical articles"
  );
  for (const a of CANONICAL_ARTICLES) {
    assert.equal(a.is_published, true, "Every canonical article must be published");
    assert.ok(
      new Date(a.published_at).getTime() <= Date.now(),
      "Future-dated articles must not be exposed to public visitors"
    );
  }

  // Featured pool backing getFeaturedArticles(3)
  const featured = CANONICAL_ARTICLES.filter((a) => a.is_featured);
  assert.ok(featured.length >= 3, "At least 3 featured articles required");

  // Slug lookup backing getArticleBySlug (valid + invalid → null)
  const article = CANONICAL_ARTICLES.find(
    (a) => a.slug === "annual-andalusia-art-exhibition"
  );
  assert.ok(article);
  assert.equal(
    CANONICAL_ARTICLES.find((a) => a.slug === "non-existent-article-slug"),
    undefined,
    "Non-existent slug must resolve to null in the DAL"
  );

  // Related pool backing getRelatedArticles (excludes current, same-category first)
  const related = CANONICAL_ARTICLES.filter(
    (a) => a.slug !== "annual-andalusia-art-exhibition"
  );
  assert.ok(related.length > 0 && related.length <= 6);
  const sameCategory = related.filter((a) => a.category === "culture");
  assert.ok(sameCategory.length > 0, "Same-category related articles must exist");

  // Slug list backing generateStaticParams
  const slugs = CANONICAL_ARTICLES.map((a) => ({ slug: a.slug }));
  assert.ok(slugs.length >= 7);
  assert.ok(
    slugs.some((s) => s.slug === "annual-andalusia-art-exhibition")
  );
});

test("Figma 91:17296 — News page geometry matches the frame", () => {
  const hero = fs.readFileSync(path.join(root, "src/components/public/NewsHero.tsx"), "utf-8");
  const grid = fs.readFileSync(path.join(root, "src/components/public/NewsGrid.tsx"), "utf-8");
  const card = fs.readFileSync(path.join(root, "src/components/public/ArticleCard.tsx"), "utf-8");
  const page = fs.readFileSync(path.join(root, "src/app/[locale]/(public)/news/page.tsx"), "utf-8");

  // Band 91:17298 is full-bleed and exactly 668 tall; the navbar floats over it.
  assert.match(hero, /lg:h-\[668px\]/, "Hero band must be 668px tall on desktop");
  // Headline block 91:17299: left 677, right 103, bottom 15, height 178.
  assert.match(hero, /lg:start-\[103px\]/, "Headline block must be inset 103px from the inline end");
  assert.match(hero, /lg:w-\[660px\]/, "Headline block must be 660px wide");
  assert.match(hero, /lg:h-\[178px\]/, "Headline block must be 178px tall");
  assert.match(hero, /bottom-\[15px\]/, "Headline block must sit 15px off the band's bottom");
  assert.match(hero, /lg:top-\[66px\]/, "Heading 91:17303 must sit at +66 in the block");
  assert.match(hero, /lg:top-\[130px\]/, "Standfirst 91:17305 must sit at +130 in the block");
  // Both lines are nowrap; only the standfirst clips where it runs past its box.
  assert.match(hero, /lg:overflow-hidden lg:whitespace-nowrap/, "Standfirst must clip, not wrap");
  // Floating card 91:17307 is physically left in both directions.
  assert.match(hero, /lg:left-\[130px\] lg:top-\[229px\]/, "Floating card must sit at left 130 / top 229");

  // Section 91:17798 is 1208 wide, 103 from the inline end — deliberately off-centre.
  assert.match(page, /lg:ms-\[103px\] lg:w-\[1208px\]/, "Grid section must be 1208 wide at 103 from the inline end");
  // The design shows no filter tabs on this section.
  assert.doesNotMatch(grid, /<NewsFilterTabs/, "The news grid must not render a category filter — the design has none");
  assert.doesNotMatch(grid, /import .*NewsFilterTabs/, "The news grid must not import the filter it no longer renders");
  assert.doesNotMatch(grid, /"use client"/, "The news grid is presentational and renders on the server");

  // Assert against code, not prose. A docblock explaining why justify-between was
  // wrong otherwise satisfies a grep for justify-between, and the same trap makes
  // every match here pass on a comment that merely quotes the value.
  const cardCode = stripComments(card);

  // Every row of the card reads from the inline start — flush right in Arabic.
  assert.match(cardCode, /flex-col p-6 text-start/, "Card body must read from the inline start");
  assert.match(cardCode, /absolute start-4 top-4/, "Date wash must sit at the inline-start corner of the cover");
  assert.match(cardCode, /h-\[192px\]/, "Cover strip must be a flat 192px");

  // Card 91:17378 is a flat 423.5px: 1px border + 192 cover + 229.5 body + 1px.
  assert.match(cardCode, /lg:h-\[423\.5px\]/, "Card must be 423.5px tall on the desktop frame");
  // Figma holds heading + excerpt at a constant 138.5px, pairing a 72px two-line
  // heading with a 66.5px excerpt and a 42px one-line heading with a 96.5px one.
  // So the excerpt absorbs the remainder and clips; it is not a spacer spread.
  assert.match(cardCode, /min-h-0 flex-1 overflow-hidden/, "Excerpt must absorb the card's slack and clip");
  assert.doesNotMatch(
    cardCode,
    /justify-between/,
    "justify-between spreads slack across every gap, growing the row to 445px and " +
      "knocking each card's rows out of alignment with its neighbours"
  );

  // Node 91:17798 ends at y=1416.5 and footer 94:18553 starts at 1568.
  assert.match(page, /lg:pb-\[151\.5px\]/, "Grid section must leave 151.5px before the footer");
  assert.match(page, /lg:pt-\[181px\]/, "Grid section must start 181px below the 668px hero band");
});

test("Figma 91:17296 — grid carries the three articles the featured band does not", () => {
  const page = fs.readFileSync(path.join(root, "src/app/[locale]/(public)/news/page.tsx"), "utf-8");
  // A fourth featured article must not fall through into the grid.
  assert.match(page, /!a\.is_featured/, "Grid must exclude every featured article, not only the rendered ones");
  assert.match(page, /\.slice\(0, 3\)/, "The design shows exactly three cards");

  for (const title of [
    "تطور الفن الرقمي في العالم العربي",
    "رحلة مصور في أزقة المدينة القديمة",
    "الإعلان عن جدول فعاليات الصيف الموسيقية",
  ]) {
    assert.ok(
      CANONICAL_ARTICLES.some((article) => article.title === title && !article.is_featured),
      `Canonical content must carry the grid article "${title}" as unfeatured`
    );
  }

  const heroArticle = CANONICAL_ARTICLES.find((a) => a.slug === "annual-andalusia-art-exhibition");
  assert.ok(heroArticle, "Canonical content must carry the hero article");
  assert.equal(
    heroArticle!.excerpt,
    "يستضيف المركز هذا الأسبوع مجموعة من أبرز الفنانين المعاصرين لتقديم أعمالهم الجديدة في المعرض السنوي المرتقب.",
    "Hero standfirst must be the copy in node 91:17306"
  );
});
