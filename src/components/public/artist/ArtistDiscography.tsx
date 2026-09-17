"use client";

import React, { useState, useRef, useEffect } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { useLocale, useTranslations } from "next-intl";
import type { Release } from "@/lib/releases";
import type { ArtistWork } from "@/lib/types/artist-works";
import type { Track } from "@/lib/dal/tracks";
import { ArtistWorkCard } from "./ArtistWorkCard";
import { ChevronStartIcon, ChevronEndIcon } from "@/components/ui/Icons";
import { ScrollReveal } from "../ScrollReveal";
import { useMotionPrefs } from "../motion/useMotionPrefs";

interface ArtistDiscographyProps {
  releases: Release[];
  works?: ArtistWork[];
  tracks?: Track[];
}

/** The frame draws Arabic-Indic digits; "ar" alone resolves to Latin ones. */
function digits(locale: string) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-GB", { useGrouping: false });
}

/**
 * مسيرتها الفنية — Figma section 134:4682 (nodes 134:4683 to 134:4744).
 *
 * A full-bleed gradscale-900 band, 96px of air either side. The H2 is centred in
 * Qahwa Arabic 48/40 brand-tint inside a 52px box padded 12px at the top. 1200px
 * container, padded 32px, so its content runs 152..1288.
 *
 * The filter row (134:4687) hugs the inline start — the physical right — as three
 * 8px-apart pills: the active one 36px tall in primary-500 with Cairo Bold 14/20
 * white, the idle ones 37.667px tall on 8% white behind a 0.833px 15% white
 * hairline with Cairo Medium 14/20 at 70% brand-tint. Drawn right to left the
 * order is ألبومات, حفلات, أغاني, which is the DOM order in Arabic.
 */
const CAREER_TABS = ["albums", "concerts", "songs"] as const;
type CareerTab = (typeof CAREER_TABS)[number];

