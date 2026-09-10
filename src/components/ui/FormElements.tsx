import React from "react";
import { cn } from "@/lib/utils";

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({
  className,
  required,
  children,
  ...props
}: FormLabelProps) {
  return (
    <label
      className={cn(
        "block font-bold text-sm text-gradscale-900 mb-2 select-none",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-brand-primary ms-1">*</span>}
    </label>
  );
}

export interface FormHelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: boolean;
}

export function FormHelperText({
  className,
  error,
  children,
  ...props
}: FormHelperTextProps) {
  return (
    <p
      className={cn(
        "mt-1.5 text-xs text-gradscale-400",
        error && "text-alert-error font-medium",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}
