"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Shared behavior for every hand-rolled modal (deposit/withdraw sheets,
// avatar picker, confirm dialog): Esc closes, body scroll locks, focus moves
// into the dialog and is trapped there (Tab/Shift+Tab cycle instead of
// escaping to the page behind it), and focus returns to whatever triggered
// the dialog once it closes. None of that existed before -- dialogs only had
// Esc + scroll lock, so keyboard/screen-reader users could tab out into the
// dimmed page and lost their place after closing.
export function useDialog<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
  initialFocusRef?: React.RefObject<HTMLElement | null>,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open) return;
    const lastFocused = document.activeElement as HTMLElement | null;
    const node = ref.current;

    const focusables = () => Array.from(node?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    // Default to the first focusable control in DOM order; callers with a
    // destructive confirm button pass initialFocusRef (e.g. Cancel) so an
    // accidental Enter press doesn't trigger the destructive action.
    (initialFocusRef?.current ?? focusables()[0] ?? node)?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lastFocused?.focus?.();
    };
  }, [open, onClose, initialFocusRef]);

  return ref;
}
