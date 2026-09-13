"use client";

import { useState, useTransition, useCallback, type FormEvent } from "react";
import { updateSiteSettingsAction } from "@/actions/cms";
import { FormHelperText, FormLabel } from "@/components/ui/FormElements";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { SiteSettings } from "@/lib/dal/site-settings";
import type { SiteSettingsInput } from "@/lib/validations/cms";

export interface SiteSettingsFormValues {
  hero_headline: string;
  hero_headline_en: string;
  hero_subheadline: string;
  hero_subheadline_en: string;
  hero_image_url: string;
  about_headline: string;
  about_headline_en: string;
  about_body: string;
  about_body_en: string;
  about_image_url: string;
  booking_banner_title: string;
  booking_banner_title_en: string;
  booking_banner_body: string;
  booking_banner_body_en: string;
  artists_subtitle: string;
  artists_subtitle_en: string;
  events_subtitle: string;
  events_subtitle_en: string;
  academy_subtitle: string;
  academy_subtitle_en: string;
  booking_subtitle: string;
  booking_subtitle_en: string;
  events_title: string;
  events_title_en: string;
  events_hero_image_url: string;
  artists_title: string;
  artists_title_en: string;
  artists_hero_image_url: string;
  academy_title: string;
  academy_title_en: string;
  academy_kicker: string;
  academy_kicker_en: string;
  academy_hero_image_url: string;
  academy_tracks_heading: string;
  academy_tracks_heading_en: string;
  news_title: string;
  news_title_en: string;
  news_subtitle: string;
  news_subtitle_en: string;
  news_kicker: string;
  news_kicker_en: string;
  home_hero_primary_cta: string;
  home_hero_primary_cta_en: string;
  home_hero_secondary_cta: string;
  home_hero_secondary_cta_en: string;
  home_about_cta: string;
  home_about_cta_en: string;
  home_artists_heading: string;
  home_artists_heading_en: string;
  home_artists_cta: string;
  home_artists_cta_en: string;
  home_testimonials_heading: string;
  home_testimonials_heading_en: string;
  home_editorial_heading: string;
  home_editorial_heading_en: string;
  home_events_heading: string;
  home_events_heading_en: string;
  home_events_cta: string;
  home_events_cta_en: string;
  academy_values_heading: string;
  academy_values_heading_en: string;
  academy_value1_title: string;
  academy_value1_title_en: string;
  academy_value1_body: string;
  academy_value1_body_en: string;
  academy_value2_title: string;
  academy_value2_title_en: string;
  academy_value2_body: string;
  academy_value2_body_en: string;
  academy_value3_title: string;
  academy_value3_title_en: string;
  academy_value3_body: string;
  academy_value3_body_en: string;
  academy_newsletter_heading: string;
  academy_newsletter_heading_en: string;
  academy_newsletter_tagline: string;
  academy_newsletter_tagline_en: string;
  contact_email: string;
  contact_phone: string;
  social_links: {
    instagram: string;
    tiktok: string;
  };
  operational_regions: string;
  operational_regions_en: string;
  footer_mission: string;
  footer_mission_en: string;
  copyright_text: string;
  copyright_text_en: string;
  home_featured_artists_count: number;
  home_featured_articles_count: number;
  home_upcoming_events_count: number;
  show_testimonials: boolean;
  show_editorial: boolean;
  show_events: boolean;
  show_booking_banner: boolean;
  // 26 SEO and label override controls
  seo_home_title: string;
  seo_home_title_en: string;
  seo_home_description: string;
  seo_home_description_en: string;
  seo_events_title: string;
  seo_events_title_en: string;
  seo_events_description: string;
  seo_events_description_en: string;
  seo_news_title: string;
  seo_news_title_en: string;
  seo_news_description: string;
  seo_news_description_en: string;
  seo_artists_title: string;
  seo_artists_title_en: string;
  seo_artists_description: string;
  seo_artists_description_en: string;
  seo_academy_title: string;
  seo_academy_title_en: string;
  seo_academy_description: string;
  seo_academy_description_en: string;
  events_filter_all_label: string;
  events_filter_all_label_en: string;
  artists_filter_all_label: string;
  artists_filter_all_label_en: string;
  booking_cta_label: string;
  booking_cta_label_en: string;
}

