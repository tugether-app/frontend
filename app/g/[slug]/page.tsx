"use client";

import { useEffect, useId, useRef, useState, useCallback } from "react";
import Link from "@/components/Link";
import { useParams, useRouter } from "next/navigation";
import type { Address } from "viem";
import { Card, PillButton, Chip, CheckCircleIcon } from "@/components/ui";
import { BackButton } from "@/components/BackButton";
import { CoinJar } from "@/components/CoinJar";
import { Mascot } from "@/components/Mascot";
import { ProgressRing } from "@/components/ProgressRing";
import { MemberAvatars } from "@/components/MemberAvatars";
import { Avatar } from "@/components/Avatar";
import { Confetti } from "@/components/Confetti";
import { CountUp } from "@/components/CountUp";
import { WordMark } from "@/components/BrandIcon";
import { ShareButton } from "@/components/ShareButton";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";
import { progressPct, money } from "@/lib/format";
import { catIcon } from "@/lib/categories";
import { useAuth } from "@/lib/auth";
import { withViewTransition } from "@/lib/viewTransition";
import { useDialog } from "@/lib/useDialog";
import {
  depositToVault,
  getUsdcBalance,
  readVaultState,
  voteOnVault,
  executeRelease,
  executeRefund,
  claimRefund,
  VaultFlowError,
  type VaultState,
} from "@/lib/sdk/particle";
import { useI18n } from "@/lib/i18n/provider";
import type { Goal } from "@/lib/types";

const DEPOSITS = [1, 2, 5, 10];
const MIN_DEPOSIT = 1;

type BusyKey = "join" | "deposit" | "vote-release" | "vote-refund" | "exec-release" | "exec-refund" | "claim" | null;

