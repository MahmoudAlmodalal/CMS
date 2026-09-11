"use client";

import React, { createContext, useContext } from "react";
import { localeDirection, type AppLocale } from "@/i18n/routing";

export type Direction = "rtl" | "ltr";
export type Locale = AppLocale;

interface DirectionContextValue {
  direction: Direction;
  locale: Locale;
  isRTL: boolean;
}

const DirectionContext = createContext<DirectionContextValue | undefined>(undefined);

export interface DirectionProviderProps {
  children: React.ReactNode;
  locale: Locale;
}

/**
 * Direction follows the active locale and nothing else. The document's dir and
 * lang are rendered on <html> by the root layout, so there is no client-side
 * mutation and no flash of the wrong direction on first paint.
 */
export function DirectionProvider({ children, locale }: DirectionProviderProps) {
  const direction = localeDirection[locale];

  return (
    <DirectionContext.Provider value={{ direction, locale, isRTL: direction === "rtl" }}>
      {children}
    </DirectionContext.Provider>
  );
}

export function useDirection(): DirectionContextValue {
  const context = useContext(DirectionContext);
  if (!context) {
    return { direction: "rtl", locale: "ar", isRTL: true };
  }
  return context;
}

export function DirectionScope({
  dir,
  className = "",
  children,
}: {
  dir: Direction;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div dir={dir} className={className}>
      {children}
    </div>
  );
}
