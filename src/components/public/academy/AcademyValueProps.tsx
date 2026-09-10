import React from "react";
import { Container, Grid } from "@/components/ui/LayoutPrimitives";
import { Card, CardContent } from "@/components/ui/Card";

export interface ValuePropItem {
  id: string;
  title: string;
  description: string;
  number: string;
}

export const CANONICAL_VALUE_PROPS: ValuePropItem[] = [
  {
    id: "small-groups",
    title: "مجموعات صغيرة",
    description: "لا تتجاوز ثمانية مشاركين لضمان جودة التركيز والتوجيه الفردي وتطوير الأداء لكل طالب.",
    number: "٠١",
  },
  {
    id: "active-artists",
    title: "فنانون من الواقع",
    description: "أساتذة هم فنانون نشطون في مجالهم، ينقلون خبراتهم العملية الحقيقية من المسارح والاستوديوهات.",
    number: "٠٢",
  },
  {
    id: "live-performance",
    title: "أداء حقيقي",
    description: "كل برنامج ينتهي بعرض متكامل أمام جمهور حقيقي يمنح الطالب تجربة الوقوف الفعلي على المسرح.",
    number: "٠٣",
  },
];

/**
 * Academy Value Propositions Section
 * Figma Node: 91:16119 / 91:16352 / 91:16359 / 91:16366 / 91:16373
 * - Section Title: "التعلّم هنا مختلف"
 * - 3 Pillars: "مجموعات صغيرة", "فنانون من الواقع", "أداء حقيقي"
 */
export function AcademyValueProps() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-secondary-100/50 border-y border-brand-espresso-subtle">
      <Container>
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <span className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-2 inline-block">
            رؤيتنا التعليمية
          </span>
          <h2 className="font-calligraphic text-2xl sm:text-3xl md:text-4xl font-bold text-brand-espresso mb-3">
            التعلّم هنا مختلف
          </h2>
          <p className="text-sm sm:text-base text-gradscale-400 font-sans">
            منهجية تدريب حية تبني المهارة من التجربة المباشرة لا التلقين النظري.
          </p>
        </div>

        {/* 3 Core Pillars Grid */}
        <Grid cols={3} className="gap-6 lg:gap-8">
          {CANONICAL_VALUE_PROPS.map((prop) => (
            <Card
              key={prop.id}
              variant="default"
              className="bg-white p-6 sm:p-8 rounded-card border border-brand-espresso-subtle/80 hover:border-primary-500/40 transition-all duration-200 shadow-sm"
            >
              <CardContent className="p-0 space-y-4 text-start">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-primary-500/40">
                    {prop.number}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-xs font-bold font-mono">
                    ♪
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-brand-espresso font-sans">
                  {prop.title}
                </h3>

                <p className="text-sm text-gradscale-400 font-sans leading-relaxed">
                  {prop.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Container>
    </section>
  );
}