export type TextFieldName = Exclude<
  keyof SiteSettingsFormValues,
  | "social_links"
  | "home_featured_artists_count"
  | "home_featured_articles_count"
  | "home_upcoming_events_count"
  | "show_testimonials"
  | "show_editorial"
  | "show_events"
  | "show_booking_banner"
>;

export function getInitialValues(settings: SiteSettings): SiteSettingsFormValues {
  return {
    hero_headline: settings.hero_headline,
    hero_headline_en: settings.hero_headline_en ?? "",
    hero_subheadline: settings.hero_subheadline,
    hero_subheadline_en: settings.hero_subheadline_en ?? "",
    hero_image_url: settings.hero_image_url,
    about_headline: settings.about_headline,
    about_headline_en: settings.about_headline_en ?? "",
    about_body: settings.about_body,
    about_body_en: settings.about_body_en ?? "",
    about_image_url: settings.about_image_url,
    booking_banner_title: settings.booking_banner_title,
    booking_banner_title_en: settings.booking_banner_title_en ?? "",
    booking_banner_body: settings.booking_banner_body,
    booking_banner_body_en: settings.booking_banner_body_en ?? "",
    artists_subtitle: settings.artists_subtitle ?? "",
    artists_subtitle_en: settings.artists_subtitle_en ?? "",
    events_subtitle: settings.events_subtitle ?? "",
    events_subtitle_en: settings.events_subtitle_en ?? "",
    academy_subtitle: settings.academy_subtitle ?? "",
    academy_subtitle_en: settings.academy_subtitle_en ?? "",
    booking_subtitle: settings.booking_subtitle ?? "",
    booking_subtitle_en: settings.booking_subtitle_en ?? "",
    events_title: settings.events_title ?? "",
    events_title_en: settings.events_title_en ?? "",
    events_hero_image_url: settings.events_hero_image_url ?? "",
    artists_title: settings.artists_title ?? "",
    artists_title_en: settings.artists_title_en ?? "",
    artists_hero_image_url: settings.artists_hero_image_url ?? "",
    academy_title: settings.academy_title ?? "",
    academy_title_en: settings.academy_title_en ?? "",
    academy_kicker: settings.academy_kicker ?? "",
    academy_kicker_en: settings.academy_kicker_en ?? "",
    academy_hero_image_url: settings.academy_hero_image_url ?? "",
    academy_tracks_heading: settings.academy_tracks_heading ?? "",
    academy_tracks_heading_en: settings.academy_tracks_heading_en ?? "",
    news_title: settings.news_title ?? "",
    news_title_en: settings.news_title_en ?? "",
    news_subtitle: settings.news_subtitle ?? "",
    news_subtitle_en: settings.news_subtitle_en ?? "",
    news_kicker: settings.news_kicker ?? "",
    news_kicker_en: settings.news_kicker_en ?? "",
    home_hero_primary_cta: settings.home_hero_primary_cta ?? "",
    home_hero_primary_cta_en: settings.home_hero_primary_cta_en ?? "",
    home_hero_secondary_cta: settings.home_hero_secondary_cta ?? "",
    home_hero_secondary_cta_en: settings.home_hero_secondary_cta_en ?? "",
    home_about_cta: settings.home_about_cta ?? "",
    home_about_cta_en: settings.home_about_cta_en ?? "",
    home_artists_heading: settings.home_artists_heading ?? "",
    home_artists_heading_en: settings.home_artists_heading_en ?? "",
    home_artists_cta: settings.home_artists_cta ?? "",
    home_artists_cta_en: settings.home_artists_cta_en ?? "",
    home_testimonials_heading: settings.home_testimonials_heading ?? "",
    home_testimonials_heading_en: settings.home_testimonials_heading_en ?? "",
    home_editorial_heading: settings.home_editorial_heading ?? "",
    home_editorial_heading_en: settings.home_editorial_heading_en ?? "",
    home_events_heading: settings.home_events_heading ?? "",
    home_events_heading_en: settings.home_events_heading_en ?? "",
    home_events_cta: settings.home_events_cta ?? "",
    home_events_cta_en: settings.home_events_cta_en ?? "",
    academy_values_heading: settings.academy_values_heading ?? "",
    academy_values_heading_en: settings.academy_values_heading_en ?? "",
    academy_value1_title: settings.academy_value1_title ?? "",
    academy_value1_title_en: settings.academy_value1_title_en ?? "",
    academy_value1_body: settings.academy_value1_body ?? "",
    academy_value1_body_en: settings.academy_value1_body_en ?? "",
    academy_value2_title: settings.academy_value2_title ?? "",
    academy_value2_title_en: settings.academy_value2_title_en ?? "",
    academy_value2_body: settings.academy_value2_body ?? "",
    academy_value2_body_en: settings.academy_value2_body_en ?? "",
    academy_value3_title: settings.academy_value3_title ?? "",
    academy_value3_title_en: settings.academy_value3_title_en ?? "",
    academy_value3_body: settings.academy_value3_body ?? "",
    academy_value3_body_en: settings.academy_value3_body_en ?? "",
    academy_newsletter_heading: settings.academy_newsletter_heading ?? "",
    academy_newsletter_heading_en: settings.academy_newsletter_heading_en ?? "",
    academy_newsletter_tagline: settings.academy_newsletter_tagline ?? "",
    academy_newsletter_tagline_en: settings.academy_newsletter_tagline_en ?? "",
    contact_email: settings.contact_email,
    contact_phone: settings.contact_phone,
    social_links: {
      instagram: settings.social_links.instagram ?? "",
      tiktok: settings.social_links.tiktok ?? "",
    },
    operational_regions: settings.operational_regions,
    operational_regions_en: settings.operational_regions_en ?? "",
    footer_mission: settings.footer_mission,
    footer_mission_en: settings.footer_mission_en ?? "",
    copyright_text: settings.copyright_text,
    copyright_text_en: settings.copyright_text_en ?? "",
    home_featured_artists_count: settings.home_featured_artists_count ?? 6,
    home_featured_articles_count: settings.home_featured_articles_count ?? 4,
    home_upcoming_events_count: settings.home_upcoming_events_count ?? 3,
    show_testimonials: settings.show_testimonials ?? true,
    show_editorial: settings.show_editorial ?? true,
    show_events: settings.show_events ?? true,
    show_booking_banner: settings.show_booking_banner ?? true,
    // 26 SEO and label override controls
    seo_home_title: settings.seo_home_title ?? "",
    seo_home_title_en: settings.seo_home_title_en ?? "",
    seo_home_description: settings.seo_home_description ?? "",
    seo_home_description_en: settings.seo_home_description_en ?? "",
    seo_events_title: settings.seo_events_title ?? "",
    seo_events_title_en: settings.seo_events_title_en ?? "",
    seo_events_description: settings.seo_events_description ?? "",
    seo_events_description_en: settings.seo_events_description_en ?? "",
    seo_news_title: settings.seo_news_title ?? "",
    seo_news_title_en: settings.seo_news_title_en ?? "",
    seo_news_description: settings.seo_news_description ?? "",
    seo_news_description_en: settings.seo_news_description_en ?? "",
    seo_artists_title: settings.seo_artists_title ?? "",
    seo_artists_title_en: settings.seo_artists_title_en ?? "",
    seo_artists_description: settings.seo_artists_description ?? "",
    seo_artists_description_en: settings.seo_artists_description_en ?? "",
    seo_academy_title: settings.seo_academy_title ?? "",
    seo_academy_title_en: settings.seo_academy_title_en ?? "",
    seo_academy_description: settings.seo_academy_description ?? "",
    seo_academy_description_en: settings.seo_academy_description_en ?? "",
    events_filter_all_label: settings.events_filter_all_label ?? "",
    events_filter_all_label_en: settings.events_filter_all_label_en ?? "",
    artists_filter_all_label: settings.artists_filter_all_label ?? "",
    artists_filter_all_label_en: settings.artists_filter_all_label_en ?? "",
    booking_cta_label: settings.booking_cta_label ?? "",
    booking_cta_label_en: settings.booking_cta_label_en ?? "",
  };
}

