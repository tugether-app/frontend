"use client";
/* eslint-disable @next/next/no-img-element */

import { useId } from "react";
import { PillButton } from "./ui";
import { useDialog } from "@/lib/useDialog";
import { useI18n } from "@/lib/i18n/provider";
import { SUPER_SAVER_THRESHOLD, type BadgeId } from "@/lib/achievements";
import { money } from "@/lib/format";

// Tap-to-inspect detail sheet for a single achievement badge, opened from
// the achievements row in the profile (see app/profile/page.tsx).
export function AchievementDialog({
  badge,
  unlocked,
  onClose,
}: {
  badge: BadgeId | null;
  unlocked: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const titleId = useId();
  const dialogRef = useDialog<HTMLDivElement>(!!badge, onClose);

  if (!badge) return null;

  return (
    <div
      className="backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-6"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="sheet-up flex w-full max-w-sm flex-col items-center rounded-card border border-line bg-surface p-7 text-center shadow-card-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={`/art/badge/${badge}.png`}
          alt=""
          aria-hidden
          className={`h-24 w-24 select-none ${unlocked ? "" : "opacity-30 grayscale"}`}
          draggable={false}
        />
        <h2 id={titleId} className="mt-4 font-display text-xl font-semibold text-ink">
          {t(`badge.${badge}`)}
        </h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-ink-soft">
          {t(`badge.${badge}.desc`, { v: money(SUPER_SAVER_THRESHOLD) })}
        </p>
        {!unlocked && (
          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-ink-soft/60">{t("badge.locked")}</p>
        )}
        <PillButton onClick={onClose} className="mt-6 w-full py-3">
          {t("common.close")}
        </PillButton>
      </div>
    </div>
  );
}
