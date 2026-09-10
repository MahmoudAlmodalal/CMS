import React from "react";
import { Container } from "@/components/ui/LayoutPrimitives";

export default function ArtistsPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="space-y-4 text-start">
        <span className="text-xs font-bold text-brand-primary">دليل الفنانين</span>
        <h1 className="font-calligraphic text-3xl sm:text-4xl font-bold text-brand-espresso">
          فنانو فرقة أندلسيا
        </h1>
        <p className="text-base text-brand-espresso/80">
          نخبة من الموسيقيين والعازفين المتخصصين في التراث الأندلسي والمقامات الشرقية.
        </p>
      </div>
    </Container>
  );
}
