"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { updateSiteSettingsAction } from "@/actions/cms";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
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


/**
 * Preview of what this form still owns. Hero, about and section copy moved to
 * /admin/pages, so previewing them here would reintroduce the split view that
 * made the same field look like it existed twice.
 */
function SiteSettingsPreview({ values }: { values: SiteSettingsFormValues }) {
  const text = (value: string, fallback: string) => value.trim() || fallback;

  return (
    <Card variant="surface" className="xl:sticky xl:top-24">
      <CardHeader>
        <CardTitle>معاينة سريعة</CardTitle>
        <CardDescription>معاينة لبيانات التواصل والتذييل أثناء التحرير.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-brand-espresso-subtle/60 bg-brand-espresso p-5 text-sm text-brand-tint">
          <p className="font-bold text-brand-primary">التواصل والتذييل</p>
          <p dir="ltr" className="mt-3 text-start">{text(values.contact_email, "hello@example.com")}</p>
          <p dir="ltr" className="mt-1 text-start">{text(values.contact_phone, "+000 00 000 000")}</p>
          <p className="mt-3 text-brand-tint/75">{text(values.operational_regions, "مناطق النشاط")}</p>
          <p className="mt-3 leading-relaxed text-brand-tint/75">{text(values.footer_mission, "رسالة التذييل")}</p>
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
    setSocialLink,
    save,
    pending,
    result,
  } = useSiteSettingsForm(settings, updateSiteSettingsAction);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    save(event);
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <form onSubmit={handleSubmit} className="space-y-6" aria-label="نموذج إعدادات الموقع">
        <Card variant="surface">
          <CardHeader>
            <CardTitle>نصوص الصفحات تُحرَّر من «صفحات الموقع»</CardTitle>
            <CardDescription>
              عناوين الهيرو ونصوص «من نحن» وعناوين الأقسام وصور الصفحات وبنر الحجز كلها تُحرَّر الآن
              في صفحة واحدة: <Link href="/admin/pages" className="font-bold text-brand-primary underline">صفحات الموقع</Link>.
              كانت هذه الحقول معروضة في الشاشتين معاً وتكتبان على الصف نفسه، فتظهر وكأنها مكرّرة ويلغي
              آخر حفظ ما كُتب في الأخرى. هذه الصفحة الآن للإعدادات العامة فقط.
            </CardDescription>
          </CardHeader>
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
            <Button type="submit" isLoading={pending} disabled={pending} className="min-h-[44px]">
              حفظ الإعدادات
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Desktop Preview (>=1280px) */}
      <div className="hidden xl:block">
        <SiteSettingsPreview values={values} />
      </div>

      {/* Floating Preview Button (<1280px) */}
      <div className="fixed bottom-6 end-6 z-40 xl:hidden">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-brand-primary text-white font-bold text-sm rounded-full shadow-lg hover:bg-brand-primary-hover active:scale-95 transition-all cursor-pointer min-h-[44px]"
          aria-label="عرض المعاينة"
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>عرض المعاينة</span>
        </button>
      </div>

      {/* Mobile Live Preview Bottom Sheet Drawer */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex flex-col justify-end" dir="rtl">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setPreviewOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Modal */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col w-full z-10 animate-in slide-in-from-bottom duration-200 pb-safe">
            <div className="p-4 border-b border-brand-espresso-subtle flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <span className="font-bold text-base text-brand-espresso">معاينة سريعة</span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-brand-espresso/70 hover:bg-brand-surface text-sm font-bold cursor-pointer"
                aria-label="إغلاق المعاينة"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <SiteSettingsPreview values={values} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
