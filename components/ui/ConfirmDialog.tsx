"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WarningIcon } from "@phosphor-icons/react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "destructive",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (loading) return;
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);

    const focusTimer = window.setTimeout(() => confirmBtnRef.current?.focus(), 60);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
    };
  }, [open, loading, onCancel]);

  async function handleConfirm() {
    if (loading) return;
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  const isDestructive = tone === "destructive";

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-bg-base/70 backdrop-blur-sm"
            onClick={() => !loading && onCancel()}
          />

          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-md bg-bg-surface border border-border-default rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.35)] overflow-hidden"
          >
            <div className="px-6 pt-6 pb-5 flex gap-4">
              {isDestructive && (
                <div className="shrink-0 w-9 h-9 rounded-full bg-vermillion-700/15 flex items-center justify-center">
                  <WarningIcon size={18} weight="fill" className="text-vermillion-100" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2
                  id="confirm-dialog-title"
                  className="text-base font-semibold text-text-primary tracking-tight"
                >
                  {title}
                </h2>
                {description && (
                  <div className="mt-1.5 text-sm text-text-secondary leading-relaxed">
                    {description}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border-default bg-bg-hover/30">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-md transition-base disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmBtnRef}
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-base active:scale-[0.98] disabled:opacity-60 ${
                  isDestructive
                    ? "bg-vermillion-700 text-vermillion-100 hover:bg-vermillion-700/85"
                    : "bg-amber-500 text-text-inverse hover:bg-amber-300"
                }`}
              >
                {loading ? "Working..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
