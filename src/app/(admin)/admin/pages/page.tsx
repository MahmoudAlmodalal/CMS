import { Suspense } from "react";
import { getSiteSettings } from "@/lib/dal/site-settings";
import { getAdminEvents } from "@/lib/dal/admin-events";
import { getAdminArticles } from "@/lib/dal/admin-articles";
import { getAdminArtists } from "@/lib/dal/artists";
import { getAdminCourses } from "@/lib/dal/admin-academy";
import {
  PagesEditor,
  type PagesSummaries,
  type TabKey,
} from "@/components/admin/pages/PagesEditor";

export const dynamic = "force-dynamic";

interface AdminPagesPageProps {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function AdminPagesPage({ searchParams }: AdminPagesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const rawTab = resolvedSearchParams?.tab;
  const initialTab: TabKey | undefined =
    rawTab && ["home", "events", "news", "artists", "academy"].includes(rawTab)
      ? (rawTab as TabKey)
      : undefined;

  const [settings, eventsRes, articlesRes, artistsRes, coursesRes] = await Promise.all([
    getSiteSettings(),
    getAdminEvents().catch(() => []),
    getAdminArticles().catch(() => []),
    getAdminArtists().catch(() => []),
    getAdminCourses().catch(() => []),
  ]);

  const summaries: PagesSummaries = {
    events: {
      publishedCount: eventsRes.filter((e) => e.is_published).length,
      featuredEventTitle: eventsRes.find((e) => e.is_featured)?.title || null,
    },
    news: {
      publishedCount: articlesRes.filter((a) => a.is_published).length,
      featuredCount: articlesRes.filter((a) => a.is_featured).length,
    },
    artists: {
      publishedCount: artistsRes.filter((a) => a.is_published).length,
      featuredCount: artistsRes.filter((a) => a.is_featured).length,
    },
    academy: {
      publishedCount: coursesRes.filter((c) => c.is_published).length,
    },
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold font-sans text-brand-espresso">صفحات الموقع</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-brand-espresso/60">
          تحرير واجهات ونصوص صفحات الموقع الرئيسية (الرئيسية، الفعاليات، الأخبار، الفنانون، والأكاديمية)، وتخصيص إعدادات تحسين محركات البحث لكل صفحة.
        </p>
        <p className="inline-flex items-center gap-2 rounded-full border border-brand-espresso-subtle/60 bg-white px-3 py-1 text-xs text-brand-espresso/60">
          سجل الإعدادات المفرد: <code dir="ltr" className="font-mono text-brand-espresso">id = default</code>
        </p>
      </header>

      <Suspense fallback={<div className="text-sm text-brand-espresso/60">جارٍ تحميل محرر الصفحات…</div>}>
        <PagesEditor
          settings={settings}
          summaries={summaries}
          initialTab={initialTab}
        />
      </Suspense>
    </div>
  );
}
