import React from "react";
import { Container } from "@/components/ui/LayoutPrimitives";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Container className="py-12 sm:py-16">
      <div className="space-y-4 text-start">
        <span className="text-xs font-bold text-brand-primary">المقال الثقافي</span>
        <h1 className="font-calligraphic text-3xl sm:text-4xl font-bold text-brand-espresso">
          المقال ({slug})
        </h1>
      </div>
    </Container>
  );
}
