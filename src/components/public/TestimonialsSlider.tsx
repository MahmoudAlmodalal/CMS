"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/LayoutPrimitives";
import { ChevronStartIcon, ChevronEndIcon } from "@/components/ui/Icons";
import { Highlight } from "@/components/ui/Highlight";
import type { Testimonial } from "@/lib/dal/testimonials";
import { ScrollReveal } from "@/components/public/ScrollReveal";

interface TestimonialsSliderProps {
  testimonials: Testimonial[];
  /** Admin override for the section heading (`*...*` highlights). Falls back to built-in copy. */
  heading?: string;
}

/**
 * Verified against Figma Section 87:14313 & Component 22 (176:6169):
 * - Dimensions: 1447x597 desktop, surface #F9F7F0
 * - Heading (87:14314): Qahwa Arabic Regular 64px/48, `أندلسيا` carrying a second #C54716 fill
 * - Quote (176:2351): Cairo Medium 20px/30.4, centered, #000, 540px
 * - Author lockup (176:2354): name Cairo Bold 13.12px with the 5x14px star row
 *   beneath it, and a 36x36 round avatar alongside (176:1822), 9px gap
 * - Arrows (176:5834): 48px white pills, radius 50px
 * - Indicators (176:2369): 24x12 terracotta pill + 12x12 white dots
 *
 * The 390 frame (136:5416, 0..450 at y=2516) draws none of the carousel furniture:
 * no arrows and no indicators, just the heading 83 down in a 48 box and one white
 * 305x167 card 48 under it, at x=32 — 33 in from the Container's own start edge.
 * Inside the card the lockup comes first (136:7490, 36 tall, 26.5 down, the avatar
 * at the inline start) and the quote under it (136:7506, a 78 block whose 66 of
 * text is 12 down). The band closes 104 under the card, and the next one opens 30
 * after that, which the page carries.
 */
export function TestimonialsSlider({ testimonials, heading }: TestimonialsSliderProps) {
  const t = useTranslations("testimonials");
  const home = useTranslations("home");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
  const reducedMotion = useReducedMotion();
  const swipeStartX = useRef<number | null>(null);

  const total = testimonials?.length ?? 0;

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setSlideDirection("prev");
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setSlideDirection("next");
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  const handleIndicatorChange = (index: number) => {
    setSlideDirection(index >= currentIndex ? "next" : "prev");
    setCurrentIndex(index);
  };

  const handleSwipeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    swipeStartX.current = event.clientX;
  };

  const handleSwipeEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (swipeStartX.current === null) return;
    const deltaX = event.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(deltaX) < 45) return;

    // A left swipe advances naturally; the visual motion remains RTL-safe.
    const forward = deltaX < 0;
    if (forward) handleNext();
    else handlePrev();
  };

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
      className="relative flex min-h-0 flex-col overflow-hidden bg-[#F9F7F0] py-12 lg:h-[597px] lg:min-h-[597px] lg:justify-center lg:py-0"
      aria-roledescription="carousel"
      aria-label={t("region")}
    >
      <Container>
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center lg:space-y-10">
          {/* Section Header (Figma 87:14314 — Qahwa Arabic Regular 64px/48, 2-fill) */}
          <ScrollReveal>
            <h2 className="font-display text-[32px] font-normal leading-[48px] text-black lg:text-[64px] lg:leading-[1.4296875]">
              <Highlight text={heading || home("testimonialsHeading")} />
            </h2>
          </ScrollReveal>

          {/* Quote Card (Figma Frame 176:6169 — 805x161px, 78px gap) */}
          <div className="mx-auto mt-6 flex h-auto min-h-0 w-full min-w-0 items-center justify-center gap-2 lg:mt-0 lg:min-h-[161px] lg:max-w-[805px] lg:justify-between lg:gap-6">
            {/* Previous Arrow (Logical RTL: right arrow moves back) */}
            {total > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-espresso shadow-sm transition-all hover:text-brand-primary active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary lg:h-12 lg:w-auto lg:px-3"
                aria-label={t("previous")}
              >
                <ChevronStartIcon size={20} />
              </button>
            )}

            {/* Central Quote Content (Frame 176:2484 — max-w 553px, gap 16) */}
            <AnimatePresence initial={false} mode="wait" custom={slideDirection}>
              <motion.div
                key={`${current.id ?? current.author_name}-${currentIndex}`}
                custom={slideDirection}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: slideDirection === "next" ? 24 : -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 1 } : { opacity: 0, x: slideDirection === "next" ? -24 : 24 }}
                transition={{ duration: reducedMotion ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
                onPointerDown={handleSwipeStart}
                onPointerUp={handleSwipeEnd}
                onPointerCancel={() => { swipeStartX.current = null; }}
                onPointerLeave={() => { swipeStartX.current = null; }}
                style={{ touchAction: "pan-y", userSelect: "none" }}
                className={`flex h-auto min-h-[167px] min-w-0 shrink flex-col-reverse items-start rounded-[16px] bg-white p-6 text-start ${
                  total > 1 ? "w-[min(305px,calc(100%_-_80px))]" : "w-full max-w-[305px]"
                } lg:max-w-[553px] lg:flex-1 lg:items-center lg:rounded-none lg:bg-transparent lg:p-0 lg:text-center`}
                aria-live="polite"
              >
              {/* Quote Body (176:2351 — Cairo Medium 20px/30.4, 540px) */}
              <blockquote className="h-auto min-h-[78px] w-full max-w-full break-words [overflow-wrap:break-word] pt-3 font-sans text-[14px] font-medium leading-[22px] text-black lg:h-auto lg:max-w-[540px] lg:pt-0 lg:text-[20px] lg:leading-[1.52]">
                &ldquo;{current.quote}&rdquo;
              </blockquote>

              {/* Author lockup: name + stars, avatar alongside (176:2353, gap 9) */}
              <div className="flex h-[36px] items-center gap-[9px]">
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
                className="hidden items-center justify-center gap-0.5 pt-2 lg:flex"
                role="tablist"
                aria-label={t("indicators")}
              >
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                  onClick={() => handleIndicatorChange(idx)}
                    className={`h-3 mx-[1px] rounded-full transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary ${
                      idx === currentIndex ? "w-6 bg-brand-primary" : "w-3 bg-white"
                    }`}
                    aria-label={t("goTo", { index: idx + 1 })}
                    aria-selected={idx === currentIndex}
                    role="tab"
                  />
                ))}
              </div>
              </motion.div>
            </AnimatePresence>

            {/* Next Arrow */}
            {total > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-espresso shadow-sm transition-all hover:text-brand-primary active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary lg:h-12 lg:w-auto lg:px-3"
                aria-label={t("next")}
              >
                <ChevronEndIcon size={20} />
              </button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
