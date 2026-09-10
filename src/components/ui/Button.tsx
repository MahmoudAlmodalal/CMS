import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "pill"
    | "inverse-outline";
  size?: "sm" | "md" | "lg" | "icon-sm" | "icon-md" | "icon-lg";
  isLoading?: boolean;
}

/**
 * Button Component
 * Derived directly from Figma Button Master Set (Node 27:11866 & 115:1080/115:2176)
 * - Radii: 12px (rounded-button) or full pill
 * - Heights: 44px (sm), 48px (md), 58px (lg)
 * - Confirmed color tokens: primary-500 (#C54716), hover (#D16C45), pressed (#B34114), disabled (#E4AA94)
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold select-none cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

    const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-primary-500 text-white hover:bg-primary-400 active:bg-primary-600 disabled:bg-primary-200",
      secondary:
        "bg-white border border-primary-500 text-primary-500 hover:border-primary-400 hover:text-primary-400 active:border-primary-600 active:text-primary-600 disabled:border-primary-200 disabled:text-primary-200",
      outline:
        "bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100 disabled:border-primary-200 disabled:text-primary-200",
      ghost:
        "bg-transparent text-primary-500 hover:bg-primary-50 active:bg-primary-100 disabled:text-primary-200",
      pill:
        "rounded-full bg-primary-500 text-white hover:bg-primary-400 active:bg-primary-600 disabled:bg-primary-200",
      "inverse-outline":
        "bg-transparent border border-brand-tint text-brand-tint hover:bg-brand-tint/10 active:bg-brand-tint/20 disabled:border-brand-tint/40 disabled:text-brand-tint/40",
    };

    const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "h-[44px] px-4 text-xs gap-2 rounded-button",
      md: "h-[48px] px-5 text-sm gap-2.5 rounded-button",
      lg: "h-[58px] px-6 text-base gap-3 rounded-button",
      "icon-sm": "h-[44px] w-[44px] p-0 rounded-button",
      "icon-md": "h-[48px] w-[48px] p-0 rounded-button",
      "icon-lg": "h-[58px] w-[58px] p-0 rounded-button",
    };

    const isPill = variant === "pill";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          isPill && "rounded-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
