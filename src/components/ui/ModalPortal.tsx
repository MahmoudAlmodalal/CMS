"use client";

import { createContext, useContext } from "react";

/**
 * The element portalled overlays should mount into.
 *
 * A `<dialog>` opened with `showModal()` paints in the browser's *top layer*,
 * which sits above every z-indexed element on the page — so a listbox portalled
 * to `document.body` (Dropdown's default) would be drawn behind an open modal
 * no matter how high its z-index. Any component that opens such a dialog
 * provides itself here, and portalling overlays read it instead of assuming
 * `document.body`.
 *
 * Null outside a modal, which is the `document.body` case.
 */
export const ModalPortalContext = createContext<HTMLElement | null>(null);

/** The nearest modal element to portal into, or null when there is none. */
export function useModalPortalContainer(): HTMLElement | null {
  return useContext(ModalPortalContext);
}
