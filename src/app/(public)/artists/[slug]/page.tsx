import React from "react";
import { Container } from "@/components/ui/LayoutPrimitives";

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Container className="py-12 sm:py-16">
      <div className="space-y-4 text-start">
        <span className="text-xs font-bold text-brand-primary">الملف الشخصي للفنان</span>
        {/* Artist name — Figma الفنان screen: display face (Qahwa) Heading 1 */}
        <h1 className="font-display text-4xl sm:text-5xl font-normal text-brand-espresso leading-[1.25]">
          الفنان ({slug})
        </h1>
      </div>
    </Container>
  );
}
