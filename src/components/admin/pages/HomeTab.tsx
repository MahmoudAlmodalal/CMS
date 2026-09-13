"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MediaPickerField } from "@/components/admin/media/MediaPickerField";
import {
  Field,
  BilingualPair,
  type SiteSettingsFormValues,
  type TextFieldName,
} from "./settingsFormKit";

export interface HomeTabProps {
  values: SiteSettingsFormValues;
  setField: (field: TextFieldName, value: string) => void;
  setNumberField: (
    field: "home_featured_artists_count" | "home_featured_articles_count" | "home_upcoming_events_count",
    value: number
  ) => void;
  setBooleanField: (
    field: "show_testimonials" | "show_editorial" | "show_events" | "show_booking_banner",
    value: boolean
  ) => void;
}

export function HomeTab({
  values,
  setField,
  setNumberField,
  setBooleanField,
}: HomeTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle>مقدمة الصفحة الرئيسية (الهيرو)</CardTitle>
          <CardDescription>العناوين الرئيسية، صورة الواجهة، وأزرار الدعوة للإجراء في واجهة الموقع.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="hero_headline"
            label="عنوان الهيرو الرئيسي"
            values={values}
            onChange={setField}
            helpText="النص الرئيسي الظاهر أعلى الصفحة."
          />
          <BilingualPair
            id="hero_subheadline"
            label="العنوان الفرعي للهيرو"
            multiline
            values={values}
            onChange={setField}
            helpText="وصف موجز للمنصة تحت العنوان الرئيسي."
          />
          <div className="space-y-2 text-start md:col-span-2">
            <MediaPickerField
              id="hero_image_url"
              label="رابط صورة الهيرو"
              value={values.hero_image_url}
              onChange={(url) => setField("hero_image_url", url)}
            />
            <p className="text-xs text-brand-espresso/60">اتركه فارغاً لاستخدام الصورة الافتراضية.</p>
          </div>
          <BilingualPair
            id="home_hero_primary_cta"
            label="نص الزر الرئيسي للهيرو"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <BilingualPair
            id="home_hero_secondary_cta"
            label="نص الزر الثانوي للهيرو"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
        </CardContent>
      </Card>

      {/* 2. About Section */}
      <Card>
        <CardHeader>
          <CardTitle>قسم من نحن</CardTitle>
          <CardDescription>رسالة المنصة التعريفية، الصورة المرافقة، وزر المتابعة.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="about_headline"
            label="عنوان قسم من نحن"
            values={values}
            onChange={setField}
            helpText="عنوان رسالة المنصة."
          />
          <BilingualPair
            id="home_about_cta"
            label="نص زر قسم من نحن"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <div className="md:col-span-2">
            <BilingualPair
              id="about_body"
              label="نص قسم من نحن"
              multiline
              values={values}
              onChange={setField}
              helpText="النص الكامل للتعريف بالمنصة ورسالتها."
            />
          </div>
          <div className="space-y-2 text-start md:col-span-2">
            <MediaPickerField
              id="about_image_url"
              label="رابط صورة قسم من نحن"
              value={values.about_image_url}
              onChange={(url) => setField("about_image_url", url)}
            />
            <p className="text-xs text-brand-espresso/60">اتركه فارغاً لاستخدام الصورة الافتراضية.</p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Section Headings & CTAs */}
      <Card>
        <CardHeader>
          <CardTitle>عناوين وأزرار أقسام الرئيسية</CardTitle>
          <CardDescription>تخصيص عناوين وأزرار التحويل لأقسام الفنانين، الفعاليات، الشهادات، والمقالات. اترك أي حقل فارغاً لاستخدام النص الافتراضي.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="home_artists_heading"
            label="عنوان قسم الفنانين"
            multiline
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <BilingualPair
            id="home_artists_cta"
            label="زر قسم الفنانين"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <BilingualPair
            id="home_events_heading"
            label="عنوان قسم الفعاليات"
            multiline
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <BilingualPair
            id="home_events_cta"
            label="زر قسم الفعاليات"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <BilingualPair
            id="home_testimonials_heading"
            label="عنوان قسم الشهادات"
            multiline
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <BilingualPair
            id="home_editorial_heading"
            label="عنوان القسم التحريري (المقالات)"
            multiline
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
        </CardContent>
      </Card>

      {/* 4. Counts & Section Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>أعداد العناصر وظهور الأقسام</CardTitle>
          <CardDescription>التحكم في ظهور أقسام الصفحة الرئيسية وأعداد العناصر المعروضة في كل قسم (بين 1 و 12).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-5 md:grid-cols-3">
            <Field id="home_featured_artists_count" label="عدد الفنانين المميزين" help="من 1 إلى 12 (الافتراضي: 6)">
              <Input
                id="home_featured_artists_count"
                type="number"
                min={1}
                max={12}
                value={values.home_featured_artists_count}
                onChange={(event) => setNumberField("home_featured_artists_count", Number(event.target.value))}
              />
            </Field>
            <Field id="home_featured_articles_count" label="عدد المقالات المميزة" help="من 1 إلى 12 (الافتراضي: 4)">
              <Input
                id="home_featured_articles_count"
                type="number"
                min={1}
                max={12}
                value={values.home_featured_articles_count}
                onChange={(event) => setNumberField("home_featured_articles_count", Number(event.target.value))}
              />
            </Field>
            <Field id="home_upcoming_events_count" label="عدد الفعاليات القادمة" help="من 1 إلى 12 (الافتراضي: 3)">
              <Input
                id="home_upcoming_events_count"
                type="number"
                min={1}
                max={12}
                value={values.home_upcoming_events_count}
                onChange={(event) => setNumberField("home_upcoming_events_count", Number(event.target.value))}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-brand-espresso-subtle/40">
            <label htmlFor="show_testimonials" className="inline-flex items-center gap-3 text-sm font-medium text-brand-espresso cursor-pointer">
              <input
                id="show_testimonials"
                type="checkbox"
                checked={values.show_testimonials}
                onChange={(event) => setBooleanField("show_testimonials", event.target.checked)}
                className="h-4 w-4 rounded border-brand-espresso-subtle accent-brand-primary cursor-pointer"
              />
              <span>عرض قسم آراء الجمهور (الشهادات)</span>
            </label>

            <label htmlFor="show_editorial" className="inline-flex items-center gap-3 text-sm font-medium text-brand-espresso cursor-pointer">
              <input
                id="show_editorial"
                type="checkbox"
                checked={values.show_editorial}
                onChange={(event) => setBooleanField("show_editorial", event.target.checked)}
                className="h-4 w-4 rounded border-brand-espresso-subtle accent-brand-primary cursor-pointer"
              />
              <span>عرض القسم التحريري (المقالات)</span>
            </label>

            <label htmlFor="show_events" className="inline-flex items-center gap-3 text-sm font-medium text-brand-espresso cursor-pointer">
              <input
                id="show_events"
                type="checkbox"
                checked={values.show_events}
                onChange={(event) => setBooleanField("show_events", event.target.checked)}
                className="h-4 w-4 rounded border-brand-espresso-subtle accent-brand-primary cursor-pointer"
              />
              <span>عرض قسم الفعاليات القادمة</span>
            </label>

            <label htmlFor="show_booking_banner" className="inline-flex items-center gap-3 text-sm font-medium text-brand-espresso cursor-pointer">
              <input
                id="show_booking_banner"
                type="checkbox"
                checked={values.show_booking_banner}
                onChange={(event) => setBooleanField("show_booking_banner", event.target.checked)}
                className="h-4 w-4 rounded border-brand-espresso-subtle accent-brand-primary cursor-pointer"
              />
              <span>عرض بنر الحجز</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 5. Booking Banner */}
      <Card>
        <CardHeader>
          <CardTitle>بنر الحجز في الرئيسية</CardTitle>
          <CardDescription>رسالة دعوة الحجز وزر الإجراء السريع.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="booking_banner_title"
            label="عنوان بنر الحجز"
            values={values}
            onChange={setField}
            helpText="عنوان دعوة الحجز الرئيسي."
          />
          <BilingualPair
            id="booking_cta_label"
            label="نص زر دعوة الحجز (CTA)"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <div className="md:col-span-2">
            <BilingualPair
              id="booking_banner_body"
              label="نص بنر الحجز"
              multiline
              values={values}
              onChange={setField}
              helpText="وصف دعوة الحجز والتواصل."
            />
          </div>
        </CardContent>
      </Card>

      {/* 6. SEO Home */}
      <Card>
        <CardHeader>
          <CardTitle>تحسين محركات البحث للرئيسية (SEO)</CardTitle>
          <CardDescription>عنوان ووصف الصفحة الرئيسية لنتائج محركات البحث ومشاركات التواصل الاجتماعي. اترك أي حقل فارغاً لاستخدام النص الافتراضي.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="seo_home_title"
            label="عنوان SEO للرئيسية"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <div className="md:col-span-2">
            <BilingualPair
              id="seo_home_description"
              label="وصف SEO للرئيسية"
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
