"use client";

import React from "react";
import { useMotionPrefs, usePageVisible } from "./useMotionPrefs";

export interface EqualizerProps {
  playing: boolean;
  className?: string;
  bars?: number;
}

/**
 * Bars that pulse while a track plays.
 *
 * Deliberately NOT driven by Web Audio analysis: an AnalyserNode would need the
 * audio graph wired up on every player instance, would break on cross-origin
 * media served from storage, and costs a rAF loop per widget. A staggered CSS
 * `scaleY` loop reads as "sound is happening" just as well, runs on the
 * compositor, and is free when paused.
 *
 * Pausing freezes the bars mid-pose rather than resetting them, which matches
 * how the audio itself pauses.
 */
export function Equalizer({ playing, className = "", bars = 5 }: EqualizerProps) {
  const { reduced } = useMotionPrefs();
  const pageVisible = usePageVisible();

  if (reduced) return null;

  const active = playing && pageVisible;

  return (
    <span
      className={`motion-equalizer inline-flex items-end gap-[3px] ${className}`.trim()}
      data-playing={active ? "true" : "false"}
      aria-hidden="true"
    >
      {Array.from({ length: bars }, (_, index) => (
        <span
          key={index}
          className="motion-equalizer-bar w-[3px] rounded-full bg-current"
          style={
            {
              // Uneven delays and heights keep the row from reading as a wave.
              height: `${10 + ((index * 7) % 9)}px`,
              "--bar-delay": `${(index * 130) % 520}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

export default Equalizer;
