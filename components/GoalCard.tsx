import Link from "next/link";
import type { Goal } from "@/lib/types";
import { progressPct, rupiah } from "@/lib/format";
import { ProgressRing } from "./ProgressRing";
import { MemberAvatars } from "./MemberAvatars";

// Compact goal summary for the list page.

export function GoalCard({ goal }: { goal: Goal }) {
  const pct = progressPct(goal);
  const reached = goal.status !== "open";

  return (
    <Link href={`/g/${goal.joinSlug}`} className="block">
      <div className="card rounded-card p-4 transition-transform hover:-translate-y-0.5">
        <div className="flex items-center gap-4">
          <ProgressRing pct={pct} size={64} stroke={7} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-extrabold text-ink">{goal.name}</h3>
              {reached && (
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                  Tercapai
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-ink-soft">
              {rupiah(goal.collectedAmount)} <span className="text-ink-soft/60">/ {goal.targetDisplay}</span>
            </p>
            <div className="mt-2">
              <MemberAvatars members={goal.members} size={28} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
