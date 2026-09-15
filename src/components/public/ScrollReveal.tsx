"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Fades its children up the first time they scroll into view.
 *
 * Visible is the default: the server renders the content with no hidden state
 * at all, and this only ever *adds* one. So a visitor with JS disabled, an
 * engine without IntersectionObserver, or anyone who asked for reduced motion
 * sees the content immediately — the animation is strictly additive.
 *
 * The decision is made in a layout effect, before the browser paints, so a
 * section that starts below the fold is never seen flashing in and then out.
 */
export function ScrollReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<boolean | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    // Already on screen when the page loads: reveal without animating in.
    if (node.getBoundingClientRect().top < window.innerHeight) return;

    setRevealed(false);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`motion-reveal ${className}`.trim()}
      data-revealed={revealed === null ? undefined : String(revealed)}
    >
      {children}
    </div>
  );
}

export default ScrollReveal;
