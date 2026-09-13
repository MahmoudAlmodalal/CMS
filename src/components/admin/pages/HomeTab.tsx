"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MediaPickerField } from "@/components/admin/media/MediaPickerField";
import {
  Field,
  BilingualPair,
  LinkField,
  type BooleanFieldName,
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
  setBooleanField: (field: BooleanFieldName, value: boolean) => void;
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
            required
            label="عنوان الهيرو الرئيسي"
            values={values}
            onChange={setField}
            helpText="النص الرئيسي الظاهر أعلى الصفحة."
          />
          <BilingualPair
            id="hero_subheadline"
            required
            label="العنوان الفرعي للهيرو"
            multiline
            values={values}
            onChange={setField}
            helpText="وصف موجز للمنصة تحت العنوان الرئيسي."
          />
          <div className="space-y-2 text-start md:col-span-2">
            <MediaPickerField
              id="hero_image_url"
              label="فيديو الهيرو"
              value={values.hero_image_url}
              onChange={(url) => setField("hero_image_url", url)}
              bucket="site"
              folder="hero"
              mediaType="video"
            />
            <p className="text-xs text-brand-espresso/60">رفع فيديو للهيرو (أو إدخال رابط مباشر). اتركه فارغاً للافتراضي.</p>
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
          <LinkField id="home_hero_primary_href" label="رابط الزر الرئيسي للهيرو" placeholder="/artists" values={values} onChange={setField} />
          <LinkField id="home_hero_secondary_href" label="رابط الزر الثانوي للهيرو" placeholder="/booking" values={values} onChange={setField} />
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
            required
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
          <BilingualPair
            id="home_about_heading"
            label="العنوان الكبير لقسم من نحن"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام «من نحن». ضع *نجمتين* حول الكلمة لتلوينها."
          />
          <LinkField id="home_about_href" label="رابط زر قسم من نحن" placeholder="/artists" values={values} onChange={setField} />
          <div className="md:col-span-2">
            <BilingualPair
              id="about_body"
              required
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
          <LinkField id="home_artists_href" label="رابط زر قسم الفنانين" placeholder="/artists" values={values} onChange={setField} />
          <LinkField id="home_events_href" label="رابط زر قسم الفعاليات" placeholder="/events" values={values} onChange={setField} />
          <div className="space-y-2 text-start md:col-span-2">
            <MediaPickerField
              id="home_events_image_url"
              label="صورة قسم الفعاليات"
              value={values.home_events_image_url}
              onChange={(url) => setField("home_events_image_url", url)}
            />
            <p className="text-xs text-brand-espresso/60">اتركه فارغاً لاستخدام الصورة الافتراضية.</p>
          </div>
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

            <label htmlFor="show_hero" className="inline-flex items-center gap-3 text-sm font-medium text-brand-espresso cursor-pointer">
              <input
                id="show_hero"
                type="checkbox"
                checked={values.show_hero}
                onChange={(event) => setBooleanField("show_hero", event.target.checked)}
                className="h-4 w-4 rounded border-brand-espresso-subtle accent-brand-primary cursor-pointer"
              />
              <span>عرض قسم الهيرو</span>
            </label>

            <label htmlFor="show_about" className="inline-flex items-center gap-3 text-sm font-medium text-brand-espresso cursor-pointer">
              <input
                id="show_about"
                type="checkbox"
                checked={values.show_about}
                onChange={(event) => setBooleanField("show_about", event.target.checked)}
                className="h-4 w-4 rounded border-brand-espresso-subtle accent-brand-primary cursor-pointer"
              />
              <span>عرض قسم من نحن</span>
            </label>

            <label htmlFor="show_featured_artists" className="inline-flex items-center gap-3 text-sm font-medium text-brand-espresso cursor-pointer">
              <input
                id="show_featured_artists"
                type="checkbox"
                checked={values.show_featured_artists}
                onChange={(event) => setBooleanField("show_featured_artists", event.target.checked)}
                className="h-4 w-4 rounded border-brand-espresso-subtle accent-brand-primary cursor-pointer"
              />
              <span>عرض قسم الفنانين المميزين</span>
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
            required
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
          <LinkField id="booking_cta_href" label="رابط زر دعوة الحجز" placeholder="/booking" values={values} onChange={setField} />
          <div className="space-y-2 text-start md:col-span-2">
            <MediaPickerField
              id="booking_banner_image_url"
              label="صورة خلفية بنر الحجز"
              value={values.booking_banner_image_url}
              onChange={(url) => setField("booking_banner_image_url", url)}
            />
            <p className="text-xs text-brand-espresso/60">اتركه فارغاً لاستخدام الصورة الافتراضية.</p>
          </div>
          <div className="md:col-span-2">
            <BilingualPair
              id="booking_banner_body"
              required
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

      {/* 7. Site-wide SEO defaults */}
      <Card>
        <CardHeader>
          <CardTitle>القيم الافتراضية لمحركات البحث (كل الموقع)</CardTitle>
          <CardDescription>تُستخدم لأي صفحة ليس لها عنوان أو وصف خاص، وصورة المشاركة تظهر عند مشاركة روابط الموقع.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="seo_default_title"
            label="العنوان الافتراضي للموقع"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <div className="md:col-span-2">
            <BilingualPair
              id="seo_default_description"
              label="الوصف الافتراضي للموقع"
              multiline
              values={values}
              onChange={setField}
              helpText="اتركه فارغاً لاستخدام النص الافتراضي."
            />
          </div>
          <div className="space-y-2 text-start md:col-span-2">
            <MediaPickerField
              id="seo_og_image_url"
              label="صورة المشاركة (Open Graph)"
              value={values.seo_og_image_url}
              onChange={(url) => setField("seo_og_image_url", url)}
            />
            <p className="text-xs text-brand-espresso/60">يُفضّل 1200×630. اتركه فارغاً لعدم إرفاق صورة.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
