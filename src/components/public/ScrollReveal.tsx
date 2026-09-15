"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const variants = {
  up: { opacity: 0, y: 30 },
  soft: { opacity: 0, y: 14 },
  image: { opacity: 0, scale: 0.96 },
} as const;

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: keyof typeof variants;
}) {
  const reducedMotion = useReducedMotion();
  const hidden = variants[variant];

  return (
    <motion.div
      className={`motion-reveal motion-reveal-${variant} ${className}`.trim()}
      initial={reducedMotion ? false : hidden}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.9,
        delay: Math.min(Math.max(delay, 0), 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export default ScrollReveal;
