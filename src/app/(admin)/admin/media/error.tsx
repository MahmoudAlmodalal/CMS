"use client";

import { useEffect } from "react";

/**
 * Error boundary for مكتبة الوسائط.
 *
 * Without one, a throw anywhere in this tree — including a failed client bundle
 * — left the server-rendered "جارٍ تحميل الملفات…" on screen with no way to tell
 * that anything had gone wrong. /admin, /admin/artists and /admin/works already
 * had a boundary; this route did not.
 */
export default function MediaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin/media]", error);
  }, [error]);

  return (
    <div dir="rtl" className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-start">
      <h2 className="text-lg font-bold text-red-800">تعذّر فتح مكتبة الوسائط</h2>
      <p className="text-sm text-red-700">
        {error.message || "حدث خطأ غير متوقع أثناء تحميل المكتبة."}
      </p>
      {error.digest && (
        <p dir="ltr" className="text-start font-mono text-xs text-red-600">
          {error.digest}
        </p>
      )}
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-800"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
