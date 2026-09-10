import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean | string;
}

/**
 * Text Area Primitive
 * Derived from Figma Booking Form (Node 91:17109):
 * - Min-height: 138px
 * - Radii: 16px (rounded-input)
 * - Stroke: rgba(43, 29, 20, 0.12)
 * - Placeholder: #666666 (gradscale-400)
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, disabled, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        className={cn(
          "w-full min-h-[138px] bg-white rounded-input px-4 py-3.5 text-sm font-sans text-gradscale-900 placeholder:text-gradscale-400 placeholder:text-xs border resize-y transition-colors duration-150",
          "border-brand-espresso-subtle focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15",
          error && "border-alert-error focus:border-alert-error focus:ring-alert-error/15 text-alert-error",
          disabled && "bg-secondary-100 opacity-60 cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
