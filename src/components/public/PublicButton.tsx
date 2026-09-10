import React, { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type PublicButtonVariant = "primary" | "secondary";
export type PublicButtonSize = "md" | "sm" | "lg";

export interface PublicButtonBaseProps {
  /**
   * Primary: Solid terracotta #C54716 with #B34114 hover (Figma Node 115:1080)
   * Secondary: Transparent with #F9EDE8 stroke & 10% tint on hover (Figma Node 115:2176)
   */
  variant?: PublicButtonVariant;
  /**
   * Standard button sizes.
   * md: default 48px height expanding to 56px on hover (+8px)
   * sm: 40px height expanding to 48px on hover
   * lg: 56px height expanding to 64px on hover
   */
  size?: PublicButtonSize;
  /**
   * Whether vertical height expansion (+8px) triggers on hover. Default true.
   */
  expandOnHover?: boolean;
  /**
   * Optional leading or trailing icon.
   */
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  /**
   * Accessible loading state with spinner.
   */
  isLoading?: boolean;
  /**
   * Canonical Figma button width is 207px. Set fullWidth to true for 100% width on mobile drawers/cards.
   */
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export type PublicButtonProps =
  | (PublicButtonBaseProps & {
      href: string;
    } & Omit<React.ComponentProps<typeof Link>, keyof PublicButtonBaseProps | "href">)
  | (PublicButtonBaseProps & {
      href?: undefined;
    } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof PublicButtonBaseProps>);

export const PublicButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  PublicButtonProps
>(function PublicButton(
  {
    variant = "primary",
    size = "md",
    expandOnHover = true,
    icon,
    iconPosition = "start",
    isLoading = false,
    fullWidth = false,
    className,
    children,
    ...props
  },
  ref
) {
  // Universal 12px radius (rounded-xl / rounded-button)
  const baseStyles =
    "inline-flex items-center justify-center font-sans font-bold select-none cursor-pointer rounded-button rounded-xl text-center transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

  // Variant styles matching Figma Nodes 115:1080 (Primary) and 115:2176 (Secondary)
  const variantStyles: Record<PublicButtonVariant, string> = {
    primary: cn(
      "bg-brand-primary text-white shadow-md border border-transparent",
      "hover:bg-brand-primary-hover hover:shadow-lg",
      "active:bg-brand-primary-pressed",
      "disabled:bg-primary-200 disabled:text-white/70"
    ),
    secondary: cn(
      "bg-transparent text-brand-tint border border-brand-tint backdrop-blur-xs",
      "hover:bg-brand-tint/10 hover:border-brand-tint",
      "active:bg-brand-tint/20",
      "disabled:border-brand-tint/40 disabled:text-brand-tint/40"
    ),
  };

  // Height definitions: default 48px expanding to 56px (+8px) on hover
  const sizeStyles: Record<PublicButtonSize, string> = {
    md: cn(
      "h-12 px-6 text-base gap-2.5",
      fullWidth ? "w-full" : "min-w-[207px] w-auto",
      expandOnHover && "hover:h-14 group-hover:h-14"
    ),
    sm: cn(
      "h-10 px-4 text-sm gap-2",
      fullWidth ? "w-full" : "min-w-[160px] w-auto",
      expandOnHover && "hover:h-12 group-hover:h-12"
    ),
    lg: cn(
      "h-14 px-8 text-lg gap-3",
      fullWidth ? "w-full" : "min-w-[240px] w-auto",
      expandOnHover && "hover:h-16 group-hover:h-16"
    ),
  };

  const content = (
    <>
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
        <>
          {icon && iconPosition === "start" && (
            <span className="shrink-0 transition-transform group-hover:scale-105" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="truncate">{children}</span>
          {icon && iconPosition === "end" && (
            <span className="shrink-0 transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" aria-hidden="true">
              {icon}
            </span>
          )}
        </>
      )}
    </>
  );

  const combinedClassName = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if ("href" in props && typeof props.href === "string") {
    const { href, ...linkProps } = props;
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={combinedClassName}
        {...linkProps}
      >
        {content}
      </Link>
    );
  }

  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={buttonProps.type || "button"}
      disabled={buttonProps.disabled || isLoading}
      className={combinedClassName}
      {...buttonProps}
    >
      {content}
    </button>
  );
});

PublicButton.displayName = "PublicButton";
