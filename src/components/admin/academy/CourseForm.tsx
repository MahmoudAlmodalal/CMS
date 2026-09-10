"use client";

import { useState, useTransition } from "react";
import type { AdminCourse, InstructorOption } from "@/lib/types/admin-academy";
import { courseSchema, type CourseInput } from "@/lib/validations/academy";
import { createCourseAction, updateCourseAction } from "@/actions/admin-academy";
import { useRouter } from "next/navigation";

interface CourseFormProps {
  course?: AdminCourse | null;
  instructors: InstructorOption[];
}

export default function CourseForm({ course, instructors }: CourseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CourseInput, string>>>({});

  const isEdit = Boolean(course);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    const form = e.currentTarget;
    const fd = new FormData(form);

    const raw: CourseInput = {
      title_ar: (fd.get("title_ar") as string) ?? "",
      description_ar: (fd.get("description_ar") as string) ?? "",
      instructor_id: (fd.get("instructor_id") as string) || null,
      image_url: (fd.get("image_url") as string) || null,
      signup_copy_ar: (fd.get("signup_copy_ar") as string) || null,
      is_published: fd.get("is_published") === "true",
      ordering: parseInt((fd.get("ordering") as string) ?? "0", 10),
    };

    const parsed = courseSchema.safeParse(raw);
    if (!parsed.success) {
      const errs: Partial<Record<keyof CourseInput, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof CourseInput;
        if (key) errs[key] = issue.message;
      });
      setFieldErrors(errs);
      return;
    }

    startTransition(async () => {
      let result;
      if (isEdit && course) {
        result = await updateCourseAction(course.id, parsed.data);
      } else {
        result = await createCourseAction(parsed.data);
      }

      if (!result.ok) {
        setServerError(result.error ?? "حدث خطأ غير متوقع");
        return;
      }

      router.push("/admin/academy");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-6 max-w-2xl">
      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title_ar" className="block text-sm font-medium text-gray-700 mb-1">
          عنوان الدورة <span className="text-red-500">*</span>
        </label>
        <input
          id="title_ar"
          name="title_ar"
          type="text"
          defaultValue={course?.title ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="مثال: أساسيات العود"
          maxLength={200}
          required
        />
        {fieldErrors.title_ar && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.title_ar}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description_ar" className="block text-sm font-medium text-gray-700 mb-1">
          وصف الدورة <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description_ar"
          name="description_ar"
          rows={5}
          defaultValue={course?.description ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          placeholder="أدخل وصفاً تفصيلياً للدورة..."
          maxLength={3000}
          required
        />
        {fieldErrors.description_ar && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.description_ar}</p>
        )}
      </div>

      {/* Instructor */}
      <div>
        <label htmlFor="instructor_id" className="block text-sm font-medium text-gray-700 mb-1">
          المدرّب
        </label>
        <select
          id="instructor_id"
          name="instructor_id"
          defaultValue={course?.instructor_id ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">— بدون مدرّب —</option>
          {instructors.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name}
            </option>
          ))}
        </select>
        {fieldErrors.instructor_id && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.instructor_id}</p>
        )}
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
          رابط صورة الدورة
        </label>
        <input
          id="image_url"
          name="image_url"
          type="url"
          defaultValue={course?.image_url ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://..."
          maxLength={500}
        />
        {fieldErrors.image_url && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.image_url}</p>
        )}
      </div>

      {/* Signup copy */}
      <div>
        <label htmlFor="signup_copy_ar" className="block text-sm font-medium text-gray-700 mb-1">
          نص التسجيل / الدعوة للعمل
        </label>
        <textarea
          id="signup_copy_ar"
          name="signup_copy_ar"
          rows={2}
          defaultValue={""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          placeholder="نص قصير لتحفيز المتعلمين على التسجيل..."
          maxLength={500}
        />
        {fieldErrors.signup_copy_ar && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.signup_copy_ar}</p>
        )}
      </div>

      {/* Ordering */}
      <div>
        <label htmlFor="ordering" className="block text-sm font-medium text-gray-700 mb-1">
          الترتيب <span className="text-red-500">*</span>
        </label>
        <input
          id="ordering"
          name="ordering"
          type="number"
          min={0}
          max={9999}
          defaultValue={course?.display_order ?? 0}
          className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {fieldErrors.ordering && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.ordering}</p>
        )}
      </div>

      {/* Published */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">حالة النشر</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="is_published"
              value="true"
              defaultChecked={course?.is_published ?? false}
              className="accent-blue-600"
            />
            <span className="text-sm text-gray-700">منشور</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="is_published"
              value="false"
              defaultChecked={!(course?.is_published ?? false)}
              className="accent-blue-600"
            />
            <span className="text-sm text-gray-700">مسودة</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إنشاء الدورة"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
