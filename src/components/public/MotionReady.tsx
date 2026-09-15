"use client";

import { useLayoutEffect } from "react";

/**
 * Progressive scroll motion coordinator.
 * Content stays visible by default; JavaScript only adds the hidden pre-reveal
 * state to elements that are confirmed to be below the fold.
 */
export function MotionReady() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.motionReady = "true";

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".public-motion-shell main > *, .motion-stagger",
      ),
    );

    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            target.dataset.scrollReveal = "true";
            target.dataset.staggerRevealed = "true";
            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );

    targets.forEach((target) => {
      const reduced = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const alreadyVisible = target.getBoundingClientRect().top < window.innerHeight;

      target.dataset.scrollReveal = alreadyVisible || reduced ? "true" : "false";
      if (target.classList.contains("motion-stagger")) {
        target.dataset.staggerRevealed = alreadyVisible || reduced ? "true" : "false";
      }

      if (!alreadyVisible && !reduced) observer.observe(target);
    });

    return () => {
      observer.disconnect();
      delete root.dataset.motionReady;
    };
  }, []);

  return null;
}

export default MotionReady;
