import Link from "next/link";
import type { Goal } from "@/lib/types";
import { progressPct, money } from "@/lib/format";
import { ProgressRing } from "./ProgressRing";
import { MemberAvatars } from "./MemberAvatars";

// Goal summary card (reference "ring" variant).

export function GoalCard({ goal }: { goal: Goal }) {
  const pct = progressPct(goal);
  const reached = goal.status !== "open";

  return (
    <Link href={`/g/${goal.joinSlug}`} className="block">
      <div className="rounded-card border border-line bg-surface p-6 shadow-card-lg transition-transform duration-150 hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-xl font-semibold text-ink">{goal.name}</h3>
            {reached && (
              <span className="mt-1 inline-block rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">
                Reached
              </span>
            )}
          </div>
          <ProgressRing pct={pct} size={68} stroke={8} />
        </div>

        <div className="mt-4 font-display text-[28px] font-bold leading-none text-gold-deep">
          {money(goal.collectedAmount)}
        </div>
        <div className="mt-1 text-[13px] font-semibold text-ink-soft">of {goal.targetDisplay}</div>

        <div className="my-4 h-px bg-line" />

        <div className="flex items-center justify-between">
          <MemberAvatars members={goal.members} size={34} />
          <span className="text-xs font-bold text-ink-soft">{goal.members.length} members</span>
        </div>
      </div>
    </Link>
  );
}
