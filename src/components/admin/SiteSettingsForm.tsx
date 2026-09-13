"use client";

import type { FormEvent } from "react";
import { updateSiteSettingsAction } from "@/actions/cms";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MediaPickerField } from "@/components/admin/media/MediaPickerField";
import { Textarea } from "@/components/ui/Textarea";
import type { SiteSettings } from "@/lib/dal/site-settings";
import {
  Field,
  BilingualPair,
  useSiteSettingsForm,
  type SiteSettingsFormValues,
  type TextFieldName,
  getInitialValues,
  buildSiteSettingsInput,
} from "./pages/settingsFormKit";

export { getInitialValues, buildSiteSettingsInput, Field, BilingualPair };
export type { SiteSettingsFormValues, TextFieldName };

// buildSiteSettingsInput payload contract:
// hero_headline_en: values.hero_headline_en || null
// about_body_en: values.about_body_en || null
// footer_mission_en: values.footer_mission_en || null
// copyright_text_en: values.copyright_text_en || null


interface PageCopyField {
  id: TextFieldName;
  label: string;
  multiline?: boolean;
  url?: boolean;
}

const PAGE_HERO_FIELDS: PageCopyField[] = [
  { id: "events_title", label: "عنوان صفحة الفعاليات", multiline: true },
  { id: "events_hero_image_url", label: "صورة صفحة الفعاليات", url: true },
  { id: "artists_title", label: "عنوان صفحة الفنانين", multiline: true },
  { id: "artists_hero_image_url", label: "صورة صفحة الفنانين", url: true },
  { id: "academy_title", label: "عنوان صفحة الأكاديمية", multiline: true },
  { id: "academy_kicker", label: "الشارة العلوية لصفحة الأكاديمية" },
  { id: "academy_hero_image_url", label: "صورة صفحة الأكاديمية", url: true },
  { id: "academy_tracks_heading", label: "عنوان قسم المسارات", multiline: true },
  { id: "news_title", label: "عنوان صفحة الأخبار" },
  { id: "news_subtitle", label: "العنوان الفرعي لصفحة الأخبار", multiline: true },
  { id: "news_kicker", label: "الشارة العلوية لصفحة الأخبار" },
];

const HOME_COPY_FIELDS: PageCopyField[] = [
  { id: "home_hero_primary_cta", label: "الزر الرئيسي للهيرو" },
  { id: "home_hero_secondary_cta", label: "الزر الثانوي للهيرو" },
  { id: "home_about_cta", label: "زر قسم من نحن" },
  { id: "home_artists_heading", label: "عنوان قسم الفنانين", multiline: true },
  { id: "home_artists_cta", label: "زر قسم الفنانين" },
  { id: "home_testimonials_heading", label: "عنوان قسم الشهادات", multiline: true },
  { id: "home_editorial_heading", label: "عنوان القسم التحريري", multiline: true },
  { id: "home_events_heading", label: "عنوان قسم الفعاليات", multiline: true },
  { id: "home_events_cta", label: "زر قسم الفعاليات" },
];

const ACADEMY_BAND_FIELDS: PageCopyField[] = [
  { id: "academy_values_heading", label: "عنوان شريط القيم", multiline: true },
  { id: "academy_value1_title", label: "القيمة الأولى — العنوان" },
  { id: "academy_value1_body", label: "القيمة الأولى — الوصف", multiline: true },
  { id: "academy_value2_title", label: "القيمة الثانية — العنوان" },
  { id: "academy_value2_body", label: "القيمة الثانية — الوصف", multiline: true },
  { id: "academy_value3_title", label: "القيمة الثالثة — العنوان" },
  { id: "academy_value3_body", label: "القيمة الثالثة — الوصف", multiline: true },
  { id: "academy_newsletter_heading", label: "عنوان النشرة البريدية" },
  { id: "academy_newsletter_tagline", label: "السطر التعريفي للنشرة البريدية" },
];

