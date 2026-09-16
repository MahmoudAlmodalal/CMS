"use client";

import React, { useMemo } from "react";
import { useMotionPrefs, usePageVisible } from "./useMotionPrefs";

export interface FloatParticlesProps {
  /** Number of particles. 6–12 is a good range. */
  count?: number;
  /** CSS colour for all particles. */
  color?: string;
  /** z-index class for the particle layer. */
  zClassName?: string;
}

/**
 * Ambient rising particle layer.
 *
 * Pure CSS keyframe animation — no JS animation loop. Each particle is a
 * small circle that drifts upward and fades out; they are positioned
 * randomly across the element's inline axis and staggered in time so the
 * effect never pulses in unison.
 *
 * The layer is `pointer-events-none` and `aria-hidden`, and is skipped
 * entirely on mobile and under reduced motion.
 */
export function FloatParticles({
  count = 8,
  color = "rgba(197, 71, 22, 0.5)",
  zClassName = "z-[1]",
}: FloatParticlesProps) {
  const { allowAmbient } = useMotionPrefs();
  const pageVisible = usePageVisible();

  // Stable random seeds: recompute only when count changes.
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 5 + ((i * 97 + 13) % 90), // pseudo-random 5–95%
        size: 4 + ((i * 31 + 7) % 7), // 4–10px diameter
        dur: 5 + ((i * 23 + 11) % 6), // 5–10s duration
        delay: ((i * 41 + 3) % 80) * 100, // 0–7.9s stagger in ms
        opacity: 0.3 + ((i * 17 + 5) % 5) * 0.1, // 0.3–0.7
      })),
    [count],
  );

  if (!allowAmbient) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${zClassName}`}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="motion-particle"
          style={{
            left: `${p.left}%`,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            background: color,
            opacity: pageVisible ? undefined : 0,
            animationPlayState: pageVisible ? "running" : "paused",
            // CSS custom properties drive the keyframe timing.
            ["--particle-dur" as string]: `${p.dur}s`,
            ["--particle-delay" as string]: `${p.delay}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export default FloatParticles;
