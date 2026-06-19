"use client";

import { PillButton } from "@/components/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-extrabold text-ink">Ada yang tidak beres</h1>
      <p className="max-w-xs text-sm text-ink-soft">Coba muat ulang halaman ini.</p>
      <PillButton onClick={reset}>Coba lagi</PillButton>
    </main>
  );
}
