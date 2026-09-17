import React from "react";

export interface HighlightProps {
  /**
   * Text whose emphasised runs are wrapped in asterisks (e.g. "أصوات *تصنع* التاريخ"),
   * HTML `<em>` tags, or plain text to be highlighted by word index.
   */
  text: string;
  /**
   * 0-based word index (or array of indices) to highlight when no asterisks are present.
   * Negative numbers count from the end (-1 = last word).
   * Defaults to 1 (second word), or 0 if the text is a single word.
   */
  highlightIndex?: number | number[];
  /** Class applied to the emphasised runs. Defaults to text-primary-500 (#C54716). */
  highlightClassName?: string;
  /**
   * When true (default), if `text` contains no asterisks, automatically
   * highlights the word at `highlightIndex`.
   */
  autoHighlight?: boolean;
}

/**
 * Highlights specific word(s) in a heading.
 *
 * Priority:
 * 1. Explicit asterisks (`*word*`) or `<em>word</em>` set by editor in the CMS / Admin.
 * 2. If no asterisks, highlights word(s) by index (`highlightIndex`, default: index 1 / second word).
 *
 * No static word lists or hardcoded dictionaries are used.
 */
export function Highlight({
  text,
  highlightIndex = 1,
  highlightClassName = "text-primary-500",
  autoHighlight = true,
}: HighlightProps) {
  if (!text || typeof text !== "string") return null;

  let source = text;

  // Convert any <em> tags to *asterisks*
  if (source.includes("<em") || source.includes("</em>")) {
    source = source.replace(/<em[^>]*>/gi, "*").replace(/<\/em>/gi, "*");
  }

  // 1. If asterisks are present, render runs wrapped in *...*
  if (source.includes("*")) {
    const parts = source.split(/\*([^*]+)\*/g);
    if (parts.length > 1) {
      return (
        <>
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <span key={i} className={highlightClassName}>
                {part}
              </span>
            ) : (
              <React.Fragment key={i}>{part.replace(/\*/g, "")}</React.Fragment>
            )
          )}
        </>
      );
    }
    // No balanced pair — strip stray asterisks and fall through to auto-highlight
    source = source.replace(/\*/g, "");
  }

  // 2. If no asterisks and autoHighlight is false, return plain text
  if (!autoHighlight) {
    return <>{text}</>;
  }

  // 3. Highlight by word index
  const tokens = source.trim().split(/(\s+)/); // Preserve whitespace delimiters
  const wordTokens: { word: string; tokenIndex: number }[] = [];

  tokens.forEach((token, idx) => {
    if (token.trim().length > 0) {
      wordTokens.push({ word: token, tokenIndex: idx });
    }
  });

  const totalWords = wordTokens.length;
  if (totalWords === 0) return <>{text}</>;

  // Resolve target indices
  const rawIndices = Array.isArray(highlightIndex) ? highlightIndex : [highlightIndex];
  const targetWordIndices = new Set<number>();

  for (const rawIdx of rawIndices) {
    let resolved = rawIdx;
    if (resolved < 0) {
      resolved = totalWords + resolved;
    }
    // Fall back to index 0 if index 1 is requested on a 1-word heading
    if (resolved >= totalWords) {
      resolved = totalWords === 1 ? 0 : totalWords - 1;
    }
    if (resolved >= 0 && resolved < totalWords) {
      targetWordIndices.add(resolved);
    }
  }

  if (targetWordIndices.size === 0) {
    targetWordIndices.add(0);
  }

  return (
    <>
      {tokens.map((token, idx) => {
        const wordIndex = wordTokens.findIndex((wt) => wt.tokenIndex === idx);
        if (wordIndex !== -1 && targetWordIndices.has(wordIndex)) {
          return (
            <span key={idx} className={highlightClassName}>
              {token}
            </span>
          );
        }
        return <React.Fragment key={idx}>{token}</React.Fragment>;
      })}
    </>
  );
}
