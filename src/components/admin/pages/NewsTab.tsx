"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  BilingualPair,
  type SiteSettingsFormValues,
  type TextFieldName,
} from "./settingsFormKit";

export interface NewsTabProps {
  values: SiteSettingsFormValues;
  setField: (field: TextFieldName, value: string) => void;
  summary: {
    publishedCount: number;
    featuredCount: number;
  };
}

export function NewsTab({ values, setField, summary }: NewsTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Summary Card */}
      <Card variant="surface" className="border-brand-primary/20 bg-brand-sand/30">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-brand-espresso">ملخص قسم المقالات والأخبار</CardTitle>
              <CardDescription>إحصائيات النشر والتحكم في ظهور المقالات في الواجهة.</CardDescription>
            </div>
            <Link
              href="/admin/articles"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
            >
              <span>الانتقال إلى إدارة المقالات</span>
              <span aria-hidden="true">←</span>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-white p-4">
              <p className="text-xs font-medium text-brand-espresso/60">المقالات المنشورة</p>
              <p className="mt-1 text-2xl font-bold text-brand-espresso">{summary.publishedCount}</p>
            </div>
            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-white p-4">
              <p className="text-xs font-medium text-brand-espresso/60">المقالات المميزة</p>
              <p className="mt-1 text-2xl font-bold text-brand-espresso">{summary.featuredCount}</p>
            </div>
          </div>
          <p className="rounded-lg bg-white/80 p-3 text-xs leading-relaxed text-brand-espresso/80 border border-brand-espresso-subtle/30">
            المقالات المميزة تتحكم في البطل وشبكة البطاقات الثلاث
          </p>
        </CardContent>
      </Card>

      {/* 2. News Page Content Overrides */}
      <Card>
        <CardHeader>
          <CardTitle>واجهة صفحة الأخبار (/news)</CardTitle>
          <CardDescription>تخصيص شارة العنوان، العنوان الرئيسي، والعنوان الفرعي لصفحة الأخبار. اترك أي حقل فارغاً لاستخدام النص الافتراضي.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="news_kicker"
            label="الشارة العلوية لصفحة الأخبار"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <BilingualPair
            id="news_title"
            label="عنوان صفحة الأخبار"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <div className="md:col-span-2">
            <BilingualPair
              id="news_subtitle"
              label="العنوان الفرعي لصفحة الأخبار"
              multiline
              values={values}
              onChange={setField}
              helpText="اتركه فارغاً لاستخدام النص الافتراضي."
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. SEO News */}
      <Card>
        <CardHeader>
          <CardTitle>تحسين محركات البحث للأخبار (SEO)</CardTitle>
          <CardDescription>عنوان ووصف صفحة الأخبار لمحركات البحث ومشاركات الروابط. اترك أي حقل فارغاً لاستخدام النص الافتراضي.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="seo_news_title"
            label="عنوان SEO للأخبار"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <div className="md:col-span-2">
            <BilingualPair
              id="seo_news_description"
              label="وصف SEO للأخبار"
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
