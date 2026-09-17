import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowStartIcon, ArrowEndIcon } from "@/components/ui/Icons";

export interface NewsPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  className?: string;
  searchParams?: Record<string, string | string[] | undefined>;
  /** i18n namespace holding pagination/previousPage/nextPage/pageNumber. */
  namespace?: "news" | "events" | "artists";
}

export function getPageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: (number | "ellipsis")[] = [1];
  let start = Math.max(2, current - 1);
  let end = Math.min(total - 1, current + 1);

  if (current <= 3) {
    start = 2;
    end = Math.min(total - 1, 4);
  } else if (current >= total - 2) {
    start = Math.max(2, total - 3);
    end = total - 1;
  }

  if (start > 2) {
    items.push("ellipsis");
  }

  for (let i = start; i <= end; i++) {
    items.push(i);
  }

  if (end < total - 1) {
    items.push("ellipsis");
  }

  items.push(total);
  return items;
}

export function NewsPagination({
  currentPage,
  totalPages,
  basePath = "/news",
  className = "",
  searchParams,
  namespace = "news",
}: NewsPaginationProps) {
  const tNews = useTranslations("news");
  const tEvents = useTranslations("events");
  const tArtists = useTranslations("artists");
  const t = namespace === "events" ? tEvents : namespace === "artists" ? tArtists : tNews;

  if (totalPages <= 1) {
    return null;
  }

  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    if (searchParams) {
      for (const [key, value] of Object.entries(searchParams)) {
        if (key === "page" || value === undefined) continue;
        if (Array.isArray(value)) {
          for (const v of value) {
            if (v !== undefined) params.append(key, v);
          }
        } else {
          params.set(key, value);
        }
      }
    }
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const items = getPageItems(currentPage, totalPages);

  return (
    <nav
      aria-label={t("pagination")}
      className={`flex flex-wrap items-center justify-center gap-2 pt-8 ${className}`}
    >
      {/* Previous Button / Noninteractive Bound */}
      {hasPrev ? (
        <Link
          href={buildHref(currentPage - 1)}
          rel="prev"
          aria-label={t("previousPage")}
          className="inline-flex h-10 items-center gap-1.5 rounded-[8px] border border-border-card bg-white px-3 text-sm font-medium text-ink-heading shadow-2xs transition-colors hover:border-brand-primary hover:text-brand-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <ArrowStartIcon size={16} />
          <span>{t("previousPage")}</span>
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex h-10 cursor-not-allowed select-none items-center gap-1.5 rounded-[8px] border border-border-card/50 bg-white/50 px-3 text-sm font-medium text-stone-400 opacity-50"
        >
          <ArrowStartIcon size={16} />
          <span>{t("previousPage")}</span>
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {items.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="flex h-10 w-8 select-none items-center justify-center text-sm font-bold text-stone-400"
              >
                …
              </span>
            );
          }

          const isCurrent = item === currentPage;
          return (
            <Link
              key={item}
              href={buildHref(item)}
              aria-label={t("pageNumber", { page: item })}
              aria-current={isCurrent ? "page" : undefined}
              className={`flex h-10 min-w-10 items-center justify-center rounded-[8px] px-3 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary ${
                isCurrent
                  ? "bg-brand-primary text-white font-bold shadow-xs"
                  : "border border-border-card bg-white text-ink-heading shadow-2xs hover:border-brand-primary hover:text-brand-primary"
              }`}
            >
              {item}
            </Link>
          );
        })}
      </div>

      {/* Next Button / Noninteractive Bound */}
      {hasNext ? (
        <Link
          href={buildHref(currentPage + 1)}
          rel="next"
          aria-label={t("nextPage")}
          className="inline-flex h-10 items-center gap-1.5 rounded-[8px] border border-border-card bg-white px-3 text-sm font-medium text-ink-heading shadow-2xs transition-colors hover:border-brand-primary hover:text-brand-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <span>{t("nextPage")}</span>
          <ArrowEndIcon size={16} />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex h-10 cursor-not-allowed select-none items-center gap-1.5 rounded-[8px] border border-border-card/50 bg-white/50 px-3 text-sm font-medium text-stone-400 opacity-50"
        >
          <span>{t("nextPage")}</span>
          <ArrowEndIcon size={16} />
        </span>
      )}
    </nav>
  );
}
