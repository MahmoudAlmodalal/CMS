"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/LayoutPrimitives";
import { ChevronStartIcon, ChevronEndIcon } from "@/components/ui/Icons";
import { Highlight } from "@/components/ui/Highlight";
import type { Testimonial } from "@/lib/dal/testimonials";

interface TestimonialsSliderProps {
  testimonials: Testimonial[];
}

/**
 * Verified against Figma Section 87:14313 & Component 22 (176:6169):
 * - Dimensions: 1447x597 desktop, surface #F9F7F0
 * - Heading (87:14314): Cairo Bold 64px, `أندلسيا` carrying a second #C54716 fill
 * - Quote (176:2351): Cairo Medium 20px/30.4, centered, #000, 540px
 * - Author lockup (176:2354): name Cairo Bold 13.12px with the 5x14px star row
 *   beneath it, and a 36x36 round avatar alongside (176:1822), 9px gap
 * - Arrows (176:5834): 48px white pills, radius 50px
 * - Indicators (176:2369): 24x12 terracotta pill + 12x12 white dots
 */
export function TestimonialsSlider({ testimonials }: TestimonialsSliderProps) {
  const t = useTranslations("testimonials");
  const home = useTranslations("home");
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = testimonials?.length ?? 0;

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        // In RTL, left arrow goes to next slide
        handleNext();
      } else if (e.key === "ArrowRight") {
        // In RTL, right arrow goes to previous slide
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const current = testimonials[currentIndex];

  return (
    <section
      className="min-h-[597px] lg:h-[597px] bg-[#F9F7F0] flex flex-col justify-center relative overflow-hidden py-16 lg:py-0"
      aria-roledescription="carousel"
      aria-label={t("region")}
    >
      <Container>
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-10">
          {/* Section Header (Figma 87:14314 — Cairo Bold 64px, 2-fill) */}
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-[64px] font-bold text-black leading-[1.4296875]">
            <Highlight text={home("testimonialsHeading")} />
          </h2>

          {/* Quote Card (Figma Frame 176:6169 — 805x161px, 78px gap) */}
          <div className="w-full max-w-[805px] min-h-[161px] mx-auto flex items-center justify-between gap-4 sm:gap-6">
            {/* Previous Arrow (Logical RTL: right arrow moves back) */}
            <button
              type="button"
              onClick={handlePrev}
              className="h-12 px-3 rounded-[50px] bg-white flex items-center justify-center text-brand-espresso hover:text-brand-primary active:scale-95 transition-all shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label={t("previous")}
            >
              <ChevronStartIcon size={24} />
            </button>

            {/* Central Quote Content (Frame 176:2484 — max-w 553px, gap 16) */}
            <div className="flex-1 max-w-[553px] flex flex-col items-center text-center gap-4">
              {/* Quote Body (176:2351 — Cairo Medium 20px/30.4, 540px) */}
              <blockquote className="font-sans text-base sm:text-lg lg:text-[20px] text-black font-medium leading-[1.52] max-w-[540px]">
                &ldquo;{current.quote}&rdquo;
              </blockquote>

              {/* Author lockup: name + stars, avatar alongside (176:2353, gap 9) */}
              <div className="flex items-center gap-[9px]">
                <div className="flex flex-col items-end">
                  <cite className="font-sans text-[13.12px] font-bold text-black not-italic leading-[1.5]">
                    {current.author_name}
                  </cite>

                  {/* 5 Stars (Figma Node 176:2357 — 14px, 3px gap, #FFD900) */}
                  <div
                    className="flex items-center gap-[3px] text-brand-gold"
                    aria-label={t("rating")}
                  >
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-3.5 h-3.5 fill-current"
                        viewBox="0 0 14 14"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path d="M7 0.5L8.91 4.79L13.5 5.38L10.05 8.49L11.02 13.01L7 10.71L2.98 13.01L3.95 8.49L0.5 5.38L5.09 4.79L7 0.5Z" />
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Avatar (Figma Node 176:1822 — 36x36, radius 18) */}
                {current.avatar_image_url ? (
                  <Image
                    src={current.avatar_image_url}
                    alt={current.author_name}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <span
                    className="w-9 h-9 rounded-full bg-brand-primary/15 text-brand-primary flex items-center justify-center font-sans text-sm font-bold shrink-0"
                    aria-hidden="true"
                  >
                    {current.author_name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Indicators (Frame 176:2369 — 24x12 pill + 12x12 dots) */}
              <div
                className="flex items-center justify-center gap-0.5 pt-2"
                role="tablist"
                aria-label={t("indicators")}
              >
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-3 mx-[1px] rounded-full transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary ${
                      idx === currentIndex ? "w-6 bg-brand-primary" : "w-3 bg-white"
                    }`}
                    aria-label={t("goTo", { index: idx + 1 })}
                    aria-selected={idx === currentIndex}
                    role="tab"
                  />
                ))}
              </div>
            </div>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={handleNext}
              className="h-12 px-3 rounded-[50px] bg-white flex items-center justify-center text-brand-espresso hover:text-brand-primary active:scale-95 transition-all shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label={t("next")}
            >
              <ChevronEndIcon size={24} />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
