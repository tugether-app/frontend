"use client";

import { useEffect } from "react";
import { PillButton } from "./ui";

// Generic confirm-before-you-do-it sheet. Same overlay/dialog pattern as the
// deposit sheet and avatar picker (Esc closes, body scroll locks) so every
// modal in the app behaves the same way.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loading && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div
      className="backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-ink/30 px-4 pb-4 sm:items-center"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => !loading && onClose()}
    >
      <div
        className="sheet-up w-full max-w-sm rounded-card border border-line bg-surface p-6 text-center shadow-card-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        {description && <p className="mt-2 text-sm font-medium text-ink-soft">{description}</p>}
        <div className="mt-6 flex flex-col gap-2.5">
          <PillButton
            variant={destructive ? "danger" : "gold"}
            onClick={onConfirm}
            loading={loading}
            className="w-full py-3.5"
          >
            {confirmLabel}
          </PillButton>
          <PillButton variant="ghost" onClick={onClose} disabled={loading} className="w-full py-3">
            {cancelLabel}
          </PillButton>
        </div>
      </div>
    </div>
  );
}