export function buildSiteSettingsInput(values: SiteSettingsFormValues): SiteSettingsInput {
  return {
    id: "default",
    hero_headline: values.hero_headline,
    hero_headline_en: values.hero_headline_en.trim() || null,
    hero_subheadline: values.hero_subheadline,
    hero_subheadline_en: values.hero_subheadline_en.trim() || null,
    hero_image_url: values.hero_image_url,
    about_headline: values.about_headline,
    about_headline_en: values.about_headline_en.trim() || null,
    about_body: values.about_body,
    about_body_en: values.about_body_en.trim() || null,
    about_image_url: values.about_image_url,
    booking_banner_title: values.booking_banner_title,
    booking_banner_title_en: values.booking_banner_title_en.trim() || null,
    booking_banner_body: values.booking_banner_body,
    booking_banner_body_en: values.booking_banner_body_en.trim() || null,
    artists_subtitle: values.artists_subtitle.trim() || null,
    artists_subtitle_en: values.artists_subtitle_en.trim() || null,
    events_subtitle: values.events_subtitle.trim() || null,
    events_subtitle_en: values.events_subtitle_en.trim() || null,
    academy_subtitle: values.academy_subtitle.trim() || null,
    academy_subtitle_en: values.academy_subtitle_en.trim() || null,
    booking_subtitle: values.booking_subtitle.trim() || null,
    booking_subtitle_en: values.booking_subtitle_en.trim() || null,
    events_title: values.events_title.trim() || null,
    events_title_en: values.events_title_en.trim() || null,
    events_hero_image_url: values.events_hero_image_url.trim() || null,
    artists_title: values.artists_title.trim() || null,
    artists_title_en: values.artists_title_en.trim() || null,
    artists_hero_image_url: values.artists_hero_image_url.trim() || null,
    academy_title: values.academy_title.trim() || null,
    academy_title_en: values.academy_title_en.trim() || null,
    academy_kicker: values.academy_kicker.trim() || null,
    academy_kicker_en: values.academy_kicker_en.trim() || null,
    academy_hero_image_url: values.academy_hero_image_url.trim() || null,
    academy_tracks_heading: values.academy_tracks_heading.trim() || null,
    academy_tracks_heading_en: values.academy_tracks_heading_en.trim() || null,
    news_title: values.news_title.trim() || null,
    news_title_en: values.news_title_en.trim() || null,
    news_subtitle: values.news_subtitle.trim() || null,
    news_subtitle_en: values.news_subtitle_en.trim() || null,
    news_kicker: values.news_kicker.trim() || null,
    news_kicker_en: values.news_kicker_en.trim() || null,
    home_hero_primary_cta: values.home_hero_primary_cta.trim() || null,
    home_hero_primary_cta_en: values.home_hero_primary_cta_en.trim() || null,
    home_hero_secondary_cta: values.home_hero_secondary_cta.trim() || null,
    home_hero_secondary_cta_en: values.home_hero_secondary_cta_en.trim() || null,
    home_about_cta: values.home_about_cta.trim() || null,
    home_about_cta_en: values.home_about_cta_en.trim() || null,
    home_artists_heading: values.home_artists_heading.trim() || null,
    home_artists_heading_en: values.home_artists_heading_en.trim() || null,
    home_artists_cta: values.home_artists_cta.trim() || null,
    home_artists_cta_en: values.home_artists_cta_en.trim() || null,
    home_testimonials_heading: values.home_testimonials_heading.trim() || null,
    home_testimonials_heading_en: values.home_testimonials_heading_en.trim() || null,
    home_editorial_heading: values.home_editorial_heading.trim() || null,
    home_editorial_heading_en: values.home_editorial_heading_en.trim() || null,
    home_events_heading: values.home_events_heading.trim() || null,
    home_events_heading_en: values.home_events_heading_en.trim() || null,
    home_events_cta: values.home_events_cta.trim() || null,
    home_events_cta_en: values.home_events_cta_en.trim() || null,
    academy_values_heading: values.academy_values_heading.trim() || null,
    academy_values_heading_en: values.academy_values_heading_en.trim() || null,
    academy_value1_title: values.academy_value1_title.trim() || null,
    academy_value1_title_en: values.academy_value1_title_en.trim() || null,
    academy_value1_body: values.academy_value1_body.trim() || null,
    academy_value1_body_en: values.academy_value1_body_en.trim() || null,
    academy_value2_title: values.academy_value2_title.trim() || null,
    academy_value2_title_en: values.academy_value2_title_en.trim() || null,
    academy_value2_body: values.academy_value2_body.trim() || null,
    academy_value2_body_en: values.academy_value2_body_en.trim() || null,
    academy_value3_title: values.academy_value3_title.trim() || null,
    academy_value3_title_en: values.academy_value3_title_en.trim() || null,
    academy_value3_body: values.academy_value3_body.trim() || null,
    academy_value3_body_en: values.academy_value3_body_en.trim() || null,
    academy_newsletter_heading: values.academy_newsletter_heading.trim() || null,
    academy_newsletter_heading_en: values.academy_newsletter_heading_en.trim() || null,
    academy_newsletter_tagline: values.academy_newsletter_tagline.trim() || null,
    academy_newsletter_tagline_en: values.academy_newsletter_tagline_en.trim() || null,
    contact_email: values.contact_email,
    contact_phone: values.contact_phone,
    social_links: values.social_links,
    operational_regions: values.operational_regions,
    operational_regions_en: values.operational_regions_en.trim() || null,
    footer_mission: values.footer_mission,
    footer_mission_en: values.footer_mission_en.trim() || null,
    copyright_text: values.copyright_text,
    copyright_text_en: values.copyright_text_en.trim() || null,
    home_featured_artists_count: Number(values.home_featured_artists_count),
    home_featured_articles_count: Number(values.home_featured_articles_count),
    home_upcoming_events_count: Number(values.home_upcoming_events_count),
    show_testimonials: Boolean(values.show_testimonials),
    show_editorial: Boolean(values.show_editorial),
    show_events: Boolean(values.show_events),
    show_booking_banner: Boolean(values.show_booking_banner),
    // 26 SEO and label override controls
    seo_home_title: values.seo_home_title.trim() || null,
    seo_home_title_en: values.seo_home_title_en.trim() || null,
    seo_home_description: values.seo_home_description.trim() || null,
    seo_home_description_en: values.seo_home_description_en.trim() || null,
    seo_events_title: values.seo_events_title.trim() || null,
    seo_events_title_en: values.seo_events_title_en.trim() || null,
    seo_events_description: values.seo_events_description.trim() || null,
    seo_events_description_en: values.seo_events_description_en.trim() || null,
    seo_news_title: values.seo_news_title.trim() || null,
    seo_news_title_en: values.seo_news_title_en.trim() || null,
    seo_news_description: values.seo_news_description.trim() || null,
    seo_news_description_en: values.seo_news_description_en.trim() || null,
    seo_artists_title: values.seo_artists_title.trim() || null,
    seo_artists_title_en: values.seo_artists_title_en.trim() || null,
    seo_artists_description: values.seo_artists_description.trim() || null,
    seo_artists_description_en: values.seo_artists_description_en.trim() || null,
    seo_academy_title: values.seo_academy_title.trim() || null,
    seo_academy_title_en: values.seo_academy_title_en.trim() || null,
    seo_academy_description: values.seo_academy_description.trim() || null,
    seo_academy_description_en: values.seo_academy_description_en.trim() || null,
    events_filter_all_label: values.events_filter_all_label.trim() || null,
    events_filter_all_label_en: values.events_filter_all_label_en.trim() || null,
    artists_filter_all_label: values.artists_filter_all_label.trim() || null,
    artists_filter_all_label_en: values.artists_filter_all_label_en.trim() || null,
    booking_cta_label: values.booking_cta_label.trim() || null,
    booking_cta_label_en: values.booking_cta_label_en.trim() || null,
  };
}

