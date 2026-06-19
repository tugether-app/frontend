import Link from "next/link";
import { Card, PillButton } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { Avatar } from "@/components/Avatar";
import { BottomNav } from "@/components/BottomNav";

// Profile stub. BE pass: real Magic session (name, email), sign out.

export default function ProfilePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href="/">
          <WordMark />
        </Link>
      </header>

      <h1 className="mt-8 font-display text-[28px] font-semibold tracking-tight text-ink">Profil</h1>

      <Card className="mt-6 flex items-center gap-4 p-5">
        <Avatar seed="you" size={56} />
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold text-ink">Kamu</p>
          <p className="truncate text-sm font-medium text-ink-soft">login dengan email</p>
        </div>
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        <Link href="/goals">
          <PillButton variant="light" className="w-full justify-between">
            Tujuanku <span aria-hidden>→</span>
          </PillButton>
        </Link>
        <PillButton variant="ghost" className="w-full">Keluar</PillButton>
      </div>

      <p className="mt-auto pt-8 text-center text-xs font-semibold text-ink-soft/60">
        Tanpa wallet, tanpa seed phrase. Cukup email.
      </p>

      <BottomNav />
    </main>
  );
}
