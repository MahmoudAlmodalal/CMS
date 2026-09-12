import React from "react";
import { useTranslations } from "next-intl";
import { PageHero } from "./PageHero";

interface BookingHeaderProps {
  subtitle: string;
}

/**
 * Hero band of الحجز — Figma nodes 91:17110 (photograph), 91:17111 (scrim) and
 * 91:17123 (copy) in frame 91:17109.
 *
 * The band is 611px tall and the copy block sits 247px down, centred. The headline
 * carries one phrase in primary-500 against 80% white, so booking.title is stored
 * with an <em> around it and rendered rich rather than split in code.
 *
 * In the frame the copy block is wrapped in a double rotate-180 — Figma's way of
 * mirroring a left-to-right stack for an Arabic artboard — which reverses the
 * source order: the headline renders above the standfirst, not below it.
 */
export function BookingHeader({ subtitle }: BookingHeaderProps) {
  const t = useTranslations("booking");

  return (
    <PageHero
      // 141:15632 is 390x688 hung at y=-10, so the band is 0..678 here.
      mobileHeight={678}
      height={611}
      contentTop={247}
      title={t.rich("title", {
        em: (chunks) => <span className="text-brand-primary">{chunks}</span>,
      })}
      subtitle={subtitle}
    />
  );
}
