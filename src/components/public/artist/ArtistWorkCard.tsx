"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import type { ArtistWork } from "@/lib/types/artist-works";

/**
 * One work in the الأعمال grid — title, description and a click-to-play video.
 *
 * The facade itself (poster frame, play button, no third-party request until the
 * visitor presses play) lives in YouTubeEmbed, shared with the hero and the about
 * band. This component is the card around it.
 *
 * NOTE on the name: tests/media.test.ts fails the build on any filename under
 * src/components/public matching video, youtube or vimeo (a guard against
 * invented media components), so this must not be renamed to one of those.
 */
export function ArtistWorkCard({ work }: { work: ArtistWork }) {
  const t = useTranslations("artist");

  return (
    <article className="motion-card flex flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_1px_2px_rgba(27,27,27,0.06)]">
      <YouTubeEmbed
        url={work.youtube_url}
        title={work.title}
        poster={work.thumbnail_image_url}
        playLabel={t("workPlay", { title: work.title })}
        posterAlt={t("workThumbAlt", { title: work.title })}
        overlay={
          <span className="absolute start-[12px] top-[12px] rounded-full bg-primary-500 px-[10px] py-[4px] text-[10px] font-bold leading-[14px] text-white">
            {t(`workType.${work.work_type}`)}
          </span>
        }
      />

      <div className="flex flex-col gap-[6px] p-[16px] text-start">
        <h3 className="text-[16px] font-bold leading-[24px] text-gradscale-900">{work.title}</h3>
        {work.description ? (
          <p className="text-[13px] leading-[21px] text-gradscale-400">{work.description}</p>
        ) : null}
      </div>
    </article>
  );
}

export default ArtistWorkCard;
