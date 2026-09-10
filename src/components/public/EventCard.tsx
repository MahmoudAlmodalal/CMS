import React from "react";
import Link from "next/link";
import { ArrowEndIcon, CalendarIcon } from "@/components/ui/Icons";
import type { Event } from "@/lib/dal/events";

interface EventCardProps {
  event: Event;
}

const EVENT_CATEGORY_LABELS: Record<Event["category"], string> = {
  concert: "حفل غنائي",
  festival: "مهرجان ثقافي",
  evening: "أمسية موسيقية",
  workshop: "ورشة تدريبية",
};

/**
 * Event Card Component
 * Verified against Figma Component 16 / Nodes 87:14487-87:14498:
 * - Card radius: 16px (rounded-card)
 * - Date display: Day in DM Mono, Month in Cairo
 * - Category badge in top corner
 * - Location, city, and performer line
 * - Action button: routes to ticket_url or /booking?event_id=[id]
 */
export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.event_date);
  const day = eventDate.getDate();
  const month = new Intl.DateTimeFormat("ar-EG", { month: "short" }).format(eventDate);
  const categoryLabel = EVENT_CATEGORY_LABELS[event.category] || "فعالية";

  const bookingHref = event.ticket_url || `/booking?event_id=${event.id}`;
  const isExternal = Boolean(event.ticket_url);

  return (
    <div className="group flex flex-col bg-white rounded-card overflow-hidden border border-brand-espresso/10 shadow-card hover:shadow-card-hover hover:border-brand-primary/40 transition-all duration-300 text-start">
      {/* Visual Header with Date Badge */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-surface">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url(${event.image_url || "/assets/events/default-event.webp"})`,
          }}
          aria-label={event.title}
          role="img"
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/70 via-transparent to-transparent pointer-events-none" />

        {/* Date Badge: Top Start */}
        <div className="absolute top-3 start-3">
          <div className="flex flex-col items-center justify-center min-w-[56px] px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-xs text-brand-espresso shadow-xs border border-white/40">
            <span className="font-mono text-xl font-bold leading-none text-brand-primary">
              {day}
            </span>
            <span className="font-sans text-[11px] font-bold mt-0.5 text-brand-espresso">
              {month}
            </span>
          </div>
        </div>

        {/* Category Badge: Top End */}
        <div className="absolute top-3 end-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-espresso/80 backdrop-blur-xs text-brand-tint text-xs font-semibold border border-white/10">
            {categoryLabel}
          </span>
        </div>

        {/* Bottom City Tag */}
        {event.city && (
          <div className="absolute bottom-3 start-3">
            <span className="text-xs text-brand-tint font-medium">
              📍 {event.city}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2">
          {/* Performer name */}
          <div className="text-xs text-brand-primary font-bold">
            {event.performer_name}
          </div>

          {/* Headline */}
          <h3 className="font-sans text-base sm:text-lg font-bold text-brand-espresso group-hover:text-brand-primary transition-colors leading-snug">
            {event.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-brand-espresso/70">
            <CalendarIcon size={14} className="shrink-0 text-brand-primary/80" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Action Link */}
        <div className="pt-2 border-t border-brand-espresso/5">
          <Link
            href={bookingHref}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-surface hover:bg-brand-primary text-brand-espresso hover:text-white font-bold text-xs sm:text-sm border border-brand-espresso/10 hover:border-brand-primary transition-all duration-200"
          >
            <span>{isExternal ? "حجز التذاكر (خارجي)" : "احجز مقعدك"}</span>
            <ArrowEndIcon size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
