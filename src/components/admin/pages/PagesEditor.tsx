"use client";

import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { SiteSettings } from "@/lib/dal/site-settings";
import { useSiteSettingsForm, type SiteSettingsFormValues } from "./settingsFormKit";
import { HomeTab } from "./HomeTab";
import { EventsTab } from "./EventsTab";
import { NewsTab } from "./NewsTab";
import { ArtistsTab } from "./ArtistsTab";
import { AcademyTab } from "./AcademyTab";
import { BookingTab } from "./BookingTab";

export type TabKey = "home" | "events" | "news" | "artists" | "academy" | "booking";

export interface PagesSummaries {
  events: {
    publishedCount: number;
    featuredEventTitle: string | null;
  };
  news: {
    publishedCount: number;
    featuredCount: number;
  };
  artists: {
    publishedCount: number;
    featuredCount: number;
  };
  academy: {
    publishedCount: number;
  };
}

interface PagesEditorProps {
  settings: SiteSettings;
  summaries: PagesSummaries;
  initialTab?: TabKey;
}

interface TabDef {
  key: TabKey;
  label: string;
  route: string;
}

const TABS: TabDef[] = [
  { key: "home", label: "الرئيسية", route: "/" },
  { key: "events", label: "الفعاليات", route: "/events" },
  { key: "news", label: "الأخبار", route: "/news" },
  { key: "artists", label: "الفنانون", route: "/artists" },
  { key: "academy", label: "الأكاديمية", route: "/academy" },
  { key: "booking", label: "الحجز", route: "/booking" },
];

