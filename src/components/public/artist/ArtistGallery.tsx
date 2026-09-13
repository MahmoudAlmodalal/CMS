import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface ArtistGalleryProps {
  /** Name the pull quote is attributed to. */
  artistName: string;
  /** The artist's own line; falls back to their short quote. */
  quote: string;
}

/**
 * الفن في لحظته الأصدق — Figma section 134:4644 (nodes 134:4645 to 134:4659).
 *
 * The section is 1280 wide and centred, padded 40/24, opening on a centred H2 in
 * Qahwa Arabic 48/42.27 tracked -0.5636 with الفن in primary-500 and the rest in
 * black, 16px inside a 59px line box. 48px under it sits an 859.333px grid,
 * itself centred, of three cells 16px apart: 265.677, 295.979, 265.677, each row
 * 295.979 tall.
 *
 * The outer cells (134:4649, 134:4658) are 12px-rounded clips holding a
 * photograph that fills only the top ~266px — the rest of the cell is empty in
 * the frame, so the image is given its drawn box rather than stretched. The
 * middle cell (134:4651) is a terracotta pull-quote card: a 56/56 ♪ at 79% of
 * brand-surface, the quote in Cairo Bold 16/26.4 over 216px, and the attribution
 * in Cairo Medium 11.2/16.8 tracked 1.12, 24px apart and vertically centred.
 *
 * The two photographs are section artwork, not per-artist media: the schema has
 * no gallery table and the frame draws the same pair for every profile, so they
 * are constants here. They are cropped 1:1 out of the reference render by
 * scripts/extract-reference-assets.py.
 *
 * DEVIATION: the frame attributes the quote to "ريم الحسيني" on سارة الصوت's
 * page — placeholder copy, not the drawn artist — so the attribution takes the
 * profile's own name.
 */
const STAGE_PHOTOGRAPHS = [
  { src: "/assets/artists/stage-1.png", width: 266, height: 267 },
  { src: "/assets/artists/stage-2.png", width: 265.677, height: 265.677 },
] as const;

export function ArtistGallery({ artistName, quote }: ArtistGalleryProps) {
  const t = useTranslations("artist");
  const [first, second] = STAGE_PHOTOGRAPHS;

  return (
    <section
      aria-label={t("galleryRegion")}
      className="mx-auto w-full max-w-[1280px] px-5 lg:px-[40px] lg:py-[24px]"
    >
      <h2 className="h-[43px] text-center font-display text-[32px] leading-[43px] tracking-[-0.5636px] text-black lg:h-[59px] lg:text-[48px] lg:leading-[42.27px]">
        {t.rich("galleryTitle", {
          em: (chunks) => <span className="text-primary-500">{chunks}</span>,
        })}
      </h2>

      <div className="pt-[55px] lg:pt-[48px]">
        <div className="mx-auto grid w-[266px] max-w-full grid-cols-1 gap-[16px] lg:w-[859.333px] lg:grid-cols-[265.677px_295.979px_265.677px] lg:grid-rows-[295.979px]">
          {/* Right-hand plate — 134:4649 */}
          <div className="h-[202.333px] overflow-hidden rounded-[12px] lg:h-[295.979px] lg:w-[265.677px]">
            <div className="relative h-full w-full lg:h-[267px] lg:w-[266px]">
              <Image
                src={first.src}
                alt={t("stageAlt")}
                fill
                sizes="266px"
                quality={90}
                className="object-cover"
              />
            </div>
          </div>

          {/* Pull quote — 134:4651 */}
          <figure className="flex h-[298.333px] flex-col items-center justify-center gap-[24px] rounded-[12px] bg-primary-500 px-[40px] py-[48px] lg:h-auto lg:size-[295.979px]">
            <p
              aria-hidden="true"
              className="text-[56px] leading-[56px] text-brand-surface/[0.79]"
            >
              ♪
            </p>
            <blockquote className="w-[216px] text-center text-[16px] font-bold leading-[26.4px] text-brand-surface">
              {`"${quote}"`}
            </blockquote>
            <figcaption className="text-[11.2px] font-medium uppercase leading-[16.8px] tracking-[1.12px] text-brand-surface">
              {t("quoteAttribution", { name: artistName })}
            </figcaption>
          </figure>

          {/* Left-hand plate — 134:4658 */}
          <div className="h-[202.333px] overflow-hidden rounded-[12px] lg:h-[295.979px] lg:w-[265.677px]">
            <div className="relative h-full w-full lg:size-[265.677px]">
              <Image
                src={second.src}
                alt={t("stageAlt")}
                fill
                sizes="266px"
                quality={90}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ArtistGallery;
