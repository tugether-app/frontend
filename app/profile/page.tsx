"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "@/components/Link";
import { isAddress, type Address } from "viem";
import { Card, PillButton } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { Avatar } from "@/components/Avatar";
import { AvatarPicker } from "@/components/AvatarPicker";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AchievementDialog } from "@/components/AchievementDialog";
import { ListRow, ListRowButton } from "@/components/ListRow";
import { BottomNav } from "@/components/BottomNav";
import { RequireAuth } from "@/components/RequireAuth";
import { useToast } from "@/components/Toast";
import { useI18n } from "@/lib/i18n/provider";
import { useAuth } from "@/lib/auth";
import { useDialog } from "@/lib/useDialog";
import { useEnter } from "@/lib/useEnter";
import { useCachedFetch } from "@/lib/useCachedFetch";
import { api } from "@/lib/client";
import { money } from "@/lib/format";
import { sendFunds, getUsdcBalance, getUnifiedBalance, VaultFlowError, type UnifiedBalance } from "@/lib/sdk/particle";
import { computeUnlockedBadges, type BadgeId } from "@/lib/achievements";

const BADGES: BadgeId[] = [
  "badge-first-goal",
  "badge-first-deposit",
  "badge-first-member",
  "badge-goal-completed",
  "badge-super-saver",
];

export default function ProfilePage() {
  return (
    <RequireAuth>
      <Profile />
    </RequireAuth>
  );
}

function GoalsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 12h4l2-5 4 10 2-5h4" stroke="#E09A1E" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ActivityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 7v5l3 3" stroke="#E09A1E" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="12" cy="12" r="8.2" stroke="#E09A1E" strokeWidth="1.9" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3.2" stroke="#E09A1E" strokeWidth="1.9" />
      <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" stroke="#E09A1E" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" stroke="#2B2622" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function WithdrawIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v11M12 15l-4-4M12 15l4-4" stroke="#E09A1E" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19h14" stroke="#E09A1E" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}
function SignOutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H6a2 2 0 01-2-2V5a2 2 0 012-2h3" stroke="#2B2622" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5M21 12H9" stroke="#2B2622" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Profile() {
  const { t } = useI18n();
  const toast = useToast();
  const entered = useEnter();
  const { user, logout, getProvider } = useAuth();
  const goals = useCachedFetch("goals:all", () => api.listGoals());
  const unlockedBadges = computeUnlockedBadges(goals ?? [], user?.addr);
  const [selectedBadge, setSelectedBadge] = useState<BadgeId | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const [sheet, setSheet] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [dest, setDest] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [sending, setSending] = useState(false);

  const [unified, setUnified] = useState<UnifiedBalance | null>(null);
  const [balLoading, setBalLoading] = useState(false);

  // Load the unified cross-chain balance on mount (and on manual refresh).
  const loadBalance = useCallback(() => {
    if (!user) return;
    setBalLoading(true);
    getUnifiedBalance(user.addr as Address)
      .then(setUnified)
      .catch(() => setUnified(null))
      .finally(() => setBalLoading(false));
  }, [user]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  // Fetch the user's own USDC balance when the withdraw sheet opens.
  useEffect(() => {
    if (!sheet || !user) return;
    let on = true;
    getUsdcBalance(user.addr as Address)
      .then((b) => on && setBalance(b))
      .catch(() => on && setBalance(null));
    return () => {
      on = false;
    };
  }, [sheet, user]);

  const closeWithdrawSheet = useCallback(() => setSheet(false), []);
  const withdrawDialogRef = useDialog<HTMLDivElement>(sheet, closeWithdrawSheet);
  const withdrawTitleId = useId();

  const destOk = isAddress(dest.trim());
  const amountOk = typeof amount === "number" && amount > 0 && (balance === null || amount <= balance);
  const withdrawOk = destOk && amountOk && !sending;

  async function confirmedSignOut() {
    setSigningOut(true);
    await logout();
    toast(t("profile.signedOut"), "success");
    // RequireAuth's own effect redirects to /welcome once `status` flips to
    // "anon" (see components/RequireAuth.tsx) -- navigating here too would
    // race two withViewTransition calls for the same route change.
  }

  const withdrawInFlight = useRef(false);

  async function withdraw() {
    if (!user || !withdrawOk || typeof amount !== "number" || withdrawInFlight.current) return;
    withdrawInFlight.current = true;
    setSending(true);
    try {
      await sendFunds({ eip1193Provider: getProvider(), to: dest.trim() as Address, amount });
      setSheet(false);
      setDest("");
      setAmount("");
      toast(t("profile.withdraw.ok"), "success");
    } catch (e) {
      console.error("withdraw failed:", e);
      toast(e instanceof VaultFlowError ? e.message : t("profile.withdraw.err"), "error");
    } finally {
      withdrawInFlight.current = false;
      setSending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href="/">
          <WordMark />
        </Link>
        <button
          type="button"
          onClick={() => setConfirmSignOut(true)}
          aria-label={t("profile.signOut")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface ring-1 ring-line transition hover:ring-error active:scale-95"
        >
          <SignOutIcon />
        </button>
      </header>

      <h1 className="mt-8 font-display text-[28px] font-semibold tracking-tight text-ink">{t("profile.title")}</h1>

      <div className={`stagger-enter ${entered ? "" : "is-out"}`}>
        <div style={{ "--i": 0 } as React.CSSProperties}>
        <Card className="mt-6 flex items-center gap-4 p-5">
          <div className="relative shrink-0">
            <Avatar seed={user?.seed ?? "you"} size={56} />
            <button
              type="button"
              onClick={() => setAvatarOpen(true)}
              aria-label={t("profile.chooseAvatar")}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold ring-2 ring-surface transition active:scale-90"
            >
              <EditIcon />
            </button>
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-ink">{user?.name ?? t("profile.you")}</p>
            <p className="truncate text-sm font-medium text-ink-soft">{user?.email ?? t("profile.signedIn")}</p>
            {user?.addr && <p className="mt-1 select-all break-all font-mono text-[11px] text-ink-soft/60">{user.addr}</p>}
          </div>
        </Card>
        </div>

        {/* Unified cross-chain balance */}
        <div style={{ "--i": 1 } as React.CSSProperties}>
        <Card className="mt-4 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-ink-soft">{t("profile.balance.title")}</span>
            <button
              type="button"
              onClick={loadBalance}
              disabled={balLoading}
              aria-label={t("profile.balance.refresh")}
              className="text-gold-deep transition active:scale-90 disabled:opacity-40"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={balLoading ? "animate-spin" : ""}>
                <path d="M20 11a8 8 0 10-.5 4M20 5v6h-6" stroke="#E09A1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {balLoading && !unified ? (
            <div className="mt-2 h-9 w-32 overflow-hidden rounded-full bg-gold-soft/60 shimmer" />
          ) : (
            <p className="mt-1 font-display text-[32px] font-bold leading-none text-gold-deep">
              {money(unified?.totalUsd ?? 0)}
            </p>
          )}
          <p className="mt-1 text-[11px] font-semibold text-ink-soft/70">{t("profile.balance.across")}</p>

          {unified && unified.assets.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {unified.assets.map((a, i) => (
                <span
                  key={`${a.symbol}-${i}`}
                  className="rounded-full bg-gold-soft/70 px-3 py-1 text-xs font-bold text-gold-deep"
                >
                  {a.amount.toLocaleString("en-US", { maximumFractionDigits: 4 })} {a.symbol}
                  <span className="ml-1 font-semibold text-ink-soft/70">{money(a.amountUsd)}</span>
                </span>
              ))}
            </div>
          )}
          {unified && unified.assets.length === 0 && !balLoading && (
            <p className="mt-2 text-xs font-medium text-ink-soft">{t("profile.balance.empty")}</p>
          )}
        </Card>
        </div>

        <div style={{ "--i": 2 } as React.CSSProperties} className="mt-6 flex flex-col gap-3">
          <ListRow href="/goals" icon={<GoalsIcon />} label={t("profile.myGoals")} />
          <ListRow href="/activity" icon={<ActivityIcon />} label={t("profile.activity")} />
          <ListRowButton onClick={() => setSheet(true)} icon={<WithdrawIcon />} label={t("profile.withdraw.title")} />
          <ListRow href="/settings" icon={<SettingsIcon />} label={t("profile.settings")} />
        </div>

        <div style={{ "--i": 3 } as React.CSSProperties}>
          <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-ink-soft">{t("profile.achievements")}</h2>
          <Card className="mt-3 p-4">
            <div className="flex items-start justify-between gap-2">
              {BADGES.map((b) => {
                const unlocked = unlockedBadges.has(b);
                return (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setSelectedBadge(b)}
                    className="flex flex-col items-center gap-1 text-center transition active:scale-95"
                  >
                    <img
                      src={`/art/badge/${b}.png`}
                      alt=""
                      aria-hidden
                      className={`h-14 w-14 select-none ${unlocked ? "" : "opacity-30 grayscale"}`}
                      draggable={false}
                    />
                    <span className="text-[10px] font-bold leading-tight text-ink-soft">{t(`badge.${b}`)}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <p className="mt-8 text-center text-xs font-semibold text-ink-soft/70">{t("profile.tagline")}</p>

      {sheet && (
        <div
          className="backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-6"
          onClick={closeWithdrawSheet}
        >
          <div
            ref={withdrawDialogRef}
            className="rise-in max-h-[88vh] w-full max-w-md overflow-y-auto rounded-card border border-line bg-surface p-6 shadow-card-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby={withdrawTitleId}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={withdrawTitleId} className="font-display text-xl font-semibold text-ink">{t("profile.withdraw.title")}</h2>
            <p className="mt-1 text-xs font-semibold text-ink-soft">
              {balance !== null ? t("profile.withdraw.balance", { v: money(balance) }) : t("profile.withdraw.loading")}
            </p>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-bold text-ink-soft">{t("profile.withdraw.toLabel")}</span>
              <input
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                placeholder="0x..."
                spellCheck={false}
                className="w-full rounded-[14px] border-[1.5px] border-line bg-[#FFFCF4] px-4 py-3 font-mono text-sm text-ink outline-none transition focus:border-gold focus:shadow-[0_0_0_4px_rgba(244,183,64,0.12)] placeholder:text-ink-soft/40"
              />
              {dest.trim() !== "" && !destOk && (
                <p className="mt-1.5 text-xs font-semibold text-blush">{t("profile.withdraw.badAddr")}</p>
              )}
            </label>

            <div className="mt-4 flex items-baseline gap-2 rounded-[14px] border-[1.5px] border-line bg-[#FFFCF4] px-4 py-3.5 transition focus-within:border-gold focus-within:shadow-[0_0_0_4px_rgba(244,183,64,0.12)]">
              <span className="font-display text-lg font-semibold text-ink-soft">$</span>
              <input
                value={amount === "" ? "" : amount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, "");
                  setAmount(v === "" ? "" : Number(v));
                }}
                inputMode="decimal"
                placeholder="0"
                className="w-full bg-transparent font-display text-2xl font-bold text-gold-deep outline-none placeholder:text-ink-soft/40"
              />
              {balance !== null && balance > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(balance)}
                  className="shrink-0 rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-gold-deep transition active:scale-95"
                >
                  {t("profile.withdraw.max")}
                </button>
              )}
            </div>

            <PillButton onClick={withdraw} loading={sending} disabled={!withdrawOk} className="mt-5 w-full py-4">
              {t("profile.withdraw.confirm")}
            </PillButton>
            <p className="mt-2 text-center text-[11px] font-medium text-ink-soft/70">{t("profile.withdraw.note")}</p>
          </div>
        </div>
      )}

      <AvatarPicker open={avatarOpen} onClose={() => setAvatarOpen(false)} />

      <ConfirmDialog
        open={confirmSignOut}
        title={t("profile.signOutTitle")}
        description={t("profile.signOutDesc")}
        confirmLabel={t("profile.signOut")}
        cancelLabel={t("common.cancel")}
        destructive
        loading={signingOut}
        onConfirm={confirmedSignOut}
        onClose={() => setConfirmSignOut(false)}
      />

      <AchievementDialog
        badge={selectedBadge}
        unlocked={selectedBadge ? unlockedBadges.has(selectedBadge) : false}
        onClose={() => setSelectedBadge(null)}
      />

      <BottomNav />
    </main>
  );
}
