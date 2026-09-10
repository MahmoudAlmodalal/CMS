import React from "react";

export interface ArtistsHeaderProps {
  title?: string;
  subtitle?: string | null;
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    [key: string]: string | undefined;
  };
  className?: string;
}

/**
 * ArtistsHeader Component
 * Mapped to Figma Frame 10 (Node 91:17844 / 91:18060 / 91:18059):
 * - Fixed Title: "أصوات تصنع التاريخ" — display face (Qahwa Regular) 64px,
 *   same canonical treatment as Figma home Frame 14 (Node 87:14299)
 * - Subtitle: configurable via site_settings.artists_subtitle, Cairo body
 */
export function ArtistsHeader({
  title = "أصوات تصنع التاريخ",
  subtitle = "كل فنان في أندلسيا يحمل قصة ومعاناة، يعزف بأنامله روح الشرق، ويصنع من التراث نغماً للمستقبل.",
  socialLinks,
  className = "",
}: ArtistsHeaderProps) {
  return (
    <header className={`text-center space-y-4 max-w-3xl mx-auto px-4 ${className}`}>
      {/* Kicker badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-50 border border-primary-100 text-brand-primary text-xs font-bold tracking-wider">
        <span>دليل الفنانين</span>
        <span aria-hidden="true">♪</span>
      </div>

      {/* Primary Display Title */}
      <h1 className="font-display text-4xl sm:text-5xl lg:text-[64px] font-normal text-brand-espresso leading-[1.25]">
        {title}
      </h1>

      {/* Subtitle / Lead Paragraph */}
      {subtitle && (
        <p className="text-base sm:text-lg text-brand-espresso/80 leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}

      {/* Approved Platform Social Links */}
      {socialLinks && (socialLinks.instagram || socialLinks.tiktok) && (
        <div className="pt-2 flex items-center justify-center gap-4 text-xs font-medium text-brand-espresso/70">
          <span>تابع جديد الفرقة والفنانين:</span>
          <div className="flex items-center gap-3">
            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs"
                aria-label="Instagram فرقة أندلسيا"
              >
                <bdi dir="ltr">Instagram</bdi>
              </a>
            )}
            {socialLinks.instagram && socialLinks.tiktok && (
              <span className="text-brand-espresso/30" aria-hidden="true">·</span>
            )}
            {socialLinks.tiktok && (
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xs"
                aria-label="TikTok فرقة أندلسيا"
              >
                <bdi dir="ltr">TikTok</bdi>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
