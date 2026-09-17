"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { type Artist } from "@/lib/types/artists";
import { ArtistFilterTabs } from "./ArtistFilterTabs";
import { ArtistsGrid } from "./ArtistsGrid";
import { NewsPagination } from "./NewsPagination";

export interface ArtistsDirectoryClientProps {
  /** Current page items — the page fetches one ?category= & ?page= window. */
  artists: Artist[];
  page: number;
  totalPages: number;
  selectedCategory?: string;
  className?: string;
  allLabel?: string | null;
  searchParams?: Record<string, string | string[] | undefined>;
}

/**
 * Artists directory — the filter bar of node 91:18144 over the grid of 91:18061.
 *
 * The frame puts 41.7px between them, which is not the rhythm anything else on the
 * page uses, so it is stated here rather than taken from a shared scale. The 390
 * frame puts 32.467 there — the filter bar closes at 776.533 and the carousel opens
 * at 809 — which is likewise its own figure.
 *
 * Filtering, the ?category= sync and the keyboard tablist are behaviour the design
 * cannot express and are kept as they were. Paging is server-side like /news:
 * the page reads ?page= and this client renders one window plus a pager that
 * preserves ?category=.
 */
export function ArtistsDirectoryClient({
  artists,
  page,
  totalPages,
  selectedCategory = "all",
  className = "",
  allLabel,
  searchParams,
}: ArtistsDirectoryClientProps) {
  const urlSearchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Handle tab switch — the page re-fetches one window and restarts at page 1.
  const handleSelectCategory = (categoryId: string) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    if (categoryId === "all") {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }
    params.delete("page");

    const query = params.toString();
    const target = query ? `${pathname}?${query}` : pathname;
    router.replace(target, { scroll: false });
  };

  return (
    <div className={`flex w-full min-w-0 flex-col items-start gap-[32.467px] lg:items-stretch lg:gap-[41.7px] ${className}`}>
      {/* 1. Category Filter Tabs */}
      <ArtistFilterTabs
        activeCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        allLabel={allLabel}
      />

      {/* 2. Responsive Artists Grid */}
      <div
        role="tabpanel"
        id={`panel-${selectedCategory}`}
        aria-labelledby={`tab-${selectedCategory}`}
      >
        <ArtistsGrid
          artists={artists}
          category={selectedCategory}
          onResetFilter={() => handleSelectCategory("all")}
        />
        {totalPages > 1 && (
          <NewsPagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/artists"
            namespace="artists"
            searchParams={searchParams}
            className="mt-8"
          />
        )}
      </div>
    </div>
  );
}
