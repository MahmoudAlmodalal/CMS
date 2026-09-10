import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "surface" | "primary-border" | "interactive";
}

/**
 * Card Primitive
 * Derived from Figma Component 16 (Node 115:2435):
 * - Radii: 16px (rounded-card)
 * - Padding: 24px (p-6)
 * - Background: #FFFFFF
 * - Base Stroke: rgba(43, 29, 20, 0.12)
 * - Hover Shadow: 9px 12px 57px 0px rgba(197, 71, 22, 0.8)
 * - Base Shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.04)
 */
export function Card({
  className,
  variant = "default",
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-white border border-brand-espresso-subtle shadow-card text-brand-espresso",
    surface: "bg-secondary-500/20 border border-secondary-600/30 text-brand-espresso",
    "primary-border": "bg-white border border-primary-500/60 shadow-card text-brand-espresso",
    interactive:
      "bg-white border border-brand-espresso-subtle shadow-card hover:border-primary-500/60 hover:shadow-card-hover transition-all duration-200 cursor-pointer text-brand-espresso",
  };

  return (
    <div
      className={cn(
        "relative rounded-card overflow-hidden text-start transition-all",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pb-2 flex flex-col gap-1.5 text-start", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base md:text-lg font-bold font-sans text-brand-espresso text-start leading-snug",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs md:text-sm text-gradscale-400 font-medium text-start leading-relaxed",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-2 text-start text-sm text-gradscale-900/80 leading-relaxed", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-6 pt-3 flex items-center justify-between gap-4 border-t border-brand-espresso-subtle mt-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBadge({
  position = "start",
  children,
  className,
}: {
  position?: "start" | "end";
  children: React.ReactNode;
  className?: string;
}) {
  const positionClass = position === "start" ? "start-4" : "end-4";
  return (
    <div
      className={cn(
        `absolute top-4 ${positionClass} z-10 px-3 py-1 text-xs font-bold rounded-badge bg-primary-500 text-white shadow-subtle tracking-wider uppercase`,
        className
      )}
    >
      {children}
    </div>
  );
}
