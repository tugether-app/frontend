"use client";

import { useId } from "react";
import { Avatar } from "./Avatar";
import { useToast } from "./Toast";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/provider";
import { useDialog } from "@/lib/useDialog";
import { AVATAR_PRESETS } from "@/lib/avatarPref";

// Bottom sheet: pick from the app's illustrated avatar styles. Same dialog
// pattern as the deposit sheet on the goal page (Esc closes, focus is
// trapped inside and returns to the trigger on close -- see lib/useDialog).
export function AvatarPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, chooseAvatar } = useAuth();
  const toast = useToast();
  const { t } = useI18n();
  const titleId = useId();
  const dialogRef = useDialog<HTMLDivElement>(open, onClose);

  if (!open) return null;

  function pick(seed: string) {
    chooseAvatar(seed);
    toast(t("profile.avatarUpdated"), "success");
    onClose();
  }

  return (
    <div className="backdrop-in fixed inset-0 z-40 flex items-end justify-center bg-ink/30 px-4 pb-4" onClick={onClose}>
      <div
        ref={dialogRef}
        className="sheet-up w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-card-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="font-display text-xl font-semibold text-ink">
          {t("profile.chooseAvatar")}
        </h2>
        <p className="mt-1 text-sm font-medium text-ink-soft">{t("profile.chooseAvatarHint")}</p>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {AVATAR_PRESETS.map((seed) => {
            const active = user?.seed === seed;
            return (
              <button
                key={seed}
                type="button"
                onClick={() => pick(seed)}
                aria-pressed={active}
                className={`relative flex flex-col items-center gap-1.5 rounded-2xl border-[1.5px] p-3 transition active:scale-95 ${
                  active ? "border-gold bg-gold-soft" : "border-line bg-bg hover:border-gold/50"
                }`}
              >
                <Avatar seed={seed} size={56} />
                {active && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#2B2622" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
