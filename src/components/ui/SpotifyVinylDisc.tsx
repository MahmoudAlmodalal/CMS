"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

export interface SpotifyVinylDiscProps {
  alt?: string;
  audioUrl?: string | null;
  className?: string;
  testId?: string;
  fallbackIcon?: React.ReactNode;
  initialChar?: string;
}

export function SpotifyVinylDisc({
  alt,
  audioUrl,
  className = "",
  testId,
  fallbackIcon,
  initialChar,
}: SpotifyVinylDiscProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
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

      let isAlive = true;

      // Viva La Vida string ostinato chords (Db - Eb - Ab - Fm)
      const chords = [
        [174.61, 207.65, 277.18], // F3, Ab3, Db4
        [196.0, 233.08, 311.13],  // G3, Bb3, Eb4
        [207.65, 261.63, 329.63], // Ab3, C4, E4
        [174.61, 207.65, 261.63], // F3, Ab3, C4
      ];
      let chordIdx = 0;
      let beat = 0;

      const playPulse = () => {
        if (!isAlive || ctx.state === "closed") return;
        const now = ctx.currentTime;
        const currentChord = chords[chordIdx % chords.length];

        currentChord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = i === 2 ? "sawtooth" : "triangle";
          osc.frequency.setValueAtTime(freq, now);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(1200, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.25);
        });

        beat++;
        if (beat % 8 === 0) {
          chordIdx++;
        }
      };

      playPulse();
      const interval = window.setInterval(playPulse, 240);

      synthRef.current = {
        stop: () => {
          isAlive = false;
          clearInterval(interval);
          void ctx.close();
        },
      };
    } catch {
      // AudioContext unavailable
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
      className={`group relative flex h-full w-full flex-col sm:flex-row items-center justify-center gap-6 p-6 overflow-hidden bg-gradient-to-br from-[#1C1410] to-[#120B08] text-white selection:bg-transparent select-none ${className}`}
      aria-label={alt ? alt : undefined}
      role={alt ? "img" : undefined}
      aria-hidden={alt ? undefined : true}
      dir="ltr"
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

      {/* Left side: Turntable Vinyl Record with Tonearm */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* 360° Circular Spinning Vinyl Record (Cycle loop) */}
        <div
          onClick={togglePlayback}
          className={`relative size-40 sm:size-48 md:size-56 rounded-full bg-[#140E0A] shadow-2xl flex items-center justify-center overflow-hidden border border-black/80 cursor-pointer transition-transform ${
            isPlaying ? "motion-spin-vinyl" : ""
          }`}
          style={{
            boxShadow: "0 14px 36px -4px rgba(0,0,0,0.85), 0 0 0 6px #1A130F",
          }}
        >
          {/* Conic Sheen Reflection */}
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.08)_45deg,transparent_90deg,rgba(255,255,255,0.08)_135deg,transparent_180deg,rgba(255,255,255,0.08)_225deg,transparent_270deg,rgba(255,255,255,0.08)_315deg,transparent_360deg)] opacity-70 pointer-events-none" />

          {/* Concentric Vinyl Grooves */}
          <div className="absolute inset-[7%] rounded-full border border-white/[0.04] pointer-events-none" />
          <div className="absolute inset-[14%] rounded-full border border-white/[0.06] pointer-events-none" />
          <div className="absolute inset-[21%] rounded-full border border-white/[0.04] pointer-events-none" />
          <div className="absolute inset-[28%] rounded-full border border-white/[0.06] pointer-events-none" />
          <div className="absolute inset-[35%] rounded-full border border-white/[0.04] pointer-events-none" />
          <div className="absolute inset-[42%] rounded-full border border-white/[0.05] pointer-events-none" />

          {/* Center Record Label: Viva La Vida artwork */}
          <div className="relative z-10 size-18 sm:size-22 md:size-26 rounded-full overflow-hidden border-2 border-[#3D271B] shadow-inner">
            {fallbackIcon ? (
              <div className="w-full h-full flex items-center justify-center bg-[#241710]">
                {fallbackIcon}
              </div>
            ) : initialChar ? (
              <div className="w-full h-full flex items-center justify-center bg-[#241710] font-display font-bold text-2xl text-primary-500">
                {initialChar}
              </div>
            ) : (
              <img
                src="/assets/viva-la-vida.jpg"
                alt="Viva La Vida - Coldplay"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            )}
            {/* Spindle hole */}
            <div className="absolute inset-0 m-auto size-3 rounded-full bg-[#0F0A07] border border-white/20" />
          </div>
        </div>

        {/* Tonearm */}
        <div
          className={`absolute top-0 right-0 z-20 pointer-events-none transition-transform duration-700 ease-out origin-[95%_10%] ${
            isPlaying ? "rotate-0" : "-rotate-[22deg]"
          }`}
          style={{ width: "85px", height: "140px" }}
        >
          <svg
            viewBox="0 0 100 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md"
          >
            <circle cx="90" cy="16" r="10" fill="#2E1F16" stroke="#52392B" strokeWidth="2" />
            <circle cx="90" cy="16" r="6" fill="#140E0A" />
            <circle cx="90" cy="16" r="2.5" fill="#EAEAEA" />
            <rect x="83" y="2" width="14" height="6" rx="1.5" fill="#756457" />
            <path
              d="M 90 16 Q 84 65, 72 105 T 38 145"
              stroke="#F0F0F0"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <g transform="translate(28, 137) rotate(-18)">
              <rect x="0" y="0" width="11" height="20" rx="3" fill="#FFFFFF" />
              <rect x="2" y="14" width="7" height="4" rx="1" fill="#C54716" />
              <circle cx="5.5" cy="19" r="1.2" fill="#FFD900" />
            </g>
          </svg>
        </div>
      </div>

      {/* Right side: Description & Media Controls */}
      <div className="flex flex-col justify-center text-center sm:text-start min-w-0 flex-1">
        <h4 className="font-sans text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight truncate">
          Viva La Vida
        </h4>
        <p className="font-sans text-sm sm:text-base text-white/60 font-medium mt-1 truncate">
          Coldplay
        </p>

        {/* Media Controls */}
        <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 mt-4 sm:mt-6">
          {/* Heart */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`transition-all duration-200 transform hover:scale-115 focus-visible:outline-hidden ${
              isLiked ? "text-[#FF4B55] scale-105" : "text-white/60 hover:text-white"
            }`}
            aria-label={isLiked ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>

          {/* Prev */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlayback(e);
            }}
            className="text-white/70 hover:text-white transition-transform hover:scale-115 focus-visible:outline-hidden"
            aria-label="المقطع السابق"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 20L9 12l10-8v16zM5 19h2V5H5v14z" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            type="button"
            onClick={togglePlayback}
            className="size-11 sm:size-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-hidden"
            aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlayback(e);
            }}
            className="text-white/70 hover:text-white transition-transform hover:scale-115 focus-visible:outline-hidden"
            aria-label="المقطع التالي"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 4l10 8-10 8V4zm14 1v14h-2V5h2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SpotifyVinylDisc;
