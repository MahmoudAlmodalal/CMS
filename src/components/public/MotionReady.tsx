"use client";

import { useEffect } from "react";

/** Enables optional entrance motion without hiding content when JavaScript is unavailable. */
export function MotionReady() {
  useEffect(() => {
    document.documentElement.dataset.motionReady = "true";
    return () => {
      delete document.documentElement.dataset.motionReady;
    };
  }, []);

  return null;
}

export default MotionReady;
