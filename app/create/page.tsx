"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PillButton, Card, Chip } from "@/components/ui";
import { BackButton } from "@/components/BackButton";
import { CoinJar } from "@/components/CoinJar";
import { ShareButton } from "@/components/ShareButton";
import { StepDots } from "@/components/Stepper";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";
import { money } from "@/lib/format";
import { getIdentity, type Identity } from "@/lib/identity";
import { useI18n } from "@/lib/i18n/provider";

// Create flow. Name + target -> POST /api/goals (deploys GoalVault), auto-joins
// the creator, then shows the share step with the returned invite slug.

const PRESETS = [500, 1_000, 2_500, 5_000];
const MIN_TARGET = 50;
const MIN_NAME = 3;

export default function CreatePage() {
  const [name, setName] = useState("");
  const [target, setTarget] = useState<number | "">("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [me, setMe] = useState<Identity | null>(null);
  const toast = useToast();
  const { t } = useI18n();

  useEffect(() => setMe(getIdentity()), []);

  const nameOk = name.trim().length >= MIN_NAME;
  const targetOk = typeof target === "number" && target >= MIN_TARGET;
  const valid = nameOk && targetOk;

  async function submit() {
    setTouched(true);
    if (!valid || typeof target !== "number" || !me) return;
    setLoading(true);
    try {
      const goal = await api.createGoal({ name: name.trim(), targetAmount: target, creatorAddr: me.addr });
      // Auto-join the creator so they're a member of their own goal.
      await api.join(goal.id, { memberAddr: me.addr, displayName: me.name, avatarSeed: me.seed }).catch(() => {});
      setCreatedSlug(goal.joinSlug);
    } catch (e) {
      toast(e instanceof Error ? e.message : t("create.err"), "error");
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
          <CoinJar pct={0} size={180} face="happy" />
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
        <PillButton onClick={submit} loading={loading} className="w-full py-4 text-base">
          {t("create.submit")} <span aria-hidden>→</span>
        </PillButton>
        <p className="mt-3 text-center text-xs text-ink-soft/80">{t("create.note")}</p>
      </div>
    </main>
  );
}