export function Field({
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

export function BilingualPair({
  id,
  label,
  multiline = false,
  url = false,
  values,
  onChange,
  helpText = "اتركه فارغاً لاستخدام النص الافتراضي.",
  enHelpText = "اختياري. يظهر في النسخة الإنجليزية؛ إن تُرك فارغاً يُعرض النص العربي.",
}: {
  id: TextFieldName;
  label: string;
  multiline?: boolean;
  url?: boolean;
  values: SiteSettingsFormValues;
  onChange: (field: TextFieldName, value: string) => void;
  helpText?: string;
  enHelpText?: string;
}) {
  if (url) {
    return (
      <Field id={id} label={label} required={false} help="اتركه فارغاً لاستخدام الصورة الافتراضية.">
        <Input id={id} type="url" dir="ltr" value={values[id]} onChange={(event) => onChange(id, event.target.value)} />
      </Field>
    );
  }
  const enId = `${id}_en` as TextFieldName;
  return (
    <>
      <Field id={id} label={label} required={false} help={helpText}>
        {multiline ? (
          <Textarea id={id} rows={3} className="min-h-[96px]" value={values[id]} onChange={(event) => onChange(id, event.target.value)} />
        ) : (
          <Input id={id} value={values[id]} onChange={(event) => onChange(id, event.target.value)} />
        )}
      </Field>
      <Field id={enId} label={`${label} — English`} required={false} help={enHelpText}>
        {multiline ? (
          <Textarea id={enId} dir="ltr" lang="en" rows={3} className="min-h-[96px]" value={values[enId]} onChange={(event) => onChange(enId, event.target.value)} />
        ) : (
          <Input id={enId} dir="ltr" lang="en" value={values[enId]} onChange={(event) => onChange(enId, event.target.value)} />
        )}
      </Field>
    </>
  );
}

export function useSiteSettingsForm(
  settings: SiteSettings,
  action: (input: SiteSettingsInput) => Promise<{ ok: boolean; error?: string }> = updateSiteSettingsAction
) {
  const [values, setValues] = useState<SiteSettingsFormValues>(() => getInitialValues(settings));
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const setField = useCallback((field: TextFieldName, value: string) => {
    setResult(null);
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const setNumberField = useCallback((
    field: "home_featured_artists_count" | "home_featured_articles_count" | "home_upcoming_events_count",
    value: number
  ) => {
    setResult(null);
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const setBooleanField = useCallback((
    field: "show_testimonials" | "show_editorial" | "show_events" | "show_booking_banner",
    value: boolean
  ) => {
    setResult(null);
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const setSocialLink = useCallback((field: keyof SiteSettingsFormValues["social_links"], value: string) => {
    setResult(null);
    setValues((current) => ({
      ...current,
      social_links: { ...current.social_links, [field]: value },
    }));
  }, []);

  const save = useCallback(async (event?: FormEvent) => {
    if (event) {
      event.preventDefault();
    }
    if (pending) return;

    const input = buildSiteSettingsInput(values);

    setResult(null);
    startTransition(async () => {
      try {
        const response = await action(input);
        setResult(response.ok ? { ok: true } : { ok: false, error: response.error });
      } catch {
        setResult({ ok: false, error: "تعذر حفظ الإعدادات حالياً. يرجى المحاولة مرة أخرى." });
      }
    });
  }, [action, pending, values]);

  return {
    values,
    setValues,
    setField,
    setNumberField,
    setBooleanField,
    setSocialLink,
    save,
    pending,
    result,
    setResult,
  };
}
