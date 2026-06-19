"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, PillButton, Chip } from "@/components/ui";
import { BackButton } from "@/components/BackButton";
import { CoinJar } from "@/components/CoinJar";
import { ProgressRing } from "@/components/ProgressRing";
import { MemberAvatars } from "@/components/MemberAvatars";
import { Avatar } from "@/components/Avatar";
import { Confetti } from "@/components/Confetti";
import { ShareButton } from "@/components/ShareButton";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";
import { progressPct, money } from "@/lib/format";
import { getIdentity, type Identity } from "@/lib/identity";
import type { Goal } from "@/lib/types";

const DEPOSITS = [25, 50, 100, 250];
const MIN_DEPOSIT = 5;

export default function GoalPage() {
  const { slug } = useParams<{ slug: string }>();
  const toast = useToast();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "notfound">("loading");
  const [me, setMe] = useState<Identity | null>(null);
  const [busy, setBusy] = useState<"join" | "deposit" | "withdraw" | null>(null);
  const [sheet, setSheet] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [celebrate, setCelebrate] = useState(false);
  const prevStatus = useRef<string | undefined>(undefined);

  useEffect(() => setMe(getIdentity()), []);

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

  // Fire confetti only on the open -> reached transition (not on a goal that
  // was already reached when the page loaded).
  useEffect(() => {
    const status = goal?.status;
    if (prevStatus.current === "open" && status === "reached") {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 4500);
      prevStatus.current = status;
      return () => clearTimeout(t);
    }
    prevStatus.current = status;
  }, [goal?.status]);

  if (phase === "loading") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-6 pt-16">
        <div className="float-slow">
          <CoinJar pct={35} size={200} />
        </div>
        <div className="mt-6 h-7 w-44 overflow-hidden rounded-full bg-gold-soft/70 shimmer" />
        <div className="mt-3 h-3.5 w-56 overflow-hidden rounded-full bg-gold-soft/60 shimmer" />
        <div className="mt-8 h-24 w-full overflow-hidden rounded-card bg-gold-soft/40 shimmer" />
      </main>
    );
  }

  if (phase === "notfound" || !goal) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <CoinJar pct={0} size={150} face="neutral" />
        <h1 className="font-display text-xl font-semibold text-ink">Goal not found</h1>
        <p className="max-w-xs text-sm font-medium text-ink-soft">The link may be wrong or the goal was closed.</p>
        <Link href="/">
          <PillButton>Back to home</PillButton>
        </Link>
      </main>
    );
  }

  const pct = progressPct(goal);
  const isReached = goal.status === "reached" || goal.status === "closed";
  const isClosed = goal.status === "closed";
  const joined = !!me && goal.members.some((m) => m.memberAddr === me.addr);
  const isCreator = !!me && goal.creatorAddr === me.addr;

  async function join() {
    if (!goal || !me) return;
    setBusy("join");
    try {
      await api.join(goal.id, { memberAddr: me.addr, displayName: me.name, avatarSeed: me.seed });
      setGoal(await api.getGoalBySlug(slug));
      setSheet(true); // jump straight into the first deposit
      toast("You're in!", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not join", "error");
    } finally {
      setBusy(null);
    }
  }

  async function deposit() {
    if (!goal || !me || typeof amount !== "number" || amount < MIN_DEPOSIT) return;
    setBusy("deposit");
    try {
      const updated = await api.deposit(goal.id, { memberAddr: me.addr, amount });
      setGoal(updated);
      setSheet(false);
      setAmount("");
      toast("Deposit received!", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not deposit", "error");
    } finally {
      setBusy(null);
    }
  }

  async function withdraw() {
    if (!goal || !me) return;
    setBusy("withdraw");
    try {
      const updated = await api.withdraw(goal.id, { toAddr: me.addr });
      setGoal(updated);
      toast("Funds withdrawn", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not withdraw", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-32 pt-6">
      {celebrate && <Confetti />}

      <header className="flex items-center justify-between">
        <BackButton />
        <ProgressRing pct={pct} size={44} stroke={6} />
      </header>

      {/* Hero */}
      <div className="mt-4 flex flex-col items-center text-center">
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">{goal.name}</h1>
        <p className="mt-1 text-sm font-semibold text-ink-soft">{goal.members.length} saving together</p>
        <div className="mt-4">
          <CoinJar pct={pct} size={250} sparkles={isReached} />
        </div>
        <div className="mt-2">
          <span className="font-display text-[40px] font-bold leading-none text-gold-deep">{money(goal.collectedAmount)}</span>
          <span className="mt-1.5 block text-sm font-semibold text-ink-soft">of {goal.targetDisplay} goal</span>
        </div>
        <div className="mt-4 h-3.5 w-full max-w-xs overflow-hidden rounded-full bg-gold-soft">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: `${pct}%`,
              background: isReached ? "linear-gradient(90deg,#5fd29e,#3FB984)" : "linear-gradient(90deg,#FBCB57,#F4B740)",
            }}
          />
        </div>
        {isClosed ? (
          <p className="mt-3 rounded-full bg-success/15 px-4 py-1.5 text-sm font-bold text-success">
            ✅ Funds withdrawn. Goal complete.
          </p>
        ) : isReached ? (
          <p className="mt-3 rounded-full bg-success/15 px-4 py-1.5 text-sm font-bold text-success">
            🎉 Target reached! Funds can be withdrawn.
          </p>
        ) : (
          <p className="mt-3 font-display text-base font-semibold text-gold-deep">
            {money(goal.targetAmount - goal.collectedAmount)} to go!
          </p>
        )}
      </div>

      {/* Members */}
      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-semibold text-ink">Members</span>
          {goal.members.length > 0 && <MemberAvatars members={goal.members} size={32} />}
        </div>
        {goal.members.length === 0 ? (
          <p className="mt-3 text-sm font-medium text-ink-soft">No one has joined yet. Invite your friends!</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {goal.members.map((m) => {
              const isMe = !!me && m.memberAddr === me.addr;
              return (
                <li
                  key={m.id}
                  className={`flex items-center gap-3 rounded-2xl ${isMe ? "-mx-2 bg-gold-soft/60 px-2 py-1.5" : ""}`}
                >
                  <Avatar seed={m.avatarSeed} size={36} />
                  <span className="flex-1 text-sm font-bold text-ink">
                    {m.displayName}
                    {isMe && <span className="ml-1.5 text-[11px] font-bold text-gold-deep">(you)</span>}
                  </span>
                  <span className="text-sm font-semibold text-ink-soft">{money(m.totalDeposited)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <div className="mt-4">
        <ShareButton slug={slug} />
      </div>

      {goal.vaultAddr && (
        <p className="mt-4 text-center text-[11px] font-medium text-ink-soft/70">
          On-chain jar: <span className="font-mono">{goal.vaultAddr.slice(0, 10)}...</span>
        </p>
      )}

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 px-6 pt-4 pb-[max(env(safe-area-inset-bottom),16px)] backdrop-blur">
        <div className="mx-auto max-w-md">
          {isClosed ? (
            <PillButton variant="light" className="w-full py-4" disabled>
              Funds withdrawn 🎉
            </PillButton>
          ) : !joined ? (
            <PillButton onClick={join} loading={busy === "join"} className="w-full py-4">
              Join &amp; save
            </PillButton>
          ) : goal.status === "reached" ? (
            <PillButton onClick={withdraw} loading={busy === "withdraw"} className="w-full py-4">
              Withdraw funds
            </PillButton>
          ) : (
            <PillButton onClick={() => setSheet(true)} className="w-full py-4">
              Add deposit
            </PillButton>
          )}
        </div>
      </div>

      {/* Deposit sheet */}
      {sheet && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-ink/30 px-4 pb-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add deposit"
          onClick={() => setSheet(false)}
        >
          <div className="w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-card-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl font-semibold text-ink">How much?</h2>
            <div className="mt-4 flex items-baseline gap-2 rounded-[14px] border-[1.5px] border-line bg-[#FFFCF4] px-4 py-3.5 transition focus-within:border-gold focus-within:shadow-[0_0_0_4px_rgba(244,183,64,0.12)]">
              <span className="font-display text-lg font-semibold text-ink-soft">$</span>
              <input
                autoFocus
                value={amount === "" ? "" : amount.toLocaleString("en-US")}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  setAmount(v === "" ? "" : Number(v));
                }}
                inputMode="numeric"
                placeholder="100"
                className="w-full bg-transparent font-display text-2xl font-bold text-gold-deep outline-none placeholder:text-ink-soft/40"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {DEPOSITS.map((p) => (
                <Chip key={p} active={amount === p} onClick={() => setAmount(p)}>
                  {money(p)}
                </Chip>
              ))}
            </div>
            <PillButton
              onClick={deposit}
              loading={busy === "deposit"}
              disabled={typeof amount !== "number" || amount < MIN_DEPOSIT}
              className="mt-5 w-full py-4"
            >
              Deposit {typeof amount === "number" ? money(amount) : ""}
            </PillButton>
            <p className="mt-2 text-center text-[11px] font-medium text-ink-soft/70">
              Chip in from any asset. It all merges into one jar.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
