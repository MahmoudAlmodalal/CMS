"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createTestimonialAction,
  deleteTestimonialAction,
  setPublishStatusAction,
  updateTestimonialAction,
} from "@/actions/cms";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Textarea } from "@/components/ui/Textarea";
import { Field, ModalShell, Notice, StatusBadge } from "@/components/admin/ManagerKit";
import type { TestimonialInput } from "@/lib/validations/cms";
import type { AdminTestimonial } from "@/lib/dal/admin-testimonials";

type TestimonialFormValues = Omit<TestimonialInput, "id">;
type StatusFilter = "all" | "published" | "draft";

interface TestimonialsManagerProps {
  initialTestimonials: AdminTestimonial[];
}

function emptyTestimonial(): TestimonialFormValues {
  return {
    quote: "",
    author_name: "",
    author_role: "",
    avatar_image_url: "",
    display_order: 0,
    is_published: false,
  };
}

function testimonialToForm(testimonial: AdminTestimonial): TestimonialFormValues {
  return {
    quote: testimonial.quote,
    author_name: testimonial.author_name,
    author_role: testimonial.author_role,
    avatar_image_url: testimonial.avatar_image_url ?? "",
    display_order: testimonial.display_order,
    is_published: testimonial.is_published,
  };
}

export function TestimonialsManager({ initialTestimonials }: TestimonialsManagerProps) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [values, setValues] = useState<TestimonialFormValues>(() => emptyTestimonial());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setTestimonials(initialTestimonials);
  }, [initialTestimonials]);

  const visibleTestimonials = testimonials.filter((testimonial) => {
    const matchesStatus = filter === "all" || (filter === "published" ? testimonial.is_published : !testimonial.is_published);
    const term = search.trim().toLocaleLowerCase();
    const matchesSearch = !term || `${testimonial.author_name} ${testimonial.author_role}`.toLocaleLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const openCreate = () => {
    setEditingId(null);
    setValues(emptyTestimonial());
    setNotice(null);
    setFormOpen(true);
  };

  const openEdit = (testimonial: AdminTestimonial) => {
    setEditingId(testimonial.id);
    setValues(testimonialToForm(testimonial));
    setNotice(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (pending) return;
    setFormOpen(false);
    setEditingId(null);
  };

  const setField = <K extends keyof TestimonialFormValues>(field: K, value: TestimonialFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setNotice(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const input: TestimonialInput = { ...values };
    startTransition(async () => {
      try {
        const result = editingId
          ? await updateTestimonialAction(editingId, input)
          : await createTestimonialAction(input);

        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حفظ بيانات الشهادة" });
          return;
        }

        if (editingId) {
          setTestimonials((current) => current.map((testimonial) => (
            testimonial.id === editingId ? { ...testimonial, ...input } : testimonial
          )));
        }
        setNotice({ type: "success", text: editingId ? "تم تحديث الشهادة" : "تمت إضافة الشهادة" });
        setFormOpen(false);
        setEditingId(null);
        setValues(emptyTestimonial());
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حفظ البيانات حالياً. يرجى المحاولة مرة أخرى." });
      }
    });
  };

  const togglePublish = (testimonial: AdminTestimonial) => {
    if (pending) return;
    startTransition(async () => {
      try {
        const nextPublished = !testimonial.is_published;
        const result = await setPublishStatusAction("testimonials", testimonial.id, nextPublished);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر تغيير حالة النشر" });
          return;
        }
        setTestimonials((current) => current.map((item) => item.id === testimonial.id ? { ...item, is_published: nextPublished } : item));
        setNotice({ type: "success", text: nextPublished ? "تم نشر الشهادة" : "تم تحويل الشهادة إلى مسودة" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر تغيير حالة النشر حالياً." });
      }
    });
  };

  const removeTestimonial = (testimonial: AdminTestimonial) => {
    if (pending || !window.confirm(`سيتم حذف شهادة «${testimonial.author_name}» نهائياً. هل تريد المتابعة؟`)) return;
    startTransition(async () => {
      try {
        const result = await deleteTestimonialAction(testimonial.id);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حذف الشهادة" });
          return;
        }
        setTestimonials((current) => current.filter((item) => item.id !== testimonial.id));
        setNotice({ type: "success", text: "تم حذف الشهادة" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حذف الشهادة حالياً." });
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-primary">المحتوى التسويقي</p>
          <h1 className="mt-1 text-2xl font-bold font-sans text-brand-espresso">إدارة آراء الجمهور والشهادات</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gradscale-400">
            أدِر الشهادات، ترتيب الظهور، وحالات النشر من مساحة واحدة.
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={pending}>
          + إضافة شهادة
        </Button>
      </div>

      <Notice notice={notice} />

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["إجمالي الشهادات", testimonials.length, "bg-white"],
          ["المنشورة", testimonials.filter((testimonial) => testimonial.is_published).length, "bg-brand-primary/10"],
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
            <CardTitle>قائمة الشهادات</CardTitle>
            <CardDescription>تظهر المسودات هنا ولا تظهر للزوار حتى يتم نشرها.</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="testimonial-search">البحث في الشهادات</label>
            <Input
              id="testimonial-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث بالاسم أو الصفة..."
              className="sm:w-56"
            />
            <label className="sr-only" htmlFor="testimonial-status-filter">تصفية حالة النشر</label>
            <select
              id="testimonial-status-filter"
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
          {visibleTestimonials.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-lg font-bold text-brand-espresso">{testimonials.length === 0 ? "لا توجد شهادات بعد" : "لا توجد نتائج مطابقة"}</p>
              <p className="mt-2 text-sm text-gradscale-400">
                {testimonials.length === 0 ? "ابدأ بإضافة أول شهادة إلى الموقع." : "غيّر البحث أو مرشح الحالة لرؤية عناصر أخرى."}
              </p>
              {testimonials.length === 0 && <Button type="button" size="sm" className="mt-5" onClick={openCreate}>إضافة أول شهادة</Button>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>صاحب الشهادة</TableHead>
                  <TableHead>الاقتباس</TableHead>
                  <TableHead>الترتيب</TableHead>
                  <TableHead>النشر</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTestimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell>
                      <div className="flex min-w-[220px] items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-brand-surface">
                          {testimonial.avatar_image_url && (
                            // eslint-disable-next-line @next/next/no-img-element -- media refs may use any approved public host.
                            <img src={testimonial.avatar_image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-brand-espresso">{testimonial.author_name}</p>
                          <p className="truncate text-xs text-gradscale-400">{testimonial.author_role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="line-clamp-2 max-w-[280px] text-sm text-gradscale-400">{testimonial.quote}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm" dir="ltr">{testimonial.display_order}</span>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => togglePublish(testimonial)}
                        disabled={pending}
                        aria-pressed={testimonial.is_published}
                        className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                        title={testimonial.is_published ? "تحويل إلى مسودة" : "نشر الشهادة"}
                      >
                        <StatusBadge published={testimonial.is_published} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(testimonial)} disabled={pending}>تعديل</Button>
                        <button
                          type="button"
                          onClick={() => removeTestimonial(testimonial)}
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
          id="testimonial-form"
          title={editingId ? "تعديل الشهادة" : "إضافة شهادة جديدة"}
          description="الحقول المعلّمة بنجمة مطلوبة."
        >
          <form onSubmit={handleSubmit} aria-label={editingId ? "نموذج تعديل شهادة" : "نموذج إضافة شهادة"} className="contents">
            <Field id="testimonial-author-name" label="اسم صاحب الشهادة">
              <Input id="testimonial-author-name" value={values.author_name} onChange={(event) => setField("author_name", event.target.value)} required />
            </Field>
            <Field id="testimonial-author-role" label="صفة أو مهنة صاحب الشهادة">
              <Input id="testimonial-author-role" value={values.author_role} onChange={(event) => setField("author_role", event.target.value)} required />
            </Field>
            <Field id="testimonial-avatar" label="رابط صورة صاحب الشهادة" required={false}>
              <Input id="testimonial-avatar" type="url" dir="ltr" value={values.avatar_image_url ?? ""} onChange={(event) => setField("avatar_image_url", event.target.value)} />
            </Field>
            <Field id="testimonial-order" label="ترتيب الظهور" help="الأرقام الأصغر تظهر أولاً.">
              <Input id="testimonial-order" type="number" min="0" dir="ltr" value={values.display_order} onChange={(event) => setField("display_order", Number(event.target.value))} required />
            </Field>
            <Field id="testimonial-quote" label="نص الشهادة">
              <Textarea id="testimonial-quote" rows={4} className="min-h-[112px] md:col-span-2" value={values.quote} onChange={(event) => setField("quote", event.target.value)} required />
            </Field>
            <div className="flex flex-wrap items-center gap-5 md:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm font-bold text-brand-espresso">
                <input type="checkbox" checked={values.is_published} onChange={(event) => setField("is_published", event.target.checked)} className="h-4 w-4 accent-brand-primary" />
                نشر الشهادة فوراً
              </label>
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <Button type="submit" isLoading={pending}>{editingId ? "حفظ التعديلات" : "حفظ الشهادة"}</Button>
              <Button type="button" variant="outline" onClick={closeForm} disabled={pending}>إلغاء</Button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
}
