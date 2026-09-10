"use client";

// Task 46 — Events CMS Table Component
// NOTE: Events link to /booking?event_id=<uuid> not /events/[slug].
// There are no public event detail pages.

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  togglePublishAction,
  toggleFeaturedAction,
  deleteEventAction,
} from "@/actions/admin-events";
import type { AdminEvent } from "@/lib/types/admin-events";
import { EVENT_CATEGORY_LABELS } from "@/lib/types/admin-events";

interface EventsTableProps {
  events: AdminEvent[];
}

function CategoryBadge({ category }: { category: AdminEvent["category"] }) {
  const label = EVENT_CATEGORY_LABELS[category] || category;
  const colorMap: Record<string, string> = {
    concert: "bg-brand-gold/20 text-brand-espresso",
    festival: "bg-brand-terracotta/20 text-brand-terracotta",
    evening: "bg-blue-100 text-blue-800",
    workshop: "bg-green-100 text-green-800",
  };
  const cls = colorMap[category] ?? "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-sans ${cls}`}
    >
      {label}
    </span>
  );
}

function ToggleButton({
  active,
  onToggle,
  activeLabel,
  inactiveLabel,
  pending,
}: {
  active: boolean;
  onToggle: () => void;
  activeLabel: string;
  inactiveLabel: string;
  pending: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-label={active ? activeLabel : inactiveLabel}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold/50 disabled:opacity-50 cursor-pointer ${
        active ? "bg-brand-gold" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${
          active ? "translate-x-1" : "translate-x-4.5"
        }`}
      />
    </button>
  );
}

export function EventsTable({ events }: EventsTableProps) {
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function showNotice(type: "success" | "error", message: string) {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 3000);
  }

  function handleTogglePublish(event: AdminEvent) {
    startTransition(async () => {
      const res = await togglePublishAction(event.id, event.is_published);
      if (res.ok) {
        showNotice(
          "success",
          event.is_published ? "تم إلغاء نشر الفعالية" : "تم نشر الفعالية بنجاح"
        );
      } else {
        showNotice("error", res.error || "حدث خطأ");
      }
    });
  }

  function handleToggleFeatured(event: AdminEvent) {
    startTransition(async () => {
      const res = await toggleFeaturedAction(event.id, event.is_featured);
      if (res.ok) {
        showNotice(
          "success",
          event.is_featured ? "تم إلغاء تمييز الفعالية" : "تم تمييز الفعالية"
        );
      } else {
        showNotice("error", res.error || "حدث خطأ");
      }
    });
  }

  function handleDelete(event: AdminEvent) {
    if (!window.confirm(`هل أنت متأكد من حذف "${event.title}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteEventAction(event.id);
      if (res.ok) {
        showNotice("success", "تم حذف الفعالية بنجاح");
      } else {
        showNotice("error", res.error || "تعذر حذف الفعالية");
      }
    });
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  if (events.length === 0) {
    return (
      <div
        className="py-12 text-center text-brand-espresso/50 font-sans"
        dir="rtl"
      >
        لا توجد فعاليات حتى الآن. ابدأ بإضافة فعالية جديدة.
      </div>
    );
  }

  return (
    <div dir="rtl">
      {/* Notice Banner */}
      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`mb-4 px-4 py-3 rounded-lg text-sm font-sans ${
            notice.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {notice.message}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-brand-espresso-subtle/40 bg-white shadow-2xs">
        <table className="min-w-full divide-y divide-brand-espresso-subtle/30">
          <thead className="bg-brand-surface">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-semibold text-brand-espresso/60 uppercase tracking-wide font-sans w-14">
                صورة
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-brand-espresso/60 uppercase tracking-wide font-sans">
                الفعالية
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-brand-espresso/60 uppercase tracking-wide font-sans">
                الفئة
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-brand-espresso/60 uppercase tracking-wide font-sans">
                التاريخ
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-brand-espresso/60 uppercase tracking-wide font-sans">
                المدينة
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-brand-espresso/60 uppercase tracking-wide font-sans">
                منشور
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-brand-espresso/60 uppercase tracking-wide font-sans">
                مميز
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-brand-espresso/60 uppercase tracking-wide font-sans">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-espresso-subtle/20">
            {events.map((event) => (
              <tr
                key={event.id}
                className="hover:bg-brand-surface/50 transition-colors"
              >
                {/* Image Thumbnail */}
                <td className="px-4 py-3">
                  {event.image_url ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-brand-surface border border-brand-espresso-subtle/20 shrink-0">
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-brand-surface border border-brand-espresso-subtle/20 flex items-center justify-center">
                      <span className="text-xs text-brand-espresso/30">—</span>
                    </div>
                  )}
                </td>

                {/* Title */}
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-brand-espresso font-sans line-clamp-1">
                    {event.title}
                  </p>
                  {event.performer_name && (
                    <p className="text-xs text-brand-espresso/50 font-sans">
                      {event.performer_name}
                    </p>
                  )}
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  <CategoryBadge category={event.category} />
                </td>

                {/* Event Date */}
                <td className="px-4 py-3">
                  <span className="text-sm text-brand-espresso/70 font-sans" dir="ltr">
                    {formatDate(event.event_date)}
                  </span>
                </td>

                {/* City */}
                <td className="px-4 py-3">
                  <span className="text-sm text-brand-espresso/70 font-sans">
                    {event.city}
                  </span>
                </td>

                {/* is_published toggle */}
                <td className="px-4 py-3">
                  <ToggleButton
                    active={event.is_published}
                    onToggle={() => handleTogglePublish(event)}
                    activeLabel="إلغاء نشر الفعالية"
                    inactiveLabel="نشر الفعالية"
                    pending={isPending}
                  />
                </td>

                {/* is_featured toggle */}
                <td className="px-4 py-3">
                  <ToggleButton
                    active={event.is_featured}
                    onToggle={() => handleToggleFeatured(event)}
                    activeLabel="إلغاء تمييز الفعالية"
                    inactiveLabel="تمييز الفعالية"
                    pending={isPending}
                  />
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="text-xs font-medium text-brand-gold hover:text-brand-gold/80 font-sans transition-colors"
                    >
                      تعديل
                    </Link>
                    <span className="text-brand-espresso/20">|</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(event)}
                      disabled={isPending}
                      className="text-xs font-medium text-red-500 hover:text-red-700 font-sans transition-colors disabled:opacity-50 cursor-pointer"
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
    </div>
  );
}
