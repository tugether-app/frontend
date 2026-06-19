"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, PillButton, Chip } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { CoinJar } from "@/components/CoinJar";
import { ProgressRing } from "@/components/ProgressRing";
import { MemberAvatars } from "@/components/MemberAvatars";
import { Avatar } from "@/components/Avatar";
import { Confetti } from "@/components/Confetti";
import { ShareButton } from "@/components/ShareButton";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";
import { progressPct, rupiah } from "@/lib/format";
import type { Goal } from "@/lib/types";

// Goal detail: coin jar hero + join + deposit, backed by /api.
// A per-session fake member address stands in for the Magic login (BE stub).

export default function GoalPage() {
  const { slug } = useParams<{ slug: string }>();
  const toast = useToast();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "notfound">("loading");
  const [depositing, setDepositing] = useState(false);
  const [joining, setJoining] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [amount, setAmount] = useState<number | "">("");

  // Stable demo identity for this browser session.
  const myAddr = useMemo(
    () => "0x" + Math.floor(Math.random() * 1e16).toString(16).padStart(40, "0").slice(0, 40),
    [],
  );

  useEffect(() => {
    let on = true;
    api
      .getGoalBySlug(slug)
      .then((g) => on && (setGoal(g), setPhase("ready")))
      .catch(() => on && setPhase("notfound"));
    return () => {
      on = false;
    };
  }, [slug]);

  if (phase === "loading") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <div className="float-slow">
          <CoinJar pct={40} size={140} />
        </div>
        <p className="text-sm font-bold text-ink-soft">Sebentar ya...</p>
      </main>
    );
  }

  if (phase === "notfound" || !goal) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <CoinJar pct={0} size={150} face="neutral" />
        <h1 className="font-display text-xl font-semibold text-ink">Tujuan tidak ketemu</h1>
        <p className="max-w-xs text-sm font-medium text-ink-soft">Mungkin link-nya salah atau tujuannya sudah ditutup.</p>
        <Link href="/">
          <PillButton>Kembali ke beranda</PillButton>
        </Link>
      </main>
    );
  }

  const pct = progressPct(goal);
  const reached = goal.status !== "open";
  const joined = goal.members.some((m) => m.memberAddr === myAddr);

  async function join() {
    if (!goal) return;
    setJoining(true);
    try {
      await api.join(goal.id, { memberAddr: myAddr, displayName: "Kamu", avatarSeed: "you" });
      setGoal(await api.getGoalBySlug(slug));
      toast("Berhasil gabung!", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Gagal gabung", "error");
    } finally {
      setJoining(false);
    }
  }

  async function deposit() {
    if (!goal || typeof amount !== "number" || amount < 10_000) return;
    setDepositing(true);
    try {
      const updated = await api.deposit(goal.id, { memberAddr: myAddr, amount });
      setGoal(updated);
      setSheet(false);
      setAmount("");
      toast("Setoran masuk!", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Gagal setor", "error");
    } finally {
      setDepositing(false);
    }
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
        <p className="mt-1 text-sm font-semibold text-ink-soft">{goal.members.length} orang nabung bareng</p>
        <div className="mt-4">
          <CoinJar pct={pct} size={250} sparkles={reached} />
        </div>
        <div className="mt-2">
          <span className="font-display text-[40px] font-bold leading-none text-gold-deep">{rupiah(goal.collectedAmount)}</span>
          <span className="mt-1.5 block text-sm font-semibold text-ink-soft">dari target {goal.targetDisplay}</span>
        </div>
        {reached ? (
          <p className="mt-3 rounded-full bg-success/15 px-4 py-1.5 text-sm font-bold text-success">
            🎉 Target tercapai! Dana bisa ditarik.
          </p>
        ) : (
          <p className="mt-3 font-display text-base font-semibold text-gold-deep">
            Tinggal {rupiah(goal.targetAmount - goal.collectedAmount)} lagi!
          </p>
        )}
      </div>

      {/* Members */}
      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-semibold text-ink">Anggota</span>
          <MemberAvatars members={goal.members} size={32} />
        </div>
        {goal.members.length > 0 && (
          <ul className="mt-4 flex flex-col gap-3">
            {goal.members.map((m) => (
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
        <p className="mt-4 text-center text-[11px] font-medium text-ink-soft/60">
          Celengan on-chain: <span className="font-mono">{goal.vaultAddr.slice(0, 10)}...</span>
        </p>
      )}

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto max-w-md">
          {!joined ? (
            <PillButton onClick={join} loading={joining} className="w-full py-4">
              Gabung &amp; nabung
            </PillButton>
          ) : reached ? (
            <PillButton variant="light" className="w-full py-4" disabled>
              Target tercapai 🎉
            </PillButton>
          ) : (
            <PillButton onClick={() => setSheet(true)} className="w-full py-4">
              Setor sekarang
            </PillButton>
          )}
        </div>
      </div>

      {/* Deposit sheet */}
      {sheet && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/30 px-4 pb-4" onClick={() => setSheet(false)}>
          <div className="w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-card-lg" onClick={(e) => e.stopPropagation()}>
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
            <p className="mt-2 text-center text-[11px] font-medium text-ink-soft/60">
              Setor dari aset apa pun. Otomatis tergabung jadi satu celengan.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
