"use client";

import React, { useId } from "react";
import { useMotionPrefs } from "./useMotionPrefs";

export interface TextRevealProps {
  /** The heading text. Plain string only — it is split for animation. */
  text: string;
  /** Rendered element. Defaults to a span so callers keep their own heading level. */
  as?: "span" | "h1" | "h2" | "h3" | "p";
  className?: string;
  /** Words per animated line. Larger groups read calmer on long Arabic headings. */
  wordsPerLine?: number;
  /** Extra milliseconds before the first line starts. */
  delay?: number;
}

/**
 * Staggered clip-path wipe for headings.
 *
 * Splits on WORDS, never characters: Arabic is a cursive script, and splitting
 * a word into per-character spans breaks the shaping so `مرحبا` renders as five
 * disconnected letterforms. Word groups keep every ligature intact and behave
 * identically under RTL.
 *
 * The full string is always present in the DOM inside the spans, so crawlers and
 * screen readers read the heading normally; `aria-label` on the wrapper plus
 * `aria-hidden` on the pieces keeps assistive tech from announcing it word by
 * word.
 *
 * Animation is CSS-driven off `data-scroll-reveal`, which `MotionReady` stamps
 * when the element scrolls into view — hence the `data-reveal-on-scroll` opt-in.
 */
export function TextReveal({
  text,
  as: Tag = "span",
  className = "",
  wordsPerLine = 4,
  delay = 0,
}: TextRevealProps) {
  const { reduced } = useMotionPrefs();
  const id = useId();

  if (reduced || !text) {
    return <Tag className={className}>{text}</Tag>;
  }

  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[][] = [];
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine));
  }

  return (
    <Tag
      className={`motion-text-reveal ${className}`.trim()}
      data-reveal-on-scroll=""
      aria-label={text}
    >
      {lines.map((line, index) => (
        <span className="motion-text-line" key={`${id}-${index}`} aria-hidden="true">
          <span style={{ "--line-delay": `${delay + index * 90}ms` } as React.CSSProperties}>
            {line.join(" ")}
          </span>
        </span>
      ))}
    </Tag>
  );
}

export default TextReveal;
