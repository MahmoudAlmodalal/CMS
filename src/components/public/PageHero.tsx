import React from "react";
import { Container } from "@/components/ui/LayoutPrimitives";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle?: string | null;
  image?: string;
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image = "/assets/figma/hero-stage-landscape.png",
}: PageHeroProps) {
  return (
    <section
      className="relative isolate min-h-[430px] overflow-hidden bg-brand-espresso text-[#F9F7F0] sm:min-h-[500px]"
      style={{ backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(7,5,17,.52),rgba(43,29,20,.94))]" />
      <Container className="relative z-10 flex min-h-[430px] flex-col items-center justify-center text-center sm:min-h-[500px]">
        <span className="mb-5 inline-flex rounded-full border border-brand-primary/70 bg-brand-primary/85 px-4 py-1.5 text-xs font-bold tracking-wide text-white">
          {eyebrow}
        </span>
        <h1 className="max-w-4xl font-display text-4xl font-normal leading-tight text-[#F9F7F0] sm:text-5xl lg:text-[64px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#F9F7F0]/85 sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </Container>
    </section>
  );
}

export default PageHero;
