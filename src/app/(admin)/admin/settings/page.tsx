import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import { getSiteSettings } from "@/lib/dal/site-settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold font-sans text-brand-espresso">إعدادات الموقع</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-brand-espresso/60">
          حدّث النصوص التي تظهر للزوار في الصفحة الرئيسية، الحجز، التواصل، والتذييل.
        </p>
        <p className="inline-flex items-center gap-2 rounded-full border border-brand-espresso-subtle/60 bg-white px-3 py-1 text-xs text-brand-espresso/60">
          سجل الإعدادات المفرد: <code dir="ltr" className="font-mono text-brand-espresso">id = default</code>
        </p>
      </header>

      <SiteSettingsForm settings={settings} />
    </div>
  );
}
