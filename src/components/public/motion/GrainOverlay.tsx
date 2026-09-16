"use client";

import React from "react";
import { useMotionPrefs, usePageVisible } from "./useMotionPrefs";

/**
 * Ambient film grain for the dark editorial bands.
 *
 * The Figma frames describe the espresso bands as textured, but a flat fill is
 * what ships. This lays a very-low-opacity, slowly drifting noise field over
 * them — subliminal on its own, and what separates "printed poster" from "dark
 * rectangle" once you scroll past it.
 *
 * The noise is an inline SVG feTurbulence data URI, so it costs no network
 * request and no image decode. The loop pauses on a hidden tab and never runs
 * on touch or under reduced motion.
 *
 * The parent must be `position: relative` and `overflow: hidden`.
 */
const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function GrainOverlay({ className = "" }: { className?: string }) {
  const { allowAmbient } = useMotionPrefs();
  const visible = usePageVisible();

  if (!allowAmbient) return null;

  return (
    <div
      className={`motion-grain ${className}`.trim()}
      data-paused={visible ? "false" : "true"}
      aria-hidden="true"
      style={{ "--grain-image": GRAIN_URI } as React.CSSProperties}
    />
  );
}

export default GrainOverlay;
