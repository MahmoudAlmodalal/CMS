"use client";

import React from "react";
import { motion } from "framer-motion";
import { useMotionPrefs } from "./useMotionPrefs";

export interface ActivePillProps {
  /**
   * Shared id for one tab bar. Every tab in the same bar passes the same value,
   * and framer-motion flies the single rendered pill between them.
   */
  layoutId: string;
  className?: string;
}

/**
 * The filled background behind the selected filter tab.
 *
 * Rendered only by the active tab. Because every tab in a bar shares one
 * `layoutId`, framer-motion treats the old and new positions as the same
 * element and animates it across, so selecting a category slides the pill
 * instead of blinking it from one label to the next.
 *
 * Sits behind the label with `-z-10` rather than as the button's own
 * background, so the pixel geometry of the tab row is untouched — the pill only
 * ever paints, it never participates in layout. Under reduced motion it is a
 * plain static background.
 */
export function ActivePill({ layoutId, className = "" }: ActivePillProps) {
  const { reduced, isMobile } = useMotionPrefs();
  const classes = `absolute inset-0 -z-10 ${className}`.trim();

  if (reduced) {
    return <span aria-hidden="true" className={classes} />;
  }

  return (
    <motion.span
      aria-hidden="true"
      layoutId={layoutId}
      className={classes}
      transition={
        isMobile
          ? { type: "spring", stiffness: 620, damping: 44 }
          : { type: "spring", stiffness: 420, damping: 36 }
      }
    />
  );
}

export default ActivePill;
