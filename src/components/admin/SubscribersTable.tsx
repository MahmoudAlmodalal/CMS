"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSubscriberAction } from "@/actions/cms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { StatusBadge, Notice } from "@/components/admin/ManagerKit";
import type { NewsletterSubscriberRow } from "@/lib/dal/bookings";

interface SubscribersTableProps {
  initialSubscribers: NewsletterSubscriberRow[];
}

export function SubscribersTable({ initialSubscribers }: SubscribersTableProps) {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setSubscribers(initialSubscribers);
  }, [initialSubscribers]);

  const toggleStatus = (subscriber: NewsletterSubscriberRow) => {
    if (pending) return;
    const nextStatus = subscriber.status === "subscribed" ? "unsubscribed" : "subscribed";
    startTransition(async () => {
      try {
        const result = await updateSubscriberAction(subscriber.id, { status: nextStatus });
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر تحديث حالة الاشتراك" });
          return;
        }
        setSubscribers((current) => current.map((item) => (item.id === subscriber.id ? { ...item, status: nextStatus } : item)));
        setNotice({ type: "success", text: nextStatus === "subscribed" ? "تم إعادة تفعيل الاشتراك" : "تم إلغاء الاشتراك" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر تحديث حالة الاشتراك حالياً." });
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <p className="text-sm font-bold text-brand-primary">النشرة البريدية</p>
        <h1 className="mt-1 text-2xl font-bold font-sans text-brand-espresso">إدارة المشتركين في النشرة البريدية</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gradscale-400">
          راجع المشتركين وحالة اشتراكهم.
        </p>
      </div>

      <Notice notice={notice} />

      <Card>
        <CardHeader>
          <CardTitle>قائمة المشتركين</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {subscribers.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-lg font-bold text-brand-espresso">لا يوجد مشتركون بعد</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <p className="font-medium text-brand-espresso" dir="ltr">{subscriber.email}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge published={subscriber.status === "subscribed"} labels={["مشترك", "ملغى"]} />
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => toggleStatus(subscriber)}
                        disabled={pending}
                        className="rounded-button px-3 py-2 text-xs font-bold text-brand-primary hover:bg-brand-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                      >
                        {subscriber.status === "subscribed" ? "إلغاء الاشتراك" : "إعادة تفعيل الاشتراك"}
                      </button>
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
