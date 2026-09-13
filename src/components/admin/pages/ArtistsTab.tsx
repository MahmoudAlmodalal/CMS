"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { MediaPickerField } from "@/components/admin/media/MediaPickerField";
import {
  BilingualPair,
  type SiteSettingsFormValues,
  type TextFieldName,
} from "./settingsFormKit";

export interface ArtistsTabProps {
  values: SiteSettingsFormValues;
  setField: (field: TextFieldName, value: string) => void;
  summary: {
    publishedCount: number;
    featuredCount: number;
  };
}

export function ArtistsTab({ values, setField, summary }: ArtistsTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Summary Card */}
      <Card variant="surface" className="border-brand-primary/20 bg-brand-sand/30">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-brand-espresso">ملخص قسم الفنانين</CardTitle>
              <CardDescription>إحصائيات الفنانين المسجلين وروابط التحكم في العرض والترتيب.</CardDescription>
            </div>
            <Link
              href="/admin/artists"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
            >
              <span>الانتقال إلى دليل الفنانين</span>
              <span aria-hidden="true">←</span>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-white p-4">
              <p className="text-xs font-medium text-brand-espresso/60">الفنانون المنشورون</p>
              <p className="mt-1 text-2xl font-bold text-brand-espresso">{summary.publishedCount}</p>
            </div>
            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-white p-4">
              <p className="text-xs font-medium text-brand-espresso/60">الفنانون المميزون</p>
              <p className="mt-1 text-2xl font-bold text-brand-espresso">{summary.featuredCount}</p>
            </div>
          </div>
          <p className="rounded-lg bg-white/80 p-3 text-xs leading-relaxed text-brand-espresso/80 border border-brand-espresso-subtle/30">
            المميز وترتيب العرض يتحكمان في شريط الرئيسية والدليل
          </p>
        </CardContent>
      </Card>

      {/* 2. Artists Page Content Overrides */}
      <Card>
        <CardHeader>
          <CardTitle>واجهة صفحة الفنانين (/artists)</CardTitle>
          <CardDescription>تخصيص عنوان الصفحة، العنوان الفرعي، صورة الهيرو، وتسمية مرشح الكل. اترك أي حقل فارغاً لاستخدام النص الافتراضي.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="artists_title"
            label="عنوان صفحة الفنانين"
            multiline
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <BilingualPair
            id="artists_filter_all_label"
            label="تسمية زر تصفية 'الكل'"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <div className="md:col-span-2">
            <BilingualPair
              id="artists_subtitle"
              label="العنوان الفرعي لصفحة الفنانين"
              multiline
              values={values}
              onChange={setField}
              helpText="اتركه فارغاً لاستخدام النص الافتراضي."
            />
          </div>
          <div className="space-y-2 text-start md:col-span-2">
            <MediaPickerField
              id="artists_hero_image_url"
              label="صورة صفحة الفنانين"
              value={values.artists_hero_image_url}
              onChange={(url) => setField("artists_hero_image_url", url)}
            />
            <p className="text-xs text-brand-espresso/60">اتركه فارغاً لاستخدام الصورة الافتراضية.</p>
          </div>
          <div className="space-y-2 text-start md:col-span-2">
            <MediaPickerField
              id="artist_hero_image_url"
              label="صورة خلفية صفحة الفنان (/artists/…)"
              value={values.artist_hero_image_url}
              onChange={(url) => setField("artist_hero_image_url", url)}
            />
            <p className="text-xs text-brand-espresso/60">تظهر خلف اسم كل فنان. اتركه فارغاً لاستخدام الصورة الافتراضية.</p>
          </div>
        </CardContent>
      </Card>

      {/* 3. SEO Artists */}
      <Card>
        <CardHeader>
          <CardTitle>تحسين محركات البحث للفنانين (SEO)</CardTitle>
          <CardDescription>عنوان ووصف صفحة الفنانين لمحركات البحث ومشاركات الروابط. اترك أي حقل فارغاً لاستخدام النص الافتراضي.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="seo_artists_title"
            label="عنوان SEO للفنانين"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <div className="md:col-span-2">
            <BilingualPair
              id="seo_artists_description"
              label="وصف SEO للفنانين"
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
