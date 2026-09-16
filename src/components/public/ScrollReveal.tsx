"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMotionPrefs } from "./motion/useMotionPrefs";

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "soft" | "image" | "fade";
}) {
  const { reduced, isMobile } = useMotionPrefs();
  const [hasEntered, setHasEntered] = useState(false);

  // On mobile: strictly zero vertical translation (y: 0) and no scaling.
  // Content fades in calmly and smoothly without throwing elements around the screen.
  // On desktop: subtle, elegant micro-lift (max 12px).
  const initial = (() => {
    if (reduced) return false;
    if (isMobile) return { opacity: 0, y: 0 };
    switch (variant) {
      case "soft":
        return { opacity: 0, y: 6 };
      case "image":
        return { opacity: 0, scale: 0.98 };
      case "fade":
        return { opacity: 0 };
      case "up":
      default:
        return { opacity: 0, y: 12 };
    }
  })();

  const animate = { opacity: 1, y: 0, scale: 1 };

  // No `.motion-reveal` class here: framer-motion drives this element through
  // inline styles, and carrying the class too would let MotionReady's observer
  // stamp a competing `data-scroll-reveal` state onto the same node.
  return (
    <motion.div
      className={`mobile-blur-reveal motion-reveal-${variant} ${hasEntered ? "is-revealed" : ""} ${className}`.trim()}
      initial={initial}
      whileInView={animate}
      onViewportEnter={() => setHasEntered(true)}
      viewport={{ once: true, amount: isMobile ? 0.05 : 0.12 }}
      transition={{
        duration: isMobile ? 0.35 : 0.5,
        delay: isMobile ? 0 : Math.min(Math.max(delay, 0), 0.25),
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export default ScrollReveal;
