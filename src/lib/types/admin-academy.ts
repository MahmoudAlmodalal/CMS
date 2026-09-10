import type { Database } from "@/lib/supabase/types";

// Raw DB row
export type CourseRow = Database["public"]["Tables"]["academy_courses"]["Row"];

// Joined row (with optional instructor data from artists table)
export interface AdminCourse extends CourseRow {
  instructor?: {
    id: string;
    name: string;
  } | null;
}

// Shape used in forms — maps to the task-spec fields
export interface CourseFormData {
  title_ar: string;
  description_ar: string;
  instructor_id?: string | null;
  image_url?: string | null;
  signup_copy_ar?: string | null;
  is_published: boolean;
  ordering: number;
}

// Filter options for getAdminCourses
export interface CourseFilters {
  is_published?: boolean;
}

// Minimal artist option used in instructor <select>
export interface InstructorOption {
  id: string;
  name: string;
}
