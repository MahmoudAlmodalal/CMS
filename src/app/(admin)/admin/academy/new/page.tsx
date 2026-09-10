import AdminShell from "@/components/admin/AdminShell";
import CourseForm from "@/components/admin/academy/CourseForm";
import { createClient } from "@/lib/supabase/server";
import { requireAdminSession } from "@/lib/auth-guard";
import type { InstructorOption } from "@/lib/types/admin-academy";
import Link from "next/link";

export const metadata = { title: "إضافة دورة جديدة" };

async function getInstructors(): Promise<InstructorOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artists")
    .select("id, name")
    .eq("is_published", true)
    .order("name", { ascending: true });
  return (data ?? []) as InstructorOption[];
}

export default async function NewCoursePage() {
  await requireAdminSession();
  const instructors = await getInstructors();

  return (
    <AdminShell>
      <div className="space-y-6" dir="rtl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex items-center gap-2">
          <Link href="/admin/academy" className="hover:text-blue-600">
            إدارة الأكاديمية
          </Link>
          <span>←</span>
          <span className="text-gray-900">إضافة دورة جديدة</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900">إضافة دورة جديدة</h1>
        <CourseForm course={null} instructors={instructors} />
      </div>
    </AdminShell>
  );
}
