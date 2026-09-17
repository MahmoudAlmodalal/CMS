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
import { BilingualField, Field, ModalShell, Notice, StatusBadge, ModalActions } from "@/components/admin/ManagerKit";
import { Dropdown } from "@/components/ui/Dropdown";
import { MediaPickerField } from "@/components/admin/media/MediaPickerField";
import type { AcademyCourseInput, CurriculumItemInput } from "@/lib/validations/cms";
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
    title_en: null,
    slug: "",
    track_category: "",
    track_category_en: null,
    description: "",
    description_en: null,
    instructor_name: "",
    instructor_name_en: null,
    instructor_id: null,
    image_url: "",
    display_order: 1,
    is_published: false,
    // Detail page fields
    price: null,
    price_en: null,
    duration: null,
    duration_en: null,
    group_size: null,
    group_size_en: null,
    certificate: null,
    certificate_en: null,
    language: null,
    language_en: null,
    offer_text: null,
    offer_text_en: null,
    philosophy_text: null,
    philosophy_text_en: null,
    practice_text: null,
    practice_text_en: null,
    curriculum_title: null,
    curriculum_title_en: null,
    curriculum_items: null,
  };
}

function courseToForm(course: AdminAcademyCourse): CourseFormValues {
  return {
    title: course.title,
    title_en: course.title_en ?? null,
    slug: course.slug,
    track_category: course.track_category,
    track_category_en: course.track_category_en ?? null,
    description: course.description,
    description_en: course.description_en ?? null,
    instructor_name: course.instructor_name ?? "",
    instructor_name_en: course.instructor_name_en ?? null,
    instructor_id: course.instructor_id,
    image_url: course.image_url ?? "",
    display_order: course.display_order,
    is_published: course.is_published,
    // Detail page fields
    price: (course as Record<string, unknown>).price as string | null ?? null,
    price_en: (course as Record<string, unknown>).price_en as string | null ?? null,
    duration: (course as Record<string, unknown>).duration as string | null ?? null,
    duration_en: (course as Record<string, unknown>).duration_en as string | null ?? null,
    group_size: (course as Record<string, unknown>).group_size as string | null ?? null,
    group_size_en: (course as Record<string, unknown>).group_size_en as string | null ?? null,
    certificate: (course as Record<string, unknown>).certificate as string | null ?? null,
    certificate_en: (course as Record<string, unknown>).certificate_en as string | null ?? null,
    language: (course as Record<string, unknown>).language as string | null ?? null,
    language_en: (course as Record<string, unknown>).language_en as string | null ?? null,
    offer_text: (course as Record<string, unknown>).offer_text as string | null ?? null,
    offer_text_en: (course as Record<string, unknown>).offer_text_en as string | null ?? null,
    philosophy_text: (course as Record<string, unknown>).philosophy_text as string | null ?? null,
    philosophy_text_en: (course as Record<string, unknown>).philosophy_text_en as string | null ?? null,
    practice_text: (course as Record<string, unknown>).practice_text as string | null ?? null,
    practice_text_en: (course as Record<string, unknown>).practice_text_en as string | null ?? null,
    curriculum_title: (course as Record<string, unknown>).curriculum_title as string | null ?? null,
    curriculum_title_en: (course as Record<string, unknown>).curriculum_title_en as string | null ?? null,
    curriculum_items: ((course as Record<string, unknown>).curriculum_items as CurriculumItemInput[] | null) ?? null,
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
            <Dropdown<StatusFilter>
              id="course-status-filter"
              ariaLabel="تصفية حالة النشر"
              value={filter}
              onChange={(next) => setFilter(next)}
              options={[
                { value: "all", label: "كل الحالات" },
                { value: "published", label: "المنشور فقط" },
                { value: "draft", label: "المسودات فقط" },
              ]}
              className="sm:w-56"
            />
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
                        className="inline-flex min-h-[44px] items-center gap-2 px-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                        title={course.is_published ? "تحويل إلى مسودة" : "نشر المسار"}
                      >
                        <StatusBadge published={course.is_published} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(course)} disabled={pending} className="min-h-[44px]">تعديل</Button>
                        <button
                          type="button"
                          onClick={() => removeCourse(course)}
                          disabled={pending}
                          className="rounded-button min-h-[44px] inline-flex items-center px-3 py-2 text-xs font-bold text-alert-error hover:bg-alert-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alert-error"
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
          onClose={closeForm}
          notice={<Notice notice={notice} />}
        >
          <form onSubmit={handleSubmit} aria-label={editingId ? "نموذج تعديل مسار" : "نموذج إضافة مسار"} className="contents">
            <BilingualField
              id="course-title"
              label="عنوان المسار"
              value={values.title}
              onChange={(value) => setField("title", value)}
              valueEn={values.title_en}
              onChangeEn={(value) => setField("title_en", value)}
            />
            <Field id="course-slug" label="المعرّف المختصر" help="أحرف لاتينية صغيرة وأرقام وشرطات فقط.">
              <Input id="course-slug" dir="ltr" value={values.slug} onChange={(event) => setField("slug", event.target.value)} required />
            </Field>
            <BilingualField
              id="course-track-category"
              label="تصنيف المسار"
              value={values.track_category}
              onChange={(value) => setField("track_category", value)}
              valueEn={values.track_category_en}
              onChangeEn={(value) => setField("track_category_en", value)}
            />
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
              <Dropdown<string>
                id="course-instructor"
                value={values.instructor_id ?? ""}
                onChange={(instructorId) => setField("instructor_id", instructorId || null)}
                options={[
                  { value: "", label: "بدون مدرب" },
                  ...instructors.map((artist) => ({ value: artist.id, label: artist.name })),
                ]}
              />
            </Field>
            <BilingualField
              id="course-instructor-name"
              label="اسم المدرب (نص حر)"
              required={false}
              help="يُستخدم عند عدم اختيار مدرب من القائمة."
              value={values.instructor_name ?? ""}
              onChange={(value) => setField("instructor_name", value)}
              valueEn={values.instructor_name_en}
              onChangeEn={(value) => setField("instructor_name_en", value)}
            />
            <Field id="course-image" label="رابط صورة المسار" required={false}>
              <MediaPickerField
                id="course-image"
                value={values.image_url ?? ""}
                onChange={(url) => setField("image_url", url)}
                bucket="academy"
                folder="tracks"
              />
            </Field>
            <BilingualField
              id="course-description"
              label="وصف المسار"
              multiline
              rows={5}
              className="min-h-[140px]"
              value={values.description}
              onChange={(value) => setField("description", value)}
              valueEn={values.description_en}
              onChangeEn={(value) => setField("description_en", value)}
            />

            {/* ── تفاصيل صفحة المسار ───────────────────────────────── */}
            <div className="md:col-span-2">
              <p className="mb-3 text-sm font-bold text-brand-primary border-b border-brand-primary/20 pb-2">تفاصيل صفحة المسار (اختياري)</p>
            </div>

            {/* Sidebar: price */}
            <Field id="course-price" label="السعر" required={false} help="مثال: ٤٥٠ دولار">
              <Input id="course-price" value={values.price ?? ""} onChange={(event) => setField("price", event.target.value || null)} />
            </Field>
            <Field id="course-price-en" label="Price — English" required={false} help="Optional English price label">
              <Input id="course-price-en" dir="ltr" lang="en" value={values.price_en ?? ""} onChange={(event) => setField("price_en", event.target.value || null)} />
            </Field>

            {/* Sidebar: duration */}
            <Field id="course-duration" label="مدة المسار" required={false} help="مثال: ٢٤ يوماً مكثفاً">
              <Input id="course-duration" value={values.duration ?? ""} onChange={(event) => setField("duration", event.target.value || null)} />
            </Field>
            <Field id="course-duration-en" label="Duration — English" required={false}>
              <Input id="course-duration-en" dir="ltr" lang="en" value={values.duration_en ?? ""} onChange={(event) => setField("duration_en", event.target.value || null)} />
            </Field>

            {/* Sidebar: group_size */}
            <Field id="course-group-size" label="حجم المجموعة" required={false} help="مثال: ٨ مشاركين كحد أقصى">
              <Input id="course-group-size" value={values.group_size ?? ""} onChange={(event) => setField("group_size", event.target.value || null)} />
            </Field>
            <Field id="course-group-size-en" label="Group Size — English" required={false}>
              <Input id="course-group-size-en" dir="ltr" lang="en" value={values.group_size_en ?? ""} onChange={(event) => setField("group_size_en", event.target.value || null)} />
            </Field>

            {/* Sidebar: certificate */}
            <Field id="course-certificate" label="الشهادة" required={false} help="مثال: شهادة إتمام رسمية ✓">
              <Input id="course-certificate" value={values.certificate ?? ""} onChange={(event) => setField("certificate", event.target.value || null)} />
            </Field>
            <Field id="course-certificate-en" label="Certificate — English" required={false}>
              <Input id="course-certificate-en" dir="ltr" lang="en" value={values.certificate_en ?? ""} onChange={(event) => setField("certificate_en", event.target.value || null)} />
            </Field>

            {/* Sidebar: language */}
            <Field id="course-language" label="لغة المسار" required={false} help="مثال: العربية">
              <Input id="course-language" value={values.language ?? ""} onChange={(event) => setField("language", event.target.value || null)} />
            </Field>
            <Field id="course-language-en" label="Language — English" required={false}>
              <Input id="course-language-en" dir="ltr" lang="en" value={values.language_en ?? ""} onChange={(event) => setField("language_en", event.target.value || null)} />
            </Field>

            {/* Body: offer_text */}
            <div className="md:col-span-2">
              <Field id="course-offer-text" label="نص العرض (البانر الداكن)" required={false} help="النص الذي يظهر داخل البانر الداكن أعلى تفاصيل المسار.">
                <Textarea id="course-offer-text" rows={3} className="min-h-[80px]" value={values.offer_text ?? ""} onChange={(event) => setField("offer_text", event.target.value || null)} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field id="course-offer-text-en" label="Offer Text — English" required={false}>
                <Textarea id="course-offer-text-en" dir="ltr" lang="en" rows={3} className="min-h-[80px]" value={values.offer_text_en ?? ""} onChange={(event) => setField("offer_text_en", event.target.value || null)} />
              </Field>
            </div>

            {/* Body: philosophy_text */}
            <div className="md:col-span-2">
              <Field id="course-philosophy" label="نص الفلسفة" required={false}>
                <Textarea id="course-philosophy" rows={3} className="min-h-[80px]" value={values.philosophy_text ?? ""} onChange={(event) => setField("philosophy_text", event.target.value || null)} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field id="course-philosophy-en" label="Philosophy — English" required={false}>
                <Textarea id="course-philosophy-en" dir="ltr" lang="en" rows={3} className="min-h-[80px]" value={values.philosophy_text_en ?? ""} onChange={(event) => setField("philosophy_text_en", event.target.value || null)} />
              </Field>
            </div>

            {/* Body: practice_text */}
            <div className="md:col-span-2">
              <Field id="course-practice" label="نص المتطلبات" required={false}>
                <Textarea id="course-practice" rows={3} className="min-h-[80px]" value={values.practice_text ?? ""} onChange={(event) => setField("practice_text", event.target.value || null)} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field id="course-practice-en" label="Practice / Requirements — English" required={false}>
                <Textarea id="course-practice-en" dir="ltr" lang="en" rows={3} className="min-h-[80px]" value={values.practice_text_en ?? ""} onChange={(event) => setField("practice_text_en", event.target.value || null)} />
              </Field>
            </div>

            {/* Curriculum title */}
            <Field id="course-curriculum-title" label="عنوان المنهج" required={false} help="العنوان الذي يظهر فوق جدول المنهج. مثال: تقسيمة المساق">
              <Input id="course-curriculum-title" value={values.curriculum_title ?? ""} onChange={(event) => setField("curriculum_title", event.target.value || null)} />
            </Field>
            <Field id="course-curriculum-title-en" label="Curriculum Title — English" required={false}>
              <Input id="course-curriculum-title-en" dir="ltr" lang="en" value={values.curriculum_title_en ?? ""} onChange={(event) => setField("curriculum_title_en", event.target.value || null)} />
            </Field>

            <div className="flex flex-wrap items-center gap-5 md:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm font-bold text-brand-espresso">
                <input type="checkbox" checked={values.is_published} onChange={(event) => setField("is_published", event.target.checked)} className="h-4 w-4 accent-brand-primary" />
                نشر المسار فوراً
              </label>
            </div>
            <ModalActions>
              <Button type="submit" isLoading={pending} className="min-h-[44px]">{editingId ? "حفظ التعديلات" : "حفظ المسار"}</Button>
              <Button type="button" variant="outline" onClick={closeForm} disabled={pending} className="min-h-[44px]">إلغاء</Button>
            </ModalActions>
          </form>
        </ModalShell>
      )}
    </div>
  );
}
