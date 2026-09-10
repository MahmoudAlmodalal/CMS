import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/LayoutPrimitives";
import { ArrowEndIcon } from "@/components/ui/Icons";
import { EventCard } from "./EventCard";
import type { Event } from "@/lib/dal/events";

interface HomeEventsProps {
  events: Event[];
}

/**
 * Verified against Figma Frame 28 (Nodes 87:14466, 87:14481, 87:14533):
 * - Frame 28 carries no headline text node — section copy follows the
 *   display-face H2 + SF Pro Bold 16px link pattern of the sibling sections
 * - Link: "عرض كل الفعاليات ←" -> /events
 * - 3-Column Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop
 */
export function HomeEvents({ events }: HomeEventsProps) {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-28 bg-[#F7F4EE] border-t border-brand-espresso/5">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-12">
          <div className="space-y-3 text-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold">
              <span>الفعاليات الحية</span>
            </div>
            <h2 className="font-display text-4xl lg:text-[64px] font-normal text-brand-espresso leading-[1.25]">
              نلتقي في المكان. في اللحظة
            </h2>
            <p className="font-sans text-sm sm:text-base text-brand-espresso/80 max-w-xl">
              استكشف جدول الفعاليات والأمسيات الموسيقية القادمة لفرقة أندلسيا، واحجز مكانك لتكون جزءاً من التجربة.
            </p>
          </div>

          {/* View All Link */}
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-base font-bold text-brand-primary hover:text-brand-primary-hover active:text-brand-primary-pressed transition-colors group shrink-0"
          >
            <span>عرض كل الفعاليات</span>
            <span className="transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1">
              <ArrowEndIcon size={18} />
            </span>
          </Link>
        </div>

        {/* 3-Item Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {events.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </Container>
    </section>
  );
}
