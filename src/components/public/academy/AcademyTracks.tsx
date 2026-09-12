import React from "react";
import { useTranslations } from "next-intl";
import { TrackCard } from "./TrackCard";
import type { AcademyCourse } from "@/lib/dal/academy";

interface AcademyTracksProps {
  courses: AcademyCourse[];
}

/**
 * Academy tracks section — Figma nodes 91:16347 and 91:16437 in frame 91:16119.
 *
 * The heading (91:16347) is Qahwa Arabic 40/48 #2B1D14 with "مسارات" in
 * primary-500, and the design does not centre it: it is an auto-width text layer
 * whose inline start — the right edge in Arabic — sits 560px in from the edge of
 * the 1440 artboard, which the reference render confirms at x=879. So it is
 * anchored from the start edge and left to grow, rather than centred on the grid
 * below it, which would put it 33px over.
 *
 * The grid (91:16438) is 1136.016 wide from x=150, three 362.67 columns 24px
 * apart, its row a flat 325.61 so the cards line up regardless of body length. It
 * opens 42px under the heading. The design draws no standfirst here.
 *
 * Two dotted marks (91:16120, 91:16225) flank the grid, each hanging off its own
 * edge of the artboard so only part of it shows. They are cropped 1:1 out of the
 * reference render, so they carry the page's cream ground with them, and they are
 * drawn only from lg up — below that the grid stacks and there is no margin to
 * hang them in.
 *
 * The 390 frame (139:12420) keeps the same card but re-lays the band: the heading
 * (139:12432) is centred on a 286px measure at y=733 — 243 under the hero's 490 —
 * and runs two lines in a 99px box, and the card container (139:13166) sits at
 * (10,863), 362 wide, holding three 325.611px cards 16px apart. The band closes
 * 31.16 under them, at 1903, which is where the value-props box opens. There is no
 * tablet artboard, so the mobile figures hold until the 1440 ones take over.
 */
export function AcademyTracks({ courses }: AcademyTracksProps) {
  const t = useTranslations("academy");

  return (
    <section
      id="tracks"
      aria-labelledby="academy-tracks-heading"
      className="relative w-full overflow-hidden pb-[31.16px] pt-[243px] lg:pb-0 lg:pt-[102px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[228px] hidden h-[112px] w-[74px] bg-[url('/assets/branding/dots-start.png')] bg-contain bg-no-repeat lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-[455px] hidden h-[112px] w-[86px] bg-[url('/assets/branding/dots-end.png')] bg-contain bg-no-repeat lg:block"
      />

      <div className="mx-auto w-full max-w-[1440px]">
        <h2
          id="academy-tracks-heading"
          className="mx-auto w-[286px] text-center font-display text-[32px] leading-[49.5px] text-brand-espresso lg:me-0 lg:ms-[560px] lg:w-auto lg:whitespace-nowrap lg:text-start lg:text-[40px] lg:leading-[48px]"
        >
          {t.rich("tracksHeading", {
            em: (chunks) => <span className="text-brand-primary">{chunks}</span>,
          })}
        </h2>

        {courses.length === 0 ? (
          <div className="ms-[18px] mt-[31px] w-[362px] rounded-[20px] lg:ms-0 lg:mt-[42px] lg:w-auto border border-dashed border-brand-espresso/20 bg-white/50 p-8 py-16 text-center">
            <p className="text-gradscale-400">{t("tracksEmpty")}</p>
          </div>
        ) : (
          <div className="ms-[18px] mt-[31px] grid w-[362px] auto-rows-[325.611px] grid-cols-1 gap-4 lg:ms-[154px] lg:mt-[42px] lg:w-[1136px] lg:grid-cols-3 lg:gap-6">
            {courses.map((course, idx) => (
              <TrackCard key={course.id || course.slug} course={course} index={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
