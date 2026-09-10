import React from "react";

export interface HighlightProps {
  /**
   * Text whose emphasised runs are wrapped in asterisks, e.g.
   * "منصتك الأولى *لاكتشاف* ودعم *المواهب* الفنية والثقافية".
   */
  text: string;
  /** Class applied to the emphasised runs. Defaults to the Figma terracotta #C54716. */
  highlightClassName?: string;
}

/**
 * Figma renders several headings as a single text node carrying two fills — the base
 * colour plus terracotta #C54716 on selected words (hero H1 `ts1`/`ts2`, about title
 * `ts3`, testimonials heading `ts4`/`ts5`).
 *
 * Editors mark those runs with *asterisks* in the CMS field; everything outside the
 * markers renders unchanged, so an unmarked string is passed straight through.
 */
export function Highlight({
  text,
  highlightClassName = "text-brand-primary",
}: HighlightProps) {
  // Split on *...* keeping the delimiters; odd indices are the emphasised runs.
  const parts = text.split(/\*([^*]+)\*/g);

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={highlightClassName}>
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}
