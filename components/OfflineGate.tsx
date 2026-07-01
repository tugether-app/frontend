"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { PillButton } from "./ui";
import { useI18n } from "@/lib/i18n/provider";

// Full-screen overlay shown when the browser goes offline. Mounted globally.
export function OfflineGate() {
  const { t } = useI18n();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <img src="/art/state/offline.png" alt="" aria-hidden className="h-52 w-auto select-none" draggable={false} />
      <h1 className="font-display text-2xl font-semibold text-ink">{t("offline.title")}</h1>
      <p className="max-w-xs text-sm font-medium text-ink-soft">{t("offline.hint")}</p>
      <PillButton onClick={() => setOffline(!navigator.onLine)}>{t("offline.retry")}</PillButton>
    </div>
  );
}
