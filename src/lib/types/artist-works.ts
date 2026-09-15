/**
 * Admin + public types for artist_works (أعمال الفنان).
 * Derived from src/lib/supabase/types.ts, mirroring src/lib/types/admin-tracks.ts.
 */

import type { Database } from "@/lib/supabase/types";
import { WORK_TYPES, type WorkType } from "@/lib/validations/primitives";

export type ArtistWork = Database["public"]["Tables"]["artist_works"]["Row"];
export type ArtistWorkInsert = Database["public"]["Tables"]["artist_works"]["Insert"];
export type ArtistWorkUpdate = Database["public"]["Tables"]["artist_works"]["Update"];

/** Work with joined artist name for admin list views. */
export interface AdminArtistWork extends ArtistWork {
  artist_name?: string | null;
}

export interface ArtistWorkFilters {
  artist_id?: string;
  is_published?: boolean;
}

/** The dropdown options in the admin panel — order is the order drawn. */
export const WORK_TYPE_OPTIONS: ReadonlyArray<{ id: WorkType; label: string }> = [
  { id: "song", label: "أغنية" },
  { id: "concert", label: "حفلة" },
  { id: "interview", label: "مقابلة" },
  { id: "documentary", label: "فيلم وثائقي" },
];

/** Arabic label for a stored work_type; unknown values fall back to the raw value. */
export function getWorkTypeLabel(workType: string): string {
  return WORK_TYPE_OPTIONS.find((option) => option.id === workType)?.label ?? workType;
}

export { WORK_TYPES, type WorkType };
export type { ArtistOption } from "@/lib/types/admin-tracks";
