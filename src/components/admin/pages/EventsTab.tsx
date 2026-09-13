"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { MediaPickerField } from "@/components/admin/media/MediaPickerField";
import {
  BilingualPair,
  type SiteSettingsFormValues,
  type TextFieldName,
} from "./settingsFormKit";

export interface EventsTabProps {
  values: SiteSettingsFormValues;
  setField: (field: TextFieldName, value: string) => void;
  summary: {
    publishedCount: number;
    featuredEventTitle: string | null;
  };
}

export function EventsTab({ values, setField, summary }: EventsTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Summary Card */}
      <Card variant="surface" className="border-brand-primary/20 bg-brand-sand/30">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-brand-espresso">ملخص قسم الفعاليات</CardTitle>
              <CardDescription>إحصائيات الفعاليات المسجلة في النظام ورابط الإدارة المباشرة.</CardDescription>
            </div>
            <Link
              href="/admin/events"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
            >
              <span>الانتقال إلى جدول الفعاليات</span>
              <span aria-hidden="true">←</span>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-white p-4">
              <p className="text-xs font-medium text-brand-espresso/60">الفعاليات المنشورة</p>
              <p className="mt-1 text-2xl font-bold text-brand-espresso">{summary.publishedCount}</p>
            </div>
            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-white p-4">
              <p className="text-xs font-medium text-brand-espresso/60">الفعالية المميزة الحالية</p>
              <p className="mt-1 truncate text-base font-bold text-brand-espresso">
                {summary.featuredEventTitle || "لا توجد فعالية مميزة حالياً"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Events Page Content Overrides */}
      <Card>
        <CardHeader>
          <CardTitle>واجهة صفحة الفعاليات (/events)</CardTitle>
          <CardDescription>تخصيص عنوان الصفحة، العنوان الفرعي، صورة الهيرو، وتسمية مرشح الكل. اترك أي حقل فارغاً لاستخدام النص الافتراضي.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="events_title"
            label="عنوان صفحة الفعاليات"
            multiline
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <BilingualPair
            id="events_filter_all_label"
            label="تسمية زر تصفية 'الكل'"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <div className="md:col-span-2">
            <BilingualPair
              id="events_subtitle"
              label="العنوان الفرعي لصفحة الفعاليات"
              multiline
              values={values}
              onChange={setField}
              helpText="اتركه فارغاً لاستخدام النص الافتراضي."
            />
          </div>
          <div className="space-y-2 text-start md:col-span-2">
            <MediaPickerField
              id="events_hero_image_url"
              label="صورة صفحة الفعاليات"
              value={values.events_hero_image_url}
              onChange={(url) => setField("events_hero_image_url", url)}
            />
            <p className="text-xs text-brand-espresso/60">اتركه فارغاً لاستخدام الصورة الافتراضية.</p>
          </div>
        </CardContent>
      </Card>

      {/* 3. SEO Events */}
      <Card>
        <CardHeader>
          <CardTitle>تحسين محركات البحث للفعاليات (SEO)</CardTitle>
          <CardDescription>عنوان ووصف صفحة الفعاليات لمحركات البحث ومشاركات الروابط. اترك أي حقل فارغاً لاستخدام النص الافتراضي.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="seo_events_title"
            label="عنوان SEO للفعاليات"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <div className="md:col-span-2">
            <BilingualPair
              id="seo_events_description"
              label="وصف SEO للفعاليات"
              multiline
              values={values}
              onChange={setField}
              helpText="اتركه فارغاً لاستخدام النص الافتراضي."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
