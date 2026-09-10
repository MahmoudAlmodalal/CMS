import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import CourseForm from "@/components/admin/academy/CourseForm";
import { getAdminCourseById } from "@/lib/dal/admin-academy";
import { createClient } from "@/lib/supabase/server";
import { requireAdminSession } from "@/lib/auth-guard";
import type { InstructorOption } from "@/lib/types/admin-academy";
import Link from "next/link";

export const metadata = { title: "تعديل الدورة" };

async function getInstructors(): Promise<InstructorOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artists")
    .select("id, name")
    .eq("is_published", true)
    .order("name", { ascending: true });
  return (data ?? []) as InstructorOption[];
}

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  await requireAdminSession();
  const { id } = await params;

  const [course, instructors] = await Promise.all([
    getAdminCourseById(id),
    getInstructors(),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <AdminShell>
      <div className="space-y-6" dir="rtl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex items-center gap-2">
          <Link href="/admin/academy" className="hover:text-blue-600">
            إدارة الأكاديمية
          </Link>
          <span>←</span>
          <span className="text-gray-900">تعديل: {course.title}</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900">تعديل الدورة</h1>
        <CourseForm course={course} instructors={instructors} />
      </div>
    </AdminShell>
  );
}
