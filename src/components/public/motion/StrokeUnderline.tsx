"use client";

import React from "react";
import { useMotionPrefs } from "./useMotionPrefs";

export interface StrokeUnderlineProps {
  className?: string;
  /** Width of the flourish in px. The path scales to fit via viewBox. */
  width?: number;
}

/**
 * Calligraphic flourish that draws itself under a section heading.
 *
 * The brand headline face is Qahwa Arabic, so a straight 2px rule under a
 * section title reads as a web default rather than as part of the type system.
 * This is a single hand-drawn stroke in brand terracotta that animates via
 * `stroke-dashoffset` when the heading scrolls into view — one inline SVG, no
 * layout cost, and it mirrors cleanly under RTL because the curve is symmetric.
 */
export function StrokeUnderline({ className = "", width = 180 }: StrokeUnderlineProps) {
  const { allowDecorative } = useMotionPrefs();

  // Without the draw the flourish is still part of the type system, so it
  // renders at full length rather than disappearing on phones.
  return (
    <svg
      className={`${allowDecorative ? "motion-stroke" : ""} pointer-events-none block ${className}`.trim()}
      {...(allowDecorative ? { "data-reveal-on-scroll": "" } : {})}
      width={width}
      height={12}
      viewBox="0 0 180 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
      // The dash length must exceed the path length or the tail never closes.
      style={{ "--stroke-length": 200 } as React.CSSProperties}
    >
      <path
        d="M2 8C28 3 54 2 90 4C126 6 152 9 178 5"
        stroke="var(--color-brand-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default StrokeUnderline;
