"use client";

import React, { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PlayIcon, PauseIcon, MusicIcon } from "@/components/ui/Icons";
import { formatDuration } from "@/lib/formatters";

export interface PlayerTrack {
  title: string;
  audio_file_url: string;
  duration_seconds: number;
}

interface AudioPlayerWidgetProps {
  track: PlayerTrack;
  artistName?: string;
}

/**
 * Verified against CONTENT_INVENTORY.md §12 / Figma Node 134:4420 (Artist Profile):
 * - Featured track title (tracks.title, CONFIRMED)
 * - Streamable audio URL (tracks.audio_file_url, CONFIRMED)
 * - Duration in mm:ss (tracks.duration_seconds, INFERRED)
 * - Play/pause controls (CONFIRMED interactive atom)
 *
 * States: loading (buffering), missing-media (no URL), playback-error (+ retry),
 * and keyboard-accessible controls (native button + range slider semantics).
 */
export function AudioPlayerWidget({ track, artistName }: AudioPlayerWidgetProps) {
  const t = useTranslations("player");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [knownDuration, setKnownDuration] = useState<number | null>(null);

  // Missing-media state: never render a broken player when no file is attached.
  if (!track.audio_file_url) {
    return (
      <div
        role="status"
        className="flex items-center gap-3 rounded-2xl bg-brand-cream px-5 py-4 text-brand-espresso"
      >
        <MusicIcon size={24} className="shrink-0 text-brand-primary" />
        <p className="text-sm">{t("unavailable")}</p>
      </div>
    );
  }

  const duration = knownDuration ?? track.duration_seconds;

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || hasError) return;
    if (isPlaying) {
      audio.pause();
    } else {
      setHasError(false);
      void audio.play().catch(() => setHasError(true));
    }
  }, [isPlaying, hasError]);

  const retry = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setHasError(false);
    setIsLoading(true);
    audio.load();
  }, []);

  const seek = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  }, []);

  return (
    <div className="rounded-2xl bg-brand-espresso px-5 py-4 text-brand-cream shadow-card">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          disabled={isLoading}
          aria-label={isPlaying ? t("pause") : t("play")}
          aria-pressed={isPlaying}
          className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-primary text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold disabled:opacity-60"
        >
          {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{track.title}</p>
          {artistName ? (
            <p className="truncate text-xs opacity-70">{artistName}</p>
          ) : null}
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={Math.max(duration, 0)}
              step={1}
              value={Math.min(currentTime, Math.max(duration, 0))}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label={t("seek", { title: track.title })}
              className="w-full accent-brand-gold"
            />
            <span className="shrink-0 text-xs tabular-nums" dir="ltr">
              <bdi>
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </bdi>
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p role="status" aria-busy="true" className="mt-2 text-xs opacity-70">
          {t("loading")}
        </p>
      ) : null}

      {hasError ? (
        <div role="alert" className="mt-2 flex items-center gap-3 text-xs">
          <p>{t("error")}</p>
          <button
            type="button"
            onClick={retry}
            className="shrink-0 rounded-full border border-brand-gold px-3 py-1 font-bold text-brand-gold transition hover:bg-brand-gold hover:text-brand-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
          >
            {t("retry")}
          </button>
        </div>
      ) : null}

      <audio
        ref={audioRef}
        src={track.audio_file_url}
        preload="metadata"
        onLoadStart={() => {
          setIsLoading(true);
          setHasError(false);
        }}
        onLoadedMetadata={(e) => {
          setIsLoading(false);
          const d = e.currentTarget.duration;
          if (Number.isFinite(d)) setKnownDuration(d);
        }}
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsPlaying(true);
          setIsLoading(false);
        }}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
