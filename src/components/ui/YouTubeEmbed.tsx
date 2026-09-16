"use client";

import React, { useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import {
  parseYouTubeId,
  youTubeBackdropEmbedUrl,
  youTubeEmbedUrl,
  youTubeThumbnailUrl,
} from "@/lib/youtube";

/** Everything a YouTube iframe needs, in one place instead of four. */
const PLAYER_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
const BACKDROP_ALLOW = "autoplay; encrypted-media; picture-in-picture";

export interface YouTubeEmbedProps {
  /** Whatever the editor pasted. Anything unparseable renders nothing. */
  url: string | null | undefined;
  /** iframe title — required for assistive tech, so it has no default. */
  title: string;
  /**
   * `player` is the click-to-play facade: a poster frame, and the iframe only
   * after the visitor presses play. `backdrop` is the chromeless, muted,
   * looping band behind the hero, which must paint without interaction.
   */
  variant?: "player" | "backdrop";
  /** Overrides the YouTube poster frame — e.g. a cover uploaded in the CMS. */
  poster?: string | null;
  /** Accessible label for the play button. */
  playLabel?: string;
  /** Alt text for the poster frame. */
  posterAlt?: string;
  /** Extra classes on the aspect box (`player`) or the crop box (`backdrop`). */
  className?: string;
  /** Rendered over the poster, e.g. the work-type pill. */
  overlay?: React.ReactNode;
}

/**
 * The single YouTube surface for the whole site.
 *
 * Before this existed, the hero backdrop, the hero body embed, the about band
 * and the artist work card each hand-rolled their own iframe with their own
 * `allow` list, `referrerPolicy` and aspect box — four copies that could drift
 * apart, and four places to fix when one of them was wrong.
 *
 * Parsing goes through `parseYouTubeId`, so any share-sheet shape an editor can
 * paste (`watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`, `/live/`) works and
 * anything else renders nothing rather than an empty frame. Embeds are served
 * from youtube-nocookie.com, and in the `player` variant nothing is requested
 * from YouTube at all until the visitor presses play.
 */
export function YouTubeEmbed({
  url,
  title,
  variant = "player",
  poster,
  playLabel,
  posterAlt,
  className = "",
  overlay,
}: YouTubeEmbedProps) {
  const videoId = parseYouTubeId(url);
  const [playing, setPlaying] = useState(false);

  if (!videoId) return null;

  if (variant === "backdrop") {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
        <iframe
          src={youTubeBackdropEmbedUrl(videoId)}
          title={title}
          tabIndex={-1}
          loading="eager"
          allow={BACKDROP_ALLOW}
          referrerPolicy="strict-origin-when-cross-origin"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.35] border-0"
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-video w-full overflow-hidden bg-gradscale-900 ${className}`}>
      {playing ? (
        <iframe
          src={youTubeEmbedUrl(videoId, { autoplay: true })}
          title={title}
          loading="lazy"
          allow={PLAYER_ALLOW}
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={playLabel || title}
          className="motion-press group/play absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset"
        >
          <SafeImage
            src={poster?.trim() || youTubeThumbnailUrl(videoId)}
            alt={posterAlt || ""}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            loading="lazy"
            quality={90}
            fallbackText={title}
            className="motion-image motion-kenburns object-cover"
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
          {overlay}
        </button>
      )}
    </div>
  );
}

export default YouTubeEmbed;
