"use client";

// Task 46 — Events CMS form fields.
// NOTE: Events link to /booking?event_id=<uuid>, not /events/[slug].

import type { Artist } from "@/lib/dal/artists";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Field } from "@/components/admin/ManagerKit";
import { EVENT_CATEGORY_LABELS, EVENT_STATUS_LABELS, EVENT_CATEGORIES, EVENT_STATUSES } from "@/lib/types/admin-events";
import type { EventFormValues } from "./EventsTable";

const selectClass =
  "h-[48px] w-full rounded-input border border-brand-espresso-subtle bg-white px-4 text-sm text-gradscale-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15";

export function EventForm({
  values,
  setField,
  artists,
  eventId,
}: {
  values: EventFormValues;
  setField: <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) => void;
  artists: Artist[];
  eventId?: string | null;
}) {
  return (
    <>
      <Field id="event-title" label="عنوان الفعالية">
        <Input id="event-title" value={values.title} onChange={(event) => setField("title", event.target.value)} required />
      </Field>
      <Field id="event-slug" label="المعرّف المختصر" help="أحرف لاتينية صغيرة وأرقام وشرطات فقط.">
        <Input id="event-slug" dir="ltr" value={values.slug} onChange={(event) => setField("slug", event.target.value)} required />
      </Field>
      <Field id="event-category" label="الفئة">
        <select
          id="event-category"
          value={values.category}
          onChange={(event) => setField("category", event.target.value as EventFormValues["category"])}
          className={selectClass}
          required
        >
          {EVENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>{EVENT_CATEGORY_LABELS[category]}</option>
          ))}
        </select>
      </Field>
      <Field id="event-status" label="حالة الفعالية">
        <select
          id="event-status"
          value={values.status}
          onChange={(event) => setField("status", event.target.value as EventFormValues["status"])}
          className={selectClass}
          required
        >
          {EVENT_STATUSES.map((status) => (
            <option key={status} value={status}>{EVENT_STATUS_LABELS[status]}</option>
          ))}
        </select>
      </Field>
      <Field id="event-date" label="تاريخ ووقت الفعالية">
        <Input
          id="event-date"
          type="datetime-local"
          dir="ltr"
          value={values.event_date}
          onChange={(event) => setField("event_date", event.target.value)}
          required
        />
      </Field>
      <Field id="event-order" label="ترتيب الظهور" help="الأرقام الأصغر تظهر أولاً.">
        <Input id="event-order" type="number" min="0" dir="ltr" value={values.display_order} onChange={(event) => setField("display_order", Number(event.target.value))} required />
      </Field>
      <Field id="event-location" label="المكان">
        <Input id="event-location" value={values.location} onChange={(event) => setField("location", event.target.value)} required />
      </Field>
      <Field id="event-city" label="المدينة">
        <Input id="event-city" value={values.city} onChange={(event) => setField("city", event.target.value)} required />
      </Field>
      <Field id="event-performer" label="اسم المؤدي أو الفرقة">
        <Input id="event-performer" value={values.performer_name} onChange={(event) => setField("performer_name", event.target.value)} required />
      </Field>
      <Field id="event-artist" label="ربط بملف فنان" required={false} help="اختياري — يربط الفعالية بملف فنان موجود.">
        <select
          id="event-artist"
          value={values.artist_id ?? ""}
          onChange={(event) => setField("artist_id", event.target.value || null)}
          className={selectClass}
        >
          <option value="">بدون ربط</option>
          {artists.map((artist) => (
            <option key={artist.id} value={artist.id}>{artist.name}</option>
          ))}
        </select>
      </Field>
      <Field id="event-image" label="رابط صورة الفعالية">
        <Input id="event-image" type="url" dir="ltr" value={values.image_url} onChange={(event) => setField("image_url", event.target.value)} required />
      </Field>
      <Field id="event-ticket" label="رابط التذاكر" required={false}>
        <Input id="event-ticket" type="url" dir="ltr" value={values.ticket_url ?? ""} onChange={(event) => setField("ticket_url", event.target.value || null)} />
      </Field>
      <Field id="event-description" label="الوصف" required={false}>
        <Textarea id="event-description" rows={4} value={values.description ?? ""} onChange={(event) => setField("description", event.target.value || null)} />
      </Field>
      {eventId && (
        <Field id="event-booking-link" label="رابط الحجز" required={false} help="رابط للاستخدام في صفحات الحجز الخارجية، انسخه عند الحاجة.">
          <Input id="event-booking-link" readOnly dir="ltr" value={`/booking?event_id=${eventId}`} onFocus={(event) => event.target.select()} />
        </Field>
      )}
      <div className="flex flex-wrap items-center gap-5 md:col-span-2">
        <label className="inline-flex items-center gap-2 text-sm font-bold text-brand-espresso">
          <input type="checkbox" checked={values.is_published} onChange={(event) => setField("is_published", event.target.checked)} className="h-4 w-4 accent-brand-primary" />
          نشر الفعالية فوراً
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-bold text-brand-espresso">
          <input type="checkbox" checked={values.is_featured} onChange={(event) => setField("is_featured", event.target.checked)} className="h-4 w-4 accent-brand-primary" />
          عرض ضمن الفعاليات المميزة
        </label>
      </div>
    </>
  );
}
