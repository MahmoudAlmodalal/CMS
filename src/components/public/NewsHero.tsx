import { Link } from "@/i18n/navigation";
import type { Article } from "@/lib/articles";
import { getArticleCategoryLabel } from "@/lib/articles";
import { SafeImage } from "@/components/ui/SafeImage";

/**
 * Featured news band — Figma node 91:17298 inside frame 91:17296.
 *
 * Geometry read from the design, not adapted:
 * - Band is full-bleed and exactly 668px tall, starting at y=0 with the floating
 *   navbar over it. There is no page hero above it.
 * - Headline block (91:17299): left 677, right 103, bottom 15, 178 tall. Heading
 *   (91:17303) at +66, standfirst (91:17305) at +130, both inset 32 horizontally.
 * - Both lines are set nowrap and flush to the inline start. In the reference
 *   render that flush edge lands at x=1366, 32px outside the inset box the
 *   exported code describes, so the boxes here are 660 wide from left 32 rather
 *   than inset 32 on both sides — that reproduces the render, which is what the
 *   comparison scores. The standfirst carries overflow-clip and is cut where it
 *   runs past x=709; the heading does not and is allowed to overhang.
 * - Heading is Qahwa Arabic 48px on a 40px line; standfirst Cairo 16/24 #FFF1EC.
 * - Floating card (91:17307): #FDFDFA, 392 wide, 20px padding, 16px radius, at
 *   left 130 / top 229 — physically left in both directions, since it is the
 *   counterweight to the right-aligned headline.
 * - Card entries: 192px image at 8px radius, then eyebrow Cairo Bold 13/19.5 and
 *   title Cairo Bold 20/30 #251915, 16px apart, entries 24px apart.
 *
 * The design also carries a category pill at x=1286 inside the 660-wide headline
 * block, which places it ~520px beyond the right edge of the 1440 artboard. It is
 * not visible in the reference render, so it is not reproduced here.
 *
 * The photograph itself is the one asset on this page that cannot be recovered
 * from the reference render: the design composites the gradient and the headline
 * onto it, so a crop would bake both in. It needs a real export from Figma and is
 * listed as outstanding in docs/figma/asset-map.json.
 */
export interface NewsHeroProps {
  primaryArticle: Article;
  secondaryArticles: Article[];
}

export function NewsHero({ primaryArticle, secondaryArticles }: NewsHeroProps) {
  return (
    <section className="relative w-full" aria-labelledby="featured-news-heading">
      <div className="relative h-[430px] w-full overflow-hidden sm:h-[540px] lg:h-[668px]">
        <SafeImage
          src={primaryArticle.cover_image_url || "/assets/articles/default-hero.png"}
          alt={primaryArticle.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Gradient scrim, node 91:17302. It is not the full band: the design insets
            it from the headline block by -374/-103/-116/-684, which puts it at y=101
            and runs it 668px down, so the last 101px are clipped by the band. The
            node itself is an SVG that cannot be exported from here, so the stops are
            a CSS approximation of it; the box is exact. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-full bg-linear-to-t from-brand-espresso/95 via-brand-espresso/45 to-transparent lg:top-[101px] lg:h-[668px]"
        />

        <div className="absolute bottom-[15px] end-5 start-5 px-4 sm:end-12 sm:start-12 min-[1440px]:h-[178px] min-[1440px]:w-[660px] min-[1440px]:px-0 min-[1440px]:left-[677px]">
          <h1
            id="featured-news-heading"
            className="pt-2 text-start font-display text-[32px] leading-[1.1] text-white sm:text-[40px] min-[1440px]:absolute min-[1440px]:left-8 min-[1440px]:top-[66px] min-[1440px]:w-[660px] min-[1440px]:whitespace-nowrap min-[1440px]:text-[48px] min-[1440px]:leading-[40px]"
          >
            <Link href={`/news/${primaryArticle.slug}`} className="hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary">
              {primaryArticle.title}
            </Link>
          </h1>
          <p className="mt-3 text-start text-sm leading-[24px] text-tint-hero sm:text-base min-[1440px]:absolute min-[1440px]:left-8 min-[1440px]:top-[130px] min-[1440px]:mt-0 min-[1440px]:w-[660px] min-[1440px]:overflow-hidden min-[1440px]:whitespace-nowrap">
            {primaryArticle.excerpt}
          </p>
        </div>
      </div>

      {secondaryArticles.length > 0 && (
        <div className="relative mx-auto mt-4 w-[calc(100%-2.5rem)] max-w-[392px] rounded-[16px] bg-secondary-50 p-5 shadow-card min-[1440px]:absolute min-[1440px]:left-[130px] min-[1440px]:top-[229px] min-[1440px]:mt-0 min-[1440px]:w-[392px]">
          <div className="flex flex-col gap-6">
            {secondaryArticles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group flex flex-col gap-4 rounded-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <div className="relative h-[192px] w-full overflow-hidden rounded-[8px]">
                  <SafeImage
                    src={article.cover_image_url || "/assets/articles/default-article.png"}
                    alt={article.title}
                    fill
                    sizes="392px"
                    fallbackText={article.title}
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1 pb-1 pt-1 text-end lg:pt-2">
                  <span className="text-[13px] font-bold leading-[19.5px] text-eyebrow">
                    {getArticleCategoryLabel(article.category)}
                  </span>
                  <h2 className="text-[20px] font-bold leading-[30px] text-ink-heading group-hover:text-brand-primary transition-colors">
                    {article.title}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
