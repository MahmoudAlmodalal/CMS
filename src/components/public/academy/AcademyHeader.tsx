import React from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/LayoutPrimitives";
import { Badge } from "@/components/ui/Badge";

interface AcademyHeaderProps {
  subtitle?: string | null;
}

/**
 * Academy Header Section
 * Figma Node: 91:16119 / 91:16346 / 91:16345
 * - Title: "تعلّم من اليد التي تعرف الطريق" (Verified Figma Heading)
 * - Subtitle: Dynamic from site_settings.academy_subtitle
 */
export function AcademyHeader({ subtitle }: AcademyHeaderProps) {
  const t = useTranslations("academy");
  const displaySubtitle = subtitle || t("subtitle");

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden text-center">
      {/* Subtle decorative background glow */}
      <div
        className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-500/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <Container className="relative z-10 max-w-4xl flex flex-col items-center">
        {/* Section Pill / Category Tag */}
        <div className="mb-4">
          <Badge variant="default" className="text-primary-600 bg-primary-50 border-primary-200">
            {t("kicker")}
          </Badge>
        </div>

        {/* Confirmed Figma Headline */}
        <h1 className="font-calligraphic text-3xl sm:text-4xl md:text-5xl lg:text-[56px] text-brand-espresso font-bold leading-tight md:leading-[1.2] mb-6">
          {t("title")}
        </h1>

        {/* Dynamic / Configured Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-gradscale-400 font-sans leading-relaxed max-w-2xl">
          {displaySubtitle}
        </p>
      </Container>
    </section>
  );
}
