import type { Database } from "@/lib/supabase/types";

export type Release = Database["public"]["Tables"]["releases"]["Row"];

/**
 * The discography the الفنان frame draws, and the roster's fallback without Supabase.
 *
 * Figma frame 134:4420 draws four album cards in one row under مسيرتها الفنية, right
 * to left: نسمة من الأندلس, حنين, ليالي بيروت, عطر الماضي. The badge on each reads
 * ألبوم استوديو except ليالي بيروت, which reads ألبوم حي — that is the release_type
 * column, so the records carry it rather than the drawn label. The covers are cropped
 * out of the 1:1 reference render by scripts/extract-reference-assets.py, with the
 * frame's own badge scrubbed off so the component can draw it live.
 *
 * Only سارة الصوت has a drawn discography; the other seven artists resolve to an
 * empty list and the section does not render for them.
 */
export const CANONICAL_RELEASES: Release[] = [
  {
    id: "r1000000-0000-0000-0000-000000000001",
    artist_id: "a1000000-0000-0000-0000-000000000001",
    title: "نسمة من الأندلس",
    release_type: "studio",
    track_count: 12,
    release_year: 2023,
    cover_image_url: "/assets/releases/release-1.png",
    display_order: 1,
    is_published: true,
    created_at: "2026-09-10T00:00:00Z",
  },
  {
    id: "r1000000-0000-0000-0000-000000000002",
    artist_id: "a1000000-0000-0000-0000-000000000001",
    title: "حنين",
    release_type: "studio",
    track_count: 9,
    release_year: 2021,
    cover_image_url: "/assets/releases/release-2.png",
    display_order: 2,
    is_published: true,
    created_at: "2026-09-10T00:00:00Z",
  },
  {
    id: "r1000000-0000-0000-0000-000000000003",
    artist_id: "a1000000-0000-0000-0000-000000000001",
    title: "ليالي بيروت",
    release_type: "live",
    track_count: 10,
    release_year: 2019,
    cover_image_url: "/assets/releases/release-3.png",
    display_order: 3,
    is_published: true,
    created_at: "2026-09-10T00:00:00Z",
  },
  {
    id: "r1000000-0000-0000-0000-000000000004",
    artist_id: "a1000000-0000-0000-0000-000000000001",
    title: "عطر الماضي",
    release_type: "studio",
    track_count: 8,
    release_year: 2017,
    cover_image_url: "/assets/releases/release-4.png",
    display_order: 4,
    is_published: true,
    created_at: "2026-09-10T00:00:00Z",
  },
];
