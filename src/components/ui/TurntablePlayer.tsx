"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { parseYouTubeId } from "@/lib/youtube";

/** Minimal shape of the bits of the YouTube IFrame Player API this file calls. */
interface YTPlayerInstance {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  loadVideoById(videoId: string): void;
  destroy(): void;
}
interface YTPlayerOptions {
  videoId?: string;
  host?: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (event: { target: YTPlayerInstance }) => void;
    onStateChange?: (event: { target: YTPlayerInstance; data: number }) => void;
  };
}
declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, options: YTPlayerOptions) => YTPlayerInstance;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Loads the YouTube IFrame Player API script once per page and resolves once
 * `window.YT.Player` is ready to construct.
 *
 * Used instead of a raw `<iframe src="...&autoplay=1">` because that only
 * ever produces sound after a fresh, direct user gesture — it cannot autoplay
 * with sound on page load. The Player API lets us start muted immediately
 * (always allowed) and call `.unMute()` from a real click, or from the
 * visitor's very first tap anywhere on the page, which browsers also honor.
 */
let ytApiPromise: Promise<void> | null = null;
function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

export interface TrackItem {
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl?: string | null;
  youtubeUrl?: string | null;
  synthMode: "vivalavida" | "andalusia";
}

export interface TurntablePlayerProps {
  initialTrack?: Partial<TrackItem>;
  playlist?: Array<Partial<TrackItem>>;
  audioUrl?: string | null;
  youtubeUrl?: string | null;
  className?: string;
}

const PLAYLIST: TrackItem[] = [
  {
    title: "Viva La Vida",
    artist: "Coldplay",
    coverUrl: "/assets/viva-la-vida.jpg",
    synthMode: "vivalavida",
  },
  {
    title: "عازف من فرقة أندلسيا",
    artist: "فرقة أندلسيا للموسيقى",
    coverUrl: "/assets/figma/about-musician.png",
    synthMode: "andalusia",
  },
];