export default function GoalPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();
  const { status, user: me, getProvider } = useAuth();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "notfound">("loading");
  const [busy, setBusy] = useState<BusyKey>(null);
  const [sheet, setSheet] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [balance, setBalance] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [vaultState, setVaultState] = useState<VaultState | null>(null);
  const prevStatus = useRef<string | undefined>(undefined);

  const refreshVaultState = useCallback(
    async (g: Goal) => {
      if (!g.vaultAddr) return;
      try {
        const state = await readVaultState({
          vaultAddr: g.vaultAddr as Address,
          memberAddr: me?.addr as Address | undefined,
        });
        setVaultState(state);
      } catch {
        // silent -- vault state is a best-effort read
      }
    },
    [me?.addr],
  );

  useEffect(() => {
    let on = true;
    api
      .getGoalBySlug(slug)
      .then((g) => {
        if (!on) return;
        setGoal(g);
        setPhase("ready");
        refreshVaultState(g);
      })
      .catch(() => on && setPhase("notfound"));
    return () => {
      on = false;
    };
  }, [slug, refreshVaultState]);

  // Fire confetti only on the open -> reached transition.
  useEffect(() => {
    const s = goal?.status;
    if (prevStatus.current === "open" && s === "reached") {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 4500);
      prevStatus.current = s;
      return () => clearTimeout(t);
    }
    prevStatus.current = s;
  }, [goal?.status]);

  // Fetch depositor's USDC balance when deposit sheet opens.
  useEffect(() => {
    if (!sheet || !me) return;
    let on = true;
    getUsdcBalance(me.addr as Address)
      .then((b) => on && setBalance(b))
      .catch(() => on && setBalance(null));
    return () => {
      on = false;
    };
  }, [sheet, me]);

  const closeSheet = useCallback(() => setSheet(false), []);
  const depositDialogRef = useDialog<HTMLDivElement>(sheet, closeSheet);
  const depositTitleId = useId();

  if (phase === "loading") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-6 pt-16">
        <Mascot pose="loading" size={170} float />
        <div className="mt-6 h-7 w-44 overflow-hidden rounded-full bg-gold-soft/70 shimmer" />
        <div className="mt-3 h-3.5 w-56 overflow-hidden rounded-full bg-gold-soft/60 shimmer" />
        <div className="mt-8 h-24 w-full overflow-hidden rounded-card bg-gold-soft/40 shimmer" />
      </main>
    );
  }

  if (phase === "notfound" || !goal) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <Mascot pose="sad" size={160} />
        <h1 className="font-display text-xl font-semibold text-ink">{t("goal.notFound")}</h1>
        <p className="max-w-xs text-sm font-medium text-ink-soft">{t("goal.notFoundHint")}</p>
        <Link href="/">
          <PillButton>{t("goal.backHome")}</PillButton>
        </Link>
      </main>
    );
  }

  const pct = progressPct(goal);
  const isReached = goal.status === "reached" || goal.status === "closed";
  const joined = !!me && goal.members.some((m) => m.memberAddr === me.addr);

  // Derived vault phase from on-chain state (source of truth)
  const isReleased = vaultState?.released ?? false;
  const isRefunded = vaultState?.refunded ?? false;
  const isFinalized = isReleased || isRefunded;
  const canExecRelease =
    !!vaultState && !isFinalized && vaultState.memberCount > 0 && vaultState.releaseVotes * 2 >= vaultState.memberCount;
  const canExecRefund =
    !!vaultState && !isFinalized && vaultState.memberCount > 0 && vaultState.refundVotes * 2 >= vaultState.memberCount;

  async function join() {
    if (!goal || !me) return;
    setBusy("join");
    try {
      await api.join(goal.id, { memberAddr: me.addr, displayName: me.name, avatarSeed: me.seed });
      const updated = await api.getGoalBySlug(slug);
      setGoal(updated);
      await refreshVaultState(updated);
      setSheet(true); // jump into first deposit
      toast(t("goal.joined"), "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not join", "error");
    } finally {
      setBusy(null);
    }
  }

  async function deposit() {
    if (!goal || !me || typeof amount !== "number" || amount < MIN_DEPOSIT || !goal.vaultAddr) return;
    setBusy("deposit");
    try {
      await depositToVault({ eip1193Provider: getProvider(), vaultAddr: goal.vaultAddr as Address, amount });
      const updated = await api.deposit(goal.id, { memberAddr: me.addr, amount });
      setGoal(updated);
      await refreshVaultState(updated);
      setSheet(false);
      setAmount("");
      toast(t("goal.depositOk"), "success");
    } catch (e) {
      console.error("deposit failed:", e);
      toast(e instanceof VaultFlowError ? e.message : "Could not deposit", "error");
    } finally {
      setBusy(null);
    }
  }

  async function vote(choice: "release" | "refund") {
    if (!goal?.vaultAddr || !me) return;
    const key: BusyKey = choice === "release" ? "vote-release" : "vote-refund";
    setBusy(key);
    try {
      await voteOnVault({ eip1193Provider: getProvider(), vaultAddr: goal.vaultAddr as Address, choice });
      await refreshVaultState(goal);
      toast(t("goal.vote.ok.vote"), "success");
    } catch (e) {
      console.error("vote failed:", e);
      toast(e instanceof VaultFlowError ? e.message : "Vote failed", "error");
    } finally {
      setBusy(null);
    }
  }

  async function execRelease() {
    if (!goal?.vaultAddr || !me) return;
    setBusy("exec-release");
    try {
      await executeRelease({ eip1193Provider: getProvider(), vaultAddr: goal.vaultAddr as Address });
      await refreshVaultState(goal);
      toast(t("goal.vote.ok.release"), "success");
    } catch (e) {
      console.error("release failed:", e);
      toast(e instanceof VaultFlowError ? e.message : "Release failed", "error");
    } finally {
      setBusy(null);
    }
  }

  async function execRefund() {
    if (!goal?.vaultAddr || !me) return;
    setBusy("exec-refund");
    try {
      await executeRefund({ eip1193Provider: getProvider(), vaultAddr: goal.vaultAddr as Address });
      await refreshVaultState(goal);
      toast(t("goal.vote.ok.refund"), "success");
    } catch (e) {
      console.error("refund failed:", e);
      toast(e instanceof VaultFlowError ? e.message : "Refund failed", "error");
    } finally {
      setBusy(null);
    }
  }

  async function claim() {
    if (!goal?.vaultAddr || !me) return;
    setBusy("claim");
    try {
      await claimRefund({ eip1193Provider: getProvider(), vaultAddr: goal.vaultAddr as Address });
      await refreshVaultState(goal);
      toast(t("goal.vote.ok.claim"), "success");
    } catch (e) {
      console.error("claim failed:", e);
      toast(e instanceof VaultFlowError ? e.message : "Claim failed", "error");
    } finally {
      setBusy(null);
    }
  }

  // Bottom bar action
  function renderActionBar() {
    if (status !== "authed") {
      return (
        <PillButton
          onClick={() => withViewTransition(() => router.push(`/login?next=/g/${slug}`))}
          loading={status === "loading"}
          className="w-full py-4"
        >
          {t("login.signInToJoin")}
        </PillButton>
      );
    }
    if (!joined) {
      return (
        <PillButton onClick={join} loading={busy === "join"} className="w-full py-4">
          {t("goal.join")}
        </PillButton>
      );
    }
    if (isReleased) {
      return (
        <PillButton variant="light" className="w-full py-4" disabled>
          {t("goal.vote.released")} ✓
        </PillButton>
      );
    }
    if (isRefunded) {
      const myContrib = vaultState?.myContribution ?? 0;
      if (myContrib > 0) {
        return (
          <PillButton onClick={claim} loading={busy === "claim"} className="w-full py-4">
            {t("goal.vote.claim", { v: money(myContrib) })}
          </PillButton>
        );
      }
      return (
        <PillButton variant="light" className="w-full py-4" disabled>
          {t("goal.vote.claimed")} ✓
        </PillButton>
      );
    }
    return (
      <PillButton onClick={() => setSheet(true)} className="w-full py-4">
        {t("goal.addDeposit")}
      </PillButton>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-32 pt-6">
      {celebrate && <Confetti />}

      <header className="flex items-center justify-between">
        <BackButton />
        <Link href="/" aria-label="Home">
          <WordMark size={26} />
        </Link>
        <ProgressRing pct={pct} size={44} stroke={6} />
      </header>

      {/* Hero */}
      <div className="mt-4 flex flex-col items-center text-center">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={catIcon(goal.category)} alt="" aria-hidden className="h-7 w-7 select-none" draggable={false} />
          <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">{goal.name}</h1>
        </div>
        <p className="mt-1 text-sm font-semibold text-ink-soft">{t("goal.savingTogether", { n: goal.members.length })}</p>
        <div className="breathe mt-4">
          <CoinJar pct={pct} size={250} sparkles={isReached} />
        </div>
        <div className="mt-2">
          <CountUp value={goal.collectedAmount} className="font-display text-[40px] font-bold leading-none text-gold-deep" />
          <span className="mt-1.5 block text-sm font-semibold text-ink-soft">{t("goal.ofGoal", { v: goal.targetDisplay })}</span>
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
        {isReleased ? (
          <p className="mt-3 flex items-center gap-1.5 rounded-full bg-success/15 px-4 py-1.5 text-sm font-bold text-success">
            <CheckCircleIcon /> {t("goal.vote.released")}
          </p>
        ) : isRefunded ? (
          <p className="mt-3 rounded-full bg-gold-soft px-4 py-1.5 text-sm font-bold text-gold-deep">{t("goal.vote.refunded")}</p>
        ) : isReached ? (
          <p className="mt-3 flex items-center gap-1.5 rounded-full bg-success/15 px-4 py-1.5 text-sm font-bold text-success">
            <CheckCircleIcon /> {t("goal.reached")}
          </p>
        ) : (
          <p className="mt-3 font-display text-base font-semibold text-gold-deep">
            {t("goal.toGo", { v: money(goal.targetAmount - goal.collectedAmount) })}
          </p>
        )}
      </div>

      {/* Members */}
      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-semibold text-ink">{t("goal.members")}</span>
          {goal.members.length > 0 && <MemberAvatars members={goal.members} size={32} />}
        </div>
        {goal.members.length === 0 ? (
          <div className="mt-2 flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/state/empty-members.png" alt="" aria-hidden className="h-28 w-auto select-none" draggable={false} />
            <p className="text-sm font-medium text-ink-soft">{t("goal.noMembers")}</p>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {goal.members.map((m) => {
              const isMe = !!me && m.memberAddr === me.addr;
              const memberVote = isMe ? vaultState?.myVote : undefined;
              return (
                <li
                  key={m.id}
                  className={`flex items-center gap-3 rounded-2xl ${isMe ? "-mx-2 bg-gold-soft/60 px-2 py-1.5" : ""}`}
                >
                  <Avatar seed={m.avatarSeed} size={36} />
                  <span className="flex-1 text-sm font-bold text-ink">
                    {m.displayName}
                    {isMe && <span className="ml-1.5 text-[11px] font-bold text-gold-deep">{t("goal.you")}</span>}
                  </span>
                  {memberVote !== undefined && memberVote !== 0 && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        memberVote === 1 ? "bg-success/15 text-success" : "bg-gold-soft text-gold-deep"
                      }`}
                    >
                      {memberVote === 1 ? t("goal.vote.badgeRelease") : t("goal.vote.badgeRefund")}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-ink-soft">{money(m.totalDeposited)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Voting card -- shown to members while vault is active */}
      {joined && goal.vaultAddr && (
        <Card className="mt-4 p-5">
          <h2 className="font-display text-base font-semibold text-ink">{t("goal.vote.title")}</h2>

          {isReleased ? (
            <p className="mt-3 flex items-center gap-1.5 rounded-2xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">
              <CheckCircleIcon /> {t("goal.vote.released")}
            </p>
          ) : isRefunded ? (
            <p className="mt-3 rounded-2xl bg-gold-soft px-4 py-3 text-sm font-semibold text-gold-deep">
              {t("goal.vote.refunded")}. {t("goal.vote.claim", { v: money(vaultState?.myContribution ?? 0) })}.
            </p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {/* Release option */}
                <VoteOption
                  title={t("goal.vote.release")}
                  desc={t("goal.vote.releaseDesc")}
                  votes={vaultState?.releaseVotes ?? 0}
                  total={vaultState?.memberCount ?? goal.members.length}
                  active={vaultState?.myVote === 1}
                  tally={t("goal.vote.tally")}
                  myVoteLabel={t("goal.vote.myVote")}
                  voteLabel={t("goal.vote.doVote")}
                  onVote={() => vote("release")}
                  loading={busy === "vote-release"}
                  disabled={!!busy || isFinalized}
                  color="success"
                />
                {/* Refund option */}
                <VoteOption
                  title={t("goal.vote.refund")}
                  desc={t("goal.vote.refundDesc")}
                  votes={vaultState?.refundVotes ?? 0}
                  total={vaultState?.memberCount ?? goal.members.length}
                  active={vaultState?.myVote === 2}
                  tally={t("goal.vote.tally")}
                  myVoteLabel={t("goal.vote.myVote")}
                  voteLabel={t("goal.vote.doVote")}
                  onVote={() => vote("refund")}
                  loading={busy === "vote-refund"}
                  disabled={!!busy || isFinalized}
                  color="gold"
                />
              </div>

              {/* Execute buttons -- permissionless once majority reached */}
              {canExecRelease && (
                <PillButton
                  onClick={execRelease}
                  loading={busy === "exec-release"}
                  disabled={!!busy}
                  className="mt-4 w-full py-3"
                >
                  {t("goal.vote.execute.release")}
                </PillButton>
              )}
              {canExecRefund && (
                <PillButton
                  onClick={execRefund}
                  loading={busy === "exec-refund"}
                  disabled={!!busy}
                  variant="light"
                  className="mt-4 w-full py-3"
                >
                  {t("goal.vote.execute.refund")}
                </PillButton>
              )}
              {(canExecRelease || canExecRefund) && (
                <p className="mt-2 text-center text-[11px] font-semibold text-gold-deep">{t("goal.vote.majority")}</p>
              )}
            </>
          )}
        </Card>
      )}

      <div className="mt-4">
        <ShareButton slug={slug} />
      </div>

      {goal.vaultAddr && (
        <p className="mt-4 text-center text-[11px] font-medium text-ink-soft/70">
          {t("goal.onchain")} <span className="font-mono">{goal.vaultAddr.slice(0, 10)}...</span>
        </p>
      )}

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 px-6 pt-4 pb-[max(env(safe-area-inset-bottom),16px)] backdrop-blur">
        <div className="mx-auto max-w-md">{renderActionBar()}</div>
      </div>

      {/* Deposit sheet */}
      {sheet && (
        <div
          className="backdrop-in fixed inset-0 z-40 flex items-end justify-center bg-ink/30 px-4 pb-4"
          onClick={closeSheet}
        >
          <div
            ref={depositDialogRef}
            className="sheet-up w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-card-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby={depositTitleId}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={depositTitleId} className="font-display text-xl font-semibold text-ink">{t("goal.howMuch")}</h2>
            {balance !== null && (
              <p className="mt-1 text-xs font-semibold text-ink-soft">{t("goal.balance", { v: money(balance) })}</p>
            )}
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
              {t("goal.deposit")} {typeof amount === "number" ? money(amount) : ""}
            </PillButton>
            <p className="mt-2 text-center text-[11px] font-medium text-ink-soft/70">{t("goal.depositNote")}</p>
          </div>
        </div>
      )}
    </main>
  );
}

// ── VoteOption sub-component ────────────────────────────────────────────────

interface VoteOptionProps {
  title: string;
  desc: string;
  votes: number;
  total: number;
  active: boolean;
  tally: string;
  myVoteLabel: string;
  voteLabel: string;
  onVote: () => void;
  loading: boolean;
  disabled: boolean;
  color: "success" | "gold";
}

function VoteOption({ title, desc, votes, total, active, tally, myVoteLabel, voteLabel, onVote, loading, disabled, color }: VoteOptionProps) {
  const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
  const majority = total > 0 && votes * 2 >= total;

  const ring = color === "success" ? "#3FB984" : "#E09A1E";
  const bg = active
    ? color === "success"
      ? "bg-success/10 border-success/40"
      : "bg-gold-soft border-gold/40"
    : "bg-surface border-line";
  const textAccent = color === "success" ? "text-success" : "text-gold-deep";
  const tallyStr = tally.replace("{v}", String(votes)).replace("{n}", String(total));

  return (
    <div className={`flex flex-col gap-2 rounded-2xl border p-3.5 transition ${bg}`}>
      <span className="text-sm font-bold text-ink leading-tight">{title}</span>
      <span className="text-[11px] font-medium text-ink-soft leading-tight">{desc}</span>

      {/* Mini progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, background: ring }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold ${majority ? textAccent : "text-ink-soft"}`}>{tallyStr}</span>
        {active && (
          <span className={`flex items-center gap-1 text-[10px] font-bold ${textAccent}`}>
            <CheckCircleIcon size={11} /> {myVoteLabel}
          </span>
        )}
      </div>

      <button
        onClick={onVote}
        disabled={disabled || loading}
        className={`mt-1 rounded-xl px-3 py-2 text-xs font-bold transition active:scale-95 disabled:opacity-40 ${
          active
            ? color === "success"
              ? "bg-success text-white"
              : "bg-gold text-ink"
            : color === "success"
              ? "bg-success/15 text-success hover:bg-success/25"
              : "bg-gold-soft text-gold-deep hover:bg-gold/30"
        }`}
      >
        {loading ? "..." : voteLabel}
      </button>
    </div>
  );
}
