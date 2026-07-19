"use client";

import { useRef, useState } from "react";
import Link from "@/components/Link";
import { useRouter } from "next/navigation";
/* eslint-disable @next/next/no-img-element */
import type { Address } from "viem";
import { PillButton, Card, Chip } from "@/components/ui";
import { BackButton } from "@/components/BackButton";
import { Mascot } from "@/components/Mascot";
import { ShareButton } from "@/components/ShareButton";
import { StepDots } from "@/components/Stepper";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";
import { money } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { withViewTransition } from "@/lib/viewTransition";
import { deployGoalVault, VaultFlowError } from "@/lib/sdk/particle";
import { useI18n } from "@/lib/i18n/provider";
import { CATEGORIES, catIcon } from "@/lib/categories";

// Create flow. Name + target -> deploy a real GoalVault from the creator's own
// smart account (via the GoalVaultFactory), then POST /api/goals to save the
// metadata, auto-join the creator, and show the share step with the invite slug.

const PRESETS = [2, 5, 10, 20];
const MIN_TARGET = 2;
const MIN_NAME = 3;

export default function CreatePage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("custom");
  const [target, setTarget] = useState<number | "">("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const toast = useToast();
  const { t } = useI18n();
  const router = useRouter();
  const { status, user, getProvider } = useAuth();

  const nameOk = name.trim().length >= MIN_NAME;
  const targetOk = typeof target === "number" && target >= MIN_TARGET;
  const valid = nameOk && targetOk;

  // If deployGoalVault succeeds but the createGoal call after it fails, a
  // real GoalVault contract already exists on-chain. Cache it here so a
  // retry with the same inputs reuses that vault instead of deploying (and
  // paying gas for) a second one and orphaning the first.
  const deployedVault = useRef<{ vaultAddr: string; forTarget: number; forCreator: string } | null>(null);

  async function submit() {
    if (status === "anon") {
      withViewTransition(() => router.push("/login?next=/create"));
      return;
    }
    setTouched(true);
    if (!valid || typeof target !== "number" || !user) return;
    setLoading(true);
    try {
      const cached = deployedVault.current;
      let vaultAddr: string;
      if (cached && cached.forTarget === target && cached.forCreator === user.addr) {
        vaultAddr = cached.vaultAddr;
      } else {
        const deployed = await deployGoalVault({
          eip1193Provider: getProvider(),
          creator: user.addr as Address,
          targetAmount: target,
        });
        vaultAddr = deployed.vaultAddr;
        deployedVault.current = { vaultAddr, forTarget: target, forCreator: user.addr };
      }
      const goal = await api.createGoal({
        name: name.trim(),
        targetAmount: target,
        category,
        creatorAddr: user.addr,
        vaultAddr,
      });
      deployedVault.current = null; // createGoal succeeded -- nothing left to reuse
      // Auto-join the creator so they're a member of their own goal. If this
      // fails, the goal still exists and was created successfully -- don't
      // silently pretend it worked, but don't block the success screen
      // either, since retrying here would try to create a whole new goal.
      try {
        await api.join(goal.id, { memberAddr: user.addr, displayName: user.name, avatarSeed: user.seed });
      } catch (e) {
        console.error("auto-join after create failed:", e);
        toast(t("create.autoJoinErr"), "error");
      }
      setCreatedSlug(goal.joinSlug);
    } catch (e) {
      console.error("createGoal failed:", e);
      toast(e instanceof VaultFlowError ? e.message : t("create.err"), "error");
    } finally {
      setLoading(false);
    }
  }

  if (createdSlug) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-6">
        <header className="flex items-center gap-3">
          <BackButton />
          <span className="font-display text-lg font-semibold text-ink">{t("create.allSet")}</span>
        </header>
        <div className="rise-in mt-8 flex flex-1 flex-col items-center text-center">
          <Mascot pose="celebrate" size={180} />
          <h1 className="mt-4 font-display text-[26px] font-semibold text-ink">{t("create.created")}</h1>
          <p className="mt-2 max-w-xs font-medium text-ink-soft">{t("create.createdHint")}</p>
          <Card className="mt-6 w-full p-5 text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{name}</p>
            <p className="mt-1 font-display text-2xl font-bold text-gold-deep">
              {typeof target === "number" ? money(target) : ""}
            </p>
          </Card>
          <div className="mt-6 w-full">
            <ShareButton slug={createdSlug} />
          </div>
          <Link href={`/g/${createdSlug}`} className="mt-3 w-full">
            <PillButton className="w-full">{t("create.openGoal")} →</PillButton>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-6">
      <header className="flex items-center gap-3">
        <BackButton />
        <span className="font-display text-lg font-semibold text-ink">{t("create.label")}</span>
      </header>

      <div className="mt-7">
        <StepDots total={2} current={targetOk ? 1 : 0} />
        <h1 className="mt-5 font-display text-[28px] font-semibold tracking-tight text-ink">{t("create.title")}</h1>
        <p className="mt-1 font-medium text-ink-soft">{t("create.subtitle")}</p>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-ink-soft">{t("create.name")}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("create.namePh")}
            maxLength={60}
            className="w-full rounded-[14px] border-[1.5px] border-line bg-bg px-4 py-3.5 text-base font-semibold text-ink outline-none transition focus:border-gold focus:bg-[#FFFCF4] focus:shadow-[0_0_0_4px_rgba(244,183,64,0.12)] placeholder:font-medium placeholder:text-ink-soft/50"
          />
          {touched && !nameOk && (
            <p className="mt-1.5 text-xs font-semibold text-blush">{t("create.nameErr", { n: MIN_NAME })}</p>
          )}
        </label>

        <div>
          <span className="mb-2 block text-sm font-bold text-ink-soft">{t("create.category")}</span>
          <div className="grid grid-cols-5 gap-2">
            {CATEGORIES.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-[1.5px] px-1 py-3 transition active:scale-95 ${
                    active ? "border-gold bg-gold-soft" : "border-line bg-surface hover:border-gold/50"
                  }`}
                >
                  <img src={catIcon(c)} alt="" aria-hidden className="h-12 w-12 select-none" draggable={false} />
                  <span className="text-[10px] font-bold leading-none text-ink-soft">{t(`cat.${c}`)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-ink-soft">{t("create.target")}</span>
          <div className="flex items-baseline gap-2 rounded-[14px] border-[1.5px] border-line bg-[#FFFCF4] px-4 py-3.5 transition focus-within:border-gold focus-within:shadow-[0_0_0_4px_rgba(244,183,64,0.12)]">
            <span className="font-display text-xl font-semibold text-ink-soft">$</span>
            <input
              value={target === "" ? "" : target.toLocaleString("en-US")}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                setTarget(v === "" ? "" : Number(v));
              }}
              inputMode="numeric"
              placeholder="5,000"
              className="w-full bg-transparent font-display text-[28px] font-bold text-gold-deep outline-none placeholder:text-ink-soft/40"
            />
          </div>
          {touched && !targetOk ? (
            <p className="mt-1.5 text-xs font-semibold text-blush">{t("create.targetErr", { v: money(MIN_TARGET) })}</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Chip key={p} active={target === p} onClick={() => setTarget(p)}>
                  {money(p)}
                </Chip>
              ))}
            </div>
          )}
        </label>
      </div>

      <div className="mt-auto pt-8">
        <PillButton onClick={submit} loading={loading || status === "loading"} className="w-full py-4 text-base">
          {status === "anon" ? t("login.signInToContinue") : t("create.submit")} <span aria-hidden>→</span>
        </PillButton>
        <p className="mt-3 text-center text-xs text-ink-soft/80">{t("create.note")}</p>
      </div>
    </main>
  );
}
