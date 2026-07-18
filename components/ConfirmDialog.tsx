"use client";

import { useCallback, useId, useRef } from "react";
import { PillButton } from "./ui";
import { useDialog } from "@/lib/useDialog";

// Generic confirm-before-you-do-it sheet. Same overlay/dialog pattern as the
// deposit sheet and avatar picker (Esc closes, body scroll locks, focus is
// trapped inside and returns to the trigger on close -- see lib/useDialog).
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
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const handleClose = useCallback(() => {
    if (!loading) onClose();
  }, [loading, onClose]);
  // Destructive: default focus to Cancel, not the danger button, so an
  // accidental Enter press doesn't confirm it.
  const dialogRef = useDialog<HTMLDivElement>(open, handleClose, destructive ? cancelRef : undefined);

  if (!open) return null;

  return (
    <div
      className="backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-ink/30 px-4 pb-4 sm:items-center"
      onClick={handleClose}
    >
      <div
        ref={dialogRef}
        className="sheet-up w-full max-w-sm rounded-card border border-line bg-surface p-6 text-center shadow-card-lg"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="font-display text-xl font-semibold text-ink">
          {title}
        </h2>
        {description && (
          <p id={descId} className="mt-2 text-sm font-medium text-ink-soft">
            {description}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2.5">
          <PillButton
            variant={destructive ? "danger" : "gold"}
            onClick={onConfirm}
            loading={loading}
            className="w-full py-3.5"
          >
            {confirmLabel}
          </PillButton>
          <PillButton ref={cancelRef} variant="ghost" onClick={handleClose} disabled={loading} className="w-full py-3">
            {cancelLabel}
          </PillButton>
        </div>
      </div>
    </div>
  );
}
