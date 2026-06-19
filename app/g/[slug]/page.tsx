"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, PillButton } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { CoinJar } from "@/components/CoinJar";
import { ProgressRing } from "@/components/ProgressRing";
import { MemberAvatars } from "@/components/MemberAvatars";
import { Avatar } from "@/components/Avatar";
import { Confetti } from "@/components/Confetti";
import { ShareButton } from "@/components/ShareButton";
import { Chip } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { getGoalBySlug } from "@/lib/mock";
import { progressPct, rupiah } from "@/lib/format";
import type { Goal } from "@/lib/types";

// Goal detail: the coin jar hero + join + deposit. Reads mock data for now;
// the BE pass swaps in GET /api/goals/by-slug/:slug and on-chain deposit.

function placeholderGoal(slug: string): Goal {
  return {
    id: slug,
    joinSlug: slug,
    name: "Tujuan baru",
    targetDisplay: rupiah(5_000_000),
    targetAmount: 5_000_000,
    collectedAmount: 0,
    status: "open",
    createdAt: new Date(0).toISOString(),
    members: [],
  };
}

export default function GoalPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const base = useMemo(() => getGoalBySlug(slug) ?? placeholderGoal(slug), [slug]);

  const toast = useToast();
  const [collected, setCollected] = useState(base.collectedAmount);
  const [members, setMembers] = useState(base.members);
  const [joined, setJoined] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [amount, setAmount] = useState<number | "">("");

  const goal: Goal = { ...base, collectedAmount: collected, members };
  const pct = progressPct(goal);
  const reached = collected >= goal.targetAmount;

  async function join() {
    // TODO(BE): Magic login -> POST /api/goals/:id/join -> upgrade EOA to UA (7702).
    await new Promise((r) => setTimeout(r, 700));
    if (!members.some((m) => m.displayName === "Kamu")) {
      setMembers((m) => [
        ...m,
        { id: "you", displayName: "Kamu", avatarSeed: "you", totalDeposited: 0, joinedAt: new Date(0).toISOString() },
      ]);
    }
    setJoined(true);
    toast("Berhasil gabung!", "success");
  }

  async function deposit() {
    if (typeof amount !== "number" || amount < 10_000) return;
    setDepositing(true);
    // TODO(BE): UA cross-chain route -> GoalVault.deposit(); listen Deposited event.
    await new Promise((r) => setTimeout(r, 900));
    setCollected((c) => Math.min(goal.targetAmount, c + amount));
    setMembers((ms) =>
      ms.map((m) => (m.displayName === "Kamu" ? { ...m, totalDeposited: m.totalDeposited + amount } : m)),
    );
    setDepositing(false);
    setSheet(false);
    setAmount("");
    toast("Setoran masuk!", "success");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-28 pt-6">
      {reached && <Confetti />}

      <header className="flex items-center justify-between">
        <Link href="/">
          <WordMark />
        </Link>
        <ProgressRing pct={pct} size={44} stroke={6} />
      </header>

      {/* Hero */}
      <div className="mt-4 flex flex-col items-center text-center">
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">{goal.name}</h1>
        <p className="mt-1 text-sm font-semibold text-ink-soft">{members.length} orang nabung bareng</p>
        <div className="mt-4">
          <CoinJar pct={pct} size={250} sparkles={reached} />
        </div>
        <div className="mt-2">
          <span className="font-display text-[40px] font-bold leading-none text-gold-deep">{rupiah(collected)}</span>
          <span className="mt-1.5 block text-sm font-semibold text-ink-soft">dari target {goal.targetDisplay}</span>
        </div>
        {reached ? (
          <p className="mt-3 rounded-full bg-success/15 px-4 py-1.5 text-sm font-bold text-success">
            🎉 Target tercapai! Dana bisa ditarik.
          </p>
        ) : (
          <p className="mt-3 font-display text-base font-semibold text-gold-deep">
            Tinggal {rupiah(goal.targetAmount - collected)} lagi!
          </p>
        )}
      </div>

      {/* Members */}
      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-semibold text-ink">Anggota</span>
          <MemberAvatars members={members} size={32} />
        </div>
        {members.length > 0 && (
          <ul className="mt-4 flex flex-col gap-3">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3">
                <Avatar seed={m.avatarSeed} size={36} />
                <span className="flex-1 text-sm font-bold text-ink">{m.displayName}</span>
                <span className="text-sm font-semibold text-ink-soft">{rupiah(m.totalDeposited)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="mt-4">
        <ShareButton slug={slug} />
      </div>

      {goal.vaultAddr && (
        <p className="mt-4 text-center text-[11px] text-ink-soft/60">
          Celengan on-chain: <span className="font-mono">{goal.vaultAddr.slice(0, 10)}...</span>
        </p>
      )}

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto max-w-md">
          {!joined ? (
            <PillButton onClick={join} className="w-full py-4 text-base">
              Gabung & nabung
            </PillButton>
          ) : reached ? (
            <PillButton variant="light" className="w-full py-4 text-base" disabled>
              Target tercapai 🎉
            </PillButton>
          ) : (
            <PillButton onClick={() => setSheet(true)} className="w-full py-4 text-base">
              Setor sekarang
            </PillButton>
          )}
        </div>
      </div>

      {/* Deposit sheet */}
      {sheet && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/30 px-4 pb-4" onClick={() => setSheet(false)}>
          <div className="rounded-card border border-line bg-surface p-6 shadow-card-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl font-semibold text-ink">Mau setor berapa?</h2>
            <div className="mt-4 flex items-baseline gap-2 rounded-[14px] border-[1.5px] border-line bg-[#FFFCF4] px-4 py-3.5 transition focus-within:border-gold focus-within:shadow-[0_0_0_4px_rgba(244,183,64,0.12)]">
              <span className="font-display text-lg font-semibold text-ink-soft">Rp</span>
              <input
                autoFocus
                value={amount === "" ? "" : amount.toLocaleString("id-ID")}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  setAmount(v === "" ? "" : Number(v));
                }}
                inputMode="numeric"
                placeholder="100.000"
                className="w-full bg-transparent font-display text-2xl font-bold text-gold-deep outline-none placeholder:text-ink-soft/40"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[50_000, 100_000, 250_000, 500_000].map((p) => (
                <Chip key={p} active={amount === p} onClick={() => setAmount(p)}>
                  {rupiah(p)}
                </Chip>
              ))}
            </div>
            <PillButton
              onClick={deposit}
              loading={depositing}
              disabled={typeof amount !== "number" || amount < 10_000}
              className="mt-5 w-full py-4"
            >
              Setor {typeof amount === "number" ? rupiah(amount) : ""}
            </PillButton>
            <p className="mt-2 text-center text-[11px] text-ink-soft/60">
              Setor dari aset apa pun. Otomatis tergabung jadi satu celengan.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
