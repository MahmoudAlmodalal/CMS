"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { useMotionPrefs } from "./useMotionPrefs";

export interface CountUpProps {
  value: number;
  /** Rendered before the number, e.g. "+". */
  prefix?: string;
  /** Rendered after the number, e.g. "%". */
  suffix?: string;
  className?: string;
  durationMs?: number;
  /** BCP-47 locale for digit shaping. Arabic pages pass "ar". */
  locale?: string;
}

/**
 * Counts a stat up from zero the first time it scrolls into view.
 *
 * The final value is the initial state, so the correct number is in the HTML
 * that the server sends. JavaScript only ever winds it back to animate — a
 * crawler, a failed hydration, or a reduced-motion visitor all see the real
 * figure immediately.
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  className = "",
  durationMs = 1400,
  locale,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const { reduced } = useMotionPrefs();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduced || !inView) return;

    const controls = animate(0, value, {
      duration: durationMs / 1000,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, reduced, value, durationMs]);

  const formatted = new Intl.NumberFormat(locale).format(display);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export default CountUp;
