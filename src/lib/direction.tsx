"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Direction = "rtl" | "ltr";
export type Locale = "ar" | "en";

interface DirectionContextValue {
  direction: Direction;
  locale: Locale;
  isRTL: boolean;
  setDirection: (dir: Direction) => void;
  toggleDirection: () => void;
}

const DirectionContext = createContext<DirectionContextValue | undefined>(undefined);

export interface DirectionProviderProps {
  children: React.ReactNode;
  defaultDirection?: Direction;
  defaultLocale?: Locale;
}

export function DirectionProvider({
  children,
  defaultDirection = "rtl",
  defaultLocale = "ar",
}: DirectionProviderProps) {
  const [direction, setDirectionState] = useState<Direction>(defaultDirection);
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const setDirection = (newDir: Direction) => {
    setDirectionState(newDir);
    setLocale(newDir === "rtl" ? "ar" : "en");
  };

  const toggleDirection = () => {
    setDirection(direction === "rtl" ? "ltr" : "rtl");
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("dir", direction);
      document.documentElement.setAttribute("lang", locale);
      document.documentElement.classList.remove("rtl", "ltr");
      document.documentElement.classList.add(direction);
    }
  }, [direction, locale]);

  return (
    <DirectionContext.Provider
      value={{
        direction,
        locale,
        isRTL: direction === "rtl",
        setDirection,
        toggleDirection,
      }}
    >
      {children}
    </DirectionContext.Provider>
  );
}

export function useDirection(): DirectionContextValue {
  const context = useContext(DirectionContext);
  if (!context) {
    return {
      direction: "rtl",
      locale: "ar",
      isRTL: true,
      setDirection: () => {},
      toggleDirection: () => {},
    };
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
