import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Artist } from "@/lib/artists";

interface ArtistProfileCardProps {
  artist: Artist;
}

/**
 * Profile row — Figma section 134:4671 (nodes 134:4672 through 134:4681).
 *
 * A 0.833px secondary-400 rule across the top, 48px of air either side, and one
 * 1200px container padded 32px so its content runs 152..1288. Inside it the
 * round portrait (134:4674) — 160px under a 3.333px hairline of primary-500 at
 * 20% — sits on the physical left, which is the inline END in Arabic, so the
 * text column is written first and the portrait second.
 *
 * The text column (134:4675) takes the remaining 936px and is aligned to the
 * inline start: the name in Cairo Bold 31/46.5 espresso, the specialties 8px
 * under it in Cairo Bold 14/20 primary-500 tracked 0.35, and the biography 16px
 * below that in Cairo 16/32 at 70% espresso.
 *
 * The portrait is the artist's own photograph, which the الفنانين grid does not
 * carry — see the note on Artist.profile_image_url.
 *
 * The 390 frame draws this as `Frame 44` (141:16451): 362 wide at x=14, 400 tall,
 * the 160px portrait on top at y=0, then 32 of air, then the 208-tall text block
 * — name 36, specialties 28, biography 144 on a 32px line. So the column reverses
 * below lg (the portrait is written last for the desktop row) and carries no
 * vertical padding of its own there.
 */
export function ArtistProfileCard({ artist }: ArtistProfileCardProps) {
  const t = useTranslations("artist");
  const portrait = artist.profile_image_url?.trim() || artist.portrait_image_url;

  return (
    <section className="w-full border-t-[0.833px] border-secondary-400 lg:py-[48px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col-reverse items-center gap-8 px-[14px] text-center lg:h-[160px] lg:flex-row lg:items-center lg:gap-[40px] lg:px-[32px] lg:text-start">
        <div className="flex min-w-0 flex-col items-center lg:flex-[936.016_0_0] lg:items-start">
          <h2 className="text-[24px] font-bold leading-[36px] text-brand-espresso lg:whitespace-nowrap lg:text-[31px] lg:leading-[46.5px]">
            {artist.name}
          </h2>
          <p className="w-full pt-[8px] text-[13px] font-bold leading-[20px] tracking-[0.35px] text-primary-500 lg:h-[28px] lg:text-[14px]">
            {artist.specialties}
          </p>
          {/* The frame reserves 144 for this box — four 32px lines under 16 of air —
              whatever the copy runs to, which is what holds Frame 44 at its 400. */}
          <p
            className="w-full min-h-[144px] pt-[16px] text-[15px] leading-[32px] text-brand-espresso/70 lg:min-h-0 lg:text-[16px]">
            {artist.full_bio || artist.short_bio}
          </p>
        </div>

        <div className="relative size-[160px] shrink-0 overflow-hidden rounded-full border-[3.333px] border-primary-500/20">
          <Image
            src={portrait}
            alt={t("portraitAlt", { name: artist.name })}
            fill
            sizes="160px"
            quality={90}
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default ArtistProfileCard;
