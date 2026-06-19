"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; msg: string; kind: "info" | "success" | "error" };
type ToastCtx = (msg: string, kind?: Toast["kind"]) => void;

const Ctx = createContext<ToastCtx>(() => {});

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let seq = 0;

  const push = useCallback<ToastCtx>((msg, kind = "info") => {
    const id = Date.now() + seq++;
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-in pointer-events-auto rounded-full px-5 py-3 text-sm font-semibold shadow-soft ${
              t.kind === "success"
                ? "bg-success text-white"
                : t.kind === "error"
                  ? "bg-blush text-ink"
                  : "bg-ink text-white"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
