"use client";

import { BackButton } from "@/components/BackButton";
import { GoalCard } from "@/components/GoalCard";
import { Mascot } from "@/components/Mascot";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/client";
import { useCachedFetch } from "@/lib/useCachedFetch";
import { useI18n } from "@/lib/i18n/provider";

// Full goal list. The dashboard only teases the first couple with a "see
// all" row; this is where the rest live.
export default function GoalsPage() {
  return (
    <RequireAuth>
      <GoalsList />
    </RequireAuth>
  );
}

function GoalsList() {
  const { t } = useI18n();
  const goals = useCachedFetch("goals:all", () => api.listGoals());

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-6">
      <header className="flex items-center gap-3">
        <BackButton />
        <span className="font-display text-lg font-semibold text-ink">{t("dash.yourGoals")}</span>
      </header>

      {goals === null ? (
        <div className="mt-6 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-card bg-gold-soft/40 shimmer" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <Mascot pose="empty" size={150} />
          <p className="mt-3 font-display text-xl font-semibold text-ink">{t("dash.noGoals")}</p>
          <p className="mt-2 max-w-xs text-sm font-medium text-ink-soft">{t("dash.noGoalsHint")}</p>
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
