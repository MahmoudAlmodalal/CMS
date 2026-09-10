import React from "react";
import Link from "next/link";

export default function AdminUnauthorized() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-brand-espresso-subtle/70 shadow-2xs">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
        <svg
          width={28}
          height={28}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h1 className="text-xl font-bold font-sans text-brand-espresso mb-2">
        غير مصرح لك بالوصول
      </h1>
      <p className="text-sm text-gradscale-400 max-w-md mb-6">
        هذه المنطقة مخصصة لمديري النظام فقط. يرجى تسجيل الدخول بحساب يحمل صلاحية مدير النظام (Admin).
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 transition-colors shadow-xs"
        >
          تسجيل الدخول
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-brand-espresso-subtle/70 text-xs font-semibold text-brand-espresso hover:bg-brand-surface transition-colors"
        >
          العودة للموقع العام
        </Link>
      </div>
    </div>
  );
}
