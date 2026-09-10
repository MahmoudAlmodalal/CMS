import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

/**
 * Form Input Primitive
 * Derived from Figma Booking Form (Node 91:17109):
 * - Height: 48px
 * - Radii: 16px (rounded-input)
 * - Padding: 13.6px top/bottom, 16px left/right (px-4 py-3.5)
 * - Stroke: rgba(43, 29, 20, 0.12)
 * - Placeholder: #666666 (gradscale-400)
 * - Value: #1B1B1B (gradscale-900)
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, startIcon, endIcon, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {startIcon && (
          <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-gradscale-400">
            {startIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            "w-full h-[48px] bg-white rounded-input px-4 py-3.5 text-sm font-sans text-gradscale-900 placeholder:text-gradscale-400 placeholder:text-xs border transition-colors duration-150",
            "border-brand-espresso-subtle focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15",
            error && "border-alert-error focus:border-alert-error focus:ring-alert-error/15 text-alert-error",
            disabled && "bg-secondary-100 opacity-60 cursor-not-allowed",
            startIcon && "ps-11",
            endIcon && "pe-11",
            className
          )}
          {...props}
        />
        {endIcon && (
          <div className="absolute inset-y-0 end-0 flex items-center pe-4 pointer-events-none text-gradscale-400">
            {endIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
