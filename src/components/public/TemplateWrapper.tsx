"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";

// Module-level flag tracks whether the very first SSR/client mount has occurred
let hasMountedOnce = false;

interface TemplateWrapperProps {
  children: React.ReactNode;
}

/**
 * Client Component page transition wrapper.
 * - Wraps children with AnimatePresence and mode="wait" so exiting page finishes
 *   animating before the new page enters.
 * - Uses usePathname() from next/navigation as the key for AnimatePresence/motion.
 * - Sets initial={false} on the very first page load to prevent initial flash and layout shifts.
 * - Snappy, GPU-only compositor animations (opacity + translateY) with 0.18–0.22s duration
 *   and easeInOut easing.
 * - Reserves minimum viewport height (var(--page-min-height, 100dvh)) to eliminate Cumulative Layout Shift (CLS).
 * - Respects prefers-reduced-motion by substituting transforms with opacity-only transitions.
 */
export function TemplateWrapper({ children }: TemplateWrapperProps) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [isInitialLoad, setIsInitialLoad] = useState(!hasMountedOnce);

  useEffect(() => {
    hasMountedOnce = true;
    setIsInitialLoad(false);
  }, []);

  const variants: Variants = {
    initial: reducedMotion
      ? { opacity: 0, y: 0 }
      : { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0.05 : 0.22,
        ease: "easeInOut",
      },
    },
    exit: reducedMotion
      ? { opacity: 0, y: 0 }
      : {
          opacity: 0,
          y: -10,
          transition: {
            duration: 0.18,
            ease: "easeInOut",
          },
        },
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
