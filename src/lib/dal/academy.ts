import { createClient } from "@/lib/supabase/server";
import { USE_DEMO_CONTENT } from "@/lib/demo-content";
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
 * Falls back to canonical courses if database is unreachable or empty. This keeps
 * the public Figma content visible while the CMS is being populated.
 */
export async function getPublishedAcademyCourses(): Promise<AcademyCourse[]> {
  if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    return localizeContentList("academy_courses", CANONICAL_ACADEMY_COURSES);
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
      console.warn("DAL Warning [getPublishedAcademyCourses]:", error.message);
      return localizeContentList("academy_courses", CANONICAL_ACADEMY_COURSES);
    }

    // An empty successful response is still an unpopulated CMS, not a reason to
    // render the public page's empty state when canonical content is available.
    return localizeContentList("academy_courses", data?.length ? (data as unknown as AcademyCourse[]) : CANONICAL_ACADEMY_COURSES);
  } catch (err) {
    console.warn("DAL Warning [getPublishedAcademyCourses]: Connection failed", err);
    return localizeContentList("academy_courses", CANONICAL_ACADEMY_COURSES);
  }
}

/**
 * Fetches a single published academy course by slug.
 */
export async function getAcademyCourseBySlug(slug: string): Promise<AcademyCourse | null> {
  if (!slug) return null;

  if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    const demo = findCanonicalAcademyCourse(slug);
    return demo ? localizeContent("academy_courses", demo) : null;
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
      const fallback = findCanonicalAcademyCourse(slug);
      return fallback ? localizeContent("academy_courses", fallback) : null;
    }

    return localizeContent("academy_courses", data as unknown as AcademyCourse);
  } catch {
    const fallback = USE_DEMO_CONTENT ? findCanonicalAcademyCourse(slug) : null;
    return (fallback || null);
  }
}
