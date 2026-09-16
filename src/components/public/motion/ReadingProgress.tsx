"use client";

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useMotionPrefs } from "./useMotionPrefs";

/**
 * Thin scroll-linked rail pinned under the floating navbar on article pages.
 *
 * `scaleX` is driven by a spring off `scrollYProgress`, so it stays on the
 * compositor and never reads layout. The CSS anchors `transform-origin` to the
 * inline start, which flips to the right edge under `[dir="rtl"]`, so the bar
 * fills in the same direction the reader is reading.
 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const { reduced } = useMotionPrefs();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 28,
    restDelta: 0.001,
  });

  if (reduced) return null;

  return (
    <motion.div
      className="motion-progress-bar fixed inset-x-0 top-0 z-50 h-[3px] bg-brand-primary"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}

export default ReadingProgress;
