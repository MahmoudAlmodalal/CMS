import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowEndIcon } from "@/components/ui/Icons";
import type { AcademyCourse } from "@/lib/dal/academy";

interface TrackCardProps {
  course: AcademyCourse;
  index?: number;
}

const ARABIC_NUMERALS = ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "١٠"];

/**
 * Academy Track Card
 * Figma Node: 91:16444 / 91:16442 / 91:16446 / 91:16448 / 91:16451
 * - Sequence index (display_order)
 * - Track Category badge (e.g. "مدرسة التراث")
 * - Title (e.g. "مدرسة العود")
 * - Description & Instructor
 * - Action button linking to /booking?course=[slug]
 */
export function TrackCard({ course, index }: TrackCardProps) {
  const displayNum =
    ARABIC_NUMERALS[(course.display_order ?? (index !== undefined ? index + 1 : 1)) - 1] ||
    String(course.display_order);

  const bookingHref = `/booking?course=${encodeURIComponent(course.slug)}`;

  return (
    <Card
      variant="default"
      className="flex flex-col h-full bg-white border border-brand-espresso-subtle hover:border-primary-500/50 hover:shadow-card-hover transition-all duration-300 rounded-card group"
    >
      <CardHeader className="p-6 sm:p-8 pb-4">
        {/* Top row: Track sequence number + Category Badge */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="font-mono text-2xl sm:text-3xl font-bold text-primary-500/30 group-hover:text-primary-500 transition-colors">
            {displayNum}
          </span>
          <Badge
            variant="surface"
            className="text-xs font-bold text-brand-espresso bg-secondary-500/20 border-secondary-600/30"
          >
            {course.track_category}
          </Badge>
        </div>

        {/* Course Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-brand-espresso font-sans group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>

        {/* Instructor info if available */}
        {course.instructor_name && (
          <p className="text-xs font-medium text-primary-600 font-sans mt-1">
            بإشراف: {course.instructor_name}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-0 flex-1">
        <p className="text-sm sm:text-base text-gradscale-400 font-sans leading-relaxed">
          {course.description}
        </p>
      </CardContent>

      <CardFooter className="p-6 sm:p-8 pt-4 border-t border-brand-espresso-subtle/50 mt-auto">
        <Link
          href={bookingHref}
          className="inline-flex items-center justify-between w-full px-5 py-3 rounded-button bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white font-bold text-sm transition-all duration-200 group/btn"
          aria-label={`سجّل الآن في ${course.title}`}
        >
          <span>سجّل الآن</span>
          <ArrowEndIcon size={18} className="transform group-hover/btn:translate-x-[-4px] rtl:group-hover/btn:translate-x-[4px] transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  );
}
