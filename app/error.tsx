"use client";

import { PillButton } from "@/components/ui";
import { Mascot } from "@/components/Mascot";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <Mascot pose="sad" size={150} />
      <h1 className="font-display text-xl font-semibold text-ink">Something went wrong</h1>
      <p className="max-w-xs text-sm font-medium text-ink-soft">Try reloading this page.</p>
      <PillButton onClick={reset}>Try again</PillButton>
    </main>
  );
}
