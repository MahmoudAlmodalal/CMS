"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Progressive scroll motion coordinator.
 * Content stays visible by default; JavaScript only adds the hidden pre-reveal
 * state to elements that are confirmed to be below the fold.
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
        ".motion-stagger, .motion-reveal",
      ),
    );

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
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
    );

    targets.forEach((target) => {
      const alreadyVisible = target.getBoundingClientRect().top < window.innerHeight;

      target.dataset.scrollReveal = alreadyVisible ? "true" : "false";
      if (target.classList.contains("motion-stagger")) {
        target.dataset.staggerRevealed = alreadyVisible ? "true" : "false";
      }

      if (!alreadyVisible) observer.observe(target);
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

export default MotionReady;
