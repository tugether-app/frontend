import Link from "next/link";
import { PillButton } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { Avatar } from "@/components/Avatar";
import { CoinJar } from "@/components/CoinJar";
import { GoalCard } from "@/components/GoalCard";
import { BottomNav } from "@/components/BottomNav";
import { listGoals } from "@/lib/db";
import { money } from "@/lib/format";

// Home = dashboard: a quick overview of your goals + a clear way to start one.
// The marketing splash lives at /welcome.
export const dynamic = "force-dynamic";

export default async function Home() {
  const goals = await listGoals();
  const totalSaved = goals.reduce((s, g) => s + g.collectedAmount, 0);
  const reached = goals.filter((g) => g.status !== "open").length;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <WordMark />
        <Link href="/profile" aria-label="Profile" className="rounded-full ring-2 ring-line transition hover:ring-gold">
          <Avatar seed="you" size={36} />
        </Link>
      </header>

      {/* Greeting */}
      <div className="rise-in mt-6">
        <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-ink">
          Hi there <span aria-hidden>👋</span>
        </h1>
        <p className="mt-1 font-medium text-ink-soft">Here's how your goals are going.</p>
      </div>

      {/* Stats */}
      <div className="stagger mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Saved", value: money(totalSaved) },
          { label: "Goals", value: String(goals.length) },
          { label: "Reached", value: String(reached) },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{ "--i": i } as React.CSSProperties}
            className="rounded-card border border-line bg-surface px-3 py-4 text-center shadow-card"
          >
            <div className="font-display text-xl font-bold text-gold-deep">{s.value}</div>
            <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Start CTA */}
      <Link href="/create" className="mt-5 block">
        <PillButton className="w-full py-4 text-base">
          Start a goal <span aria-hidden>→</span>
        </PillButton>
      </Link>

      {/* Your goals */}
      <h2 className="mt-8 font-display text-lg font-semibold text-ink">Your goals</h2>
      {goals.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-card border border-dashed border-[#E6DECF] bg-surface p-10 text-center">
          <CoinJar pct={0} size={150} face="neutral" />
          <p className="mt-3 font-display text-xl font-semibold text-ink">No goals yet</p>
          <p className="mt-2 max-w-xs text-sm font-medium text-ink-soft">
            Start your first one. The jar is waiting to be filled.
          </p>
        </div>
      ) : (
        <div className="stagger mt-4 flex flex-col gap-3">
          {goals.map((g, i) => (
            <div key={g.id} style={{ "--i": i } as React.CSSProperties}>
              <GoalCard goal={g} />
            </div>
          ))}
        </div>
      )}

      <Link href="/welcome" className="mt-8 text-center text-xs font-bold text-ink-soft/70 hover:text-ink">
        How Tugether works
      </Link>

      <BottomNav />
    </main>
  );
}
