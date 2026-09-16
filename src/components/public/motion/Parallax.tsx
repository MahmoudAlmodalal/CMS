"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMotionPrefs } from "./useMotionPrefs";

export interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Fraction of the scroll distance the layer travels. 0.2 means the backdrop
   * drifts a fifth as fast as the page — enough to read as depth, small enough
   * that the photo never uncovers its own edge.
   */
  rate?: number;
}

/**
 * Scroll-linked backdrop drift.
 *
 * Runs on the compositor: framer-motion writes a MotionValue straight into
 * `transform`, so nothing here hits React state or triggers layout.
 *
 * Disabled entirely under reduced motion and on touch devices — on a phone the
 * effect competes with momentum scrolling and costs battery for a depth cue
 * nobody sees at that viewport size.
 */
export function Parallax({ children, className = "", rate = 0.2 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { allowAmbient } = useMotionPrefs();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // The layer is overscaled by the same proportion it travels, so drifting it
  // can never expose a gap at the top or bottom of the band.
  const travel = Math.min(Math.max(rate, 0), 0.5) * 100;
  const y = useTransform(scrollYProgress, [0, 1], [`-${travel / 2}%`, `${travel / 2}%`]);

  if (!allowAmbient) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="h-full w-full will-change-transform"
        style={{ y, scale: 1 + travel / 100 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default Parallax;
