"use client";

import React, { useRef } from "react";
import { useMotionPrefs } from "./useMotionPrefs";

export interface RippleButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  "aria-label"?: string;
}

/**
 * A button wrapper that spawns a ripple on click.
 *
 * The ripple is a CSS `clip-path: circle()` expansion driven by adding a
 * `.rippling` class to a `::after` pseudo-element. No JS animation loop.
 *
 * Skipped under reduced motion — the button renders as a plain button that
 * passes all props through unchanged.
 */
export function RippleButton({
  children,
  className = "",
  onClick,
  type = "button",
  disabled,
  "aria-label": ariaLabel,
}: RippleButtonProps) {
  const { reduced } = useMotionPrefs();
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (reduced || !btnRef.current) return;
    const btn = btnRef.current;
    btn.classList.remove("rippling");
    // Force reflow so the animation restarts even on rapid clicks.
    void btn.offsetWidth;
    btn.classList.add("rippling");
    btn.addEventListener("animationend", () => btn.classList.remove("rippling"), { once: true });
  };

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={handleClick}
      className={`motion-ripple-click ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export default RippleButton;
