import React from "react";
import { Container } from "@/components/ui/LayoutPrimitives";

export default function AcademyPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="space-y-4 text-start">
        <span className="text-xs font-bold text-brand-primary">أكاديمية الموسيقى</span>
        <h1 className="font-calligraphic text-3xl sm:text-4xl font-bold text-brand-espresso">
          مسارات التدريب والتعليم الموسيقي
        </h1>
        <p className="text-base text-brand-espresso/80">
          برامج تدريبية متخصصة في العود، المقامات، والغناء الأندلسي والتراثي.
        </p>
      </div>
    </Container>
  );
}
