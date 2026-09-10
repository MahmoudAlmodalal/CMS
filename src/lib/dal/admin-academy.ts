import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/auth-guard";
import type { AdminCourse, CourseFilters } from "@/lib/types/admin-academy";
import type { CourseInput } from "@/lib/validations/academy";

/**
 * Fetch all academy courses for the admin workspace (including unpublished).
 * Optionally filters by is_published.
 * Joins instructor name from artists table.
 */
export async function getAdminCourses(
  filters?: CourseFilters
): Promise<AdminCourse[]> {
  await requireAdminSession();
  const supabase = await createClient();

  let query = supabase
    .from("academy_courses")
    .select(
      "id, title, slug, track_category, description, instructor_name, instructor_id, image_url, display_order, is_published, created_at, updated_at"
    )
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters?.is_published !== undefined) {
    query = query.eq("is_published", filters.is_published);
  }

  const { data, error } = await query;

  if (error) {
    console.error("DAL Error [getAdminCourses]:", error.message);
    throw new Error("تعذر تحميل قائمة الدورات حالياً");
  }

  // Optionally enrich with instructor name from artists if instructor_id present
  const courses = (data || []) as AdminCourse[];
  return courses;
}

/**
 * Fetch a single academy course by id for the admin.
 */
export async function getAdminCourseById(id: string): Promise<AdminCourse | null> {
  await requireAdminSession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("academy_courses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("DAL Error [getAdminCourseById]:", error.message);
    throw new Error("تعذر تحميل بيانات الدورة");
  }

  return (data as AdminCourse | null);
}

/**
 * Create a new academy course.
 * Maps CourseInput fields to DB column names.
 */
export async function createCourse(
  data: CourseInput
): Promise<{ id: string }> {
  await requireAdminSession();
  const supabase = createAdminClient();

  const insert = {
    title: data.title_ar,
    slug: generateSlug(data.title_ar),
    track_category: "general",
    description: data.description_ar,
    instructor_id: data.instructor_id ?? null,
    image_url: data.image_url ?? null,
    display_order: data.ordering,
    is_published: data.is_published,
  };

  const { data: row, error } = await supabase
    .from("academy_courses")
    .insert(insert as never)
    .select("id")
    .single();

  if (error) {
    console.error("DAL Error [createCourse]:", error.message);
    throw new Error("تعذر إنشاء الدورة");
  }

  return { id: (row as { id: string }).id };
}

/**
 * Update an existing academy course.
 */
export async function updateCourse(
  id: string,
  data: Partial<CourseInput>
): Promise<void> {
  await requireAdminSession();
  const supabase = createAdminClient();

  const update: Record<string, unknown> = {};
  if (data.title_ar !== undefined) {
    update.title = data.title_ar;
    update.slug = generateSlug(data.title_ar);
  }
  if (data.description_ar !== undefined) update.description = data.description_ar;
  if (data.instructor_id !== undefined) update.instructor_id = data.instructor_id;
  if (data.image_url !== undefined) update.image_url = data.image_url;
  if (data.is_published !== undefined) update.is_published = data.is_published;
  if (data.ordering !== undefined) update.display_order = data.ordering;

  const { error } = await supabase
    .from("academy_courses")
    .update(update as never)
    .eq("id", id);

  if (error) {
    console.error("DAL Error [updateCourse]:", error.message);
    throw new Error("تعذر تحديث الدورة");
  }
}

/**
 * Delete an academy course by id.
 */
export async function deleteCourse(id: string): Promise<void> {
  await requireAdminSession();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("academy_courses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("DAL Error [deleteCourse]:", error.message);
    throw new Error("تعذر حذف الدورة");
  }
}

/**
 * Toggle a course's published status (flip current value).
 */
export async function toggleCoursePublish(
  id: string,
  current: boolean
): Promise<void> {
  await requireAdminSession();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("academy_courses")
    .update({ is_published: !current } as never)
    .eq("id", id);

  if (error) {
    console.error("DAL Error [toggleCoursePublish]:", error.message);
    throw new Error("تعذر تغيير حالة نشر الدورة");
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 150) || `course-${Date.now()}`;
}
