import { createClient } from "@/lib/supabase/server";
import { USE_DEMO_CONTENT } from "@/lib/demo-content";
import { PAGE_SIZE, pagination } from "@/lib/pagination";
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
export async function getPublishedAcademyCoursesPage(options: { page?: number } = {}) {
  const fallback = async () => {
    const rows = CANONICAL_ACADEMY_COURSES.filter((course) => course.is_published)
      .sort((a, b) => a.display_order - b.display_order || a.id.localeCompare(b.id));
    const bounds = pagination(rows.length, options.page ?? 1, PAGE_SIZE);
    return { ...bounds, total: rows.length, items: await localizeContentList("academy_courses", rows.slice(bounds.from, bounds.to + 1)) };
  };
  if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) return fallback();
  try {
    const supabase = await createClient();
    const buildQuery = (head = false) => supabase.from("academy_courses").select("*", { count: "exact", head }).eq("is_published", true);
    const { count, error: countError } = await buildQuery(true);
    if (countError || !count) return fallback();
    const total = count;
    const bounds = pagination(total, options.page ?? 1, PAGE_SIZE);
    const { data, error } = await buildQuery()
      .order("display_order", { ascending: true })
      .order("id", { ascending: true })
      .range(bounds.from, bounds.to);
    if (error) return fallback();
    return { ...bounds, total, items: await localizeContentList("academy_courses", (data as unknown as AcademyCourse[]) || []) };
  } catch {
    return fallback();
  }
}

export async function getPublishedAcademyCourses(): Promise<AcademyCourse[]> {
  if (USE_DEMO_CONTENT && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    return localizeContentList("academy_courses", CANONICAL_ACADEMY_COURSES);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academy_courses")
      .select(
        "id, title, title_en, slug, track_category, track_category_en, description, description_en, instructor_name, instructor_name_en, instructor_id, image_url, display_order, is_published, created_at, updated_at, price, price_en, duration, duration_en, group_size, group_size_en, certificate, certificate_en, language, language_en, offer_text, offer_text_en, philosophy_text, philosophy_text_en, practice_text, practice_text_en, curriculum_title, curriculum_title_en, curriculum_items"
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
    return fallback ? localizeContent("academy_courses", fallback) : null;
  }
}
