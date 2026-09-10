import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "active" | "primary" | "surface" | "outline";
  size?: "sm" | "md";
  interactive?: boolean;
}

/**
 * Badge & Category Chip Component
 * Derived directly from Figma Component 1 (Node 31:3483) & Filter Tabs (Node 31:3581):
 * - Active: bg-primary-500 (#C54716), text-white
 * - Default: bg-primary-50 (#F9EDE8), text-gradscale-900 (#1B1B1B)
 * - Radii: 16px (rounded-badge)
 * - Font: Cairo Bold (700)
 */
export function Badge({
  className,
  variant = "default",
  size = "md",
  interactive = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-primary-50 text-gradscale-900 border border-primary-100 hover:bg-primary-100",
    active: "bg-primary-500 text-white shadow-subtle",
    primary: "bg-primary-500 text-white",
    surface: "bg-secondary-500/30 text-brand-espresso border border-secondary-600/20",
    outline: "bg-transparent border border-primary-500 text-primary-500",
  };

  const sizeStyles = {
    sm: "h-[28px] px-3 text-xs gap-1.5",
    md: "h-[38px] px-4 text-sm gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-bold font-sans rounded-badge select-none transition-colors duration-150",
        variantStyles[variant],
        sizeStyles[size],
        interactive && "cursor-pointer active:scale-95",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
