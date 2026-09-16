/**
 * Stable `view-transition-name` values for shared-element route morphs.
 *
 * Plain module rather than part of the "use client" ViewTransitions file on
 * purpose: server components (ArticleCard, ArtistHero, the detail pages) call
 * this while rendering, and a function imported from a client module is only a
 * client reference on the server — it cannot be invoked there.
 *
 * Names must be unique within a document and are CSS idents, so slugs are
 * sanitised. The same call on a grid card and on its detail page pairs the two
 * elements, which is what makes the portrait fly between them.
 */
export function morphName(kind: string, slug: string | null | undefined): string | undefined {
  if (!slug) return undefined;
  const safe = slug.replace(/[^a-zA-Z0-9_-]/g, "-");
  return `morph-${kind}-${safe}`;
}
