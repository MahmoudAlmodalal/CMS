"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    // Log unexpected admin workspace error
    console.error("Admin workspace boundary error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-brand-espresso-subtle/70 shadow-2xs">
      <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
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
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h1 className="text-xl font-bold font-sans text-brand-espresso mb-2">
        حدث خطأ غير متوقع في لوحة التحكم
      </h1>
      <p className="text-sm text-gradscale-400 max-w-md mb-6">
        تعذر إكمال طلبك في هذه الصفحة. يمكنك محاولة إعادة تحميل المحتوى أو العودة للرئيسية.
      </p>

      {error.digest && (
        <p className="text-xs font-mono text-brand-espresso/40 mb-4 bg-brand-surface px-2.5 py-1 rounded" dir="ltr">
          رمز الخطأ: {error.digest}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => reset()}
        >
          إعادة المحاولة
        </Button>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-brand-espresso-subtle/70 text-xs font-semibold text-brand-espresso hover:bg-brand-surface transition-colors"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
