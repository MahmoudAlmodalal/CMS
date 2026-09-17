"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBookingRequestAction } from "@/actions/cms";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Textarea } from "@/components/ui/Textarea";
import { Notice, Field } from "@/components/admin/ManagerKit";
import { Dropdown } from "@/components/ui/Dropdown";
import type { BookingRequestRow } from "@/lib/dal/bookings";
import type { AdminBookingUpdate } from "@/lib/validations";

type BookingStatus = Exclude<AdminBookingUpdate["status"], undefined>;

const STATUSES: BookingStatus[] = ["pending", "contacted", "confirmed", "archived"];

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  contacted: "تم التواصل",
  confirmed: "مؤكد",
  archived: "مؤرشف",
};

interface BookingsTableProps {
  initialBookings: BookingRequestRow[];
}

export function BookingsTable({ initialBookings }: BookingsTableProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  const changeStatus = (booking: BookingRequestRow, status: BookingStatus) => {
    if (pending) return;
    startTransition(async () => {
      try {
        const result = await updateBookingRequestAction(booking.id, { status });
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر تحديث حالة الحجز" });
          return;
        }
        setBookings((current) => current.map((item) => (item.id === booking.id ? { ...item, status } : item)));
        setNotice({ type: "success", text: "تم تحديث حالة طلب الحجز" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر تحديث حالة الحجز حالياً." });
      }
    });
  };

  const saveNotes = (booking: BookingRequestRow) => {
    if (pending) return;
    const admin_notes = notesDraft[booking.id] ?? booking.admin_notes ?? "";
    startTransition(async () => {
      try {
        const result = await updateBookingRequestAction(booking.id, { admin_notes });
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حفظ الملاحظات" });
          return;
        }
        setBookings((current) => current.map((item) => (item.id === booking.id ? { ...item, admin_notes } : item)));
        setNotice({ type: "success", text: "تم حفظ الملاحظات الداخلية" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حفظ الملاحظات حالياً." });
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <p className="text-sm font-bold text-brand-primary">طلبات العملاء</p>
        <h1 className="mt-1 text-2xl font-bold font-sans text-brand-espresso">إدارة طلبات الحجز</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gradscale-400">
          تابع طلبات الحجز، حدّث حالتها، وسجّل ملاحظات داخلية للفريق.
        </p>
      </div>

      <Notice notice={notice} />

      <Card>
        <CardHeader>
          <CardTitle>قائمة طلبات الحجز</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-lg font-bold text-brand-espresso">لا توجد طلبات حجز بعد</p>
            </div>
          ) : (
            <>
              {/* Mobile Stacked Card View (<640px) */}
              <div className="block sm:hidden divide-y divide-brand-surface/60">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-4 space-y-4">
                    {/* Header with requester and status */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-base text-brand-espresso">{booking.full_name}</p>
                        <p className="text-xs text-gradscale-400 mt-0.5" dir="ltr">{booking.email}</p>
                        {booking.phone && (
                          <p className="text-xs text-gradscale-400" dir="ltr">{booking.phone}</p>
                        )}
                      </div>
                      <Badge size="sm">{STATUS_LABELS[booking.status] ?? booking.status}</Badge>
                    </div>

                    {/* Event details */}
                    <div className="rounded-xl bg-brand-surface/30 p-3 text-xs space-y-1.5 border border-brand-surface/50">
                      <div className="flex justify-between">
                        <span className="text-gradscale-400 font-medium">نوع الفعالية:</span>
                        <span className="font-semibold text-brand-espresso">{booking.event_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gradscale-400 font-medium">تاريخ الفعالية:</span>
                        <span className="font-medium text-brand-espresso" dir="ltr">{booking.event_date}</span>
                      </div>
                    </div>

                    {/* Status dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-espresso" htmlFor={`mobile-booking-status-${booking.id}`}>
                        تحديث الحالة:
                      </label>
                      <Dropdown<BookingStatus>
                        id={`mobile-booking-status-${booking.id}`}
                        ariaLabel="حالة طلب الحجز"
                        value={booking.status}
                        disabled={pending}
                        onChange={(status) => changeStatus(booking, status)}
                        options={STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status as string] }))}
                        size="sm"
                        className="w-full"
                      />
                    </div>

                    {/* Admin notes & save action */}
                    <div className="space-y-2 pt-1">
                      <Field id={`mobile-booking-notes-${booking.id}`} label="ملاحظات إدارية" required={false}>
                        <Textarea
                          id={`mobile-booking-notes-${booking.id}`}
                          rows={2}
                          value={notesDraft[booking.id] ?? booking.admin_notes ?? ""}
                          onChange={(event) => setNotesDraft((current) => ({ ...current, [booking.id]: event.target.value }))}
                          placeholder="ملاحظات داخلية للفريق..."
                        />
                      </Field>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() => saveNotes(booking)}
                        className="w-full min-h-[44px]"
                      >
                        حفظ الملاحظات
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tablet & Desktop Horizontal Scrolling Table (>=640px) */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>مقدّم الطلب</TableHead>
                      <TableHead>الفعالية</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>ملاحظات داخلية</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="min-w-[200px]">
                            <p className="font-bold text-brand-espresso">{booking.full_name}</p>
                            <p className="text-xs text-gradscale-400" dir="ltr">{booking.email}</p>
                            {booking.phone && <p className="text-xs text-gradscale-400" dir="ltr">{booking.phone}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-brand-espresso">{booking.event_type}</p>
                          <p className="mt-1 text-xs text-gradscale-400" dir="ltr">{booking.event_date}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex min-w-[160px] items-center gap-2">
                            <Badge size="sm">{STATUS_LABELS[booking.status] ?? booking.status}</Badge>
                            <label className="sr-only" htmlFor={`booking-status-${booking.id}`}>حالة طلب الحجز</label>
                            <Dropdown<BookingStatus>
                              id={`booking-status-${booking.id}`}
                              ariaLabel="حالة طلب الحجز"
                              value={booking.status}
                              disabled={pending}
                              onChange={(status) => changeStatus(booking, status)}
                              options={STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status as string] }))}
                              size="sm"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[260px] space-y-2">
                            <Field id={`booking-notes-${booking.id}`} label="ملاحظات إدارية" required={false}>
                              <Textarea
                                id={`booking-notes-${booking.id}`}
                                rows={2}
                                value={notesDraft[booking.id] ?? booking.admin_notes ?? ""}
                                onChange={(event) => setNotesDraft((current) => ({ ...current, [booking.id]: event.target.value }))}
                              />
                            </Field>
                            <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => saveNotes(booking)} className="min-h-[44px]">
                              حفظ الملاحظات
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
