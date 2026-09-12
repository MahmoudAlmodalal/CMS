import { createClient } from "@/lib/supabase/server";
import { localizeContent, localizeContentList } from "./localize";
import {
  CANONICAL_ACADEMY_COURSES,
  findCanonicalAcademyCourse,
  type AcademyCourse,
} from "@/lib/academy";

export { CANONICAL_ACADEMY_COURSES, findCanonicalAcademyCourse, type AcademyCourse };

/**
 * Fetches all published academy courses ordered strictly by display_order ASC.
 * Draft or unpublished courses are never returned to public callers.
 * Falls back to canonical courses if database is unreachable or empty.
 */
async function getPublishedAcademyCoursesRaw(): Promise<AcademyCourse[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return CANONICAL_ACADEMY_COURSES;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_courses")
      .select(
        "id, title, slug, track_category, description, instructor_name, instructor_id, image_url, display_order, is_published, created_at, updated_at, " +
          "title_en, track_category_en, description_en, instructor_name_en"
      )
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn("DAL Warning [getPublishedAcademyCourses]:", error.message);
      }
      return CANONICAL_ACADEMY_COURSES;
    }

    return data as unknown as AcademyCourse[];
  } catch (err) {
    console.warn("DAL Warning [getPublishedAcademyCourses]: Connection failed", err);
    return CANONICAL_ACADEMY_COURSES;
  }
}

/**
 * Fetches a single published academy course by slug.
 */
async function getAcademyCourseBySlugRaw(slug: string): Promise<AcademyCourse | null> {
  if (!slug) return null;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return findCanonicalAcademyCourse(slug);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_courses")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) {
      return findCanonicalAcademyCourse(slug);
    }

    return data as unknown as AcademyCourse;
  } catch {
    return findCanonicalAcademyCourse(slug);
  }
}

/*
 * Public readers resolve content into the request's locale. Arabic rows are
 * returned untouched; English falls back to Arabic per field when a
 * translation has not been written yet.
 */
export async function getPublishedAcademyCourses(): Promise<AcademyCourse[]> {
  return localizeContentList("academy_courses", await getPublishedAcademyCoursesRaw());
}
export async function getAcademyCourseBySlug(slug: string): Promise<AcademyCourse | null> {
  const row = await getAcademyCourseBySlugRaw(slug);
  return row ? localizeContent("academy_courses", row) : null;
}
