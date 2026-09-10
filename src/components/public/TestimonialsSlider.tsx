"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/LayoutPrimitives";
import { ChevronStartIcon, ChevronEndIcon } from "@/components/ui/Icons";
import type { Testimonial } from "@/lib/dal/testimonials";

interface TestimonialsSliderProps {
  testimonials: Testimonial[];
}

/**
 * Verified against Figma Section 87:14313 (Nodes 87:14314, 186:1792, 186:1797, 186:1798):
 * - Heading: Cairo Bold 64px "يقولون عن أندلسيا" (NOT the display face — Figma 87:14314)
 * - Large typographic quotation card with decorative quotation marks
 * - Reviewer name and professional role attribution
 * - Interactive slide controls (Prev, Next, Dots indicator)
 * - Accessible keyboard navigation
 */
export function TestimonialsSlider({ testimonials }: TestimonialsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = testimonials.length;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
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
      className="py-20 lg:py-28 bg-[#F7F4EE] relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="آراء النقاد والجمهور عن أندلسيا"
    >
      <Container>
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-10">
          {/* Section Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold">
              <span>شهادات وآراء</span>
            </div>
            <h2 className="font-sans text-4xl lg:text-[64px] font-bold text-brand-espresso leading-[1.25]">
              يقولون عن أندلسيا
            </h2>
          </div>

          {/* Testimonial Active Slide Card */}
          <div className="w-full relative min-h-[260px] flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl bg-white border border-brand-espresso/10 shadow-card">
            {/* Decorative Quote Mark */}
            <div
              className="font-sans text-7xl sm:text-8xl font-bold text-brand-primary/20 select-none leading-none -mb-8"
              aria-hidden="true"
            >
              “
            </div>

            {/* Quote Body */}
            <blockquote className="font-sans text-xl sm:text-2xl lg:text-3xl text-brand-espresso font-bold leading-relaxed max-w-2xl">
              &ldquo;{current.quote}&rdquo;
            </blockquote>

            {/* Author Attribution */}
            <div className="pt-8 flex flex-col items-center space-y-1">
              <cite className="font-sans text-base sm:text-lg font-bold text-brand-espresso not-italic">
                {current.author_name}
              </cite>
              <span className="font-sans text-xs sm:text-sm text-brand-espresso/70">
                {current.author_role}
              </span>
            </div>
          </div>

          {/* Controls: Slider Arrows & Dots */}
          <div className="flex items-center justify-between w-full max-w-xs pt-2">
            {/* Previous Button (Next in logical RTL progression) */}
            <button
              type="button"
              onClick={handlePrev}
              className="w-12 h-12 rounded-2xl bg-white border border-brand-espresso/15 shadow-xs flex items-center justify-center text-brand-espresso hover:bg-brand-surface hover:text-brand-primary active:scale-95 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label="الشهادة السابقة"
            >
              <ChevronStartIcon size={20} />
            </button>

            {/* Indicators */}
            <div className="flex items-center gap-2" role="tablist" aria-label="مؤشرات الشهادات">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary ${
                    idx === currentIndex
                      ? "w-8 bg-brand-primary"
                      : "w-2.5 bg-brand-espresso/20 hover:bg-brand-espresso/40"
                  }`}
                  aria-label={`الانتقال إلى الشهادة ${idx + 1}`}
                  aria-selected={idx === currentIndex}
                  role="tab"
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="w-12 h-12 rounded-2xl bg-white border border-brand-espresso/15 shadow-xs flex items-center justify-center text-brand-espresso hover:bg-brand-surface hover:text-brand-primary active:scale-95 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label="الشهادة التالية"
            >
              <ChevronEndIcon size={20} />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
