"use client";

// Task 46 — Events CMS Table + Manager Component
// NOTE: Events link to /booking?event_id=<uuid> not /events/[slug].
// There are no public event detail pages.

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createEventAction,
  updateEventAction,
  deleteEventAction,
  setPublishStatusAction,
} from "@/actions/cms";
import type { EventInput } from "@/lib/validations";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Notice, StatusBadge } from "@/components/admin/ManagerKit";
import type { Artist } from "@/lib/dal/artists";
import type { AdminEvent } from "@/lib/types/admin-events";
import { EVENT_CATEGORY_LABELS } from "@/lib/types/admin-events";
import { EventForm } from "./EventForm";

export type EventFormValues = Omit<EventInput, "id" | "event_date"> & { event_date: string };
type StatusFilter = "all" | "published" | "draft";

interface EventsTableProps {
  events: AdminEvent[];
  artists: Artist[];
}

function emptyEvent(): EventFormValues {
  return {
    title: "",
    slug: "",
    category: "concert",
    event_date: "",
    location: "",
    city: "",
    performer_name: "",
    artist_id: null,
    description: null,
    image_url: "",
    ticket_url: null,
    is_featured: false,
    status: "upcoming",
    is_published: true,
    display_order: 0,
  };
}

// datetime-local inputs need "YYYY-MM-DDTHH:mm"; ISO strings carry seconds/timezone.
function toLocalInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function eventToForm(event: AdminEvent): EventFormValues {
  return {
    title: event.title,
    slug: event.slug,
    category: event.category,
    event_date: toLocalInput(event.event_date),
    location: event.location,
    city: event.city,
    performer_name: event.performer_name,
    artist_id: event.artist_id,
    description: event.description,
    image_url: event.image_url,
    ticket_url: event.ticket_url,
    is_featured: event.is_featured,
    status: event.status,
    is_published: event.is_published,
    display_order: event.display_order,
  };
}

