"use client";

import React, { useCallback, useEffect, useState } from "react";
import { runDiagnosticsAction, type CheckRow, type CheckStatus, type DiagnosticsReport, type MediaProbe } from "@/actions/diagnostics";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const STATUS_STYLES: Record<CheckStatus, string> = {
  ok: "bg-alert-success/10 text-alert-success border-alert-success/30",
  warn: "bg-amber-50 text-amber-800 border-amber-300",
  fail: "bg-red-50 text-red-700 border-red-300",
};

const STATUS_LABELS: Record<CheckStatus, string> = {
  ok: "سليم",
  warn: "تنبيه",
  fail: "خطأ",
};

function StatusPill({ status }: { status: CheckStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function CheckList({ rows }: { rows: CheckRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-brand-espresso/60">لا توجد نتائج.</p>;
  }
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li
          key={row.label}
          className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-brand-espresso-subtle/50 bg-white p-3"
        >
          <div className="min-w-0 flex-1">
            <p dir="ltr" className="text-start font-mono text-sm font-bold text-brand-espresso">
              {row.label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-brand-espresso/70">{row.detail}</p>
          </div>
          <StatusPill status={row.status} />
        </li>
      ))}
    </ul>
  );
}

function ProbeList({ probes, empty }: { probes: MediaProbe[]; empty: string }) {
  if (probes.length === 0) {
    return <p className="text-sm text-brand-espresso/60">{empty}</p>;
  }
  return (
    <ul className="space-y-2">
      {probes.map((probe, index) => (
        <li
          key={`${probe.source}-${probe.url}-${index}`}
          className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-brand-espresso-subtle/50 bg-white p-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-brand-espresso">{probe.source}</p>
            <p dir="ltr" className="mt-1 truncate text-start font-mono text-xs text-brand-espresso/60">
              {probe.url}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-brand-espresso/70">{probe.detail}</p>
          </div>
          <StatusPill status={probe.status} />
        </li>
      ))}
    </ul>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/**
 * Runs the deployment checks and shows the result.
 *
 * Runs once on mount, because the first question anyone opening this page has is
 * "what is broken right now", and re-runs on demand after a fix so the same page
 * confirms it.
 */
export function DiagnosticsPanel() {
  const [report, setReport] = useState<DiagnosticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(() => {
    setLoading(true);
    setError(null);
    runDiagnosticsAction()
      .then((res) => {
        if (res.success) {
          setReport(res.report);
        } else {
          setError(res.error);
          setReport(null);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "فشل تشغيل الفحص");
        setReport(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  const failures = report
    ? [...report.env, ...report.storage, ...report.schema].filter((r) => r.status === "fail").length +
      report.media.filter((p) => p.status === "fail").length +
      report.youtube.filter((p) => p.status === "fail").length
    : 0;

  return (
    <div className="space-y-6" dir="rtl">
      <Card variant="surface">
        <CardHeader>
          <CardTitle>فحص النشر</CardTitle>
          <CardDescription>
            يسأل النشر الحالي مباشرةً: هل المتغيّرات مضبوطة، هل مفتاح الخدمة صالح، هل الحاويات تُسرد،
            هل الأعمدة موجودة في قاعدة بيانات الإنتاج، وهل كل رابط وسائط محفوظ يستجيب فعلاً.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-h-6 text-sm" aria-live="polite">
            {loading && <p className="text-brand-espresso/60">جارٍ تشغيل الفحص…</p>}
            {!loading && report && failures === 0 && (
              <p role="status" className="font-bold text-alert-success">
                كل الفحوصات سليمة.
              </p>
            )}
            {!loading && report && failures > 0 && (
              <p role="status" className="font-bold text-red-700">
                {failures} فحصاً فاشلاً — التفاصيل أدناه.
              </p>
            )}
            {!loading && error && (
              <p role="alert" className="font-bold text-red-700">
                {error}
              </p>
            )}
          </div>
          <Button type="button" onClick={run} isLoading={loading} disabled={loading}>
            إعادة تشغيل الفحص
          </Button>
        </CardContent>
      </Card>

      {report && (
        <>
          <Section
            title="متغيّرات البيئة"
            description="وجود المتغيّرات وشكلها فقط — لا تُعرض أي قيمة سرّية."
          >
            <CheckList rows={report.env} />
          </Section>

          <Section
            title="حاويات التخزين"
            description="هل تستجيب كل حاوية لطلب سرد بصلاحيات القراءة العامة."
          >
            <CheckList rows={report.storage} />
          </Section>

          <Section
            title="أعمدة قاعدة البيانات"
            description="عمود ناقص هنا يعني أن هجرة لم تُطبَّق على قاعدة بيانات الإنتاج."
          >
            <CheckList rows={report.schema} />
          </Section>

          <Section
            title="روابط الوسائط المحفوظة"
            description={
              report.mediaTruncated
                ? "أول 25 رابطاً لكل عمود. رمز 404 هنا يعني أن الرابط محفوظ لكن الملف غير موجود في التخزين."
                : "رمز 404 هنا يعني أن الرابط محفوظ لكن الملف غير موجود في التخزين."
            }
          >
            <ProbeList
              probes={report.media}
              empty="لا توجد روابط تخزين محفوظة لفحصها (الصور المحلية تحت ‎/assets‎ لا تُفحص)."
            />
          </Section>

          <Section
            title="روابط يوتيوب المحفوظة"
            description="رابط لا يُستخرج منه معرّف لن يُعرض على الموقع إطلاقاً."
          >
            <ProbeList probes={report.youtube} empty="لا توجد روابط يوتيوب محفوظة." />
          </Section>

          <p dir="ltr" className="text-start text-xs text-brand-espresso/50">
            {report.generatedAt}
          </p>
        </>
      )}
    </div>
  );
}

export default DiagnosticsPanel;
