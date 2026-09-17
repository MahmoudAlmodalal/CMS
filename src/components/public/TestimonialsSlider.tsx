"use client";

import React, { useRef } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/LayoutPrimitives";
import { ChevronStartIcon, ChevronEndIcon } from "@/components/ui/Icons";
import { Highlight } from "@/components/ui/Highlight";
import type { Testimonial } from "@/lib/dal/testimonials";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { Marquee, type MarqueeHandle } from "./motion/Marquee";
import { useMotionPrefs } from "./motion/useMotionPrefs";

interface TestimonialsSliderProps {
  testimonials: Testimonial[];
  /** Admin override for the section heading (`*...*` highlights). Falls back to built-in copy. */
  heading?: string;
}

/**
 * Verified against Figma Section 87:14313:
 * - Dimensions: 1447x597 desktop, surface #F9F7F0
 * - Heading (87:14314): Qahwa Arabic Regular 64px/48, `أندلسيا` carrying a second #C54716 fill
 * - Quote (176:2351): Cairo Medium on #000; author lockup (176:2354) with the
 *   5x14px star row and a 36x36 round avatar alongside (176:1822), 9px gap
 *
 * The quotes run as a seamless infinite loop (the same single-copy rAF rail as
 * the artists band): visitors reaching the section find the cards already
 * cycling, with no arrows, dots, or duplicated images. Hover and touch never
 * pause it; keyboard focus, background tabs, and reduced motion still it.
 */
export function TestimonialsSlider({ testimonials, heading }: TestimonialsSliderProps) {
  const t = useTranslations("testimonials");
  const home = useTranslations("home");
  const { reduced } = useMotionPrefs();
  const railRef = useRef<MarqueeHandle>(null);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const renderCard = (item: Testimonial) => (
    <figure className="flex w-[280px] shrink-0 flex-col gap-4 rounded-[16px] bg-white p-6 text-start shadow-sm sm:w-[340px] lg:w-[380px]">
      {/* Quote Body (176:2351 — Cairo Medium, #000) */}
      <blockquote className="w-full break-words font-sans text-[14px] font-medium leading-[22px] text-black lg:text-[16px] lg:leading-[1.5]">
        &ldquo;{item.quote}&rdquo;
      </blockquote>

      {/* Author lockup: avatar, name + stars (176:2353, gap 9) */}
      <figcaption className="flex items-center gap-[9px]">
        {item.avatar_image_url ? (
          <div className="size-9 shrink-0 overflow-hidden rounded-full">
            <SafeImage
              src={item.avatar_image_url}
              alt={item.author_name}
              fallbackText={item.author_name}
            />
          </div>
        ) : (
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/15 font-sans text-sm font-bold text-brand-primary"
            aria-hidden="true"
          >
            {item.author_name.charAt(0)}
          </span>
        )}
        <div className="flex min-w-0 flex-col items-start">
          <cite className="font-sans text-[13.12px] font-bold not-italic leading-[1.5] text-black">
            {item.author_name}
          </cite>

          {/* 5 Stars (Figma Node 176:2357 — 14px, 3px gap, #FFD900) */}
          <div
            className="flex items-center gap-[3px] text-brand-gold"
            aria-label={t("rating")}
          >
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="h-3.5 w-3.5 fill-current"
                viewBox="0 0 14 14"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M7 0.5L8.91 4.79L13.5 5.38L10.05 8.49L11.02 13.01L7 10.71L2.98 13.01L3.95 8.49L0.5 5.38L5.09 4.79L7 0.5Z" />
              </svg>
            ))}
          </div>
        </div>
      </figcaption>
    </figure>
  );

  return (
    <section
      className="relative flex min-h-0 w-full flex-col overflow-hidden bg-[#F9F7F0] py-12 md:py-16 lg:h-[597px] lg:min-h-[597px] lg:justify-center lg:py-0"
      aria-label={t("region")}
    >
      <Container>
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {/* Section Header (Figma 87:14314 — Qahwa Arabic Regular 64px/48, 2-fill) */}
          <ScrollReveal>
            <h2 className="font-display text-3xl font-normal leading-relaxed text-black sm:text-4xl md:text-5xl lg:text-[64px] lg:leading-[1.4296875]">
              <Highlight text={heading || home("testimonialsHeading")} />
            </h2>
          </ScrollReveal>
        </div>
      </Container>

      <div className="mx-auto mt-8 w-full max-w-5xl px-4 sm:mt-10 lg:mt-12">
        <div className="flex items-center gap-3 sm:gap-4">
          {!reduced && (
            <button
              type="button"
              onClick={() => railRef.current?.prev()}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-espresso shadow-md transition-all hover:scale-105 hover:text-brand-primary active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary sm:size-10"
              aria-label={t("previous")}
            >
              <ChevronStartIcon size={20} />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <Marquee ref={railRef} durationSeconds={45}>
              {testimonials.map((item) => (
                <div key={item.id ?? item.author_name} className="shrink-0 px-3">
                  {renderCard(item)}
                </div>
              ))}
            </Marquee>
          </div>
          {!reduced && (
            <button
              type="button"
              onClick={() => railRef.current?.next()}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-espresso shadow-md transition-all hover:scale-105 hover:text-brand-primary active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary sm:size-10"
              aria-label={t("next")}
            >
              <ChevronEndIcon size={20} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
