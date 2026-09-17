"use client";

import React, { useId } from "react";
import { useMotionPrefs } from "./useMotionPrefs";
import { Highlight } from "@/components/ui/Highlight";

export interface TextRevealProps {
  /** The heading text. Plain string or asterisk-marked runs for highlight. */
  text: string;
  /** Rendered element. Defaults to a span so callers keep their own heading level. */
  as?: "span" | "h1" | "h2" | "h3" | "p";
  className?: string;
  /** Words per animated line. Larger groups read calmer on long Arabic headings. */
  wordsPerLine?: number;
  /** Extra milliseconds before the first line starts. */
  delay?: number;
  /** Class applied to highlighted runs. Defaults to text-primary-500 (#C54716). */
  highlightClassName?: string;
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
  highlightClassName = "text-primary-500",
}: TextRevealProps) {
  const { allowDecorative } = useMotionPrefs();
  const id = useId();

  if (!text) return null;
  const plainText = text.replace(/\*/g, "");

  // Phones render the heading as one plain string: the per-word wipe is
  // illegible at that measure and the section still fades in around it.
  if (!allowDecorative) {
    return (
      <Tag className={className}>
        <Highlight text={text} highlightClassName={highlightClassName} autoHighlight />
      </Tag>
    );
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
      aria-label={plainText}
    >
      {lines.map((line, index) => (
        <span className="motion-text-line" key={`${id}-${index}`} aria-hidden="true">
          <span style={{ "--line-delay": `${delay + index * 90}ms` } as React.CSSProperties}>
            <Highlight text={line.join(" ")} highlightClassName={highlightClassName} autoHighlight />
          </span>
        </span>
      ))}
    </Tag>
  );
}

export default TextReveal;