export function TurntablePlayer({
  initialTrack,
  playlist,
  audioUrl,
  youtubeUrl,
  className = "",
}: TurntablePlayerProps) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<{ stop: () => void; resume?: () => void } | null>(null);
  const playRequestedRef = useRef(false);
  const ytMutedRef = useRef(false);
  // React-owned wrapper with no JSX children of its own, so React never tries
  // to diff or remove whatever ends up inside it. The YouTube Player API
  // physically replaces its mount element with an <iframe>, which crashes
  // React's reconciliation if that element is one React itself manages —
  // so the actual mount point is a plain DOM node created imperatively
  // below, entirely outside React's tree.
  const ytHostRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);

  const activePlaylist = playlist?.length ? playlist : initialTrack ? [initialTrack] : [];
  const playlistTrack = activePlaylist.length
    ? activePlaylist[trackIndex % activePlaylist.length]
    : undefined;
  const currentTrack: TrackItem = {
    title: "",
    artist: "",
    coverUrl: "/assets/figma/about-musician.png",
    synthMode: "andalusia",
    ...(playlistTrack || initialTrack || {}),
    ...(audioUrl ? { audioUrl } : {}),
    ...(youtubeUrl ? { youtubeUrl } : {}),
  };
  // youtubeUrl is the full link an editor pasted (e.g. "https://youtu.be/xyz");
  // the embed endpoint needs the bare 11-char video id, or it 404s and never
  // makes a sound no matter how it was triggered.
  const youtubeVideoId = currentTrack.audioUrl ? null : parseYouTubeId(currentTrack.youtubeUrl);

  const stopSynth = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.stop();
      synthRef.current = null;
    }
  }, []);

  const startSynth = useCallback((mode: "vivalavida" | "andalusia") => {
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

      if (mode === "vivalavida") {
        // Viva La Vida string ostinato chords (Db - Eb - Ab - Fm)
        // 8 staccato pulses per chord
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

          // Staccato string chord
          currentChord.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = i === 2 ? "sawtooth" : "triangle";
            osc.frequency.setValueAtTime(freq, now);

            filter.type = "lowpass";
            filter.frequency.setValueAtTime(1200, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.07, now + 0.02);
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
          resume: () => {
            if (ctx.state === "suspended") void ctx.resume();
          },
        };
      } else {
        // Andalusian Hijaz Oud scale
        const notes = [146.83, 185.0, 220.0, 293.66, 261.63, 233.08, 220.0];
        let idx = 0;

        const playNote = () => {
          if (!isAlive || ctx.state === "closed") return;
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(notes[idx % notes.length], now);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(850, now);

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

        playNote();
        const interval = window.setInterval(playNote, 500);

        synthRef.current = {
          stop: () => {
            isAlive = false;
            clearInterval(interval);
            void ctx.close();
          },
          resume: () => {
            if (ctx.state === "suspended") void ctx.resume();
          },
        };
      }
    } catch {
      // AudioContext fallback
    }
  }, [stopSynth]);

  useEffect(() => {
    return () => {
      stopSynth();
    };
  }, [stopSynth]);

  // Create (or redirect) the YouTube player whenever the current track's
  // video id changes. Starts muted so it can autoplay immediately — every
  // browser allows muted autoplay — and unmutes on the first real gesture
  // via the effect below, or immediately on an explicit play-button click.
  useEffect(() => {
    if (!youtubeVideoId) {
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
      return;
    }
    let cancelled = false;
    loadYouTubeIframeApi().then(() => {
      if (cancelled || !ytHostRef.current || !window.YT) return;
      if (ytPlayerRef.current) {
        ytPlayerRef.current.loadVideoById(youtubeVideoId);
        ytPlayerRef.current.mute();
        ytMutedRef.current = true;
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
        return;
      }
      const mount = document.createElement("div");
      ytHostRef.current.appendChild(mount);
      ytPlayerRef.current = new window.YT.Player(mount, {
        videoId: youtubeVideoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: { autoplay: 1, mute: 1, controls: 0, rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: (event) => {
            event.target.mute();
            ytMutedRef.current = true;
            event.target.playVideo();
            setIsPlaying(true);
            if (playRequestedRef.current) {
              event.target.unMute();
              event.target.playVideo();
              playRequestedRef.current = false;
            }
          },
          // 1 is YT.PlayerState.PLAYING — a stable, documented API constant.
          onStateChange: (event) => setIsPlaying(event.data === 1),
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [youtubeVideoId]);

  // Destroy the player on unmount only (not on every id change above).
  useEffect(() => {
    return () => {
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
    };
  }, []);

  // The visitor's very first tap/click/keypress anywhere on the page unmutes
  // whichever track is currently loaded — the closest a browser allows to
  // "just plays itself" while still respecting autoplay-with-sound rules.
  useEffect(() => {
    const unlock = () => {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.playVideo();
        ytMutedRef.current = false;
        document.removeEventListener("pointerdown", unlock);
        document.removeEventListener("keydown", unlock);
      }
      synthRef.current?.resume?.();
    };
    document.addEventListener("pointerdown", unlock, { passive: true });
    document.addEventListener("keydown", unlock, { once: true });
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);

  // Autoplay on mount as soon as the native source is available.
  // YouTube tracks are handled by the player effect above; tracks without a
  // media URL use the local synth fallback and resume on the first gesture.
  useEffect(() => {
    if (youtubeVideoId) return;
    const start = () => {
      if (currentTrack.audioUrl && audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            startSynth(currentTrack.synthMode);
            setIsPlaying(true);
          });
      } else if (!currentTrack.audioUrl) {
        startSynth(currentTrack.synthMode);
        setIsPlaying(true);
      }
    };
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlayback = useCallback(() => {
    if (youtubeVideoId) {
      // A direct click is a real user gesture — unmuting here always works,
      // even before the page-wide first-interaction listener has fired.
      if (!ytPlayerRef.current) {
        playRequestedRef.current = true;
        return;
      }
      if (ytMutedRef.current) {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.playVideo();
        ytMutedRef.current = false;
        setIsPlaying(true);
        return;
      }
      if (isPlaying) {
        ytPlayerRef.current?.pauseVideo();
      } else {
        playRequestedRef.current = false;
        ytPlayerRef.current?.unMute();
        ytPlayerRef.current?.playVideo();
        ytMutedRef.current = false;
      }
      return;
    }
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopSynth();
      setIsPlaying(false);
    } else if (currentTrack.audioUrl && audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          startSynth(currentTrack.synthMode);
          setIsPlaying(true);
        });
    } else {
      startSynth(currentTrack.synthMode);
      setIsPlaying(true);
    }
  }, [isPlaying, currentTrack, youtubeVideoId, startSynth, stopSynth]);

  const handleNext = () => {
    if (!activePlaylist.length) return;
    stopSynth();
    if (audioRef.current) audioRef.current.pause();
    const nextIdx = (trackIndex + 1) % activePlaylist.length;
    setTrackIndex(nextIdx);
    if (isPlaying && !youtubeVideoId) {
      setTimeout(() => {
        if (activePlaylist[nextIdx]?.audioUrl && audioRef.current) {
          void audioRef.current.play().catch(() => setIsPlaying(false));
          return;
        }
        startSynth(activePlaylist[nextIdx].synthMode || "andalusia");
      }, 100);
    }
  };

  const handlePrev = () => {
    if (!activePlaylist.length) return;
    stopSynth();
    if (audioRef.current) audioRef.current.pause();
    const prevIdx = (trackIndex - 1 + activePlaylist.length) % activePlaylist.length;
    setTrackIndex(prevIdx);
    if (isPlaying && !youtubeVideoId) {
      setTimeout(() => {
        if (activePlaylist[prevIdx]?.audioUrl && audioRef.current) {
          void audioRef.current.play().catch(() => setIsPlaying(false));
          return;
        }
        startSynth(activePlaylist[prevIdx].synthMode || "andalusia");
      }, 100);
    }
  };

  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-gradient-to-br from-[#2B1D14] to-[#0F0700] text-white flex flex-col items-center justify-between pb-8 pt-6 ${className}`}
      dir="ltr"
    >
      {currentTrack.audioUrl ? (
        <audio
          ref={audioRef}
          src={currentTrack.audioUrl}
          loop
          autoPlay
          playsInline
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      ) : null}
      {/* YouTube Player API mounts its iframe inside this node (into a plain
          DOM child it creates itself, not this div); it persists across
          track switches so loadVideoById() can swap videos in place instead
          of tearing down and losing the mute/gesture state. */}
      <div ref={ytHostRef} className="absolute h-px w-px opacity-0" aria-hidden="true" />

      {/* Vinyl Record — top half */}
      <div className="relative flex shrink-0 items-center justify-center mt-2">
        {/* Vinyl disc */}
        <div
          className={`relative size-36 sm:size-44 md:size-52 rounded-full bg-[#140E0A] flex items-center justify-center overflow-hidden border border-black/80 ${
            isPlaying ? "motion-spin-vinyl" : ""
          }`}
          style={{
            boxShadow: "0 8px 28px -4px rgba(0,0,0,0.9), 0 0 0 5px #1A130F",
          }}
        >
          {/* Conic gloss sheen */}
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.08)_45deg,transparent_90deg,rgba(255,255,255,0.08)_135deg,transparent_180deg,rgba(255,255,255,0.08)_225deg,transparent_270deg,rgba(255,255,255,0.08)_315deg,transparent_360deg)] pointer-events-none opacity-80" />
          {/* Grooves */}
          <div className="absolute inset-[7%]  rounded-full border border-white/[0.04]" />
          <div className="absolute inset-[14%] rounded-full border border-white/[0.06]" />
          <div className="absolute inset-[21%] rounded-full border border-white/[0.04]" />
          <div className="absolute inset-[28%] rounded-full border border-white/[0.06]" />
          <div className="absolute inset-[35%] rounded-full border border-white/[0.04]" />
          <div className="absolute inset-[42%] rounded-full border border-white/[0.05]" />
          {/* Center cover art */}
          <div className="relative z-10 size-16 sm:size-20 md:size-24 rounded-full overflow-hidden border-2 border-[#3D271B] shadow-inner">
            <img
              src={currentTrack.coverUrl}
              alt={`${currentTrack.title} - ${currentTrack.artist}`}
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            {/* Spindle */}
            <div className="absolute inset-0 m-auto size-3 rounded-full bg-[#0F0A07] border border-white/20" />
          </div>
        </div>

        {/* Tonearm */}
        <div
          className={`absolute top-0 right-0 z-20 pointer-events-none transition-transform duration-700 ease-out origin-[95%_10%] ${
            isPlaying ? "rotate-0" : "-rotate-[22deg]"
          }`}
          style={{ width: "72px", height: "120px" }}
        >
          <svg viewBox="0 0 100 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            <circle cx="90" cy="16" r="10" fill="#2E1F16" stroke="#52392B" strokeWidth="2" />
            <circle cx="90" cy="16" r="6"  fill="#140E0A" />
            <circle cx="90" cy="16" r="2.5" fill="#EAEAEA" />
            <rect x="83" y="2" width="14" height="6" rx="1.5" fill="#756457" />
            <path d="M 90 16 Q 84 65, 72 105 T 38 145" stroke="#F0F0F0" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <g transform="translate(28, 137) rotate(-18)">
              <rect x="0" y="0" width="11" height="20" rx="3" fill="#FFFFFF" />
              <rect x="2" y="14" width="7"  height="4" rx="1" fill="#C54716" />
              <circle cx="5.5" cy="19" r="1.2" fill="#FFD900" />
            </g>
          </svg>
        </div>
      </div>

      {/* Bottom: title + artist + controls */}
      <div className="flex flex-col items-center gap-1 w-full px-6">
        <h3 className="font-sans text-base sm:text-lg md:text-xl font-extrabold text-white tracking-tight truncate text-center w-full">
          {currentTrack.title}
        </h3>
        <p className="font-sans text-xs sm:text-sm text-white/60 font-medium truncate text-center w-full">
          {currentTrack.artist}
        </p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3">
          {/* Heart */}
          <button
            type="button"
            onClick={() => setIsLiked(!isLiked)}
            className={`transition-all duration-200 hover:scale-115 focus-visible:outline-hidden ${
              isLiked ? "text-[#FF4B55] scale-105" : "text-white/60 hover:text-white"
            }`}
            aria-label={isLiked ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>

          {/* Prev */}
          <button type="button" onPointerDown={(event) => { event.preventDefault(); handlePrev(); }} onClick={(event) => event.detail === 0 && handlePrev()} className="touch-manipulation select-none text-white/70 hover:text-white transition-transform hover:scale-115 active:scale-90 focus-visible:outline-hidden" aria-label="المقطع السابق">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 20L9 12l10-8v16zM5 19h2V5H5v14z" /></svg>
          </button>

          {/* Play/Pause */}
          <button
            type="button"
            onClick={togglePlayback}
            className="size-10 sm:size-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-hidden"
            aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          {/* Next */}
          <button type="button" onPointerDown={(event) => { event.preventDefault(); handleNext(); }} onClick={(event) => event.detail === 0 && handleNext()} className="touch-manipulation select-none text-white/70 hover:text-white transition-transform hover:scale-115 active:scale-90 focus-visible:outline-hidden" aria-label="المقطع التالي">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4l10 8-10 8V4zm14 1v14h-2V5h2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TurntablePlayer;
