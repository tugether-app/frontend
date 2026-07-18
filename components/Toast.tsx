"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type Kind = "info" | "success" | "error";
type ToastItem = { id: number; msg: string; kind: Kind; leaving: boolean };
type ToastCtx = (msg: string, kind?: Kind) => void;

const Ctx = createContext<ToastCtx>(() => {});

export function useToast() {
  return useContext(Ctx);
}

const AUTO_DISMISS_MS = 3200;
const EXIT_MS = 220;

function ToastIcon({ kind }: { kind: Kind }) {
  if (kind === "success") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 12.5l4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "error") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="1.3" fill="currentColor" />
      <path d="M12 11.5v6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

const KIND_STYLE: Record<Kind, string> = {
  success: "bg-success/15 text-success",
  error: "bg-error/15 text-error",
  info: "bg-gold-soft text-gold-deep",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), EXIT_MS);
  }, []);

  const push = useCallback<ToastCtx>(
    (msg, kind = "info") => {
      const id = Date.now() + seq.current++;
      setToasts((list) => [...list, { id, msg, kind, leaving: false }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface py-3 pl-3.5 pr-2.5 shadow-card-lg ${
              t.leaving ? "toast-out" : "toast-in"
            }`}
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${KIND_STYLE[t.kind]}`}>
              <ToastIcon kind={t.kind} />
            </span>
            <span className="flex-1 text-sm font-semibold text-ink">{t.msg}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-bg hover:text-ink active:scale-90"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
