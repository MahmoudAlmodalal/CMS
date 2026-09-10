import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/LayoutPrimitives";

export default function HomePage() {
  return (
    <Container className="py-12 sm:py-16 lg:py-20">
      <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-surface border border-brand-primary/20 text-brand-primary text-xs font-bold">
          <span>فرقة أندلسيا للموسيقى والتراث</span>
        </div>
        <h1 className="font-calligraphic text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-espresso leading-tight">
          منصتك الأولى لاكتشاف ودعم المواهب الفنية والثقافية
        </h1>
        <p className="text-base sm:text-lg text-brand-espresso/80 leading-relaxed max-w-2xl">
          أندلسيا منصة متخصصة في تمثيل ودعم المواهب الفنية التراثية وإحياء المقامات والموشحات الأندلسية عبر فعاليات ثقافية وأكاديمية متكاملة.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/booking"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl bg-brand-primary text-brand-tint font-bold text-base shadow-sm hover:bg-brand-primary-hover active:bg-brand-primary-pressed transition-all"
          >
            احجز الآن
          </Link>
          <Link
            href="/artists"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl bg-brand-surface hover:bg-brand-surface/80 text-brand-espresso font-bold text-base border border-brand-espresso/10 transition-all"
          >
            اكتشف الفنانين
          </Link>
        </div>
      </div>
    </Container>
  );
}
