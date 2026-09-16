"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMotionPrefs } from "./useMotionPrefs";

export interface Tilt3DProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Maximum tilt angle in degrees. Keep ≤ 10° — past that it stops reading
   * as depth and starts looking like a glitch.
   */
  max?: number;
  /** CSS perspective value applied to the wrapper. */
  perspective?: number;
}

/**
 * Mouse-tracking 3D card tilt.
 *
 * On desktop, moving the cursor over the card tilts it around both axes
 * proportionally to the offset from the element's centre. Springs return
 * the card to flat when the pointer leaves. The effect is purely
 * `transform` so it never triggers layout.
 *
 * Skipped on touch and under reduced motion.
 */
export function Tilt3D({
  children,
  className = "",
  max = 7,
  perspective = 900,
}: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { allowAmbient } = useMotionPrefs();

  const rawRX = useMotionValue(0);
  const rawRY = useMotionValue(0);
  const rotateX = useSpring(rawRX, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(rawRY, { stiffness: 300, damping: 30 });

  if (!allowAmbient) {
    return <div className={className}>{children}</div>;
  }

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    const cx = bounds.left + bounds.width / 2;
    const cy = bounds.top + bounds.height / 2;
    const dx = (e.clientX - cx) / (bounds.width / 2);
    const dy = (e.clientY - cy) / (bounds.height / 2);
    // Invert Y so the card tilts toward the cursor (top of cursor → card top lifts).
    rawRX.set(-dy * max);
    rawRY.set(dx * max);
  };

  const onLeave = () => {
    rawRX.set(0);
    rawRY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`will-change-transform ${className}`.trim()}
      style={{ rotateX, rotateY, transformPerspective: perspective }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

export default Tilt3D;
