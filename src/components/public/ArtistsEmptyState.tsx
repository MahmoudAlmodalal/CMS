import React from "react";
import { useTranslations } from "next-intl";
import { MusicIcon } from "@/components/ui/Icons";

export interface ArtistsEmptyStateProps {
  category?: string;
  onResetFilter?: () => void;
  className?: string;
}

/**
 * ArtistsEmptyState Component
 * Displays helpful, graceful empty feedback when no published artists match the selection.
 */
export function ArtistsEmptyState({
  category = "all",
  onResetFilter,
  className = "",
}: ArtistsEmptyStateProps) {
  const t = useTranslations("artists");
  const isFiltered = category !== "all";

  return (
    <div
      data-testid="artists-empty-state"
      className={`w-full py-16 px-6 rounded-2xl bg-white border border-brand-espresso-subtle text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto my-8 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-brand-surface/60 border border-brand-espresso-subtle flex items-center justify-center text-brand-primary">
        <MusicIcon size={28} />
      </div>

      <div className="space-y-2">
        <h3 className="font-sans text-2xl font-bold text-brand-espresso">
          {isFiltered ? t("emptyFilteredTitle") : t("emptyTitle")}
        </h3>
        <p className="text-sm text-gradscale-400 max-w-sm mx-auto leading-relaxed">
          {isFiltered ? t("emptyFilteredBody") : t("emptyBody")}
        </p>
      </div>

      {isFiltered && onResetFilter && (
        <button
          type="button"
          onClick={onResetFilter}
          className="mt-2 px-6 py-2.5 rounded-full bg-brand-primary text-white text-sm font-bold shadow-subtle hover:bg-brand-primary-pressed transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          {t("showAll")}
        </button>
      )}
    </div>
  );
}