export function ArtistDiscography({
  releases,
  works = [],
  tracks = [],
}: ArtistDiscographyProps) {
  const t = useTranslations("artist");
  const locale = useLocale();
  const number = digits(locale);
  const { reduced } = useMotionPrefs();

  const [activeTab, setActiveTab] = useState<CareerTab>("albums");
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const isRtl = locale === "ar";
  const step = 289; // 269px card width + 20px gap

  // Scroll to start when switching tabs
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: 0,
        behavior: reduced ? "auto" : "smooth",
      });
    }
  }, [activeTab, reduced]);

  // Modal keyboard and scroll lock
  useEffect(() => {
    if (!selectedRelease) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedRelease(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedRelease]);

  const concertWorks = works.filter((w) => w.work_type === "concert");
  const songWorks = works.filter((w) => w.work_type === "song");

  const hasAnyContent = releases.length > 0 || works.length > 0 || tracks.length > 0;
  if (!hasAnyContent) return null;

  const scrollNext = () => {
    if (!carouselRef.current) return;
    const delta = isRtl ? -step : step;
    carouselRef.current.scrollBy({
      left: delta,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const scrollPrev = () => {
    if (!carouselRef.current) return;
    const delta = isRtl ? step : -step;
    carouselRef.current.scrollBy({
      left: delta,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      carouselRef.current?.scrollBy({
        left: -step,
        behavior: reduced ? "auto" : "smooth",
      });
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      carouselRef.current?.scrollBy({
        left: step,
        behavior: reduced ? "auto" : "smooth",
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || e.button !== 0) return;
    const container = carouselRef.current;
    if (!container) return;

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = container.scrollLeft;
    container.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const container = carouselRef.current;
    if (!container) return;

    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 5) {
      hasDraggedRef.current = true;
    }
    container.scrollLeft = startScrollLeftRef.current - dx;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const container = carouselRef.current;
    if (container && container.hasPointerCapture(e.pointerId)) {
      container.releasePointerCapture(e.pointerId);
    }
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 50);
  };

  const isEmpty =
    (activeTab === "albums" && releases.length === 0) ||
    (activeTab === "concerts" && concertWorks.length === 0) ||
    (activeTab === "songs" && tracks.length === 0 && songWorks.length === 0);

  return (
    <section className="w-full bg-gradscale-900 py-24 lg:py-[96px]">
      <ScrollReveal variant="up">
        <h2 className="pt-[12px] text-center font-display text-[32px] leading-[40px] text-brand-tint lg:h-[52px] lg:text-[48px]">
          {t("careerTitle")}
        </h2>
      </ScrollReveal>

      <div className="mx-auto w-full max-w-[1200px] px-[31px] lg:px-[32px]">
        {/* Filter row — 134:4687 with Prev/Next controls */}
        <ScrollReveal variant="soft" delay={0.1}>
          <div className="flex items-center justify-between">
            <div
              role="tablist"
              aria-label={t("careerFilters")}
              className="flex items-start gap-[8px] pt-6 lg:h-[37.667px] lg:pt-0"
            >
              {CAREER_TABS.map((tab) => {
                const isActive = activeTab === tab;
                return isActive ? (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    id={`career-tab-${tab}`}
                    aria-controls={`career-tabpanel-${tab}`}
                    aria-selected="true"
                    onClick={() => setActiveTab(tab)}
                    className="rounded-full bg-primary-500 px-[20px] py-[8px] text-[14px] font-bold leading-[20px] text-white cursor-pointer transition-colors"
                  >
                    {t(`careerFilter.${tab}`)}
                  </button>
                ) : (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    id={`career-tab-${tab}`}
                    aria-controls={`career-tabpanel-${tab}`}
                    aria-selected="false"
                    onClick={() => setActiveTab(tab)}
                    className="rounded-full border-[0.833px] border-white/15 bg-white/[0.08] px-[20px] py-[8px] text-[14px] font-medium leading-[20px] text-brand-tint/70 hover:bg-white/[0.12] cursor-pointer transition-colors"
                  >
                    {t(`careerFilter.${tab}`)}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-[8px] pt-6 lg:pt-0">
              <button
                type="button"
                onClick={scrollPrev}
                disabled={isEmpty}
                aria-label={t("careerPrev")}
                className="flex size-[36px] items-center justify-center rounded-full border-[0.833px] border-white/15 bg-white/[0.08] text-brand-tint/70 hover:bg-white/[0.15] hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronStartIcon size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                disabled={isEmpty}
                aria-label={t("careerNext")}
                className="flex size-[36px] items-center justify-center rounded-full border-[0.833px] border-white/15 bg-white/[0.08] text-brand-tint/70 hover:bg-white/[0.15] hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronEndIcon size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Grid — 134:4696. Draggable carousel on all breakpoints (replacing static lg:grid lg:grid-cols-4). */}
        <ScrollReveal variant="up" delay={0.2}>
          {isEmpty ? (
            <div className="pt-10 lg:pt-[40px] text-start">
              <p className="rounded-[14px] border border-white/10 bg-white/[0.04] p-6 text-[15px] leading-[24px] text-brand-tint/70">
                {t(`careerEmpty.${activeTab}`)}
              </p>
            </div>
          ) : (
            <div
              ref={carouselRef}
              role="region"
              id={`career-tabpanel-${activeTab}`}
              aria-labelledby={`career-tab-${activeTab}`}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="flex gap-[20px] overflow-x-auto overscroll-x-contain pt-10 lg:pt-[40px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
            >
              {activeTab === "albums" &&
                releases.map((release) => (
                  <article
                    key={release.id}
                    data-testid={`release-${release.id}`}
                    className="flex w-[269px] shrink-0 snap-start flex-col"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (!hasDraggedRef.current) {
                          setSelectedRelease(release);
                        }
                      }}
                      aria-haspopup="dialog"
                      className="group flex w-full flex-col text-start cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-[14px]"
                    >
                      <div className="relative w-full overflow-hidden rounded-[14px] bg-[#2a1d13] lg:h-[268.997px] transition-transform duration-200 group-hover:scale-[1.02]">
                        <div className="relative aspect-square w-full lg:h-full">
                          <SafeImage
                            src={release.cover_image_url}
                            bucket="releases"
                            alt={t("coverAlt", { title: release.title })}
                            fill
                            sizes="(max-width: 1023px) 100vw, 269px"
                            quality={90}
                            fallbackText={release.title}
                            className="object-cover"
                          />
                        </div>
                        <span className="absolute start-[2.526px] top-[11.992px] rounded-full bg-primary-500 px-[10px] py-[4px] text-[8px] font-bold uppercase leading-[12px] tracking-[0.8px] text-white">
                          {t(release.release_type === "live" ? "releaseLive" : "releaseStudio")}
                        </span>
                      </div>

                      <p className="pt-[16px] text-start text-[16px] font-bold leading-[20px] text-[#f0ebe1] lg:h-[36px] group-hover:text-primary-500 transition-colors">
                        {release.title}
                      </p>

                      <div className="flex h-[21px] w-full items-start justify-between">
                        <span className="mt-[4px] font-mono text-[11px] leading-[16.5px] text-primary-500">
                          {number.format(release.release_year)}
                        </span>
                        <span className="mt-[5px] text-[10px] leading-[15px] text-brand-tint/40">
                          {t("trackCount", {
                            count: release.track_count,
                            value: number.format(release.track_count),
                          })}
                        </span>
                      </div>
                    </button>
                  </article>
                ))}

              {activeTab === "concerts" &&
                concertWorks.map((work) => (
                  <div
                    key={work.id}
                    data-testid={`concert-${work.id}`}
                    className="w-[269px] shrink-0 snap-start flex flex-col"
                  >
                    <ArtistWorkCard work={work} />
                  </div>
                ))}

              {activeTab === "songs" && (
                <>
                  {tracks.map((track) => (
                    <article
                      key={`track-${track.id}`}
                      data-testid={`track-${track.id}`}
                      className="flex w-[269px] shrink-0 snap-start flex-col"
                    >
                      <div className="relative w-full overflow-hidden rounded-[14px] bg-[#2a1d13] lg:h-[268.997px]">
                        <div className="relative aspect-square w-full lg:h-full">
                          <SafeImage
                            src={track.cover_image_url}
                            bucket="releases"
                            alt={track.title}
                            fill
                            sizes="(max-width: 1023px) 100vw, 269px"
                            quality={90}
                            fallbackText={track.title}
                            className="object-cover"
                          />
                        </div>
                        <span className="absolute start-[2.526px] top-[11.992px] rounded-full bg-primary-500 px-[10px] py-[4px] text-[8px] font-bold uppercase leading-[12px] tracking-[0.8px] text-white">
                          {t("workType.song")}
                        </span>
                      </div>

                      <p className="pt-[16px] text-start text-[16px] font-bold leading-[20px] text-[#f0ebe1] lg:h-[36px]">
                        {track.title}
                      </p>

                      <div className="mt-2 w-full">
                        <audio
                          controls
                          preload="none"
                          src={track.audio_file_url}
                          className="w-full h-[36px] rounded accent-primary-500"
                        />
                      </div>
                    </article>
                  ))}
                  {songWorks.map((work) => (
                    <div
                      key={`work-${work.id}`}
                      data-testid={`song-work-${work.id}`}
                      className="w-[269px] shrink-0 snap-start flex flex-col"
                    >
                      <ArtistWorkCard work={work} />
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </ScrollReveal>
      </div>

      {/* Accessible Album Details Modal */}
      {selectedRelease && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="release-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedRelease(null)}
            aria-hidden="true"
          />

          {/* Dialog content */}
          <div className="relative z-10 w-full max-w-[460px] overflow-hidden rounded-[20px] bg-[#1b1b1b] border border-white/10 p-6 text-brand-tint shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedRelease(null)}
              aria-label={t("modalClose")}
              className="absolute top-4 end-4 z-20 flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <span aria-hidden="true" className="text-lg leading-none">&times;</span>
            </button>

            {/* Big cover */}
            <div className="relative aspect-square w-full max-w-[280px] mx-auto overflow-hidden rounded-[14px] bg-[#2a1d13]">
              <SafeImage
                src={selectedRelease.cover_image_url}
                bucket="releases"
                alt={t("coverAlt", { title: selectedRelease.title })}
                fill
                sizes="280px"
                quality={90}
                fallbackText={selectedRelease.title}
                className="object-cover"
              />
              <span className="absolute start-[2.526px] top-[11.992px] rounded-full bg-primary-500 px-[10px] py-[4px] text-[8px] font-bold uppercase leading-[12px] tracking-[0.8px] text-white">
                {t(selectedRelease.release_type === "live" ? "releaseLive" : "releaseStudio")}
              </span>
            </div>

            {/* Title & Metadata */}
            <div className="mt-5 text-start">
              <h3
                id="release-modal-title"
                className="text-[20px] font-bold leading-[26px] text-[#f0ebe1]"
              >
                {selectedRelease.title}
              </h3>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[13px] text-primary-500 font-bold">
                  {number.format(selectedRelease.release_year)}
                </span>
                <span className="text-[12px] text-brand-tint/60">
                  {t("trackCount", {
                    count: selectedRelease.track_count,
                    value: number.format(selectedRelease.track_count),
                  })}
                </span>
              </div>
            </div>

            {/* Track titles when artist tracks exist */}
            {tracks.length > 0 && (
              <div className="mt-5 border-t border-white/10 pt-4 text-start">
                <h4 className="text-[13px] font-bold text-brand-tint/80 mb-2">
                  {t("careerFilter.songs")}
                </h4>
                <ol className="max-h-[160px] overflow-y-auto space-y-2 [scrollbar-width:thin] text-sm divide-y divide-white/5">
                  {tracks.map((trk, i) => (
                    <li
                      key={trk.id}
                      className="pt-2 flex items-center justify-between text-brand-tint/70 text-[13px]"
                    >
                      <span className="truncate pe-2">
                        <span className="inline-block w-5 text-brand-tint/40 font-mono">
                          {number.format(i + 1)}.
                        </span>
                        {trk.title}
                      </span>
                      {trk.audio_file_url && (
                        <audio
                          controls
                          preload="none"
                          src={trk.audio_file_url}
                          className="h-7 w-32 shrink-0"
                        />
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ArtistDiscography;