function TabLivePreview({ tab, values }: { tab: TabKey; values: SiteSettingsFormValues }) {
  const text = (v: string | null | undefined, fallback: string) => v?.trim() || fallback;

  return (
    <Card variant="surface" className="xl:sticky xl:top-24">
      <CardHeader>
        <CardTitle className="text-base">معاينة مباشرة للصفحة</CardTitle>
        <CardDescription>
          معاينة بصرية فورية للحقول الظاهرة في تبويب{" "}
          <span className="font-semibold text-brand-espresso">{TABS.find((t) => t.key === tab)?.label}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tab === "home" && (
          <>
            <section className="rounded-2xl bg-brand-espresso p-5 text-brand-tint" aria-label="معاينة هيرو الرئيسية">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-brand-primary">واجهة الهيرو</p>
                <span className="rounded-md bg-brand-tint/10 px-2 py-0.5 text-[10px] text-brand-tint/80">
                  {values.hero_video_url.trim() ? "الخلفية: فيديو يوتيوب" : "الخلفية: صورة/فيديو مرفوع"}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-bold leading-relaxed">{text(values.hero_headline, "عنوان الهيرو الرئيسي")}</h3>
              <p className="mt-2 text-xs leading-relaxed text-brand-tint/80">{text(values.hero_subheadline, "العنوان الفرعي سيظهر هنا")}</p>
              <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-brand-tint/15 text-xs">
                <span className="rounded-md bg-brand-primary px-2.5 py-1 text-white font-medium">
                  {text(values.home_hero_primary_cta, "الزر الرئيسي")}
                </span>
                <span className="rounded-md border border-brand-tint/30 px-2.5 py-1 text-brand-tint">
                  {text(values.home_hero_secondary_cta, "الزر الثانوي")}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-brand-espresso-subtle/60 bg-white p-5" aria-label="معاينة من نحن">
              <p className="text-xs font-bold text-brand-primary">قسم من نحن</p>
              <h3 className="mt-2 text-base font-bold leading-relaxed">{text(values.about_headline, "عنوان قسم من نحن")}</h3>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-brand-espresso/70">{text(values.about_body, "نص قسم من نحن سيظهر هنا...")}</p>
              {values.home_about_cta.trim() && (
                <p className="mt-3 text-xs font-semibold text-brand-primary">الزر: {values.home_about_cta.trim()}</p>
              )}
            </section>

            {values.show_editorial && (
              <section className="rounded-2xl bg-[#1F0900] p-5 text-[#F9EDE8]" aria-label="معاينة القسم التحريري">
                <p className="text-xs font-bold text-brand-primary">القسم التحريري (المقالات)</p>
                <h3 className="mt-2 text-base font-bold leading-relaxed">
                  {text(values.home_editorial_heading, "نكتب كي لا تضيع التفاصيل")}
                </h3>
                <p className="mt-2 text-xs text-[#F9EDE8]/75">
                  يعرض {values.home_featured_articles_count} مقالات مميزة في منتصف الصفحة
                </p>
              </section>
            )}

            <section className="rounded-2xl bg-brand-primary p-5 text-white" aria-label="معاينة بنر الحجز">
              <p className="text-xs font-bold text-white/75">دعوة الحجز</p>
              <h3 className="mt-2 text-base font-bold leading-relaxed">{text(values.booking_banner_title, "عنوان بنر الحجز")}</h3>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/85">{text(values.booking_banner_body, "نص بنر الحجز...")}</p>
              <p className="mt-3 inline-block rounded bg-white px-2 py-1 text-xs font-bold text-brand-primary">
                {text(values.booking_cta_label, "احجز الآن")}
              </p>
            </section>

            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-white p-4 text-xs space-y-1 text-brand-espresso/75">
              <p className="font-bold text-brand-espresso mb-2">أعداد الأقسام النشطة</p>
              <p>الفنانون: {values.home_featured_artists_count} عنصر</p>
              <p>المقالات: {values.home_featured_articles_count} عنصر</p>
              <p>الفعاليات: {values.home_upcoming_events_count} عنصر</p>
            </div>

            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-brand-sand/40 p-4 text-xs">
              <p className="font-bold text-brand-espresso">بطاقة محركات البحث (SEO)</p>
              <p className="mt-1 font-semibold text-brand-primary">{text(values.seo_home_title, "أندلسيا — منصة المواهب الفنية")}</p>
              <p className="mt-1 text-brand-espresso/70 line-clamp-2">{text(values.seo_home_description, "منصة متخصصة في دعم المواهب الفنية وربط الفنانين بالجمهور.")}</p>
            </div>
          </>
        )}

        {tab === "events" && (
          <>
            <section className="rounded-2xl bg-brand-espresso p-5 text-brand-tint" aria-label="معاينة هيرو الفعاليات">
              <span className="inline-block rounded bg-brand-primary/20 px-2 py-0.5 text-xs font-bold text-brand-primary">
                /events
              </span>
              <h3 className="mt-3 text-lg font-bold leading-relaxed">{text(values.events_title, "الفعاليات الموسيقية")}</h3>
              <p className="mt-2 text-xs leading-relaxed text-brand-tint/80">
                {text(values.events_subtitle, "مواعيد تترك أثراً جميلاً في قلوب عشاق الموسيقى الأصيلة.")}
              </p>
            </section>

            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-white p-4 text-xs space-y-2">
              <p className="font-bold text-brand-espresso">عناصر واجهة الفعاليات</p>
              <p className="text-brand-espresso/70">
                زر التصفية الافتراضي:{" "}
                <span className="font-bold text-brand-espresso">{text(values.events_filter_all_label, "كل الفعاليات")}</span>
              </p>
              <p className="text-brand-espresso/70">
                صورة الهيرو:{" "}
                <span className="font-bold text-brand-espresso">
                  {values.events_hero_image_url.trim() ? "صورة مخصصة محددة" : "الصورة الافتراضية للمنصة"}
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-brand-sand/40 p-4 text-xs">
              <p className="font-bold text-brand-espresso">بطاقة محركات البحث (SEO)</p>
              <p className="mt-1 font-semibold text-brand-primary">{text(values.seo_events_title, "فعاليات أندلسيا — أجندة الحفلات")}</p>
              <p className="mt-1 text-brand-espresso/70 line-clamp-2">{text(values.seo_events_description, "جدول الفعاليات والأمسيات الموسيقية القادمة.")}</p>
            </div>
          </>
        )}

        {tab === "news" && (
          <>
            <section className="rounded-2xl bg-brand-espresso p-5 text-brand-tint" aria-label="معاينة هيرو الأخبار">
              <p className="text-xs font-bold text-brand-primary">{text(values.news_kicker, "أخبار المنصة")}</p>
              <h3 className="mt-3 text-lg font-bold leading-relaxed">{text(values.news_title, "الأخبار والمقالات")}</h3>
              <p className="mt-2 text-xs leading-relaxed text-brand-tint/80">
                {text(values.news_subtitle, "متابعة مستمرة لجديد المشهد الثقافي والموسيقي ومسارات الفنانين.")}
              </p>
            </section>

            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-white p-4 text-xs">
              <p className="font-bold text-brand-espresso mb-1">طريقة العرض</p>
              <p className="text-brand-espresso/70 leading-relaxed">
                تعتمد الصفحة على المقالات المنشورة مع تمييز المقال البطل وبطاقات الشبكة الثلاث.
              </p>
            </div>

            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-brand-sand/40 p-4 text-xs">
              <p className="font-bold text-brand-espresso">بطاقة محركات البحث (SEO)</p>
              <p className="mt-1 font-semibold text-brand-primary">{text(values.seo_news_title, "أخبار أندلسيا ومقالات الموسيقى")}</p>
              <p className="mt-1 text-brand-espresso/70 line-clamp-2">{text(values.seo_news_description, "آخر الأخبار والمقالات الثقافية والموسيقية.")}</p>
            </div>
          </>
        )}

        {tab === "artists" && (
          <>
            <section className="rounded-2xl bg-brand-espresso p-5 text-brand-tint" aria-label="معاينة هيرو الفنانين">
              <span className="inline-block rounded bg-brand-primary/20 px-2 py-0.5 text-xs font-bold text-brand-primary">
                /artists
              </span>
              <h3 className="mt-3 text-lg font-bold leading-relaxed">{text(values.artists_title, "دليل فناني أندلسيا")}</h3>
              <p className="mt-2 text-xs leading-relaxed text-brand-tint/80">
                {text(values.artists_subtitle, "كل فنان في أندلسيا يحمل قصة ومعاناة تحوّلت إلى موسيقى تلامس القلوب.")}
              </p>
            </section>

            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-white p-4 text-xs space-y-2">
              <p className="font-bold text-brand-espresso">عناصر واجهة الفنانين</p>
              <p className="text-brand-espresso/70">
                زر التصفية الافتراضي:{" "}
                <span className="font-bold text-brand-espresso">{text(values.artists_filter_all_label, "كل الفنانين")}</span>
              </p>
              <p className="text-brand-espresso/70">
                صورة الهيرو:{" "}
                <span className="font-bold text-brand-espresso">
                  {values.artists_hero_image_url.trim() ? "صورة مخصصة محددة" : "الصورة الافتراضية للمنصة"}
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-brand-sand/40 p-4 text-xs">
              <p className="font-bold text-brand-espresso">بطاقة محركات البحث (SEO)</p>
              <p className="mt-1 font-semibold text-brand-primary">{text(values.seo_artists_title, "فنانو أندلسيا — دليل المواهب")}</p>
              <p className="mt-1 text-brand-espresso/70 line-clamp-2">{text(values.seo_artists_description, "دليل الفنانين والموسيقيين المبدعين في المنصة.")}</p>
            </div>
          </>
        )}

        {tab === "academy" && (
          <>
            <section className="rounded-2xl bg-brand-espresso p-5 text-brand-tint" aria-label="معاينة هيرو الأكاديمية">
              <p className="text-xs font-bold text-brand-primary">{text(values.academy_kicker, "أكاديمية أندلسيا")}</p>
              <h3 className="mt-3 text-lg font-bold leading-relaxed">{text(values.academy_title, "البرامج والمسارات الفنية")}</h3>
              <p className="mt-2 text-xs leading-relaxed text-brand-tint/80">
                {text(values.academy_subtitle, "برامج تعليمية موسيقية مع فنانين حقيقيين في بيئات صغيرة ومكثفة.")}
              </p>
            </section>

            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-white p-4 text-xs space-y-2">
              <p className="font-bold text-brand-espresso">عناوين الأقسام المرافقة</p>
              <p className="text-brand-espresso/70">
                المسارات: <span className="font-semibold text-brand-espresso">{text(values.academy_tracks_heading, "المسارات التعليمية")}</span>
              </p>
              <p className="text-brand-espresso/70">
                القيم: <span className="font-semibold text-brand-espresso">{text(values.academy_values_heading, "قيم الأكاديمية")}</span>
              </p>
              <p className="text-brand-espresso/70">
                النشرة: <span className="font-semibold text-brand-espresso">{text(values.academy_newsletter_heading, "انضم إلى نشرتنا")}</span>
              </p>
            </div>

            <div className="rounded-xl border border-brand-espresso-subtle/40 bg-brand-sand/40 p-4 text-xs">
              <p className="font-bold text-brand-espresso">بطاقة محركات البحث (SEO)</p>
              <p className="mt-1 font-semibold text-brand-primary">{text(values.seo_academy_title, "أكاديمية أندلسيا الموسيقية")}</p>
              <p className="mt-1 text-brand-espresso/70 line-clamp-2">{text(values.seo_academy_description, "ورش ودورات موسيقية احترافية مع كبار العازفين والفنانين.")}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function PagesEditor({ settings, summaries, initialTab = "home" }: PagesEditorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlTab = searchParams.get("tab") as TabKey | null;
  const activeTab: TabKey =
    urlTab && TABS.some((t) => t.key === urlTab)
      ? urlTab
      : initialTab && TABS.some((t) => t.key === initialTab)
      ? initialTab
      : "home";

  const {
    values,
    setField,
    setNumberField,
    setBooleanField,
    save,
    pending,
    result,
  } = useSiteSettingsForm(settings);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  const handleTabChange = (key: TabKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Shared Save Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-brand-espresso-subtle/50 bg-white p-4 shadow-sm">
        <div className="min-h-6 text-sm" aria-live="polite">
          {pending && <p className="text-brand-espresso/70">جارٍ حفظ التغييرات…</p>}
          {!pending && result?.ok && (
            <p role="status" className="font-semibold text-alert-success">
              تم حفظ إعدادات الصفحات بنجاح.
            </p>
          )}
          {!pending && result && !result.ok && (
            <p role="alert" className="font-semibold text-alert-error">
              {result.error || "تعذر حفظ إعدادات الصفحات."}
            </p>
          )}
        </div>
        <Button
          type="button"
          onClick={() => save()}
          isLoading={pending}
          disabled={pending}
          className="self-end sm:self-auto min-h-[44px]"
        >
          حفظ كل التغييرات
        </Button>
      </div>

      {/* Tab Navigation (Horizontally scrollable tabstrip on mobile) */}
      <div
        role="tablist"
        aria-label="أقسام صفحات الموقع"
        className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 border-b border-brand-espresso-subtle/40 pb-3"
      >
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              role="tab"
              type="button"
              aria-selected={isSelected}
              aria-controls={`tabpanel-${tab.key}`}
              onClick={() => handleTabChange(tab.key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all min-h-[44px] cursor-pointer ${
                isSelected
                  ? "bg-brand-primary text-white shadow-sm"
                  : "bg-white text-brand-espresso/75 hover:bg-brand-sand/60 hover:text-brand-espresso border border-brand-espresso-subtle/50"
              }`}
            >
              <span>{tab.label}</span>
              <span dir="ltr" className={`text-xs ${isSelected ? "text-white/80" : "text-brand-espresso/45"}`}>
                {tab.route}
              </span>
            </button>
          );
        })}
      </div>

      {/* Editor Content + Live Preview Grid */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="focus-visible:outline-none"
        >
          {activeTab === "home" && (
            <HomeTab
              values={values}
              setField={setField}
              setNumberField={setNumberField}
              setBooleanField={setBooleanField}
            />
          )}

          {activeTab === "events" && (
            <EventsTab
              values={values}
              setField={setField}
              summary={summaries.events}
            />
          )}

          {activeTab === "news" && (
            <NewsTab
              values={values}
              setField={setField}
              summary={summaries.news}
            />
          )}

          {activeTab === "artists" && (
            <ArtistsTab
              values={values}
              setField={setField}
              summary={summaries.artists}
            />
          )}

          {activeTab === "academy" && (
            <AcademyTab
              values={values}
              setField={setField}
              summary={summaries.academy}
            />
          )}

          {activeTab === "booking" && <BookingTab values={values} setField={setField} />}
        </div>

        {/* Desktop per-tab live preview (>=1280px) */}
        <div className="hidden xl:block">
          <TabLivePreview tab={activeTab} values={values} />
        </div>
      </div>

      {/* Floating Preview Button (<1280px) */}
      <div className="fixed bottom-6 end-6 z-40 xl:hidden">
        <button
          type="button"
          onClick={() => setMobilePreviewOpen(true)}
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
      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex flex-col justify-end" dir="rtl">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobilePreviewOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Modal */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col w-full z-10 animate-in slide-in-from-bottom duration-200 pb-safe">
            <div className="p-4 border-b border-brand-espresso-subtle flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-brand-espresso">المعاينة المباشرة</span>
                <span className="text-xs text-brand-primary font-medium">({TABS.find((t) => t.key === activeTab)?.label})</span>
              </div>
              <button
                type="button"
                onClick={() => setMobilePreviewOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-brand-espresso/70 hover:bg-brand-surface text-sm font-bold cursor-pointer"
                aria-label="إغلاق المعاينة"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <TabLivePreview tab={activeTab} values={values} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
