import React, { useId } from "react";
import { ChevronEndIcon } from "./Icons";

export function FormField({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`flex flex-col gap-1.5 text-start ${className}`}>{children}</div>;
}

export function Label({
  htmlFor,
  required,
  className = "",
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-semibold text-brand-espresso text-start flex items-center gap-1 ${className}`}
    >
      <span>{children}</span>
      {required && <span className="text-brand-primary text-xs" aria-hidden="true">*</span>}
    </label>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: string;
}

export function Input({
  className = "",
  startIcon,
  endIcon,
  error,
  ...props
}: InputProps) {
  return (
    <div className="relative w-full">
      {startIcon && (
        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-brand-espresso/50">
          {startIcon}
        </div>
      )}
      <input
        className={`w-full rounded-xl border bg-white py-2.5 text-sm text-brand-espresso transition-colors placeholder:text-brand-espresso/40 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary ${
          startIcon ? "ps-10" : "ps-4"
        } ${endIcon ? "pe-10" : "pe-4"} ${
          error ? "border-red-500 ring-1 ring-red-500/20" : "border-brand-surface hover:border-brand-primary/50"
        } ${className}`}
        {...props}
      />
      {endIcon && (
        <div className="absolute inset-y-0 end-0 pe-3.5 flex items-center pointer-events-none text-brand-espresso/50">
          {endIcon}
        </div>
      )}
    </div>
  );
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ className = "", error, ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full rounded-xl border bg-white p-3.5 text-sm text-brand-espresso transition-colors placeholder:text-brand-espresso/40 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary min-h-[100px] text-start ${
        error ? "border-red-500 ring-1 ring-red-500/20" : "border-brand-surface hover:border-brand-primary/50"
      } ${className}`}
      {...props}
    />
  );
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ className = "", children, error, ...props }: SelectProps) {
  return (
    <div className="relative w-full">
      <select
        className={`w-full appearance-none rounded-xl border bg-white py-2.5 ps-4 pe-10 text-sm text-brand-espresso transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary ${
          error ? "border-red-500" : "border-brand-surface hover:border-brand-primary/50"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3.5 text-brand-espresso/60 rotate-90">
        <ChevronEndIcon size={16} />
      </div>
    </div>
  );
}

export function Checkbox({
  id,
  label,
  checked,
  onChange,
  disabled,
  className = "",
}: {
  id?: string;
  label: React.ReactNode;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`flex items-start gap-3 cursor-pointer select-none ${className}`}>
      <input
        type="checkbox"
        id={inputId}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 h-4 w-4 rounded-md border-brand-surface text-brand-primary focus:ring-brand-primary/30 focus:ring-2 cursor-pointer accent-brand-primary"
      />
      <label htmlFor={inputId} className="text-sm text-brand-espresso leading-snug cursor-pointer text-start">
        {label}
      </label>
    </div>
  );
}

export function Radio({
  id,
  name,
  value,
  label,
  checked,
  onChange,
  className = "",
}: {
  id?: string;
  name: string;
  value: string;
  label: React.ReactNode;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`flex items-center gap-3 cursor-pointer select-none ${className}`}>
      <input
        type="radio"
        id={inputId}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 border-brand-surface text-brand-primary focus:ring-brand-primary/30 cursor-pointer accent-brand-primary"
      />
      <label htmlFor={inputId} className="text-sm text-brand-espresso cursor-pointer text-start">
        {label}
      </label>
    </div>
  );
}

/**
 * RTL-Aware Phone Input with LTR isolation for digits and country code
 */
export function PhoneInput({
  prefix = "+966",
  placeholder = "50 123 4567",
  className = "",
  error,
  ...props
}: Omit<InputProps, "startIcon"> & { prefix?: string }) {
  return (
    <div className={`relative flex items-center rounded-xl border bg-white ${error ? "border-red-500" : "border-brand-surface"} ${className}`}>
      <span
        dir="ltr"
        className="ps-3.5 pe-2 py-2.5 text-sm font-mono font-medium text-brand-espresso/70 border-e border-brand-surface bg-brand-surface/20 rounded-s-xl select-none"
      >
        {prefix}
      </span>
      <input
        type="tel"
        dir="ltr"
        placeholder={placeholder}
        className="w-full bg-transparent py-2.5 ps-3 pe-4 text-sm font-mono text-brand-espresso placeholder:text-brand-espresso/40 focus:outline-hidden text-start rounded-e-xl"
        {...props}
      />
    </div>
  );
}

/**
 * RTL-Aware URL Input with LTR isolation
 */
export function UrlInput({
  protocol = "https://",
  placeholder = "andalusia-band.com",
  className = "",
  error,
  ...props
}: Omit<InputProps, "startIcon"> & { protocol?: string }) {
  return (
    <div className={`relative flex items-center rounded-xl border bg-white ${error ? "border-red-500" : "border-brand-surface"} ${className}`}>
      <span
        dir="ltr"
        className="ps-3.5 pe-2 py-2.5 text-sm font-mono text-brand-espresso/60 border-e border-brand-surface bg-brand-surface/20 rounded-s-xl select-none"
      >
        {protocol}
      </span>
      <input
        type="url"
        dir="ltr"
        placeholder={placeholder}
        className="w-full bg-transparent py-2.5 ps-3 pe-4 text-sm font-mono text-brand-espresso placeholder:text-brand-espresso/40 focus:outline-hidden text-start rounded-e-xl"
        {...props}
      />
    </div>
  );
}

export function FormHelperText({
  children,
  error = false,
  className = "",
}: {
  children: React.ReactNode;
  error?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`text-xs text-start mt-1 ${
        error ? "text-red-600 font-medium" : "text-brand-espresso/60"
      } ${className}`}
    >
      {children}
    </p>
  );
}
