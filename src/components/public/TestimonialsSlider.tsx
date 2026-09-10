"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/LayoutPrimitives";
import { ChevronStartIcon, ChevronEndIcon } from "@/components/ui/Icons";
import type { Testimonial } from "@/lib/dal/testimonials";

interface TestimonialsSliderProps {
  testimonials: Testimonial[];
}

/**
 * Verified against Figma Section 87:14313 & Component 22 (176:6169):
 * - Dimensions: Fixed 1447x597px desktop height (min-h-[597px] lg:h-[597px])
 * - Surface: Warm parchment #F9F7F0 (bg-[#F9F7F0], replacing legacy surface)
 * - Heading: Cairo Bold 64px "يقولون عن أندلسيا" (Node 87:14314)
 * - Single quote card geometry: 805x161px (Frame 176:6169)
 * - Rating: 5 gold stars (#FFD900, Node 176:2357)
 * - Navigation: 48x48px circular white buttons + 24x12px active indicator pill
 * - Clean layout: Strictly NO invented pill badge ("شهادات وآراء" purged)
 */
export function TestimonialsSlider({ testimonials }: TestimonialsSliderProps) {
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
      className="min-h-[597px] lg:h-[597px] bg-[#F9F7F0] flex flex-col justify-center relative overflow-hidden py-16 lg:py-0 border-t border-brand-espresso/5"
      aria-roledescription="carousel"
      aria-label="يقولون عن أندلسيا"
    >
      <Container>
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-10">
          {/* Section Header (Figma 87:14314 — Cairo Bold 64px, NO badge) */}
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-[64px] font-bold text-brand-espresso leading-[1.25] tracking-tight">
            يقولون عن أندلسيا
          </h2>

          {/* Single Quote Card Geometry (Figma Frame 176:6169 — 805x161px) */}
          <div className="w-full max-w-[805px] min-h-[161px] mx-auto flex items-center justify-between gap-4 sm:gap-6">
            {/* Previous Arrow Button (Logical RTL: right arrow moves back) */}
            <button
              type="button"
              onClick={handlePrev}
              className="w-12 h-12 rounded-full bg-white border border-brand-espresso/15 shadow-xs flex items-center justify-center text-brand-espresso hover:bg-brand-surface hover:text-brand-primary active:scale-95 transition-all shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label="الشهادة السابقة"
            >
              <ChevronStartIcon size={20} />
            </button>

            {/* Central Quote Content (Frame 51: max-w 553px) */}
            <div className="flex-1 max-w-[553px] flex flex-col items-center text-center space-y-4">
              {/* Quote Body */}
              <blockquote className="font-sans text-base sm:text-lg lg:text-[20px] text-brand-espresso font-medium leading-relaxed">
                &ldquo;{current.quote}&rdquo;
              </blockquote>

              {/* Author & 5-Star Rating Lockup */}
              <div className="flex flex-col items-center space-y-1.5 pt-1">
                <cite className="font-sans text-sm sm:text-base font-bold text-brand-espresso not-italic">
                  {current.author_name}
                </cite>

                {/* 5 Stars Rating (Figma Node 176:2357 — Fill #FFD900) */}
                <div className="flex items-center gap-1 text-[#FFD900]" aria-label="تقييم 5 من 5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3.5 h-3.5 fill-current"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path d="M7 0.5L8.91 4.79L13.5 5.38L10.05 8.49L11.02 13.01L7 10.71L2.98 13.01L3.95 8.49L0.5 5.38L5.09 4.79L7 0.5Z" />
                    </svg>
                  ))}
                </div>

                {current.author_role && (
                  <span className="font-sans text-xs text-brand-espresso/70">
                    {current.author_role}
                  </span>
                )}
              </div>
            </div>

            {/* Next Arrow Button */}
            <button
              type="button"
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-white border border-brand-espresso/15 shadow-xs flex items-center justify-center text-brand-espresso hover:bg-brand-surface hover:text-brand-primary active:scale-95 transition-all shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label="الشهادة التالية"
            >
              <ChevronEndIcon size={20} />
            </button>
          </div>

          {/* Indicators / Pagination (Frame 49: 24x12px active pill + 12x12px dots) */}
          <div className="flex items-center justify-center gap-2 pt-2" role="tablist" aria-label="مؤشرات الشهادات">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-3 rounded-full transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary ${
                  idx === currentIndex
                    ? "w-6 bg-brand-primary"
                    : "w-3 bg-white border border-brand-espresso/20 hover:border-brand-espresso/40"
                }`}
                aria-label={`الانتقال إلى الشهادة ${idx + 1}`}
                aria-selected={idx === currentIndex}
                role="tab"
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
