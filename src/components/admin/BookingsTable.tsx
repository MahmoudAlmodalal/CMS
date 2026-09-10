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
                        <select
                          id={`booking-status-${booking.id}`}
                          value={booking.status}
                          disabled={pending}
                          onChange={(event) => changeStatus(booking, event.target.value as BookingStatus)}
                          className="h-[40px] rounded-input border border-brand-espresso-subtle bg-white px-3 text-sm text-gradscale-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>{STATUS_LABELS[status as string]}</option>
                          ))}
                        </select>
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
                        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => saveNotes(booking)}>
                          حفظ الملاحظات
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
