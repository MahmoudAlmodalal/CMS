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
 *   (stroke-draw underlines, clip-path wipes, the reading drop-cap).
 *
 * Content stays visible by default; JavaScript only adds the hidden pre-reveal
 * state to elements confirmed to be below the fold, so a JS failure or a
 * crawler still sees a fully rendered page.
 */
export function MotionReady() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motionReady = "true";

    const reduced = typeof window !== "undefined" && window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced || typeof IntersectionObserver === "undefined") return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".motion-stagger, [data-reveal-on-scroll]",
      ),
    );

    const reveal = (target: HTMLElement) => {
      target.dataset.scrollReveal = "true";
      if (target.classList.contains("motion-stagger")) {
        target.dataset.staggerRevealed = "true";
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
    );

    targets.forEach((target) => {
      const alreadyVisible = target.getBoundingClientRect().top < window.innerHeight;

      if (alreadyVisible) {
        reveal(target);
        return;
      }

      target.dataset.scrollReveal = "false";
      if (target.classList.contains("motion-stagger")) {
        target.dataset.staggerRevealed = "false";
      }
      observer.observe(target);
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

export default MotionReady;
