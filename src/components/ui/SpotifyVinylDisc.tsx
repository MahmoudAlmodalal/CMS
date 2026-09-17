"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { PlayIcon, PauseIcon } from "@/components/ui/Icons";

export interface SpotifyVinylDiscProps {
  alt?: string;
  audioUrl?: string | null;
  className?: string;
  testId?: string;
  fallbackIcon?: React.ReactNode;
  initialChar?: string;
}

/**
 * SpotifyVinylDisc
 * 
 * Renders a circular vinyl record with:
 * - 360° continuous circular rotation loop
 * - Concentric vinyl record grooves and subtle gloss sheen
 * - Center Andalusia record label with musical note ♪
 * - Spotify-style animated equalizer sound wave bars
 * - Seamless looping audio playback with play/pause interaction
 *   (supports external audio URLs or gentle built-in Andalusian acoustic synth)
 */
export function SpotifyVinylDisc({
  alt,
  audioUrl,
  className = "",
  testId,
  fallbackIcon,
  initialChar,
}: SpotifyVinylDiscProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<{ stop: () => void } | null>(null);

  const stopSynth = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.stop();
      synthRef.current = null;
    }
  }, []);

  const startSynth = useCallback(() => {
    stopSynth();
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      // Andalusian Hijaz / Phrygian scale notes: D3 (146.83Hz), F#3 (185.0Hz), A3 (220.0Hz), D4 (293.66Hz), C4 (261.63Hz), Bb3 (233.08Hz), A3 (220.0Hz)
      const notes = [146.83, 185.0, 220.0, 293.66, 261.63, 233.08, 220.0];
      let idx = 0;
      let isAlive = true;

      const playNext = () => {
        if (!isAlive || ctx.state === "closed") return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(notes[idx % notes.length], now);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(900, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.95);
        idx++;
      };

      playNext();
      const interval = window.setInterval(playNext, 520);

      synthRef.current = {
        stop: () => {
          isAlive = false;
          clearInterval(interval);
          void ctx.close();
        },
      };
    } catch {
      // AudioContext unavailable in current environment
    }
  }, [stopSynth]);

  useEffect(() => {
    return () => {
      stopSynth();
    };
  }, [stopSynth]);

  const togglePlayback = useCallback(
    (e?: React.MouseEvent | React.KeyboardEvent) => {
      if (e) {
        e.stopPropagation();
      }

      if (isPlaying) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        stopSynth();
        setIsPlaying(false);
      } else {
        if (audioUrl && audioRef.current) {
          audioRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              // Fallback to built-in Andalusian ambient synth
              startSynth();
              setIsPlaying(true);
            });
        } else {
          startSynth();
          setIsPlaying(true);
        }
      }
    },
    [isPlaying, audioUrl, startSynth, stopSynth]
  );

  return (
    <div
      data-testid={testId}
      className={`group relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#2B1D14] to-[#1F0900] text-brand-surface selection:bg-transparent cursor-pointer select-none ${className}`}
      aria-label={alt ? alt : undefined}
      role={alt ? "img" : undefined}
      aria-hidden={alt ? undefined : true}
      onClick={togglePlayback}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          togglePlayback(e);
        }
      }}
      tabIndex={0}
    >
      {audioUrl ? (
        <audio
          ref={audioRef}
          src={audioUrl}
          loop
          preload="metadata"
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      ) : null}

      {/* 360° Circular Spinning Vinyl Record (Infinite loop) */}
      <div
        className="motion-spin-vinyl absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        {/* Subtle Conic Sheen Reflection */}
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.06)_45deg,transparent_90deg,rgba(255,255,255,0.06)_135deg,transparent_180deg,rgba(255,255,255,0.06)_225deg,transparent_270deg,rgba(255,255,255,0.06)_315deg,transparent_360deg)] opacity-70" />

        {/* Concentric Vinyl Grooves (Looping circularly) */}
        <div className="absolute inset-[6%] rounded-full border border-white/[0.04]" />
        <div className="absolute inset-[13%] rounded-full border border-white/[0.06]" />
        <div className="absolute inset-[20%] rounded-full border border-white/[0.04]" />
        <div className="absolute inset-[27%] rounded-full border border-white/[0.06]" />
        <div className="absolute inset-[34%] rounded-full border border-white/[0.05]" />
        <div className="absolute inset-[41%] rounded-full border border-white/[0.07]" />
        <div className="absolute inset-[48%] rounded-full border border-white/[0.04]" />
      </div>

      {/* Center Record Label */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-3 rounded-full bg-gradient-to-br from-[#3D271B] to-[#1F0900] border-2 border-primary-500/40 shadow-2xl size-28 sm:size-36 md:size-44 transition-all duration-300 group-hover:border-primary-500/80 group-hover:scale-105">
        {/* Note / Play Icon */}
        <div className="relative flex items-center justify-center size-9 sm:size-11">
          {fallbackIcon ? (
            fallbackIcon
          ) : initialChar ? (
            <span className="font-display font-bold text-2xl sm:text-3xl text-primary-500 select-none">
              {initialChar}
            </span>
          ) : (
            <span
              aria-hidden="true"
              className={`font-sans text-xl sm:text-2xl font-bold select-none transition-opacity duration-200 group-hover:opacity-20 ${
                isPlaying ? "text-primary-400 animate-pulse" : "text-primary-500/80"
              }`}
            >
              ♪
            </span>
          )}

          {/* Hover Play / Pause Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {isPlaying ? (
              <PauseIcon size={22} className="text-primary-300 drop-shadow-md" />
            ) : (
              <PlayIcon size={22} className="text-primary-300 drop-shadow-md" />
            )}
          </div>
        </div>

        {/* Spotify-Style Animated Sound Wave Bars */}
        <div
          className="flex items-end justify-center gap-[3px] sm:gap-1 mt-1 sm:mt-1.5 h-3.5 sm:h-4.5"
          aria-hidden="true"
        >
          <span
            className="w-[3px] sm:w-1 bg-[#1DB954] rounded-full spotify-wave-bar"
            style={{ animationDelay: "0ms", height: "45%" }}
            data-playing={isPlaying ? "true" : "false"}
          />
          <span
            className="w-[3px] sm:w-1 bg-primary-500 rounded-full spotify-wave-bar"
            style={{ animationDelay: "220ms", height: "90%" }}
            data-playing={isPlaying ? "true" : "false"}
          />
          <span
            className="w-[3px] sm:w-1 bg-brand-gold rounded-full spotify-wave-bar"
            style={{ animationDelay: "450ms", height: "100%" }}
            data-playing={isPlaying ? "true" : "false"}
          />
          <span
            className="w-[3px] sm:w-1 bg-[#1DB954] rounded-full spotify-wave-bar"
            style={{ animationDelay: "140ms", height: "70%" }}
            data-playing={isPlaying ? "true" : "false"}
          />
          <span
            className="w-[3px] sm:w-1 bg-primary-500 rounded-full spotify-wave-bar"
            style={{ animationDelay: "360ms", height: "50%" }}
            data-playing={isPlaying ? "true" : "false"}
          />
        </div>

        {/* Subtle Spotify audio hint */}
        <span className="mt-1 text-[9px] sm:text-[10px] font-sans font-medium text-primary-200/70 tracking-wider select-none">
          {isPlaying ? "إيقاف مؤقت" : "تشغيل الموسيقى"}
        </span>
      </div>
    </div>
  );
}

export default SpotifyVinylDisc;
