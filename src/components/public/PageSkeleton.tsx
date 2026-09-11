import React from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/LayoutPrimitives";

/**
 * Shared route-level loading skeleton for the public site.
 *
 * The admin group has had one since Task 24; the public group did not, so a
 * slow DAL read left the shell empty between navigations. It mirrors the shared
 * page rhythm — eyebrow, headline, subtitle, then a card grid — so the layout
 * does not jump when the real content arrives.
 *
 * Mounted per route rather than on the (public) group, on purpose: a loading.tsx
 * opens a Suspense boundary for its segment AND every child, and once a response
 * starts streaming its 200 is already committed — a later notFound() in a child
 * would then render the 404 page under a 200 status. So /artists and /news, whose
 * [slug] children call notFound(), deliberately have no loading.tsx.
 */
export function PageSkeleton() {
  const t = useTranslations("a11y");

  return (
    <div className="py-16 lg:py-24 animate-pulse" role="status" aria-busy="true" aria-label={t("loadingPage")}>
      <Container>
        {/* Page header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-4 w-40 rounded bg-brand-espresso/10" />
          <div className="h-10 w-72 max-w-full rounded-lg bg-brand-espresso/15 sm:h-12 sm:w-96" />
          <div className="h-4 w-full max-w-xl rounded bg-brand-espresso/10" />
          <div className="h-4 w-2/3 max-w-md rounded bg-brand-espresso/10" />
        </div>

        {/* Card grid */}
        <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((card) => (
            <div
              key={card}
              className="flex flex-col overflow-hidden rounded-card border border-brand-espresso-subtle bg-white"
            >
              <div className="h-44 w-full bg-brand-surface" />
              <div className="flex flex-col gap-3 p-6">
                <div className="h-3 w-24 rounded bg-brand-surface" />
                <div className="h-5 w-3/4 rounded bg-brand-surface" />
                <div className="h-3 w-full rounded bg-brand-surface/70" />
                <div className="h-3 w-5/6 rounded bg-brand-surface/70" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
