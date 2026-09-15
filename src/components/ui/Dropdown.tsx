"use client";

// Custom dropdown replacing native <select> inside admin panels.
//
// Why: native select popups open and instantly close in the admin shell on
// Chrome (every admin select sits inside an overflow-hidden Card). This
// listbox keeps its full state in React and renders the option panel in a
// portal, so it stays open until an option is picked, Escape is pressed, or
// the user clicks outside. RTL-safe, keyboard accessible.

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useModalPortalContainer } from "@/components/ui/ModalPortal";
import { CheckIcon, ChevronEndIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface DropdownProps<T extends string> {
  id?: string;
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  /** Preserves native form validation when an empty value is invalid. */
  required?: boolean;
  size?: "md" | "sm";
  className?: string;
  ariaLabel?: string;
  /**
   * Where the listbox portals to. Defaults to the nearest open modal (so the
   * panel is not painted under a top-layer `<dialog>`), else document.body.
   */
  container?: HTMLElement | null;
}

const PANEL_MAX_HEIGHT = 256;

export function Dropdown<T extends string>({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  required = false,
  size = "md",
  className = "",
  ariaLabel,
  container,
}: DropdownProps<T>) {
  const modalContainer = useModalPortalContainer();
  const generatedId = useId();
  const buttonId = id ?? `dropdown-${generatedId}`;
  const listboxId = `${buttonId}-listbox`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const openUp = spaceBelow < 160 && rect.top > spaceBelow;
    setPanelStyle({
      position: "fixed",
      zIndex: 100,
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
      width: Math.max(rect.width, 120),
      maxHeight: PANEL_MAX_HEIGHT,
    });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setHighlight(-1);
  }, []);

  const openMenu = useCallback(() => {
    if (disabled) return;
    const firstEnabled = options.findIndex((option) => !option.disabled);
    setHighlight(selectedIndex >= 0 ? selectedIndex : firstEnabled);
    updatePosition();
    setOpen(true);
  }, [disabled, options, selectedIndex, updatePosition]);

  const pick = useCallback(
    (next: T) => {
      onChange(next);
      close();
      buttonRef.current?.focus();
    },
    [onChange, close],
  );

  // Close on outside pointer down.
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        target &&
        !buttonRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        close();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, close]);

  // Keep the panel anchored while scrolling / resizing.
  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  // Focus the highlighted option for keyboard users.
  useLayoutEffect(() => {
    if (open && highlight >= 0) {
      optionRefs.current[highlight]?.focus({ preventScroll: true });
      optionRefs.current[highlight]?.scrollIntoView({ block: "nearest" });
    }
  }, [open, highlight]);

  const moveHighlight = useCallback(
    (direction: 1 | -1) => {
      if (options.length === 0) return;
      let next = highlight;
      for (let step = 0; step < options.length; step += 1) {
        next = (next + direction + options.length) % options.length;
        if (!options[next]?.disabled) break;
      }
      if (!options[next]?.disabled) setHighlight(next);
    },
    [highlight, options],
  );

  const handleButtonKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
      } else {
        moveHighlight(event.key === "ArrowDown" ? 1 : -1);
      }
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
    }
  };

  const handlePanelKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveHighlight(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlight(-1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[highlight];
      if (option && !option.disabled) pick(option.value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
      buttonRef.current?.focus();
    } else if (event.key === "Tab") {
      close();
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <button
        ref={buttonRef}
        type="button"
        id={buttonId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={handleButtonKeyDown}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-input border bg-white text-sm transition-colors duration-150",
          "border-brand-espresso-subtle focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15",
          size === "md" ? "h-[48px] px-4" : "h-[40px] px-3",
          disabled && "cursor-not-allowed bg-secondary-100 opacity-60",
          !disabled && "cursor-pointer hover:border-brand-primary/50",
          selected ? "text-gradscale-900" : "text-gradscale-400",
        )}
      >
        <span className="truncate text-start">{selected?.label ?? placeholder ?? ""}</span>
        <span
          aria-hidden="true"
          className={cn(
            "shrink-0 text-brand-espresso/60 transition-transform",
            open && "-rotate-90",
          )}
        >
          <span className="block rotate-90">
            <ChevronEndIcon size={16} />
          </span>
        </span>
      </button>

      {/* Hidden native select keeps required-field form validation working.
          It can never open a popup: pointer events off, removed from tab order. */}
      {required && (
        <select
          aria-hidden="true"
          tabIndex={-1}
          required
          value={value}
          onChange={() => {}}
          className="pointer-events-none absolute h-px w-px opacity-0"
        />
      )}

      {mounted &&
        open &&
        createPortal(
          <div
            ref={panelRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={buttonId}
            onKeyDown={handlePanelKeyDown}
            style={panelStyle}
            className="overflow-auto rounded-input border border-brand-espresso-subtle bg-white p-1.5 shadow-dropdown"
          >
            {options.length === 0 ? (
              <p className="px-3 py-2 text-start text-xs text-gradscale-400">
                لا توجد خيارات متاحة
              </p>
            ) : (
              options.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlight;
                return (
                  <button
                    key={option.value}
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onClick={() => pick(option.value)}
                    onMouseEnter={() => setHighlight(index)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-start text-sm transition-colors",
                      option.disabled
                        ? "cursor-not-allowed opacity-40"
                        : "cursor-pointer",
                      isSelected
                        ? "bg-brand-primary/10 font-bold text-brand-primary"
                        : "text-gradscale-900",
                      !isSelected &&
                        !option.disabled &&
                        isHighlighted &&
                        "bg-brand-surface/60",
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <span aria-hidden="true" className="shrink-0">
                        <CheckIcon size={16} />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>,
          container ?? modalContainer ?? document.body,
        )}
    </div>
  );
}