function SiteSettingsPreview({ values }: { values: SiteSettingsFormValues }) {
  const text = (value: string, fallback: string) => value.trim() || fallback;

  return (
    <Card variant="surface" className="xl:sticky xl:top-24">
      <CardHeader>
        <CardTitle>معاينة سريعة</CardTitle>
        <CardDescription>معاينة للنصوص العامة أثناء التحرير، من دون نشر صفحة جديدة.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <section className="rounded-2xl bg-brand-espresso p-5 text-brand-tint" aria-labelledby="settings-preview-hero">
          <p className="text-xs font-bold text-brand-primary">معاينة الهيرو</p>
          <h2 id="settings-preview-hero" className="mt-3 text-xl font-bold leading-relaxed">
            {text(values.hero_headline, "عنوان الهيرو")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-tint/80">
            {text(values.hero_subheadline, "العنوان الفرعي سيظهر هنا")}
          </p>
        </section>

        <section className="rounded-2xl border border-brand-espresso-subtle/60 bg-white p-5" aria-labelledby="settings-preview-about">
          <p className="text-xs font-bold text-brand-primary">من نحن</p>
          <h2 id="settings-preview-about" className="mt-2 text-lg font-bold leading-relaxed">
            {text(values.about_headline, "عنوان قسم من نحن")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-espresso/70">
            {text(values.about_body, "نص قسم من نحن سيظهر هنا")}
          </p>
        </section>

        <section className="rounded-2xl bg-brand-primary p-5 text-white" aria-labelledby="settings-preview-booking">
          <p className="text-xs font-bold text-white/75">دعوة الحجز</p>
          <h2 id="settings-preview-booking" className="mt-2 text-lg font-bold leading-relaxed">
            {text(values.booking_banner_title, "عنوان بنر الحجز")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            {text(values.booking_banner_body, "نص بنر الحجز سيظهر هنا")}
          </p>
        </section>

        {(values.events_title.trim() ||
          values.artists_title.trim() ||
          values.academy_title.trim() ||
          values.news_title.trim() ||
          values.home_artists_heading.trim() ||
          values.home_events_heading.trim()) && (
          <section className="rounded-2xl border border-brand-espresso-subtle/60 bg-white p-5" aria-labelledby="settings-preview-pages">
            <p className="text-xs font-bold text-brand-primary">عناوين الصفحات</p>
            <ul id="settings-preview-pages" className="mt-2 space-y-1 text-sm leading-relaxed text-brand-espresso/70">
              {values.events_title.trim() && <li>الفعاليات: {values.events_title.trim()}</li>}
              {values.artists_title.trim() && <li>الفنانون: {values.artists_title.trim()}</li>}
              {values.academy_title.trim() && <li>الأكاديمية: {values.academy_title.trim()}</li>}
              {values.news_title.trim() && <li>الأخبار: {values.news_title.trim()}</li>}
              {values.home_artists_heading.trim() && <li>الرئيسية/الفنانون: {values.home_artists_heading.trim()}</li>}
              {values.home_events_heading.trim() && <li>الرئيسية/الفعاليات: {values.home_events_heading.trim()}</li>}
            </ul>
          </section>
        )}

        <div className="rounded-2xl border border-brand-espresso-subtle/60 bg-brand-espresso p-5 text-sm text-brand-tint">
          <p className="font-bold text-brand-primary">التواصل والتذييل</p>
          <p dir="ltr" className="mt-3 text-start">{text(values.contact_email, "hello@example.com")}</p>
          <p dir="ltr" className="mt-1 text-start">{text(values.contact_phone, "+000 00 000 000")}</p>
          <p className="mt-3 text-brand-tint/75">{text(values.operational_regions, "مناطق النشاط")}</p>
          <p className="mt-3 border-t border-brand-tint/15 pt-3 text-xs text-brand-tint/65">
            {text(values.copyright_text, "نص حقوق النشر")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  // Form submission manages useTransition and calls updateSiteSettingsAction via useSiteSettingsForm
  const {
    values,
    setField,
    setNumberField,
    setBooleanField,
    setSocialLink,
    save,
    pending,
    result,
  } = useSiteSettingsForm(settings, updateSiteSettingsAction);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    save(event);
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <form onSubmit={handleSubmit} className="space-y-6" aria-label="نموذج إعدادات الموقع">
        <Card>
          <CardHeader>
            <CardTitle>الواجهة الرئيسية</CardTitle>
            <CardDescription>النصوص والصور الظاهرة في مقدمة الموقع وقسم التعريف.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field id="hero_headline" label="عنوان الهيرو الرئيسي">
              <Input id="hero_headline" value={values.hero_headline} onChange={(event) => setField("hero_headline", event.target.value)} />
            </Field>
            <Field id="hero_headline_en" label="عنوان الهيرو الرئيسي — English" required={false} help="اختياري. يظهر في النسخة الإنجليزية؛ إن تُرك فارغاً يُعرض النص العربي.">
              <Input id="hero_headline_en" dir="ltr" lang="en" value={values.hero_headline_en} onChange={(event) => setField("hero_headline_en", event.target.value)} />
            </Field>
            <Field id="about_headline" label="عنوان قسم من نحن">
              <Input id="about_headline" value={values.about_headline} onChange={(event) => setField("about_headline", event.target.value)} />
            </Field>
            <Field id="about_headline_en" label="عنوان قسم من نحن — English" required={false} help="اختياري. يظهر في النسخة الإنجليزية؛ إن تُرك فارغاً يُعرض النص العربي.">
              <Input id="about_headline_en" dir="ltr" lang="en" value={values.about_headline_en} onChange={(event) => setField("about_headline_en", event.target.value)} />
            </Field>
            <Field id="hero_subheadline" label="العنوان الفرعي للهيرو">
              <Textarea id="hero_subheadline" rows={3} className="min-h-[96px]" value={values.hero_subheadline} onChange={(event) => setField("hero_subheadline", event.target.value)} />
            </Field>
            <Field id="hero_subheadline_en" label="العنوان الفرعي للهيرو — English" required={false} help="اختياري. يظهر في النسخة الإنجليزية؛ إن تُرك فارغاً يُعرض النص العربي.">
              <Textarea id="hero_subheadline_en" dir="ltr" lang="en" rows={3} className="min-h-[96px]" value={values.hero_subheadline_en} onChange={(event) => setField("hero_subheadline_en", event.target.value)} />
            </Field>
            <Field id="about_body" label="نص قسم من نحن">
              <Textarea id="about_body" value={values.about_body} onChange={(event) => setField("about_body", event.target.value)} />
            </Field>
            <Field id="about_body_en" label="نص قسم من نحن — English" required={false} help="اختياري. يظهر في النسخة الإنجليزية؛ إن تُرك فارغاً يُعرض النص العربي.">
              <Textarea id="about_body_en" dir="ltr" lang="en" rows={3} className="min-h-[96px]" value={values.about_body_en} onChange={(event) => setField("about_body_en", event.target.value)} />
            </Field>
            <Field id="hero_image_url" label="فيديو الهيرو" required={false} help="رفع فيديو للهيرو (أو إدخال رابط مباشر). اتركه فارغاً لاستخدام الفيديو/الصورة الافتراضية.">
              <MediaPickerField
                id="hero_image_url"
                value={values.hero_image_url}
                onChange={(url) => setField("hero_image_url", url)}
                bucket="site"
                folder="hero"
                required={false}
                mediaType="video"
              />
            </Field>
            <Field id="about_image_url" label="رابط صورة قسم من نحن" required={false} help="اتركه فارغاً لاستخدام الصورة الافتراضية.">
              <MediaPickerField
                id="about_image_url"
                value={values.about_image_url}
                onChange={(url) => setField("about_image_url", url)}
                bucket="site"
                folder="about"
                required={false}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أقسام الصفحة الرئيسية</CardTitle>
            <CardDescription>التحكم في ظهور أقسام الصفحة الرئيسية وأعداد العناصر المعروضة في كل قسم.</CardDescription>
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

        <Card>
          <CardHeader>
            <CardTitle>الحجز والصفحات</CardTitle>
            <CardDescription>رسائل دعوة الحجز والعناوين الفرعية للأقسام العامة.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field id="booking_banner_title" label="عنوان بنر الحجز">
              <Input id="booking_banner_title" value={values.booking_banner_title} onChange={(event) => setField("booking_banner_title", event.target.value)} />
            </Field>
            <Field id="booking_banner_title_en" label="عنوان بنر الحجز — English" required={false} help="اختياري. يظهر في النسخة الإنجليزية؛ إن تُرك فارغاً يُعرض النص العربي.">
              <Input id="booking_banner_title_en" dir="ltr" lang="en" value={values.booking_banner_title_en} onChange={(event) => setField("booking_banner_title_en", event.target.value)} />
            </Field>
            <Field id="booking_banner_body" label="نص بنر الحجز">
              <Textarea id="booking_banner_body" value={values.booking_banner_body} onChange={(event) => setField("booking_banner_body", event.target.value)} />
            </Field>
            <Field id="booking_banner_body_en" label="نص بنر الحجز — English" required={false} help="اختياري. يظهر في النسخة الإنجليزية؛ إن تُرك فارغاً يُعرض النص العربي.">
              <Textarea id="booking_banner_body_en" dir="ltr" lang="en" rows={3} className="min-h-[96px]" value={values.booking_banner_body_en} onChange={(event) => setField("booking_banner_body_en", event.target.value)} />
            </Field>
            <Field id="artists_subtitle" label="العنوان الفرعي للفنانين" required={false}>
              <Textarea id="artists_subtitle" rows={3} className="min-h-[96px]" value={values.artists_subtitle} onChange={(event) => setField("artists_subtitle", event.target.value)} />
            </Field>
            <Field id="artists_subtitle_en" label="العنوان الفرعي للفنانين — English" required={false} help="اختياري. يظهر في النسخة الإنجليزية؛ إن تُرك فارغاً يُعرض النص العربي.">
              <Textarea id="artists_subtitle_en" dir="ltr" lang="en" rows={3} className="min-h-[96px]" value={values.artists_subtitle_en} onChange={(event) => setField("artists_subtitle_en", event.target.value)} />
            </Field>
            <Field id="events_subtitle" label="العنوان الفرعي للفعاليات" required={false}>
              <Textarea id="events_subtitle" rows={3} className="min-h-[96px]" value={values.events_subtitle} onChange={(event) => setField("events_subtitle", event.target.value)} />
            </Field>
            <Field id="events_subtitle_en" label="العنوان الفرعي للفعاليات — English" required={false} help="اختياري. يظهر في النسخة الإنجليزية؛ إن تُرك فارغاً يُعرض النص العربي.">
              <Textarea id="events_subtitle_en" dir="ltr" lang="en" rows={3} className="min-h-[96px]" value={values.events_subtitle_en} onChange={(event) => setField("events_subtitle_en", event.target.value)} />
            </Field>
            <Field id="academy_subtitle" label="العنوان الفرعي للأكاديمية" required={false}>
              <Textarea id="academy_subtitle" rows={3} className="min-h-[96px]" value={values.academy_subtitle} onChange={(event) => setField("academy_subtitle", event.target.value)} />
            </Field>
            <Field id="academy_subtitle_en" label="العنوان الفرعي للأكاديمية — English" required={false} help="اختياري. يظهر في النسخة الإنجليزية؛ إن تُرك فارغاً يُعرض النص العربي.">
              <Textarea id="academy_subtitle_en" dir="ltr" lang="en" rows={3} className="min-h-[96px]" value={values.academy_subtitle_en} onChange={(event) => setField("academy_subtitle_en", event.target.value)} />
            </Field>
            <Field id="booking_subtitle" label="العنوان الفرعي لصفحة الحجز" required={false}>
              <Textarea id="booking_subtitle" rows={3} className="min-h-[96px]" value={values.booking_subtitle} onChange={(event) => setField("booking_subtitle", event.target.value)} />
            </Field>
            <Field id="booking_subtitle_en" label="العنوان الفرعي لصفحة الحجز — English" required={false} help="اختياري. يظهر في النسخة الإنجليزية؛ إن تُرك فارغاً يُعرض النص العربي.">
              <Textarea id="booking_subtitle_en" dir="ltr" lang="en" rows={3} className="min-h-[96px]" value={values.booking_subtitle_en} onChange={(event) => setField("booking_subtitle_en", event.target.value)} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>عناوين وصور الصفحات</CardTitle>
            <CardDescription>عناوين وشارات وصور الواجهات لصفحات الفعاليات والفنانين والأكاديمية والأخبار. اترك أي حقل فارغاً لعرض النص الافتراضي.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            {PAGE_HERO_FIELDS.map((field) => (
              <BilingualPair key={field.id} id={field.id} label={field.label} multiline={field.multiline} url={field.url} values={values} onChange={setField} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>نصوص الصفحة الرئيسية</CardTitle>
            <CardDescription>أزرار وعناوين أقسام الصفحة الرئيسية. اترك أي حقل فارغاً لعرض النص الافتراضي.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            {HOME_COPY_FIELDS.map((field) => (
              <BilingualPair key={field.id} id={field.id} label={field.label} multiline={field.multiline} url={field.url} values={values} onChange={setField} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الأكاديمية: القيم والنشرة</CardTitle>
            <CardDescription>عنوان شريط القيم الثلاث وقيمه، وعنوان النشرة البريدية وسطرها التعريفي.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            {ACADEMY_BAND_FIELDS.map((field) => (
              <BilingualPair key={field.id} id={field.id} label={field.label} multiline={field.multiline} url={field.url} values={values} onChange={setField} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>التواصل والحضور</CardTitle>
            <CardDescription>بيانات التواصل وروابط الحسابات الاجتماعية ومناطق النشاط.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field id="contact_email" label="البريد الإلكتروني للتواصل">
              <Input id="contact_email" type="email" dir="ltr" value={values.contact_email} onChange={(event) => setField("contact_email", event.target.value)} />
            </Field>
            <Field id="contact_phone" label="هاتف التواصل">
              <Input id="contact_phone" type="tel" dir="ltr" value={values.contact_phone} onChange={(event) => setField("contact_phone", event.target.value)} />
            </Field>
            <Field id="social_instagram" label="رابط إنستغرام" required={false}>
              <Input id="social_instagram" type="url" dir="ltr" value={values.social_links.instagram} onChange={(event) => setSocialLink("instagram", event.target.value)} />
            </Field>
            <Field id="social_tiktok" label="رابط تيك توك" required={false}>
              <Input id="social_tiktok" type="url" dir="ltr" value={values.social_links.tiktok} onChange={(event) => setSocialLink("tiktok", event.target.value)} />
            </Field>
            <Field id="operational_regions" label="مناطق النشاط">
              <Input id="operational_regions" value={values.operational_regions} onChange={(event) => setField("operational_regions", event.target.value)} />
            </Field>
            <Field id="operational_regions_en" label="مناطق النشاط — English" required={false} help="اختياري. يظهر في النسخة الإنجليزية؛ إن تُرك فارغاً يُعرض النص العربي.">
              <Input id="operational_regions_en" dir="ltr" lang="en" value={values.operational_regions_en} onChange={(event) => setField("operational_regions_en", event.target.value)} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>التذييل وحقوق النشر</CardTitle>
            <CardDescription>الرسالة المختصرة ونص حقوق النشر في أسفل الموقع.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field id="footer_mission" label="رسالة التذييل">
              <Textarea id="footer_mission" value={values.footer_mission} onChange={(event) => setField("footer_mission", event.target.value)} />
            </Field>
            <Field id="footer_mission_en" label="رسالة التذييل — English" required={false} help="اختياري. يظهر في النسخة الإنجليزية؛ إن تُرك فارغاً يُعرض النص العربي.">
              <Textarea id="footer_mission_en" dir="ltr" lang="en" rows={3} className="min-h-[96px]" value={values.footer_mission_en} onChange={(event) => setField("footer_mission_en", event.target.value)} />
            </Field>
            <Field id="copyright_text" label="نص حقوق النشر">
              <Input id="copyright_text" value={values.copyright_text} onChange={(event) => setField("copyright_text", event.target.value)} />
            </Field>
            <Field id="copyright_text_en" label="نص حقوق النشر — English" required={false} help="اختياري. يظهر في النسخة الإنجليزية؛ إن تُرك فارغاً يُعرض النص العربي.">
              <Input id="copyright_text_en" dir="ltr" lang="en" value={values.copyright_text_en} onChange={(event) => setField("copyright_text_en", event.target.value)} />
            </Field>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-6 text-sm" aria-live="polite">
              {pending && <p className="text-brand-espresso/60">جارٍ حفظ الإعدادات…</p>}
              {!pending && result?.ok && <p role="status" className="font-semibold text-alert-success">تم حفظ الإعدادات بنجاح.</p>}
              {!pending && result && !result.ok && <p role="alert" className="font-semibold text-alert-error">{result.error || "تعذر حفظ الإعدادات."}</p>}
            </div>
            <Button type="submit" isLoading={pending} disabled={pending}>
              حفظ الإعدادات
            </Button>
          </CardFooter>
        </Card>
      </form>

      <SiteSettingsPreview values={values} />
    </div>
  );
}
