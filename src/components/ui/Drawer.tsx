"use client";

import React, { useEffect } from "react";
import { useDirection } from "@/lib/direction";
import { CloseIcon } from "./Icons";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  side?: "start" | "end";
  children: React.ReactNode;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  side = "start",
  children,
  className = "",
}: DrawerProps) {
  const { isRTL } = useDirection();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine alignment and translate animation according to side & direction
  // side="start": in RTL, start is right side; in LTR, start is left side.
  // side="end": in RTL, end is left side; in LTR, end is right side.
  const isStart = side === "start";
  const positionClass = isStart ? "start-0" : "end-0";

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === "string" ? title : "قائمة جانبية"}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed inset-y-0 ${positionClass} z-50 flex flex-col w-full max-w-sm bg-brand-cream border-s border-brand-surface shadow-2xl transition-transform duration-300 ease-out text-brand-espresso ${className}`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-brand-surface bg-white/70">
          {title ? (
            <h3 className="font-calligraphic text-xl font-bold text-brand-espresso text-start">
              {title}
            </h3>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-full p-2 text-brand-espresso/70 hover:bg-brand-surface hover:text-brand-espresso transition-colors cursor-pointer"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 text-start">{children}</div>
      </aside>
    </div>
  );
}
