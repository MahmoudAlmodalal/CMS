"use client";

import { useTranslations } from "next-intl";
import { ARTIST_CATEGORIES } from "@/lib/types/artists";

/**
 * The frame lays the row out left to right as غناء · عود وموسيقى · إيقاع · معاصر ·
 * تراث · الكل, which read right to left puts الكل first and then the rest of
 * ARTIST_CATEGORIES backwards. That is how the bar is drawn, so that is the order
 * rendered — it looks like the row was built for the English artboard and mirrored
 * without reversing, but the reference render is the authority.
 */
const [ALL_CATEGORY, ...REST_CATEGORIES] = ARTIST_CATEGORIES;
const DISPLAY_CATEGORIES = [ALL_CATEGORY, ...[...REST_CATEGORIES].reverse()];

export interface ArtistFilterTabsProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  className?: string;
}

/**
 * Artist filter bar — Figma node 91:18144 in frame 91:17844.
 *
 * A 506-wide pill on 80% white at a 16px radius, 24px padded across and 13.6px
 * down, its inline start 88px in from the edge of the 1440 artboard. Inside, the
 * six categories sit 32px apart in Cairo Bold 14.08/21.12 #1B1B1B over a
 * transparent 2px underline, and the selected one — الكل in the frame — is a
 * 62-wide primary-500 pill at a 16px radius with its label at 80% white.
 *
 * The design carries no counts beside the labels, so none are rendered.
 */
export function ArtistFilterTabs({
  activeCategory,
  onSelectCategory,
  className = "",
}: ArtistFilterTabsProps) {
  const t = useTranslations("artists");

  return (
    <nav aria-label={t("filterTabs")} className={`w-full ${className}`}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex w-full flex-wrap items-center justify-start gap-4 rounded-[16px] border-y-[0.667px] border-[rgba(236,230,208,0.07)] bg-white/80 px-6 py-[13.6px] lg:ms-[88px] lg:w-[506px] lg:flex-nowrap lg:gap-8"
      >
        {DISPLAY_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              role="tab"
              type="button"
              id={`tab-${cat.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`cursor-pointer whitespace-nowrap text-center text-[14.08px] font-bold leading-[21.12px] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary ${
                isActive
                  ? "w-[62px] shrink-0 rounded-[16px] bg-brand-primary py-2 text-white/80"
                  : "border-b-2 border-transparent pb-[2px] text-gradscale-900 hover:border-brand-primary hover:text-brand-primary"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
