"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export type BandTone = "light" | "dark";

/**
 * Reports whether the strip of viewport at `probeY` is currently over a dark
 * band.
 *
 * The site's whole visual rhythm is alternating cream and espresso bands, and
 * the floating navbar crosses all of them as one fixed cream pill. This is what
 * lets it acknowledge the band underneath it.
 *
 * Deliberately not an IntersectionObserver: the region of interest is a ~64px
 * strip pinned near the top of the viewport, which would need a rootMargin
 * recomputed against the viewport height on every resize. Instead the dark
 * bands' document offsets are measured once per route and on resize, and the
 * scroll handler only does arithmetic — no layout reads while scrolling, so
 * this cannot cause scroll jank.
 *
 * Mark a band with `data-band="dark"` to opt it in.
 */
export function useBandTone(probeY = 92): BandTone {
  const pathname = usePathname();
  const [tone, setTone] = useState<BandTone>("light");
  const rangesRef = useRef<Array<[number, number]>>([]);

  const measure = useCallback(() => {
    const scroll = window.scrollY;
    rangesRef.current = Array.from(
      document.querySelectorAll<HTMLElement>('[data-band="dark"]'),
    ).map((el) => {
      const rect = el.getBoundingClientRect();
      return [rect.top + scroll, rect.bottom + scroll] as [number, number];
    });
  }, []);

  useEffect(() => {
    let frame = 0;

    const evaluate = () => {
      frame = 0;
      const probe = window.scrollY + probeY;
      const overDark = rangesRef.current.some(([top, bottom]) => probe >= top && probe <= bottom);
      setTone(overDark ? "dark" : "light");
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(evaluate);
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    // Images and fonts settle after mount and move the bands, so measure again
    // once the page has finished loading rather than trusting first paint.
    measure();
    evaluate();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
    };
  }, [measure, probeY, pathname]);

  return tone;
}
