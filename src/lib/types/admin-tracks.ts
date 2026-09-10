/**
 * Admin types for Tracks and Releases CMS (Task 45)
 * Derived from src/lib/supabase/types.ts canonical schema.
 */

import type { Database } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Track types
// ---------------------------------------------------------------------------

export type TrackRow = Database["public"]["Tables"]["tracks"]["Row"];
export type TrackInsert = Database["public"]["Tables"]["tracks"]["Insert"];
export type TrackUpdate = Database["public"]["Tables"]["tracks"]["Update"];

/** Track with joined artist name for admin list views */
export interface AdminTrack extends TrackRow {
  artist_name?: string | null;
}

/** Simple artist option used in dropdowns */
export interface ArtistOption {
  id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Release types
// ---------------------------------------------------------------------------

export type ReleaseRow = Database["public"]["Tables"]["releases"]["Row"];
export type ReleaseInsert = Database["public"]["Tables"]["releases"]["Insert"];
export type ReleaseUpdate = Database["public"]["Tables"]["releases"]["Update"];

/** Release with joined artist name for admin list views */
export interface AdminRelease extends ReleaseRow {
  artist_name?: string | null;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface TrackFilters {
  artist_id?: string;
  is_published?: boolean;
}

export interface ReleaseFilters {
  artist_id?: string;
  is_published?: boolean;
}
