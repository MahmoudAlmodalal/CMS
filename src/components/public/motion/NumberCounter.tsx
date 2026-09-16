"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { useMotionPrefs } from "./useMotionPrefs";

export interface NumberCounterProps {
  /** The final value to count up to. */
  target: number;
  /** Suffix rendered after the number (e.g. "+", "%"). */
  suffix?: string;
  /** Prefix rendered before the number (e.g. "$"). */
  prefix?: string;
  /** Animation duration in seconds. */
  duration?: number;
  /** Extra class names on the output span. */
  className?: string;
}

/**
 * Counts from 0 to `target` when it scrolls into view.
 *
 * Uses Framer Motion's `animate` utility on a plain number (not a
 * MotionValue) so the count can be formatted at each frame. Under reduced
 * motion or on mobile the final value is shown immediately without animation.
 *
 * Uses `IntersectionObserver` to start counting once — replaying on every
 * scroll-in would feel noisy for numerical stats.
 */
export function NumberCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 1.8,
  className = "",
}: NumberCounterProps) {
  const { reduced } = useMotionPrefs();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(reduced ? target : 0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (reduced || hasAnimated.current) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setDisplay(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;
        observer.disconnect();
        animate(0, target, {
          duration,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (v) => setDisplay(Math.round(v)),
        });
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

export default NumberCounter;
