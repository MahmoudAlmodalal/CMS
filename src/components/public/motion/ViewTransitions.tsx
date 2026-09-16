"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useMotionPrefs } from "./useMotionPrefs";

/**
 * `Link` accepts a wider href shape than `router.push` does (its UrlObject allows
 * a null pathname). The morph has to push, so the narrower router type is the
 * one that governs here — a link whose href it cannot express falls back to a
 * plain navigation below.
 */
type Href = Parameters<ReturnType<typeof useRouter>["push"]>[0];

interface ViewTransitionContextValue {
  /** True while the browser is mid-morph, so other animations stand down. */
  transitioning: boolean;
  navigate: (href: Href) => void;
}

const ViewTransitionContext = createContext<ViewTransitionContextValue>({
  transitioning: false,
  navigate: () => {},
});

function supported(): boolean {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

/**
 * Drives the View Transitions API ourselves.
 *
 * Next's App Router does not wrap client navigations in
 * `document.startViewTransition`, so simply assigning `view-transition-name` to
 * a card and its detail hero produces nothing. The browser also needs the
 * navigation to happen *inside* the transition callback, and it snapshots the
 * "after" state when that callback's promise resolves.
 *
 * So: we start the transition, hand it a promise we hold open, push the route,
 * and resolve only once `usePathname()` reports the new URL — which is the
 * first moment the incoming page is actually on screen and worth snapshotting.
 * A 700ms watchdog resolves it regardless, so a slow or failed navigation can
 * never leave the page frozen under a half-finished transition.
 *
 * Everything degrades to a plain push: unsupported browsers, reduced motion,
 * modified clicks, and external or new-tab links all bypass this entirely.
 */
export function ViewTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { reduced } = useMotionPrefs();
  const [transitioning, setTransitioning] = useState(false);
  const resolveRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const settle = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    resolveRef.current?.();
    resolveRef.current = null;
  }, []);

  // The incoming route has rendered — snapshot now.
  useEffect(() => {
    settle();
  }, [pathname, settle]);

  useEffect(() => settle, [settle]);

  const navigate = useCallback(
    (href: Href) => {
      if (reduced || !supported()) {
        router.push(href);
        return;
      }

      setTransitioning(true);

      const ready = new Promise<void>((resolve) => {
        resolveRef.current = resolve;
        timerRef.current = setTimeout(resolve, 700);
      });

      const transition = (
        document as Document & {
          startViewTransition: (cb: () => Promise<void>) => { finished: Promise<void> };
        }
      ).startViewTransition(async () => {
        router.push(href);
        await ready;
      });

      transition.finished.finally(() => setTransitioning(false));
    },
    [reduced, router],
  );

  return (
    <ViewTransitionContext.Provider value={{ transitioning, navigate }}>
      {children}
    </ViewTransitionContext.Provider>
  );
}

export function useViewTransition() {
  return useContext(ViewTransitionContext);
}

export type MorphLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: Href;
};

/**
 * A `next/link` that morphs shared elements instead of cross-fading the page.
 *
 * Pair it with `morphName()` on the image inside the card and on the matching
 * hero image of the destination, and the portrait grows from one into the other.
 */
export function MorphLink({ href, onClick, children, ...rest }: MorphLinkProps) {
  const { navigate } = useViewTransition();

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        // Let the browser handle anything that is not a plain left click.
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0 ||
          rest.target === "_blank"
        ) {
          return;
        }
        event.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}

export default ViewTransitionProvider;
