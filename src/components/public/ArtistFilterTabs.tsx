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
 *
 * On the 390 frame (140:14826) the bar is 366x66.53 at x=10 — wider than the page's
 * own content box, so it breaks out of it — and the same 24 of side padding holds a
 * 318x38 row. The six labels keep the 32px rhythm there too, but only four of them
 * fit: عود وموسيقى opens at -67 and غناء at -125, off the row's inline end. So the
 * bar scrolls horizontally rather than wrapping, which is what the code did before
 * and what made it 107 tall against the designed 66.53.
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
        className="ms-[-6px] flex h-[66.533px] w-[366px] items-center justify-start gap-8 overflow-x-auto overscroll-x-contain rounded-[16px] border-y-[0.667px] border-[rgba(236,230,208,0.07)] bg-white/80 px-6 py-[14.267px] [scrollbar-width:none] lg:ms-[88px] lg:h-auto lg:w-[506px] lg:overflow-visible lg:py-[13.6px] [&::-webkit-scrollbar]:hidden"
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
              className={`shrink-0 cursor-pointer whitespace-nowrap text-center text-[14.08px] font-bold leading-[21.12px] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary ${
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
