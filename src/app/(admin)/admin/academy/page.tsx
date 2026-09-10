import { Suspense } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import CoursesTable from "@/components/admin/academy/CoursesTable";
import { getAdminCourses } from "@/lib/dal/admin-academy";

export const metadata = { title: "إدارة الأكاديمية" };

async function CoursesList() {
  const courses = await getAdminCourses();
  return <CoursesTable courses={courses} />;
}

export default function AdminAcademyPage() {
  return (
    <AdminShell>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الأكاديمية</h1>
            <p className="text-sm text-gray-500 mt-1">إدارة دورات ومسارات الأكاديمية الموسيقية</p>
          </div>
          <Link
            href="/admin/academy/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <span>+</span>
            <span>إضافة دورة جديدة</span>
          </Link>
        </div>

        {/* Table */}
        <Suspense
          fallback={
            <div className="text-center py-16 text-gray-400 text-sm animate-pulse">
              جاري تحميل الدورات...
            </div>
          }
        >
          <CoursesList />
        </Suspense>
      </div>
    </AdminShell>
  );
}
