"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMotionPrefs, usePageVisible } from "./useMotionPrefs";

export interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds for one full pass. Longer reads calmer. */
  durationSeconds?: number;
}

/**
 * Seamless infinite loop with a SINGLE copy of the content.
 *
 * A requestAnimationFrame loop translates the track pixel by pixel; whenever
 * the leading tile has fully exited the viewport it is moved to the end of
 * the track and the offset is corrected by its width. The strip never ends
 * yet no image ever appears twice side by side.
 *
 * Pauses for keyboard focus inside the strip (a11y) and for background tabs.
 * Hover and touch never pause it. Under reduced motion it renders a plain
 * scroll container instead — the content stays reachable by scroll/keyboard.
 */
export function Marquee({ children, className = "", durationSeconds = 48 }: MarqueeProps) {
  // The rail loops on every device including touch — only an OS-level
  // reduced-motion request (or a hidden tab / keyboard focus) stills it.
  const { reduced } = useMotionPrefs();
  const pageVisible = usePageVisible();
  const pageVisibleRef = useRef(pageVisible);
  const trackRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const focusedRef = useRef(false);
  const durationRef = useRef(durationSeconds);

  // Mirror render values into refs inside an effect (never during render).
  useEffect(() => {
    pageVisibleRef.current = pageVisible;
    focusedRef.current = focused;
    durationRef.current = durationSeconds;
  });

  useEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    let offset = 0;
    let last = performance.now();
    let speed = 60; // px/s fallback until the set is measured
    const measure = () => {
      const width = track.scrollWidth;
      if (width > 0) speed = width / Math.max(durationRef.current, 1);
    };
    measure();
    window.addEventListener("resize", measure);

    // In RTL the row starts at the right and overflows left, so the loop
    // runs mirrored; the wrap math below stays identical via the sign.
    const sign = getComputedStyle(track).direction === "rtl" ? 1 : -1;

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!pageVisibleRef.current || focusedRef.current || document.hidden) return;
      offset += sign * speed * dt;
      const first = track.firstElementChild as HTMLElement | null;
      if (first) {
        const w = first.getBoundingClientRect().width;
        if (w > 0 && sign * offset >= w) {
          track.appendChild(first);
          offset -= sign * w;
        }
      }
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <div className={`flex overflow-x-auto ${className}`.trim()}>{children}</div>
    );
  }

  return (
    <div
      className={`motion-marquee ${className}`.trim()}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <div ref={trackRef} className="motion-marquee-track">
        {children}
      </div>
    </div>
  );
}

export default Marquee;
