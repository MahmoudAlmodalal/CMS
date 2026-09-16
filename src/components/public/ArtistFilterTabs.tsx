"use client";

import { useTranslations } from "next-intl";
import { ARTIST_CATEGORIES } from "@/lib/types/artists";
import { ActivePill } from "./motion/ActivePill";

/**
 * The frame lays the row out left to right as غناء · عود وموسيقى · إيقاع · معاصر ·
 * تراث · الكل, which read right to left puts الكل first and then the rest of
 * ARTIST_CATEGORIES backwards. That is how the bar is drawn, so that is the order
 * rendered — it looks like the row was built for the English artboard and mirrored
 * without reversing, but the reference render is the authority.
 */
const [ALL_CATEGORY, ...REST_CATEGORIES] = ARTIST_CATEGORIES;
const DISPLAY_CATEGORIES = [ALL_CATEGORY, ...[...REST_CATEGORIES].reverse()];
const ARTIST_CATEGORY_MESSAGE_KEYS: Record<string, string> = {
  all: "all",
  singing: "artistSinging",
  oud: "artistOud",
  percussion: "artistPercussion",
  contemporary: "artistContemporary",
  heritage: "artistHeritage",
};

export interface ArtistFilterTabsProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  className?: string;
  allLabel?: string | null;
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
  allLabel,
}: ArtistFilterTabsProps) {
  const t = useTranslations("artists");
  const c = useTranslations("categories");

  return (
    <nav aria-label={t("filterTabs")} className={`w-full ${className}`}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="filter-scroll-mask no-scrollbar ms-[-6px] flex h-[66.533px] w-[calc(100vw-20px)] max-w-none snap-x snap-mandatory flex-nowrap items-center gap-4 overflow-x-auto scroll-smooth rounded-[16px] border-y-[0.667px] border-[rgba(236,230,208,0.07)] bg-white/80 px-5 py-[14.267px] lg:mx-auto lg:h-auto lg:w-fit lg:max-w-full lg:overflow-visible lg:py-[13.6px] hd:mx-0 hd:ms-[88px]"
      >
        {DISPLAY_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const label =
            cat.id === "all" && allLabel?.trim()
              ? allLabel.trim()
              : c(ARTIST_CATEGORY_MESSAGE_KEYS[cat.id]);

          return (
            <button
              key={cat.id}
              role="tab"
              type="button"
              id={`tab-${cat.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              // `isolate` is load-bearing: the pill sits at -z-10, and without a
              // stacking context here it would paint behind the tablist's own
              // white background instead of behind just this label.
              className={`relative isolate snap-start inline-flex min-h-11 min-w-max shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-[16px] px-5 text-center text-[14.08px] font-bold leading-[21.12px] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary ${
                isActive
                  ? "text-white/80"
                  : "motion-underline text-gradscale-900 hover:text-brand-primary"
              }`}
            >
              {/* The filled pill is one element shared by the whole bar, so
                  changing category slides it rather than blinking it across. */}
              {isActive ? (
                <ActivePill layoutId="artist-filter-pill" className="rounded-[16px] bg-brand-primary" />
              ) : null}
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