export function EventsTable({ events: initialEvents, artists }: EventsTableProps) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [values, setValues] = useState<EventFormValues>(() => emptyEvent());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const visibleEvents = events.filter((event) => {
    const matchesStatus = filter === "all" || (filter === "published" ? event.is_published : !event.is_published);
    const term = search.trim().toLocaleLowerCase();
    const matchesSearch = !term || `${event.title} ${event.slug} ${event.city} ${event.performer_name}`.toLocaleLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const openCreate = () => {
    setEditingId(null);
    setValues(emptyEvent());
    setNotice(null);
    setFormOpen(true);
  };

  const openEdit = (event: AdminEvent) => {
    setEditingId(event.id);
    setValues(eventToForm(event));
    setNotice(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (pending) return;
    setFormOpen(false);
    setEditingId(null);
  };

  const setField = <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setNotice(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const eventDateIso = new Date(values.event_date).toISOString();
    if (Number.isNaN(new Date(values.event_date).getTime())) {
      setNotice({ type: "error", text: "تاريخ الفعالية غير صالح" });
      return;
    }
    const input: EventInput = { ...values, event_date: eventDateIso };

    startTransition(async () => {
      try {
        const result = editingId
          ? await updateEventAction(editingId, input)
          : await createEventAction(input);

        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حفظ بيانات الفعالية" });
          return;
        }

        setNotice({ type: "success", text: editingId ? "تم تحديث بيانات الفعالية" : "تمت إضافة الفعالية" });
        setFormOpen(false);
        setEditingId(null);
        setValues(emptyEvent());
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حفظ البيانات حالياً. يرجى المحاولة مرة أخرى." });
      }
    });
  };

  const togglePublish = (event: AdminEvent) => {
    if (pending) return;
    startTransition(async () => {
      try {
        const nextPublished = !event.is_published;
        const result = await setPublishStatusAction("events", event.id, nextPublished);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر تغيير حالة النشر" });
          return;
        }
        setEvents((current) => current.map((item) => item.id === event.id ? { ...item, is_published: nextPublished } : item));
        setNotice({ type: "success", text: nextPublished ? "تم نشر الفعالية" : "تم تحويل الفعالية إلى مسودة" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر تغيير حالة النشر حالياً." });
      }
    });
  };

  const toggleFeatured = (event: AdminEvent) => {
    if (pending) return;
    startTransition(async () => {
      try {
        const nextFeatured = !event.is_featured;
        const result = await updateEventAction(event.id, { is_featured: nextFeatured });
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر تغيير حالة التمييز" });
          return;
        }
        setEvents((current) => current.map((item) => item.id === event.id ? { ...item, is_featured: nextFeatured } : item));
        setNotice({ type: "success", text: nextFeatured ? "تم تمييز الفعالية" : "تم إلغاء تمييز الفعالية" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر تغيير حالة التمييز حالياً." });
      }
    });
  };

  const removeEvent = (event: AdminEvent) => {
    if (pending || !window.confirm(`سيتم حذف «${event.title}» نهائياً. هل تريد المتابعة؟`)) return;
    startTransition(async () => {
      try {
        const result = await deleteEventAction(event.id);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حذف الفعالية" });
          return;
        }
        setEvents((current) => current.filter((item) => item.id !== event.id));
        setNotice({ type: "success", text: "تم حذف الفعالية" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حذف الفعالية حالياً." });
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-primary">المحتوى الفني</p>
          <h1 className="mt-1 text-2xl font-bold font-sans text-brand-espresso">إدارة الفعاليات والحفلات</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gradscale-400">
            أدِر الفعاليات وارتباطها بالفنانين وحالات النشر والتمييز من مساحة واحدة.
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={pending}>
          + إضافة فعالية
        </Button>
      </div>

      <Notice notice={notice} />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["إجمالي الفعاليات", events.length, "bg-white"],
          ["المنشورة", events.filter((event) => event.is_published).length, "bg-brand-primary/10"],
          ["المميزة", events.filter((event) => event.is_featured).length, "bg-brand-secondary/30"],
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
            <CardTitle>قائمة الفعاليات</CardTitle>
            <CardDescription>تظهر المسودات هنا ولا تظهر للزوار حتى يتم نشرها.</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="event-search">البحث في الفعاليات</label>
            <Input
              id="event-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث بالعنوان أو المدينة..."
              className="sm:w-56"
            />
            <label className="sr-only" htmlFor="event-status-filter">تصفية حالة النشر</label>
            <select
              id="event-status-filter"
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
          {visibleEvents.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-lg font-bold text-brand-espresso">{events.length === 0 ? "لا توجد فعاليات بعد" : "لا توجد نتائج مطابقة"}</p>
              <p className="mt-2 text-sm text-gradscale-400">
                {events.length === 0 ? "ابدأ بإضافة أول فعالية إلى الموقع." : "غيّر البحث أو مرشح الحالة لرؤية عناصر أخرى."}
              </p>
              {events.length === 0 && <Button type="button" size="sm" className="mt-5" onClick={openCreate}>إضافة أول فعالية</Button>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الفعالية</TableHead>
                  <TableHead>الفئة / المدينة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>رابط الحجز</TableHead>
                  <TableHead>النشر</TableHead>
                  <TableHead>الواجهة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="min-w-[220px]">
                        <p className="truncate font-bold text-brand-espresso">{event.title}</p>
                        <p className="truncate text-xs text-gradscale-400">{event.performer_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-brand-espresso">{EVENT_CATEGORY_LABELS[event.category]}</p>
                      <p className="mt-1 text-xs text-gradscale-400">{event.city}</p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm" dir="ltr">{new Date(event.event_date).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}</span>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(`/booking?event_id=${event.id}`)}
                        className="rounded-lg px-2 py-1 font-mono text-xs text-brand-primary underline decoration-dotted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                        dir="ltr"
                        title="نسخ رابط الحجز"
                      >
                        /booking?event_id=…
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => togglePublish(event)}
                        disabled={pending}
                        aria-pressed={event.is_published}
                        className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                        title={event.is_published ? "تحويل إلى مسودة" : "نشر الفعالية"}
                      >
                        <StatusBadge published={event.is_published} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => toggleFeatured(event)}
                        disabled={pending}
                        aria-pressed={event.is_featured}
                        className={event.is_featured
                          ? "rounded-lg px-2 py-1 text-sm font-bold text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                          : "rounded-lg px-2 py-1 text-sm font-bold text-gradscale-400 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"}
                      >
                        {event.is_featured ? "★ مميز" : "☆ تمييز"}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(event)} disabled={pending}>تعديل</Button>
                        <button
                          type="button"
                          onClick={() => removeEvent(event)}
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
        <Card variant="primary-border" id="event-form">
          <CardHeader>
            <CardTitle>{editingId ? "تعديل الفعالية" : "إضافة فعالية جديدة"}</CardTitle>
            <CardDescription>الحقول المعلّمة بنجمة مطلوبة، ويمكن حفظ الفعالية كمسودة قبل نشرها.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} aria-label={editingId ? "نموذج تعديل فعالية" : "نموذج إضافة فعالية"}>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <EventForm values={values} setField={setField} artists={artists} eventId={editingId} />
            </CardContent>
            <CardFooter className="justify-start">
              <Button type="submit" isLoading={pending}>{editingId ? "حفظ التعديلات" : "حفظ الفعالية"}</Button>
              <Button type="button" variant="outline" onClick={closeForm} disabled={pending}>إلغاء</Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
