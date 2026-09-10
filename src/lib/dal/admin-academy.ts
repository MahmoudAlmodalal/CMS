// Task 44 (rebuild) — Academy Courses admin DAL. Canonical columns only, see
// supabase/migrations/20260910000600_create_academy_courses.sql.

import { requireAdminSession } from "@/lib/auth-guard";
import type { Database } from "@/lib/supabase/types";

export type AdminAcademyCourse = Database["public"]["Tables"]["academy_courses"]["Row"];

/**
 * Fetches every academy course for the protected admin workspace, including drafts.
 * The auth guard is kept in the DAL so the page cannot forget it.
 */
export async function getAdminCourses(): Promise<AdminAcademyCourse[]> {
  const { supabase } = await requireAdminSession();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("academy_courses")
    .select("*")
    .order("display_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    console.error("DAL Error [getAdminCourses]:", error.message);
    throw new Error("تعذر تحميل قائمة المسارات التعليمية حالياً");
  }

  return (data as unknown as AdminAcademyCourse[]) || [];
}
