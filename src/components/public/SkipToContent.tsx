import React from "react";

/**
 * SkipToContent: Accessible skip link for keyboard & screen reader users.
 * Allows bypassing repeated navigation bars directly to primary content.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:px-5 focus:py-2.5 focus:bg-brand-primary focus:text-brand-tint focus:rounded-xl focus:shadow-xl focus:font-bold focus:text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-cream transition-all"
    >
      انتقل إلى المحتوى الرئيسي
    </a>
  );
}
