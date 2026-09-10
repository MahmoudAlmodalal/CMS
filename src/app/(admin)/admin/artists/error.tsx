"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function ArtistsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Artists admin page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center rounded-card border border-alert-error/20 bg-white p-6 text-center">
      <p className="text-sm font-bold text-alert-error">تعذر تحميل الفنانين</p>
      <h1 className="mt-2 text-xl font-bold text-brand-espresso">حدث خطأ أثناء تحميل مساحة الفنانين</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-gradscale-400">تحقق من الاتصال ثم حاول إعادة تحميل القائمة.</p>
      <Button type="button" size="sm" className="mt-6" onClick={() => reset()}>إعادة المحاولة</Button>
    </div>
  );
}
