"use client";
/* eslint-disable @next/next/no-img-element */

import { useId, useRef, useState } from "react";
import { PillButton } from "./ui";
import { StepDots } from "./Stepper";
import { useDialog } from "@/lib/useDialog";
import { useI18n } from "@/lib/i18n/provider";

const STEPS = [
  { art: "/art/jar-hero.png", key: "welcome" },
  { art: "/art/coin.png", key: "dashboard" },
  { art: "/art/step-goal.png", key: "create" },
  { art: "/art/step-save.png", key: "save" },
  { art: "/art/step-invite.png", key: "profile" },
] as const;

// First-run walkthrough: shown once, automatically, the first time a new
// member lands on the dashboard (see lib/onboarding.ts). Every "tool" in the
// app gets one step instead of leaving people to stumble onto Create,
// notifications, or Profile on their own.
export function OnboardingTour({
  open,
  onDone,
}: {
  open: boolean;
  onDone: (dontShowAgain: boolean) => void;
}) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const titleId = useId();
  const close = () => onDone(dontShowAgain);
  const dialogRef = useDialog<HTMLDivElement>(open, close);
  const touchStartX = useRef<number | null>(null);

  if (!open) return null;

  const last = step === STEPS.length - 1;
  const s = STEPS[step];

  const SWIPE_THRESHOLD = 40;
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx < 0 && !last) setStep((n) => n + 1);
    else if (dx > 0 && step > 0) setStep((n) => n - 1);
  }

  return (
    <div className="backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-6">
      <div
        ref={dialogRef}
        className="sheet-up flex w-full max-w-sm flex-col items-center rounded-card border border-line bg-surface p-7 text-center shadow-card-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          onClick={close}
          className="self-end text-xs font-bold text-ink-soft/70 transition hover:text-ink"
        >
          {t("tour.skip")}
        </button>

        <img
          key={step}
          src={s.art}
          alt=""
          aria-hidden
          className="image-pop-in mt-1 h-32 w-auto select-none"
          draggable={false}
        />

        <h2 id={titleId} className="mt-4 font-display text-xl font-semibold text-ink">
          {t(`tour.${s.key}.title`)}
        </h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-ink-soft">{t(`tour.${s.key}.desc`)}</p>

        <div className="mt-6">
          <StepDots total={STEPS.length} current={step} />
        </div>

        <label className="mt-6 flex cursor-pointer select-none items-center gap-2 self-start text-xs font-medium text-ink-soft">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded border-line text-gold-deep accent-gold-deep"
          />
          {t("tour.dontShowAgain")}
        </label>

        <div className="mt-3 flex w-full gap-2.5">
          {step > 0 && (
            <PillButton variant="light" onClick={() => setStep((n) => n - 1)} className="flex-1 py-3">
              {t("tour.back")}
            </PillButton>
          )}
          <PillButton
            onClick={() => (last ? close() : setStep((n) => n + 1))}
            className="flex-1 py-3"
          >
            {last ? t("tour.done") : t("tour.next")}
          </PillButton>
        </div>
      </div>
    </div>
  );
}
