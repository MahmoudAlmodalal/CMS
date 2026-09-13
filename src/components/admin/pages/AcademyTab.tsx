"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { MediaPickerField } from "@/components/admin/media/MediaPickerField";
import {
  BilingualPair,
  type SiteSettingsFormValues,
  type TextFieldName,
} from "./settingsFormKit";

export interface AcademyTabProps {
  values: SiteSettingsFormValues;
  setField: (field: TextFieldName, value: string) => void;
  summary: {
    publishedCount: number;
  };
}

export function AcademyTab({ values, setField, summary }: AcademyTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Summary Card */}
      <Card variant="surface" className="border-brand-primary/20 bg-brand-sand/30">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-brand-espresso">ملخص قسم الأكاديمية</CardTitle>
              <CardDescription>إحصائيات الدورات والمسارات التعليمية المتاحة للطلاب.</CardDescription>
            </div>
            <Link
              href="/admin/academy"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
            >
              <span>الانتقال إلى إدارة المسارات</span>
              <span aria-hidden="true">←</span>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-brand-espresso-subtle/40 bg-white p-4 max-w-xs">
            <p className="text-xs font-medium text-brand-espresso/60">المسارات والدورات المنشورة</p>
            <p className="mt-1 text-2xl font-bold text-brand-espresso">{summary.publishedCount}</p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Academy Page Content Overrides */}
      <Card>
        <CardHeader>
          <CardTitle>واجهة صفحة الأكاديمية (/academy)</CardTitle>
          <CardDescription>تخصيص شارة العنوان، العنوان الرئيسي، العنوان الفرعي، صورة الهيرو، وعنوان قسم المسارات. اترك أي حقل فارغاً لاستخدام النص الافتراضي.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="academy_kicker"
            label="الشارة العلوية لصفحة الأكاديمية"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <BilingualPair
            id="academy_tracks_heading"
            label="عنوان قسم المسارات التعليمية"
            multiline
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <div className="md:col-span-2">
            <BilingualPair
              id="academy_title"
              label="عنوان صفحة الأكاديمية"
              multiline
              values={values}
              onChange={setField}
              helpText="اتركه فارغاً لاستخدام النص الافتراضي."
            />
          </div>
          <div className="md:col-span-2">
            <BilingualPair
              id="academy_subtitle"
              label="العنوان الفرعي لصفحة الأكاديمية"
              multiline
              values={values}
              onChange={setField}
              helpText="اتركه فارغاً لاستخدام النص الافتراضي."
            />
          </div>
          <div className="space-y-2 text-start md:col-span-2">
            <MediaPickerField
              id="academy_hero_image_url"
              label="صورة صفحة الأكاديمية"
              value={values.academy_hero_image_url}
              onChange={(url) => setField("academy_hero_image_url", url)}
            />
            <p className="text-xs text-brand-espresso/60">اتركه فارغاً لاستخدام الصورة الافتراضية.</p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Values Band */}
      <Card>
        <CardHeader>
          <CardTitle>شريط قيم الأكاديمية</CardTitle>
          <CardDescription>عنوان شريط القيم التعليمية وعناوين ونصوص القيم الثلاث. اترك أي حقل فارغاً لاستخدام النص الافتراضي.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <BilingualPair
                id="academy_values_heading"
                label="عنوان شريط القيم"
                multiline
                values={values}
                onChange={setField}
                helpText="اتركه فارغاً لاستخدام النص الافتراضي."
              />
            </div>
          </div>

          <div className="border-t border-brand-espresso-subtle/30 pt-4 space-y-4">
            <h3 className="text-sm font-bold text-brand-espresso">القيمة الأولى</h3>
            <div className="grid gap-5 md:grid-cols-2">
              <BilingualPair
                id="academy_value1_title"
                label="القيمة الأولى — العنوان"
                values={values}
                onChange={setField}
                helpText="اتركه فارغاً لاستخدام النص الافتراضي."
              />
              <div className="md:col-span-2">
                <BilingualPair
                  id="academy_value1_body"
                  label="القيمة الأولى — الوصف"
                  multiline
                  values={values}
                  onChange={setField}
                  helpText="اتركه فارغاً لاستخدام النص الافتراضي."
                />
              </div>
            </div>
          </div>

          <div className="border-t border-brand-espresso-subtle/30 pt-4 space-y-4">
            <h3 className="text-sm font-bold text-brand-espresso">القيمة الثانية</h3>
            <div className="grid gap-5 md:grid-cols-2">
              <BilingualPair
                id="academy_value2_title"
                label="القيمة الثانية — العنوان"
                values={values}
                onChange={setField}
                helpText="اتركه فارغاً لاستخدام النص الافتراضي."
              />
              <div className="md:col-span-2">
                <BilingualPair
                  id="academy_value2_body"
                  label="القيمة الثانية — الوصف"
                  multiline
                  values={values}
                  onChange={setField}
                  helpText="اتركه فارغاً لاستخدام النص الافتراضي."
                />
              </div>
            </div>
          </div>

          <div className="border-t border-brand-espresso-subtle/30 pt-4 space-y-4">
            <h3 className="text-sm font-bold text-brand-espresso">القيمة الثالثة</h3>
            <div className="grid gap-5 md:grid-cols-2">
              <BilingualPair
                id="academy_value3_title"
                label="القيمة الثالثة — العنوان"
                values={values}
                onChange={setField}
                helpText="اتركه فارغاً لاستخدام النص الافتراضي."
              />
              <div className="md:col-span-2">
                <BilingualPair
                  id="academy_value3_body"
                  label="القيمة الثالثة — الوصف"
                  multiline
                  values={values}
                  onChange={setField}
                  helpText="اتركه فارغاً لاستخدام النص الافتراضي."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Newsletter Band */}
      <Card>
        <CardHeader>
          <CardTitle>شريط النشرة البريدية للأكاديمية</CardTitle>
          <CardDescription>العنوان الرئيسي والسطر التعريفي لشريط الاشتراك البريدي. اترك أي حقل فارغاً لاستخدام النص الافتراضي.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="academy_newsletter_heading"
            label="عنوان النشرة البريدية"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <BilingualPair
            id="academy_newsletter_tagline"
            label="السطر التعريفي للنشرة البريدية"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
        </CardContent>
      </Card>

      {/* 5. SEO Academy */}
      <Card>
        <CardHeader>
          <CardTitle>تحسين محركات البحث للأكاديمية (SEO)</CardTitle>
          <CardDescription>عنوان ووصف صفحة الأكاديمية لمحركات البحث ومشاركات الروابط. اترك أي حقل فارغاً لاستخدام النص الافتراضي.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="seo_academy_title"
            label="عنوان SEO للأكاديمية"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <div className="md:col-span-2">
            <BilingualPair
              id="seo_academy_description"
              label="وصف SEO للأكاديمية"
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
