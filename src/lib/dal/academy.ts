import { createClient } from "@/lib/supabase/server";
import { USE_DEMO_CONTENT } from "@/lib/demo-content";
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
export async function getPublishedAcademyCourses(): Promise<AcademyCourse[]> {
  if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    return CANONICAL_ACADEMY_COURSES;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_courses")
      .select(
        "id, title, slug, track_category, description, instructor_name, instructor_id, image_url, display_order, is_published, created_at, updated_at"
      )
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error) {
      if (error) {
        console.warn("DAL Warning [getPublishedAcademyCourses]:", error.message);
      }
      return USE_DEMO_CONTENT ? CANONICAL_ACADEMY_COURSES : [];
    }

    return data as unknown as AcademyCourse[];
  } catch (err) {
    console.warn("DAL Warning [getPublishedAcademyCourses]: Connection failed", err);
    return USE_DEMO_CONTENT ? CANONICAL_ACADEMY_COURSES : [];
  }
}

/**
 * Fetches a single published academy course by slug.
 */
export async function getAcademyCourseBySlug(slug: string): Promise<AcademyCourse | null> {
  if (!slug) return null;

  if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
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
      return null;
    }

    return data as unknown as AcademyCourse;
  } catch {
    return USE_DEMO_CONTENT ? findCanonicalAcademyCourse(slug) : null;
  }
}
