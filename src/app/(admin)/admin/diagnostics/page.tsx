import React from "react";
import type { Metadata } from "next";
import { DiagnosticsPanel } from "./DiagnosticsPanel";

export const metadata: Metadata = {
  title: "فحص النشر | لوحة التحكم",
};

// The whole point is the live state of this deployment, so nothing here may be
// cached or prerendered.
export const dynamic = "force-dynamic";

export default function AdminDiagnosticsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-sans text-2xl font-bold">فحص النشر</h1>
      <p className="text-sm text-gradscale-400">
        تشخيص ذاتي للبيئة والتخزين وقاعدة البيانات وروابط الوسائط، من داخل النشر نفسه.
      </p>
      <DiagnosticsPanel />
    </div>
  );
}
