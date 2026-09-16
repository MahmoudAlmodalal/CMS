"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

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
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // On mobile: strictly zero vertical translation (y: 0) and no scaling.
  // Content fades in calmly and smoothly without throwing elements around the screen.
  // On desktop: subtle, elegant micro-lift (max 12px).
  const initial = (() => {
    if (reducedMotion) return false;
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

  return (
    <motion.div
      className={`motion-reveal motion-reveal-${variant} ${className}`.trim()}
      initial={initial}
      whileInView={animate}
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
