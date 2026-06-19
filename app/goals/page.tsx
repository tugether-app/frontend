import Link from "next/link";
import { PillButton } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { GoalCard } from "@/components/GoalCard";
import { CoinJar } from "@/components/CoinJar";
import { BottomNav } from "@/components/BottomNav";
import { MOCK_GOALS } from "@/lib/mock";

// My goals. Lists goals the member created or joined.
// BE pass: read from /api keyed by the logged-in member address.

export default function GoalsPage() {
  const goals = MOCK_GOALS;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href="/">
          <WordMark />
        </Link>
        <Link href="/create" className="text-sm font-bold text-gold-deep hover:text-ink">
          + Tujuan
        </Link>
      </header>

      <h1 className="mt-8 font-display text-[28px] font-semibold tracking-tight text-ink">Tujuanku</h1>

      {goals.length === 0 ? (
        <div className="mt-10 flex flex-1 flex-col items-center rounded-card border border-dashed border-[#E6DECF] bg-surface p-12 text-center">
          <CoinJar pct={0} size={160} face="neutral" />
          <p className="mt-3 font-display text-2xl font-semibold text-ink">Belum ada tujuan</p>
          <p className="mt-2 max-w-xs text-sm font-medium text-ink-soft">
            Yuk mulai yang pertama. Celengannya nunggu diisi nih.
          </p>
          <Link href="/create" className="mt-6">
            <PillButton>Mulai tujuan pertama</PillButton>
          </Link>
        </div>
      ) : (
        <div className="stagger mt-6 flex flex-col gap-3">
          {goals.map((g, i) => (
            <div key={g.id} style={{ "--i": i } as React.CSSProperties}>
              <GoalCard goal={g} />
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
