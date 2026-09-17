"use client";

import React, { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PlayIcon, PauseIcon } from "@/components/ui/Icons";
import { formatDuration } from "@/lib/formatters";
import { Equalizer } from "./motion/Equalizer";

export interface PlayerTrack {
  title: string;
  audio_file_url: string;
  duration_seconds: number;
  cover_image_url?: string | null;
}

interface AudioPlayerWidgetProps {
  track: PlayerTrack;
  artistName?: string;
  onPrevious?: () => void;
  onNext?: () => void;
}

/**
 * Figma Artist Profile node 134:4420 — a turntable-style audio player.
 * The native audio element remains the source of truth for loading, seeking,
 * buffering and errors; the visible surface is the branded vinyl record.
 */
export function AudioPlayerWidget({ track, artistName, onPrevious, onNext }: AudioPlayerWidgetProps) {
  const t = useTranslations("player");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [knownDuration, setKnownDuration] = useState<number | null>(null);

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

  if (!track.audio_file_url) {
    return (
      <div role="status" className="flex items-center gap-3 rounded-2xl bg-brand-cream px-5 py-4 text-brand-espresso">
        <span aria-hidden="true" className="text-2xl text-brand-primary">♪</span>
        <p className="text-sm">{t("unavailable")}</p>
      </div>
    );
  }

  return (
    <section className="relative mx-auto flex w-full max-w-[520px] flex-col items-center overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2B1D14] via-[#1b120d] to-[#0F0700] px-5 pb-7 pt-7 text-white shadow-2xl" aria-label={track.title}>
      <div className="relative flex h-[min(74vw,330px)] w-[min(74vw,330px)] items-center justify-center">
        <div className={`relative aspect-square h-full w-full rounded-full bg-[#11100f] shadow-[0_18px_46px_-8px_rgba(0,0,0,.9)] ring-4 ring-[#332219] ${isPlaying ? "motion-spin-vinyl" : ""}`}>
          <div className="absolute inset-[5%] rounded-full border border-white/[0.05]" />
          <div className="absolute inset-[10%] rounded-full border border-white/[0.07]" />
          <div className="absolute inset-[16%] rounded-full border border-white/[0.05]" />
          <div className="absolute inset-[22%] rounded-full border border-white/[0.06]" />
          <div className="absolute inset-[28%] rounded-full border border-white/[0.05]" />
          <div className="absolute inset-[34%] rounded-full border border-white/[0.06]" />
          <div className="absolute inset-[40%] overflow-hidden rounded-full border-2 border-[#5b2d18] bg-[#24150d]">
            {track.cover_image_url ? (
              <img src={track.cover_image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-5xl font-bold text-primary-500">{track.title.slice(0, 1)}</div>
            )}
            <span className="absolute inset-0 m-auto size-4 rounded-full border border-white/30 bg-[#0d0a08]" />
          </div>
          <span className="absolute inset-0 m-auto size-3 rounded-full bg-[#080706] ring-1 ring-white/20" />
        </div>
        <div className={`pointer-events-none absolute -right-1 -top-2 z-10 h-[47%] w-[27%] origin-[92%_10%] transition-transform duration-500 ${isPlaying ? "rotate-0" : "-rotate-[20deg]"}`} aria-hidden="true">
          <svg viewBox="0 0 100 180" fill="none" className="h-full w-full drop-shadow-lg">
            <circle cx="88" cy="16" r="11" fill="#2E1F16" stroke="#73513b" strokeWidth="2" />
            <circle cx="88" cy="16" r="4" fill="#120c08" />
            <path d="M88 17 Q82 72 70 113 T35 162" stroke="#f5f3ee" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="29" y="157" width="13" height="20" rx="3" fill="white" />
            <rect x="31" y="171" width="9" height="4" rx="1" fill="#C54716" />
          </svg>
        </div>
      </div>

      <div className="mt-5 flex w-full flex-col items-center text-center">
        <div className="flex items-center gap-2">
          <h3 className="max-w-[min(78vw,390px)] truncate text-xl font-extrabold tracking-tight sm:text-2xl">{track.title}</h3>
          <Equalizer playing={isPlaying} className="shrink-0 text-brand-gold" />
        </div>
        {artistName ? <p className="mt-1 truncate text-sm font-medium text-white/65">{artistName}</p> : null}

        <div className="mt-5 flex items-center justify-center gap-6 sm:gap-8">
          <button type="button" onClick={() => setIsLiked((liked) => !liked)} aria-label={isLiked ? "Unlike" : "Like"} className={`transition hover:scale-110 ${isLiked ? "text-primary-500" : "text-white/65 hover:text-white"}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" /></svg>
          </button>
          <button type="button" onClick={onPrevious} aria-label="Previous track" className="text-white/75 transition hover:scale-110 hover:text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 20 9 12l10-8v16ZM5 19h2V5H5v14Z" /></svg></button>
          <button type="button" onClick={toggle} disabled={isLoading} aria-label={isPlaying ? t("pause") : t("play")} aria-pressed={isPlaying} data-playing={isPlaying ? "true" : "false"} className="grid size-16 place-items-center rounded-full bg-white text-black shadow-xl transition hover:scale-105 active:scale-95 disabled:opacity-60">
            {isPlaying ? <PauseIcon size={24} /> : <PlayIcon size={26} />}
          </button>
          <button type="button" onClick={onNext} aria-label="Next track" className="text-white/75 transition hover:scale-110 hover:text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="m5 4 10 8-10 8V4Zm14 1h-2v14h2V5Z" /></svg></button>
        </div>

        <div className="mt-5 flex w-full items-center gap-3 text-xs text-white/60" dir="ltr">
          <span><bdi>{formatDuration(currentTime)}</bdi></span>
          <input type="range" min={0} max={Math.max(duration, 0)} step={1} value={Math.min(currentTime, Math.max(duration, 0))} onChange={(e) => seek(Number(e.target.value))} aria-label={t("seek", { title: track.title })} className="w-full accent-brand-gold" />
          <span><bdi>{formatDuration(duration)}</bdi></span>
        </div>
      </div>

      {isLoading ? <p role="status" aria-busy="true" className="mt-3 text-xs text-white/65">{t("loading")}</p> : null}
      {hasError ? <div role="alert" className="mt-3 flex items-center gap-3 text-xs"><p>{t("error")}</p><button type="button" onClick={retry} className="rounded-full border border-brand-gold px-3 py-1 font-bold text-brand-gold">{t("retry")}</button></div> : null}

      <audio ref={audioRef} src={track.audio_file_url} preload="metadata" onLoadStart={() => { setIsLoading(true); setHasError(false); }} onLoadedMetadata={(e) => { setIsLoading(false); const d = e.currentTarget.duration; if (Number.isFinite(d)) setKnownDuration(d); }} onCanPlay={() => setIsLoading(false)} onWaiting={() => setIsLoading(true)} onPlaying={() => { setIsPlaying(true); setIsLoading(false); }} onPause={() => setIsPlaying(false)} onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} onEnded={() => { setIsPlaying(false); setCurrentTime(0); }} onError={() => { setIsLoading(false); setIsPlaying(false); setHasError(true); }} />
    </section>
  );
}
