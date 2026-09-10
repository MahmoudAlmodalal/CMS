import React from "react";
import { Container } from "@/components/ui/LayoutPrimitives";

export default function EventsPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="space-y-4 text-start">
        <span className="text-xs font-bold text-brand-primary">جدول العروض</span>
        <h1 className="font-calligraphic text-3xl sm:text-4xl font-bold text-brand-espresso">
          الفعاليات والحفلات القادمة
        </h1>
        <p className="text-base text-brand-espresso/80">
          استكشف مواعيد الأمسيات والمهرجانات الموسيقية واحجز تذكرتك مباشرة.
        </p>
      </div>
    </Container>
  );
}
