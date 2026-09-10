"use client";

import { useState } from "react";
import type { AdminCourse } from "@/lib/types/admin-academy";
import { togglePublishAction, deleteCourseAction } from "@/actions/admin-academy";
import Link from "next/link";

interface CoursesTableProps {
  courses: AdminCourse[];
}

export default function CoursesTable({ courses }: CoursesTableProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleTogglePublish(course: AdminCourse) {
    setLoading(`publish-${course.id}`);
    await togglePublishAction(course.id, course.is_published);
    setLoading(null);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`هل أنت متأكد من حذف الدورة "${title}"؟`)) return;
    setLoading(`delete-${id}`);
    await deleteCourseAction(id);
    setLoading(null);
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 text-sm">
        لا توجد دورات حتى الآن. أضف دورة جديدة للبدء.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm" dir="rtl">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-right font-medium text-gray-600 w-16">صورة</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">عنوان الدورة</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">المدرّب</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">الترتيب</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">النشر</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {courses.map((course) => (
            <tr key={course.id} className="hover:bg-gray-50 transition-colors">
              {/* Image thumbnail */}
              <td className="px-4 py-3">
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="w-12 h-12 object-cover rounded-md border border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-300 text-lg">
                    🎓
                  </div>
                )}
              </td>

              {/* Title */}
              <td className="px-4 py-3">
                <span className="font-medium text-gray-900">{course.title}</span>
                {course.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xs">
                    {course.description}
                  </p>
                )}
              </td>

              {/* Instructor */}
              <td className="px-4 py-3 text-gray-700">
                {course.instructor?.name ||
                  course.instructor_name ||
                  <span className="text-gray-400 italic text-xs">غير محدد</span>}
              </td>

              {/* Ordering */}
              <td className="px-4 py-3 text-gray-600 tabular-nums">
                {course.display_order}
              </td>

              {/* Publish toggle */}
              <td className="px-4 py-3">
                <button
                  onClick={() => handleTogglePublish(course)}
                  disabled={loading === `publish-${course.id}`}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                    course.is_published
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                  aria-label={course.is_published ? "إخفاء الدورة" : "نشر الدورة"}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      course.is_published ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  {course.is_published ? "منشور" : "مسودة"}
                </button>
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link
                    href={`/admin/academy/${course.id}/edit`}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium underline underline-offset-2"
                  >
                    تعديل
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id, course.title)}
                    disabled={loading === `delete-${course.id}`}
                    className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                  >
                    حذف
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
