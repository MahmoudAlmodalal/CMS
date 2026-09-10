import React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "full";
}

/**
 * Responsive Container Primitive
 * Derived from Figma "gride and space":
 * - Max Width: 1280px
 * - Margins/Offset: 20px (mobile), 70px-80px (desktop)
 */
export function Container({
  className,
  size = "default",
  children,
  ...props
}: ContainerProps) {
  const sizeStyles = {
    default: "max-w-[1280px]",
    narrow: "max-w-[800px]",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "w-full mx-auto px-5 sm:px-8 lg:px-20",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "canvas" | "espresso" | "surface" | "white";
  spacing?: "sm" | "md" | "lg";
}

/**
 * Section Primitive
 * Standard vertical page block with confirmed Figma backgrounds
 */
export function Section({
  className,
  variant = "canvas",
  spacing = "md",
  children,
  ...props
}: SectionProps) {
  const variantStyles = {
    canvas: "bg-secondary-100 text-brand-espresso",
    espresso: "bg-brand-espresso text-secondary-100",
    surface: "bg-secondary-500/30 text-brand-espresso",
    white: "bg-white text-brand-espresso",
  };

  const spacingStyles = {
    sm: "py-8 md:py-12",
    md: "py-12 md:py-20 lg:py-24",
    lg: "py-16 md:py-28 lg:py-32",
  };

  return (
    <section
      className={cn(
        "w-full relative overflow-hidden text-start",
        variantStyles[variant],
        spacingStyles[spacing],
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
}

/**
 * Grid Primitive
 * Directly mapped to Figma 12-column desktop & 4-column mobile grid:
 * - Gutter: 24px mobile (gap-6), 32px desktop (gap-8)
 */
export function Grid({
  className,
  cols = 12,
  children,
  ...props
}: GridProps) {
  const colsStyles: Record<NonNullable<GridProps["cols"]>, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
    12: "grid-cols-4 md:grid-cols-8 lg:grid-cols-12",
  };

  return (
    <div
      className={cn("grid gap-6 lg:gap-8", colsStyles[cols], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "col";
  gap?: 1 | 2 | 3 | 4 | 6 | 8 | 12;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
}

/**
 * Stack Primitive
 * Flex layout helper with verified spacing scale
 */
export function Stack({
  className,
  direction = "col",
  gap = 4,
  align = "stretch",
  justify = "start",
  children,
  ...props
}: StackProps) {
  const gapStyles: Record<NonNullable<StackProps["gap"]>, string> = {
    1: "gap-2",   // 8px
    2: "gap-4",   // 16px
    3: "gap-6",   // 24px
    4: "gap-8",   // 32px
    6: "gap-12",  // 48px
    8: "gap-16",  // 64px
    12: "gap-24", // 96px
  };

  const alignStyles: Record<NonNullable<StackProps["align"]>, string> = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyStyles: Record<NonNullable<StackProps["justify"]>, string> = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        gapStyles[gap],
        alignStyles[align],
        justifyStyles[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
