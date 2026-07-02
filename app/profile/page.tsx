"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, PillButton } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { Avatar } from "@/components/Avatar";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/components/Toast";
import { useI18n } from "@/lib/i18n/provider";
import { useAuth } from "@/lib/auth";

const BADGES = ["badge-first-goal", "badge-first-deposit", "badge-first-member", "badge-goal-completed", "badge-super-saver"];

export default function ProfilePage() {
  const { t } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuth();

  async function signOut() {
    await logout();
    toast(t("profile.signedOut"), "success");
    router.push("/welcome");
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
        <Avatar seed={user?.seed ?? "you"} size={56} />
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold text-ink">{user?.name ?? t("profile.you")}</p>
          <p className="truncate text-sm font-medium text-ink-soft">{user?.email ?? t("profile.signedIn")}</p>
        </div>
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        <Link href="/">
          <PillButton variant="light" className="w-full">
            {t("profile.myGoals")} <span aria-hidden>→</span>
          </PillButton>
        </Link>
        <Link href="/activity">
          <PillButton variant="light" className="w-full">
            {t("profile.activity")} <span aria-hidden>→</span>
          </PillButton>
        </Link>
        <Link href="/settings">
          <PillButton variant="light" className="w-full">
            {t("profile.settings")} <span aria-hidden>→</span>
          </PillButton>
        </Link>
        <PillButton variant="ghost" className="w-full" onClick={signOut}>{t("profile.signOut")}</PillButton>
      </div>

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

      <BottomNav />
    </main>
  );
}
