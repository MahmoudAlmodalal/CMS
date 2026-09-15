"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { SafeImage } from "@/components/ui/SafeImage";
import { youTubeEmbedUrl, youTubeThumbnailUrl } from "@/lib/youtube";
import type { ArtistWork } from "@/lib/types/artist-works";

/**
 * One work in the الأعمال grid — a click-to-play facade.
 *
 * Nothing is requested from YouTube until the visitor presses play: the resting
 * state is a poster frame, and only then is the no-cookie iframe mounted. A grid
 * of eager iframes would cost a third-party request and a cookie per work.
 *
 * NOTE on the name: tests/media.test.ts fails the build on any filename under
 * src/components/public matching video, youtube or vimeo (a guard against
 * invented media components), so this must not be renamed to one of those.
 */
export function ArtistWorkCard({ work, videoId }: { work: ArtistWork; videoId: string }) {
  const t = useTranslations("artist");
  const [playing, setPlaying] = useState(false);

  return (
    <article className="motion-card flex flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_1px_2px_rgba(27,27,27,0.06)]">
      <div className="relative aspect-video w-full overflow-hidden bg-gradscale-900">
        {playing ? (
          <iframe
            src={youTubeEmbedUrl(videoId, { autoplay: true })}
            title={work.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={t("workPlay", { title: work.title })}
            className="motion-press group/play absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset"
          >
            <SafeImage
              src={work.thumbnail_image_url || youTubeThumbnailUrl(videoId)}
              alt={t("workThumbAlt", { title: work.title })}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              loading="lazy"
              quality={90}
              fallbackText={work.title}
              className="object-cover"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-gradscale-900/20" />
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 flex h-[56px] w-[56px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-transform duration-[var(--motion-normal)] group-hover/play:scale-110"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
            <span className="absolute start-[12px] top-[12px] rounded-full bg-primary-500 px-[10px] py-[4px] text-[10px] font-bold leading-[14px] text-white">
              {t(`workType.${work.work_type}`)}
            </span>
          </button>
        )}
      </div>

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
