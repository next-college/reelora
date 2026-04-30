"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { DotsThreeIcon } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

interface OverflowMenuProps {
  ariaLabel?: string;
  align?: "left" | "right";
  iconSize?: number;
  children: (close: () => void) => ReactNode;
  triggerClassName?: string;
}

export default function OverflowMenu({
  ariaLabel = "More options",
  align = "right",
  iconSize = 16,
  children,
  triggerClassName,
}: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen((o) => !o);
        }}
        aria-label={ariaLabel}
        className={
          triggerClassName ??
          "p-1 rounded-md text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-base"
        }
      >
        <DotsThreeIcon size={iconSize} weight="bold" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute top-full mt-1 z-50 min-w-36 origin-top bg-bg-surface border border-border-default rounded-lg shadow-xl overflow-hidden ${
              align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
            }`}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
