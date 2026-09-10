import React from "react";
import { Container } from "@/components/ui/LayoutPrimitives";

export default function BookingPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="space-y-4 text-start">
        <span className="text-xs font-bold text-brand-primary">حجز الفعاليات</span>
        <h1 className="font-calligraphic text-3xl sm:text-4xl font-bold text-brand-espresso">
          طلب حجز حفل أو أمسية خاصة
        </h1>
        <p className="text-base text-brand-espresso/80">
          تواصل معنا لتنسيق فرقة أندلسيا لفعاليتك أو مهرجانك القادم في لبنان، المغرب والخليج.
        </p>
      </div>
    </Container>
  );
}
