"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMotionPrefs } from "./useMotionPrefs";

export interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum pull in px. Keep small — past ~14px it stops feeling like a button. */
  strength?: number;
}

/**
 * Wrapper that lets its child lean toward the cursor.
 *
 * Used only on the 404 page's "back home" control, where playfulness costs
 * nothing. Pointer position is read from the event and written to MotionValues,
 * so the pull never round-trips through React state. Springs return the element
 * to rest on leave, and the whole effect is skipped on touch and under reduced
 * motion — a magnetic pull has no meaning without a hovering pointer.
 */
export function MagneticButton({
  children,
  className = "",
  strength = 12,
}: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const { allowAmbient } = useMotionPrefs();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 260, damping: 20 });
  const y = useSpring(rawY, { stiffness: 260, damping: 20 });

  if (!allowAmbient) {
    return <span className={className}>{children}</span>;
  }

  const onMove = (event: React.MouseEvent<HTMLSpanElement>) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    const dx = event.clientX - (bounds.left + bounds.width / 2);
    const dy = event.clientY - (bounds.top + bounds.height / 2);
    rawX.set((dx / (bounds.width / 2)) * strength);
    rawY.set((dy / (bounds.height / 2)) * strength);
  };

  const onLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <span
      ref={ref}
      className={`inline-block ${className}`.trim()}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <motion.span className="inline-block will-change-transform" style={{ x, y }}>
        {children}
      </motion.span>
    </span>
  );
}

export default MagneticButton;
