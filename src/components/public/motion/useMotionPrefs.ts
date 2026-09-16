"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Subscribes to a media query and returns whether it currently matches.
 * Starts `false` so server and first client render agree — every caller must
 * treat `false` as the calm, motion-free default rather than as "desktop".
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/**
 * The three questions every motion component in this codebase asks before it
 * animates anything. Centralised so the answers stay consistent:
 *
 * - `reduced`  — the visitor asked the OS for less motion, so render static.
 * - `isMobile` — phones get calm motion: no vertical throw, no parallax.
 * - `isTouch`  — coarse pointers never get hover-driven or ambient effects.
 */
export function useMotionPrefs() {
  const reduced = useReducedMotion() ?? false;
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isFinePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  return {
    reduced,
    isMobile,
    isTouch: !isFinePointer,
    /** Rich, scroll-linked or looping motion is only worth its cost here. */
    allowAmbient: !reduced && isFinePointer,
  };
}

/**
 * True while the tab is visible. Ambient loops (marquee, grain, equalizer)
 * gate on this so a backgrounded tab stops burning battery.
 */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === "visible");
    onChange();
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  return visible;
}
