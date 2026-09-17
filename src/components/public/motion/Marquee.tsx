"use client";

import React, { useState } from "react";
import { useMotionPrefs, usePageVisible } from "./useMotionPrefs";

export interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds for one full pass. Longer reads calmer. */
  durationSeconds?: number;
}

/**
 * Seamless horizontal rail.
 *
 * The children are rendered twice inside the track; translating the track by
 * exactly -50% lands on the duplicate, so the loop never shows a seam. The
 * duplicate is `aria-hidden` and taken out of the tab order, so assistive tech
 * and keyboard users see one copy of each item.
 *
 * Falls back to a plain scroll container under reduced motion — the content is
 * always reachable by scroll or by keyboard regardless of whether the
 * animation runs.
 */
export function Marquee({ children, className = "", durationSeconds = 48 }: MarqueeProps) {
  // The rail loops on every device including touch — only an OS-level
  // reduced-motion request (or a hidden tab / keyboard focus) stills it.
  const { reduced } = useMotionPrefs();
  const pageVisible = usePageVisible();
  const [focused, setFocused] = useState(false);

  if (reduced) {
    return (
      <div className={`flex overflow-x-auto ${className}`.trim()}>{children}</div>
    );
  }

  // Hover no longer pauses the rail — only keyboard focus (a11y) or a hidden
  // tab pauses it.
  const paused = focused || !pageVisible;

  return (
    <div
      className={`motion-marquee ${className}`.trim()}
      data-paused={paused ? "true" : "false"}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
      style={{ "--motion-marquee-duration": `${durationSeconds}s` } as React.CSSProperties}
    >
      <div className="motion-marquee-track">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true" inert>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Marquee;
