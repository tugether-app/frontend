import Link from "next/link";
import { PillButton } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { GoalCard } from "@/components/GoalCard";
import { CoinJar } from "@/components/CoinJar";
import { MOCK_GOALS } from "@/lib/mock";

// My goals. Lists goals the member created or joined.
// BE pass: read from /api keyed by the logged-in member address.

export default function GoalsPage() {
  const goals = MOCK_GOALS;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-6">
      <header className="flex items-center justify-between">
        <Link href="/">
          <WordMark />
        </Link>
        <Link href="/create" className="text-sm font-semibold text-gold-deep hover:text-ink">
          + Tujuan
        </Link>
      </header>

      <h1 className="mt-8 text-2xl font-extrabold tracking-tight text-ink">Tujuanku</h1>

      {goals.length === 0 ? (
        <div className="mt-12 flex flex-1 flex-col items-center text-center">
          <CoinJar pct={0} size={180} />
          <p className="mt-4 font-semibold text-ink">Belum ada tujuan</p>
          <p className="mt-1 max-w-xs text-sm text-ink-soft">Mulai tujuan pertamamu dan ajak teman nabung bareng.</p>
          <Link href="/create" className="mt-6 w-full">
            <PillButton className="w-full">Mulai tujuan pertama</PillButton>
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
    </main>
  );
}
