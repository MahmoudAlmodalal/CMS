"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { type Artist } from "@/lib/types/artists";
import { ArtistFilterTabs } from "./ArtistFilterTabs";
import { ArtistsGrid } from "./ArtistsGrid";

export interface ArtistsDirectoryClientProps {
  initialArtists: Artist[];
  className?: string;
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
 * cannot express and are kept as they were.
 */
export function ArtistsDirectoryClient({
  initialArtists,
  className = "",
}: ArtistsDirectoryClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Category from query param or default "all"
  const paramCategory = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState<string>(paramCategory);

  // Sync state if URL searchParam changes (e.g. back/forward navigation)
  useEffect(() => {
    if (paramCategory) {
      setSelectedCategory(paramCategory);
    }
  }, [paramCategory]);

  // Handle tab switch
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);

    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === "all") {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }

    const query = params.toString();
    const target = query ? `${pathname}?${query}` : pathname;
    router.replace(target, { scroll: false });
  };

  // Filtered and sorted artists
  const filteredArtists = useMemo(() => {
    let result = initialArtists;
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((a) => a.category === selectedCategory);
    }
    // Strict ordering: display_order ASC, name ASC
    return [...result].sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return a.name.localeCompare(b.name, "ar");
    });
  }, [initialArtists, selectedCategory]);

  return (
    <div className={`flex flex-col items-start gap-[32.467px] lg:items-stretch lg:gap-[41.7px] ${className}`}>
      {/* 1. Category Filter Tabs */}
      <ArtistFilterTabs
        activeCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* 2. Responsive Artists Grid */}
      <div
        role="tabpanel"
        id={`panel-${selectedCategory}`}
        aria-labelledby={`tab-${selectedCategory}`}
      >
        <ArtistsGrid
          artists={filteredArtists}
          category={selectedCategory}
          onResetFilter={() => handleSelectCategory("all")}
        />
      </div>
    </div>
  );
}
