"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Link from "@/components/Link";
import { useRouter } from "next/navigation";
import { Card, PillButton } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { Avatar } from "@/components/Avatar";
import { AvatarPicker } from "@/components/AvatarPicker";
import { ListRow, ListRowButton } from "@/components/ListRow";
import { BottomNav } from "@/components/BottomNav";
import { RequireAuth } from "@/components/RequireAuth";
import { useToast } from "@/components/Toast";
import { useI18n } from "@/lib/i18n/provider";
import { useAuth } from "@/lib/auth";
import { withViewTransition } from "@/lib/viewTransition";

const BADGES = ["badge-first-goal", "badge-first-deposit", "badge-first-member", "badge-goal-completed", "badge-super-saver"];

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
function FaceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.2" stroke="#E09A1E" strokeWidth="1.9" />
      <circle cx="9.3" cy="10.5" r="1.1" fill="#E09A1E" />
      <circle cx="14.7" cy="10.5" r="1.1" fill="#E09A1E" />
      <path d="M9 14.2q3 2.4 6 0" stroke="#E09A1E" strokeWidth="1.7" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function Profile() {
  const { t } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuth();
  const [avatarOpen, setAvatarOpen] = useState(false);

  async function signOut() {
    await logout();
    toast(t("profile.signedOut"), "success");
    withViewTransition(() => router.push("/welcome"));
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href="/">
          <WordMark />
        </Link>
      </header>

      <h1 className="mt-8 font-display text-[28px] font-semibold tracking-tight text-ink">{t("profile.title")}</h1>

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

      <div className="mt-6 flex flex-col gap-3">
        <ListRow href="/goals" icon={<GoalsIcon />} label={t("profile.myGoals")} />
        <ListRow href="/activity" icon={<ActivityIcon />} label={t("profile.activity")} />
        <ListRow href="/settings" icon={<SettingsIcon />} label={t("profile.settings")} />
        <ListRowButton onClick={() => setAvatarOpen(true)} icon={<FaceIcon />} label={t("profile.chooseAvatar")} />
      </div>

      <PillButton variant="ghost" className="mt-4 w-full" onClick={signOut}>
        {t("profile.signOut")}
      </PillButton>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-ink-soft">{t("profile.achievements")}</h2>
      <Card className="mt-3 p-4">
        <div className="flex items-center justify-between gap-2">
          {BADGES.map((b, i) => (
            <img
              key={b}
              src={`/art/badge/${b}.png`}
              alt=""
              aria-hidden
              className={`h-14 w-14 select-none ${i === 0 ? "" : "opacity-30 grayscale"}`}
              draggable={false}
            />
          ))}
        </div>
      </Card>

      <p className="mt-8 text-center text-xs font-semibold text-ink-soft/70">{t("profile.tagline")}</p>

      <AvatarPicker open={avatarOpen} onClose={() => setAvatarOpen(false)} />

      <BottomNav />
    </main>
  );
}
