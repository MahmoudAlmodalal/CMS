"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useMotionPrefs, usePageVisible } from "./useMotionPrefs";

export interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds for one full pass. Longer reads calmer. */
  durationSeconds?: number;
  /** Pause animation when mouse hovers over the track or its tiles. Defaults to true. */
  pauseOnHover?: boolean;
}

/** Imperative single-tile steps for arrow controls flanking the rail. */
export interface MarqueeHandle {
  /** Advance one tile in the loop direction. */
  next: () => void;
  /** Step one tile back against the loop direction. */
  prev: () => void;
}

/**
 * Seamless infinite loop with a SINGLE copy of the content.
 *
 * A requestAnimationFrame loop translates the track pixel by pixel; whenever
 * the leading tile has fully exited the viewport it is moved to the end of
 * the track and the offset is corrected by its width. The strip never ends
 * yet no image ever appears twice side by side.
 *
 * Arrow buttons can nudge the loop a single tile via the `next`/`prev`
 * handle: forward tweens one tile ahead then rotates, backward prepends the
 * trailing tile then tweens back into place.
 *
 * Pauses for keyboard focus inside the strip (a11y), for background tabs,
 * and on mouse hover when pauseOnHover is enabled (default).
 * Under reduced motion it renders a plain scroll container instead.
 */
export const Marquee = forwardRef<MarqueeHandle, MarqueeProps>(function Marquee(
  { children, className = "", durationSeconds = 48, pauseOnHover = true },
  ref,
) {
  // The rail loops on every device including touch — only an OS-level
  // reduced-motion request (or a hidden tab / keyboard focus / hover) stills it.
  const { reduced } = useMotionPrefs();
  const pageVisible = usePageVisible();
  const pageVisibleRef = useRef(pageVisible);
  const trackRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const focusedRef = useRef(false);
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);
  const pauseOnHoverRef = useRef(pauseOnHover);
  const durationRef = useRef(durationSeconds);
  const reducedRef = useRef(reduced);
  const offsetRef = useRef(0);
  const speedRef = useRef(60); // px/s fallback until the set is measured
  type Anim = { from: number; to: number; start: number; dur: number; commit: () => void };
  const animRef = useRef<Anim | null>(null);

  // Mirror render values into refs inside an effect (never during render).
  useEffect(() => {
    pageVisibleRef.current = pageVisible;
    focusedRef.current = focused;
    hoveredRef.current = hovered;
    pauseOnHoverRef.current = pauseOnHover;
    durationRef.current = durationSeconds;
    reducedRef.current = reduced;
  });

  const rotateOnce = useCallback((dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track || reducedRef.current || animRef.current) return;
    const sign = getComputedStyle(track).direction === "rtl" ? 1 : -1;
    if (dir === 1) {
      const first = track.firstElementChild as HTMLElement | null;
      const w = first?.getBoundingClientRect().width ?? 0;
      if (!first || w <= 0) return;
      animRef.current = {
        from: offsetRef.current,
        to: offsetRef.current + sign * w,
        start: performance.now(),
        dur: 450,
        commit: () => {
          track.appendChild(first);
          offsetRef.current -= sign * w;
          track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        },
      };
    } else {
      const lastChild = track.lastElementChild as HTMLElement | null;
      const w = lastChild?.getBoundingClientRect().width ?? 0;
      if (!lastChild || w <= 0) return;
      track.prepend(lastChild);
      offsetRef.current += sign * w;
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      animRef.current = {
        from: offsetRef.current,
        to: offsetRef.current - sign * w,
        start: performance.now(),
        dur: 450,
        commit: () => {},
      };
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      next: () => rotateOnce(1),
      prev: () => rotateOnce(-1),
    }),
    [rotateOnce],
  );

  useEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    let last = performance.now();
    const measure = () => {
      const width = track.scrollWidth;
      if (width > 0) speedRef.current = width / Math.max(durationRef.current, 1);
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
      if (
        !pageVisibleRef.current ||
        focusedRef.current ||
        document.hidden ||
        (pauseOnHoverRef.current && hoveredRef.current && !animRef.current)
      ) {
        return;
      }
      const anim = animRef.current;
      if (anim) {
        const p = Math.min((now - anim.start) / anim.dur, 1);
        const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        offsetRef.current = anim.from + (anim.to - anim.from) * eased;
        if (p >= 1) {
          anim.commit();
          animRef.current = null;
        }
      } else {
        offsetRef.current += sign * speedRef.current * dt;
        const first = track.firstElementChild as HTMLElement | null;
        if (first) {
          const w = first.getBoundingClientRect().width;
          if (w > 0 && sign * offsetRef.current >= w) {
            track.appendChild(first);
            offsetRef.current -= sign * w;
          }
        }
      }
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
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
      onMouseEnter={() => {
        if (pauseOnHoverRef.current) setHovered(true);
      }}
      onMouseLeave={() => {
        if (pauseOnHoverRef.current) setHovered(false);
      }}
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
});

export default Marquee;
