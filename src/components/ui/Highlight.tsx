import React from "react";

export interface HighlightProps {
  /**
   * Text whose emphasised runs are wrapped in asterisks, e.g.
   * "منصتك الأولى *لاكتشاف* ودعم *المواهب* الفنية والثقافية".
   */
  text: string;
  /** Class applied to the emphasised runs. Defaults to the Figma terracotta #C54716. */
  highlightClassName?: string;
  /**
   * When true (default), if `text` contains no asterisks, automatically
   * highlights key words so headers always carry the brand orange terracotta styling.
   */
  autoHighlight?: boolean;
}

const KNOWN_HIGHLIGHTS: Record<string, string> = {
  // Arabic headers
  "من نحن": "من *نحن*",
  "فنانون مميزون": "فنانون *مميزون*",
  "أصوات تصنع التاريخ": "أصوات *تصنع* التاريخ",
  "قالوا عنا": "قالوا *عنا*",
  "يقولون عن أندلسيا": "يقولون عن *أندلسيا*",
  "مختارات تحريرية": "مختارات *تحريرية*",
  "نكتب كي لا تضيع التفاصيل": "*نكتب* كي لا تضيع التفاصيل",
  "فعاليات قادمة": "فعاليات *قادمة*",
  "نلتقي في المكان. في اللحظة": "*نلتقي* في المكان. في اللحظة",
  "احجز فنانك للمناسبة القادمة": "احجز فنانك *للمناسبة القادمة*",
  "مناسبتك تستحق موسيقى حقيقية": "مناسبتك تستحق *موسيقى حقيقية*",
  "منصتك الأولى لاكتشاف ودعم المواهب الفنية والثقافية": "منصتك الأولى *لاكتشاف* ودعم *المواهب* الفنية والثقافية",

  // English headers
  "About Us": "About *Us*",
  "Featured Artists": "Featured *Artists*",
  "Voices that make history": "Voices that *make* history",
  "Voices that Shape History": "Voices that *Shape* History",
  "Testimonials": "*Testimonials*",
  "They say about Andalusia": "They say about *Andalusia*",
  "Editorial Picks": "Editorial *Picks*",
  "We write so the details are never lost": "*We write* so the details are never lost",
  "Upcoming Events": "Upcoming *Events*",
  "We meet in the place. In the moment": "*We meet* in the place. In the moment",
  "Book your artist for the next occasion": "Book your artist for *the next occasion*",
  "Your occasion deserves real music": "Your occasion deserves *real music*",
  "Your first platform to discover and support artistic and cultural talent": "Your first platform to *discover* and support artistic and cultural *talent*",
};

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
  autoHighlight = true,
}: HighlightProps) {
  if (!text) return null;

  let source = text;
  if (autoHighlight && !source.includes("*")) {
    const trimmed = source.trim();
    if (KNOWN_HIGHLIGHTS[trimmed]) {
      source = KNOWN_HIGHLIGHTS[trimmed];
    } else {
      const words = trimmed.split(/\s+/);
      if (words.length >= 2) {
        // Highlight the last word by default
        source = `${words.slice(0, -1).join(" ")} *${words[words.length - 1]}*`;
      } else if (words.length === 1 && words[0]) {
        source = `*${words[0]}*`;
      }
    }
  }

  // Split on *...* keeping the delimiters; odd indices are the emphasised runs.
  const parts = source.split(/\*([^*]+)\*/g);

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
