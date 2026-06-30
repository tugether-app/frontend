"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PillButton } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { Avatar } from "@/components/Avatar";
import { CoinJar } from "@/components/CoinJar";
import { Mascot } from "@/components/Mascot";
import { GoalCard } from "@/components/GoalCard";
import { ProgressRing } from "@/components/ProgressRing";
import { BottomNav } from "@/components/BottomNav";
import { api } from "@/lib/client";
import { money, progressPct } from "@/lib/format";
import { useI18n } from "@/lib/i18n/provider";
import type { Goal } from "@/lib/types";

// Home = dashboard: greeting, stats, a featured goal, and your goals list.
export default function Home() {
  const { t } = useI18n();
  const [goals, setGoals] = useState<Goal[] | null>(null);

  useEffect(() => {
    let on = true;
    api.listGoals().then((g) => on && setGoals(g)).catch(() => on && setGoals([]));
    return () => {
      on = false;
    };
  }, []);

  const totalSaved = (goals ?? []).reduce((s, g) => s + g.collectedAmount, 0);
  const reached = (goals ?? []).filter((g) => g.status !== "open").length;
  // Featured: the open goal closest to its target.
  const featured = (goals ?? [])
    .filter((g) => g.status === "open")
    .sort((a, b) => progressPct(b) - progressPct(a))[0];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <WordMark />
        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            aria-label={t("notif.title")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface ring-1 ring-line transition hover:ring-gold active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6" stroke="#2B2622" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 20a2 2 0 004 0" stroke="#2B2622" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Link>
          <Link href="/profile" aria-label={t("nav.profile")} className="rounded-full ring-2 ring-line transition hover:ring-gold">
            <Avatar seed="you" size={36} />
          </Link>
        </div>
      </header>

      <div className="rise-in mt-6">
        <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-ink">
          {t("dash.greeting")} <span aria-hidden>👋</span>
        </h1>
        <p className="mt-1 font-medium text-ink-soft">{t("dash.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="stagger mt-5 grid grid-cols-3 gap-3">
        {[
          { label: t("dash.saved"), value: goals ? money(totalSaved) : "—" },
          { label: t("dash.goals"), value: goals ? String(goals.length) : "—" },
          { label: t("dash.reached"), value: goals ? String(reached) : "—" },
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

      {/* Featured goal */}
      {featured && (
        <Link href={`/g/${featured.joinSlug}`} className="mt-5 block">
          <div className="flex items-center gap-4 rounded-card border border-line bg-gradient-to-br from-[#FFFCF4] to-gold-soft p-5 shadow-card transition-transform hover:-translate-y-0.5">
            <CoinJar pct={progressPct(featured)} size={92} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gold-deep">{t("dash.featured")}</p>
              <h3 className="mt-0.5 truncate font-display text-lg font-semibold text-ink">{featured.name}</h3>
              <p className="mt-0.5 text-sm font-semibold text-ink-soft">
                {money(featured.collectedAmount)} <span className="text-ink-soft/60">/ {featured.targetDisplay}</span>
              </p>
            </div>
            <ProgressRing pct={progressPct(featured)} size={52} stroke={6} />
          </div>
        </Link>
      )}

      {/* Start CTA */}
      <Link href="/create" className="mt-5 block">
        <PillButton className="w-full py-4 text-base">
          {t("dash.startGoal")} <span aria-hidden>→</span>
        </PillButton>
      </Link>

      {/* Your goals */}
      <h2 className="mt-8 font-display text-lg font-semibold text-ink">{t("dash.yourGoals")}</h2>
      {goals === null ? (
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 rounded-card bg-gold-soft/40 shimmer" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-card border border-dashed border-[#E6DECF] bg-surface p-10 text-center">
          <Mascot pose="empty" size={150} />
          <p className="mt-3 font-display text-xl font-semibold text-ink">{t("dash.noGoals")}</p>
          <p className="mt-2 max-w-xs text-sm font-medium text-ink-soft">{t("dash.noGoalsHint")}</p>
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
        {t("dash.howItWorks")}
      </Link>

      <BottomNav />
    </main>
  );
}
