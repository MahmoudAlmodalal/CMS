"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Progressive scroll motion coordinator for the CSS-driven half of the motion
 * system.
 *
 * Ownership split, so the two engines never fight over the same node:
 * - framer-motion (`ScrollReveal`, `TextReveal`, `Parallax`) owns entrance
 *   reveals it animates itself via inline styles.
 * - This observer owns everything animated purely in CSS: `.motion-stagger`
 *   grids, and any element that opts in with `data-reveal-on-scroll`
 *   (`StrokeUnderline`, the text-reveal wipes, the reading drop-cap).
 *
 * Two behaviours matter here:
 *
 * 1. **Reveals replay.** The observer never unobserves. It flips
 *    `data-scroll-reveal` back to `"false"` when an element leaves the
 *    viewport, which resets the CSS keyframes so the next pass animates again.
 * 2. **Late nodes are picked up.** Filter tabs on /artists, /news, /events and
 *    /academy swap their card grids without navigating, so a pathname-scoped
 *    query would miss every card rendered after first paint. A MutationObserver
 *    re-scans on the next frame whenever the tree changes.
 *
 * Content stays visible by default; JavaScript only adds the hidden pre-reveal
 * state to elements confirmed to be below the fold, so a JS failure or a
 * crawler still sees a fully rendered page.
 */
const SELECTOR = ".motion-stagger, [data-reveal-on-scroll]";

export function MotionReady() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motionReady = "true";

    const reduced = typeof window !== "undefined" && window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced || typeof IntersectionObserver === "undefined") return;

    const setState = (target: HTMLElement, revealed: boolean) => {
      const value = revealed ? "true" : "false";
      // Only touch the DOM on an actual change: the observer fires on every
      // threshold crossing and a redundant write would restart the animation
      // mid-flight.
      if (target.dataset.scrollReveal === value) return;
      target.dataset.scrollReveal = value;
      if (target.classList.contains("motion-stagger")) {
        target.dataset.staggerRevealed = value;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState(entry.target as HTMLElement, true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
    );

    // Elements already on screen at first paint reveal immediately;
    // below-the-fold elements reveal once on first intersection.
    const register = (target: HTMLElement) => {
      if (target.dataset.motionObserved === "true") return;
      target.dataset.motionObserved = "true";

      const alreadyVisible = target.getBoundingClientRect().top < window.innerHeight;
      if (alreadyVisible) {
        setState(target, true);
      } else {
        setState(target, false);
        observer.observe(target);
      }
    };

    const scan = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach(register);
    };

    scan();

    let frame = 0;
    const mutations = new MutationObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        scan();
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      mutations.disconnect();
      observer.disconnect();
      // The flag is per-observer; leaving it set would make the next mount
      // skip every existing node.
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((target) => {
        delete target.dataset.motionObserved;
      });
    };
  }, [pathname]);

  return null;
}

export default MotionReady;
