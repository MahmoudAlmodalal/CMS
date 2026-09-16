"use client";

import React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMotionPrefs } from "./useMotionPrefs";

export interface CursorGlowProps {
  /** CSS colour string for the radial glow centre. */
  color?: string;
  /** Diameter of the glow circle in px. */
  size?: number;
  className?: string;
}

/**
 * Radial spotlight that follows the cursor inside its parent.
 *
 * The parent must carry `position: relative` (or `relative` Tailwind class)
 * so the absolute-positioned glow is scoped to it. The glow layer is
 * pointer-events-none so it never blocks clicks on siblings.
 *
 * Skipped on touch devices and under reduced motion — a cursor-following
 * effect has no meaning without a hovering pointer.
 */
export function CursorGlow({
  color = "rgba(197, 71, 22, 0.12)",
  size = 420,
  className = "",
}: CursorGlowProps) {
  const { allowAmbient } = useMotionPrefs();

  const rawX = useMotionValue(-size * 2);
  const rawY = useMotionValue(-size * 2);
  const x = useSpring(rawX, { stiffness: 140, damping: 20 });
  const y = useSpring(rawY, { stiffness: 140, damping: 20 });

  if (!allowAmbient) return null;

  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 z-10 overflow-hidden ${className}`.trim()}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        rawX.set(e.clientX - rect.left);
        rawY.set(e.clientY - rect.top);
      }}
      onMouseLeave={() => {
        rawX.set(-size * 2);
        rawY.set(-size * 2);
      }}
    >
      <motion.div
        aria-hidden="true"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          width: size,
          height: size,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        }}
        className="absolute rounded-full will-change-transform"
      />
    </motion.div>
  );
}

export default CursorGlow;
