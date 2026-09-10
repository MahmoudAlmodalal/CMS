import React from "react";
import { Container } from "@/components/ui/LayoutPrimitives";

export default function NewsPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="space-y-4 text-start">
        <span className="text-xs font-bold text-brand-primary">مدونة التراث</span>
        <h1 className="font-calligraphic text-3xl sm:text-4xl font-bold text-brand-espresso">
          الأخبار والمقالات الثقافية
        </h1>
        <p className="text-base text-brand-espresso/80">
          مقالات متعمقة في تاريخ المقامات الموسيقية، تغطيات المهرجانات، وحوارات الفنانين.
        </p>
      </div>
    </Container>
  );
}
