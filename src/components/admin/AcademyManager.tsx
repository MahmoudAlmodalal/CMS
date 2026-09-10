"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createAcademyCourseAction,
  deleteAcademyCourseAction,
  setPublishStatusAction,
  updateAcademyCourseAction,
} from "@/actions/cms";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Textarea } from "@/components/ui/Textarea";
import { Field, ModalShell, Notice, StatusBadge } from "@/components/admin/ManagerKit";
import type { AcademyCourseInput } from "@/lib/validations/cms";
import type { AdminAcademyCourse } from "@/lib/dal/admin-academy";
import type { Artist } from "@/lib/types/artists";

type CourseFormValues = Omit<AcademyCourseInput, "id">;
type StatusFilter = "all" | "published" | "draft";

interface AcademyManagerProps {
  initialCourses: AdminAcademyCourse[];
  instructors: Artist[];
}

function emptyCourse(): CourseFormValues {
  return {
    title: "",
    slug: "",
    track_category: "",
    description: "",
    instructor_name: "",
    instructor_id: null,
    image_url: "",
    display_order: 1,
    is_published: false,
  };
}

function courseToForm(course: AdminAcademyCourse): CourseFormValues {
  return {
    title: course.title,
    slug: course.slug,
    track_category: course.track_category,
    description: course.description,
    instructor_name: course.instructor_name ?? "",
    instructor_id: course.instructor_id,
    image_url: course.image_url ?? "",
    display_order: course.display_order,
    is_published: course.is_published,
  };
}

