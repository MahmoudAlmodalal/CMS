"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { type Artist, ARTIST_CATEGORIES } from "@/lib/types/artists";
import { ArtistFilterTabs } from "./ArtistFilterTabs";
import { ArtistsGrid } from "./ArtistsGrid";

export interface ArtistsDirectoryClientProps {
  initialArtists: Artist[];
  className?: string;
}

/**
 * ArtistsDirectoryClient Component
 * Handles client-side category filtering, URL sync (?category=...), and responsive grid rendering.
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

  // Compute category counts for pills
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: initialArtists.length };
    for (const cat of ARTIST_CATEGORIES) {
      if (cat.id !== "all") {
        map[cat.id] = initialArtists.filter((a) => a.category === cat.id).length;
      }
    }
    return map;
  }, [initialArtists]);

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
    <div className={`space-y-8 ${className}`}>
      {/* 1. Category Filter Tabs */}
      <ArtistFilterTabs
        activeCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        counts={counts}
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
