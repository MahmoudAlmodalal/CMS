"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { useViewTransition } from "./motion/ViewTransitions";

// Module-level flag tracks whether the very first SSR/client mount has occurred
let hasMountedOnce = false;

interface TemplateWrapperProps {
  children: React.ReactNode;
}

/**
 * Client Component page transition wrapper.
 *
 * Three tiers, best available wins:
 * 1. Shared-element morph — `ViewTransitionProvider` is driving a
 *    `document.startViewTransition`, so an artist portrait is growing out of its
 *    grid card into the detail hero. We stand down for the duration.
 * 2. Curtain wipe — a terracotta panel sweeps across on exit and retracts on
 *    enter. `scaleY` on a fixed overlay, so it costs no layout.
 * 3. Opacity-only cross-fade — reduced motion.
 *
 * In every tier the wrapper reserves `var(--page-min-height, 100dvh)` so the
 * transition cannot introduce cumulative layout shift.
 */
export function TemplateWrapper({ children }: TemplateWrapperProps) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [isInitialLoad, setIsInitialLoad] = useState(!hasMountedOnce);
  const { transitioning } = useViewTransition();

  useEffect(() => {
    hasMountedOnce = true;
    setIsInitialLoad(false);
  }, []);

  // Tier 1: a shared-element morph is in flight. Running our own exit on top of
  // it double-animates the page and makes the morph read as a stutter, so the
  // wrapper stands down and lets the browser own the frame.
  if (transitioning && !reducedMotion) {
    return (
      <div
        className="page-transition-wrapper flex-1 w-full flex flex-col"
        style={{ minHeight: "var(--page-min-height, 100dvh)" }}
      >
        {children}
      </div>
    );
  }

  const variants: Variants = {
    initial: reducedMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: reducedMotion ? 0.05 : 0.22, ease: "easeInOut" },
    },
    exit: reducedMotion
      ? { opacity: 0, y: 0 }
      : { opacity: 0, y: -10, transition: { duration: 0.18, ease: "easeInOut" } },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial={isInitialLoad ? false : "initial"}
        animate="animate"
        exit="exit"
        style={{ minHeight: "var(--page-min-height, 100dvh)" }}
        className="page-transition-wrapper flex-1 w-full flex flex-col will-change-[opacity,transform]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default TemplateWrapper;
