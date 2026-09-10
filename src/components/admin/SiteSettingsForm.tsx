"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateSiteSettingsAction } from "@/actions/cms";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { FormHelperText, FormLabel } from "@/components/ui/FormElements";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { SiteSettings } from "@/lib/dal/site-settings";
import type { SiteSettingsInput } from "@/lib/validations/cms";

interface SiteSettingsFormValues {
  hero_headline: string;
  hero_subheadline: string;
  hero_image_url: string;
  about_headline: string;
  about_body: string;
  about_image_url: string;
  booking_banner_title: string;
  booking_banner_body: string;
  artists_subtitle: string;
  events_subtitle: string;
  academy_subtitle: string;
  booking_subtitle: string;
  contact_email: string;
  contact_phone: string;
  social_links: {
    instagram: string;
    tiktok: string;
  };
  operational_regions: string;
  footer_mission: string;
  copyright_text: string;
}

type TextFieldName = Exclude<keyof SiteSettingsFormValues, "social_links">;

function getInitialValues(settings: SiteSettings): SiteSettingsFormValues {
  return {
    hero_headline: settings.hero_headline,
    hero_subheadline: settings.hero_subheadline,
    hero_image_url: settings.hero_image_url,
    about_headline: settings.about_headline,
    about_body: settings.about_body,
    about_image_url: settings.about_image_url,
    booking_banner_title: settings.booking_banner_title,
    booking_banner_body: settings.booking_banner_body,
    artists_subtitle: settings.artists_subtitle ?? "",
    events_subtitle: settings.events_subtitle ?? "",
    academy_subtitle: settings.academy_subtitle ?? "",
    booking_subtitle: settings.booking_subtitle ?? "",
    contact_email: settings.contact_email,
    contact_phone: settings.contact_phone,
    social_links: {
      instagram: settings.social_links.instagram ?? "",
      tiktok: settings.social_links.tiktok ?? "",
    },
    operational_regions: settings.operational_regions,
    footer_mission: settings.footer_mission,
    copyright_text: settings.copyright_text,
  };
}

function Field({
  id,
  label,
  required = true,
  help,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 text-start">
      <FormLabel htmlFor={id} required={required}>{label}</FormLabel>
      {children}
      {help && <FormHelperText>{help}</FormHelperText>}
    </div>
  );
}

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
  const [values, setValues] = useState(() => getInitialValues(settings));
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const setField = (field: TextFieldName, value: string) => {
    setResult(null);
    setValues((current) => ({ ...current, [field]: value }));
  };

  const setSocialLink = (field: keyof SiteSettingsFormValues["social_links"], value: string) => {
    setResult(null);
    setValues((current) => ({
      ...current,
      social_links: { ...current.social_links, [field]: value },
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const input: SiteSettingsInput = {
      id: "default",
      hero_headline: values.hero_headline,
      hero_subheadline: values.hero_subheadline,
      hero_image_url: values.hero_image_url,
      about_headline: values.about_headline,
      about_body: values.about_body,
      about_image_url: values.about_image_url,
      booking_banner_title: values.booking_banner_title,
      booking_banner_body: values.booking_banner_body,
      artists_subtitle: values.artists_subtitle || null,
      events_subtitle: values.events_subtitle || null,
      academy_subtitle: values.academy_subtitle || null,
      booking_subtitle: values.booking_subtitle || null,
      contact_email: values.contact_email,
      contact_phone: values.contact_phone,
      social_links: values.social_links,
      operational_regions: values.operational_regions,
      footer_mission: values.footer_mission,
      copyright_text: values.copyright_text,
    };

    setResult(null);
    startTransition(async () => {
      try {
        const response = await updateSiteSettingsAction(input);
        setResult(response.ok ? { ok: true } : { ok: false, error: response.error });
      } catch {
        setResult({ ok: false, error: "تعذر حفظ الإعدادات حالياً. يرجى المحاولة مرة أخرى." });
      }
    });
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
            <Field id="about_headline" label="عنوان قسم من نحن">
              <Input id="about_headline" value={values.about_headline} onChange={(event) => setField("about_headline", event.target.value)} />
            </Field>
            <Field id="hero_subheadline" label="العنوان الفرعي للهيرو">
              <Textarea id="hero_subheadline" rows={3} className="min-h-[96px]" value={values.hero_subheadline} onChange={(event) => setField("hero_subheadline", event.target.value)} />
            </Field>
            <Field id="about_body" label="نص قسم من نحن">
              <Textarea id="about_body" value={values.about_body} onChange={(event) => setField("about_body", event.target.value)} />
            </Field>
            <Field id="hero_image_url" label="رابط صورة الهيرو" required={false} help="اتركه فارغاً لاستخدام الصورة الافتراضية.">
              <Input id="hero_image_url" type="url" dir="ltr" value={values.hero_image_url} onChange={(event) => setField("hero_image_url", event.target.value)} />
            </Field>
            <Field id="about_image_url" label="رابط صورة قسم من نحن" required={false} help="اتركه فارغاً لاستخدام الصورة الافتراضية.">
              <Input id="about_image_url" type="url" dir="ltr" value={values.about_image_url} onChange={(event) => setField("about_image_url", event.target.value)} />
            </Field>
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
            <Field id="booking_banner_body" label="نص بنر الحجز">
              <Textarea id="booking_banner_body" value={values.booking_banner_body} onChange={(event) => setField("booking_banner_body", event.target.value)} />
            </Field>
            <Field id="artists_subtitle" label="العنوان الفرعي للفنانين" required={false}>
              <Textarea id="artists_subtitle" rows={3} className="min-h-[96px]" value={values.artists_subtitle} onChange={(event) => setField("artists_subtitle", event.target.value)} />
            </Field>
            <Field id="events_subtitle" label="العنوان الفرعي للفعاليات" required={false}>
              <Textarea id="events_subtitle" rows={3} className="min-h-[96px]" value={values.events_subtitle} onChange={(event) => setField("events_subtitle", event.target.value)} />
            </Field>
            <Field id="academy_subtitle" label="العنوان الفرعي للأكاديمية" required={false}>
              <Textarea id="academy_subtitle" rows={3} className="min-h-[96px]" value={values.academy_subtitle} onChange={(event) => setField("academy_subtitle", event.target.value)} />
            </Field>
            <Field id="booking_subtitle" label="العنوان الفرعي لصفحة الحجز" required={false}>
              <Textarea id="booking_subtitle" rows={3} className="min-h-[96px]" value={values.booking_subtitle} onChange={(event) => setField("booking_subtitle", event.target.value)} />
            </Field>
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
            <Field id="copyright_text" label="نص حقوق النشر">
              <Input id="copyright_text" value={values.copyright_text} onChange={(event) => setField("copyright_text", event.target.value)} />
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
