import React from "react";
import { useTranslations } from "next-intl";

export interface EventsHeaderProps {
  title?: string;
  subtitle: string;
}

/**
 * Events Header Component
 * Derived directly from Figma Node 91:16532 / 91:16748 (Page Title) & 91:16747 (Subtitle)
 */
export function EventsHeader({
  title,
  subtitle,
}: EventsHeaderProps) {
  const t = useTranslations("events");

  return (
    <header className="space-y-4 text-start pb-2">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-50 border border-primary-100 text-brand-primary text-xs font-bold">
        <span>{t("kicker")}</span>
      </div>
      <h1 className="font-calligraphic text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-espresso leading-tight">
        {title ?? t("title")}
      </h1>
      <p className="text-base sm:text-lg text-brand-espresso/80 leading-relaxed max-w-2xl">
        {subtitle}
      </p>
    </header>
  );
}