export function AcademyManager({ initialCourses, instructors }: AcademyManagerProps) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [values, setValues] = useState<CourseFormValues>(() => emptyCourse());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  const visibleCourses = courses.filter((course) => {
    const matchesStatus = filter === "all" || (filter === "published" ? course.is_published : !course.is_published);
    const term = search.trim().toLocaleLowerCase();
    const matchesSearch = !term || `${course.title} ${course.slug} ${course.track_category}`.toLocaleLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const openCreate = () => {
    setEditingId(null);
    setValues(emptyCourse());
    setNotice(null);
    setFormOpen(true);
  };

  const openEdit = (course: AdminAcademyCourse) => {
    setEditingId(course.id);
    setValues(courseToForm(course));
    setNotice(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (pending) return;
    setFormOpen(false);
    setEditingId(null);
  };

  const setField = <K extends keyof CourseFormValues>(field: K, value: CourseFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setNotice(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const input: AcademyCourseInput = { ...values };
    startTransition(async () => {
      try {
        const result = editingId
          ? await updateAcademyCourseAction(editingId, input)
          : await createAcademyCourseAction(input);

        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حفظ بيانات المسار" });
          return;
        }

        if (editingId) {
          setCourses((current) => current.map((course) => (
            course.id === editingId ? { ...course, ...input } : course
          )));
        }
        setNotice({ type: "success", text: editingId ? "تم تحديث المسار التعليمي" : "تمت إضافة المسار التعليمي" });
        setFormOpen(false);
        setEditingId(null);
        setValues(emptyCourse());
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حفظ البيانات حالياً. يرجى المحاولة مرة أخرى." });
      }
    });
  };

  const togglePublish = (course: AdminAcademyCourse) => {
    if (pending) return;
    startTransition(async () => {
      try {
        const nextPublished = !course.is_published;
        const result = await setPublishStatusAction("academy_courses", course.id, nextPublished);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر تغيير حالة النشر" });
          return;
        }
        setCourses((current) => current.map((item) => item.id === course.id ? { ...item, is_published: nextPublished } : item));
        setNotice({ type: "success", text: nextPublished ? "تم نشر المسار" : "تم تحويل المسار إلى مسودة" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر تغيير حالة النشر حالياً." });
      }
    });
  };

  const removeCourse = (course: AdminAcademyCourse) => {
    if (pending || !window.confirm(`سيتم حذف «${course.title}» نهائياً. هل تريد المتابعة؟`)) return;
    startTransition(async () => {
      try {
        const result = await deleteAcademyCourseAction(course.id);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حذف المسار" });
          return;
        }
        setCourses((current) => current.filter((item) => item.id !== course.id));
        setNotice({ type: "success", text: "تم حذف المسار التعليمي" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حذف المسار حالياً." });
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-primary">الأكاديمية</p>
          <h1 className="mt-1 text-2xl font-bold font-sans text-brand-espresso">إدارة المسارات التعليمية</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gradscale-400">
            أدِر مسارات الأكاديمية، ترتيب الظهور، وحالات النشر من مساحة واحدة.
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={pending}>
          + إضافة مسار
        </Button>
      </div>

      <Notice notice={notice} />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["إجمالي المسارات", courses.length, "bg-white"],
          ["المنشورة", courses.filter((course) => course.is_published).length, "bg-brand-primary/10"],
          ["المسودات", courses.filter((course) => !course.is_published).length, "bg-brand-secondary/30"],
        ].map(([label, value, className]) => (
          <Card key={String(label)} className={String(className)}>
            <CardContent className="p-5">
              <p className="text-xs font-bold text-gradscale-400">{label}</p>
              <p className="mt-2 text-3xl font-bold text-brand-espresso">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>قائمة المسارات</CardTitle>
            <CardDescription>تظهر المسودات هنا ولا تظهر للزوار حتى يتم نشرها.</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="course-search">البحث في المسارات</label>
            <Input
              id="course-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث بالعنوان أو التصنيف..."
              className="sm:w-56"
            />
            <label className="sr-only" htmlFor="course-status-filter">تصفية حالة النشر</label>
            <select
              id="course-status-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value as StatusFilter)}
              className="h-[48px] rounded-input border border-brand-espresso-subtle bg-white px-3 text-sm text-gradscale-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            >
              <option value="all">كل الحالات</option>
              <option value="published">المنشور فقط</option>
              <option value="draft">المسودات فقط</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {visibleCourses.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-lg font-bold text-brand-espresso">{courses.length === 0 ? "لا توجد مسارات بعد" : "لا توجد نتائج مطابقة"}</p>
              <p className="mt-2 text-sm text-gradscale-400">
                {courses.length === 0 ? "ابدأ بإضافة أول مسار تعليمي إلى الأكاديمية." : "غيّر البحث أو مرشح الحالة لرؤية عناصر أخرى."}
              </p>
              {courses.length === 0 && <Button type="button" size="sm" className="mt-5" onClick={openCreate}>إضافة أول مسار</Button>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المسار</TableHead>
                  <TableHead>التصنيف / المدرب</TableHead>
                  <TableHead>الترتيب</TableHead>
                  <TableHead>النشر</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="min-w-[220px]">
                        <p className="truncate font-bold text-brand-espresso">{course.title}</p>
                        <p className="truncate text-xs text-gradscale-400" dir="ltr">/{course.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-brand-espresso">{course.track_category}</p>
                      <p className="mt-1 text-xs text-gradscale-400">{course.instructor_name || "بدون مدرب"}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm" dir="ltr">{course.display_order}</span>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => togglePublish(course)}
                        disabled={pending}
                        aria-pressed={course.is_published}
                        className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                        title={course.is_published ? "تحويل إلى مسودة" : "نشر المسار"}
                      >
                        <StatusBadge published={course.is_published} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(course)} disabled={pending}>تعديل</Button>
                        <button
                          type="button"
                          onClick={() => removeCourse(course)}
                          disabled={pending}
                          className="rounded-button px-3 py-2 text-xs font-bold text-alert-error hover:bg-alert-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alert-error"
                        >
                          حذف
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {formOpen && (
        <ModalShell
          id="course-form"
          title={editingId ? "تعديل مسار تعليمي" : "إضافة مسار جديد"}
          description="الحقول المعلّمة بنجمة مطلوبة، ويمكن حفظ المسار كمسودة قبل نشره."
        >
          <form onSubmit={handleSubmit} aria-label={editingId ? "نموذج تعديل مسار" : "نموذج إضافة مسار"} className="contents">
            <Field id="course-title" label="عنوان المسار">
              <Input id="course-title" value={values.title} onChange={(event) => setField("title", event.target.value)} required />
            </Field>
            <Field id="course-slug" label="المعرّف المختصر" help="أحرف لاتينية صغيرة وأرقام وشرطات فقط.">
              <Input id="course-slug" dir="ltr" value={values.slug} onChange={(event) => setField("slug", event.target.value)} required />
            </Field>
            <Field id="course-track-category" label="تصنيف المسار">
              <Input id="course-track-category" value={values.track_category} onChange={(event) => setField("track_category", event.target.value)} required />
            </Field>
            <Field id="course-order" label="ترتيب الظهور" help="رقم بين 1 و10.">
              <Input
                id="course-order"
                type="number"
                min="1"
                max="10"
                dir="ltr"
                value={values.display_order}
                onChange={(event) => setField("display_order", Number(event.target.value))}
                required
              />
            </Field>
            <Field id="course-instructor" label="المدرب" required={false} help="اختياري، من قائمة الفنانين المنشورين.">
              <select
                id="course-instructor"
                value={values.instructor_id ?? ""}
                onChange={(event) => setField("instructor_id", event.target.value || null)}
                className="h-[48px] w-full rounded-input border border-brand-espresso-subtle bg-white px-4 text-sm text-gradscale-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
              >
                <option value="">بدون مدرب</option>
                {instructors.map((artist) => (
                  <option key={artist.id} value={artist.id}>{artist.name}</option>
                ))}
              </select>
            </Field>
            <Field id="course-instructor-name" label="اسم المدرب (نص حر)" required={false} help="يُستخدم عند عدم اختيار مدرب من القائمة.">
              <Input id="course-instructor-name" value={values.instructor_name ?? ""} onChange={(event) => setField("instructor_name", event.target.value)} />
            </Field>
            <Field id="course-image" label="رابط صورة المسار" required={false}>
              <Input id="course-image" type="url" dir="ltr" value={values.image_url ?? ""} onChange={(event) => setField("image_url", event.target.value)} />
            </Field>
            <Field id="course-description" label="وصف المسار">
              <Textarea id="course-description" rows={5} className="min-h-[140px]" value={values.description} onChange={(event) => setField("description", event.target.value)} required />
            </Field>
            <div className="flex flex-wrap items-center gap-5 md:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm font-bold text-brand-espresso">
                <input type="checkbox" checked={values.is_published} onChange={(event) => setField("is_published", event.target.checked)} className="h-4 w-4 accent-brand-primary" />
                نشر المسار فوراً
              </label>
            </div>
            <CardFooter className="justify-start md:col-span-2 p-0 pt-2">
              <Button type="submit" isLoading={pending}>{editingId ? "حفظ التعديلات" : "حفظ المسار"}</Button>
              <Button type="button" variant="outline" onClick={closeForm} disabled={pending}>إلغاء</Button>
            </CardFooter>
          </form>
        </ModalShell>
      )}
    </div>
  );
}
