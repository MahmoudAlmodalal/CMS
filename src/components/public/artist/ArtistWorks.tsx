import React from "react";
import { getTranslations } from "next-intl/server";
import { parseYouTubeId } from "@/lib/youtube";
import type { ArtistWork } from "@/lib/types/artist-works";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { ArtistWorkCard } from "./ArtistWorkCard";

interface ArtistWorksProps {
  works: ArtistWork[];
}

/**
 * الأعمال — the artist's published works, as YouTube embeds.
 *
 * The profile page had no works band at all: an editor could fill the CMS and
 * the visitor would still see only a biography. The band renders nothing when
 * the artist has no published work, so a profile without one is unchanged.
 *
 * Server component by design — only the per-card play toggle needs the client.
 */
export async function ArtistWorks({ works }: ArtistWorksProps) {
  // A row whose link no longer parses (hand-edited in the DB) is skipped rather
  // than rendered as a dead card.
  const playable = works.filter((work) => parseYouTubeId(work.youtube_url) !== null);

  if (playable.length === 0) return null;

  const t = await getTranslations("artist");

  // The reveal wrapper lives inside the early return, so a profile with no
  // published work renders nothing at all and the page's `empty:mt-0` guard
  // still collapses the band's margin.
  return (
    <ScrollReveal>
      <section
        aria-label={t("worksRegion")}
        className="mx-auto w-full max-w-[1280px] px-5 lg:px-[40px]"
      >
        <h2 className="text-center font-display text-[32px] leading-[43px] tracking-[-0.5636px] text-black lg:text-[48px] lg:leading-[52px]">
          {t.rich("worksTitle", {
            em: (chunks) => <span className="text-primary-500">{chunks}</span>,
          })}
        </h2>

        <div className="grid grid-cols-1 gap-[16px] pt-[40px] sm:grid-cols-2 lg:grid-cols-3">
          {playable.map((work) => (
            <ArtistWorkCard key={work.id} work={work} />
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}

export default ArtistWorks;
