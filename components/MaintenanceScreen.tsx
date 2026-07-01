"use client";
/* eslint-disable @next/next/no-img-element */

import { useI18n } from "@/lib/i18n/provider";

// Shown when NEXT_PUBLIC_MAINTENANCE is on (gated in layout).
export function MaintenanceScreen() {
  const { t } = useI18n();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <img src="/art/state/maintenance.png" alt="" aria-hidden className="h-56 w-auto select-none" draggable={false} />
      <h1 className="font-display text-2xl font-semibold text-ink">{t("maintenance.title")}</h1>
      <p className="max-w-xs text-sm font-medium text-ink-soft">{t("maintenance.hint")}</p>
    </main>
  );
}
