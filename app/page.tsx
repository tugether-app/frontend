import Link from "next/link";
import { Badge, PillButton } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { CoinJar } from "@/components/CoinJar";
import { BottomNav } from "@/components/BottomNav";

const ICON = "#E09A1E";

const STEPS = [
  {
    title: "Set a goal",
    desc: "Give it a name and a target",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.5" stroke={ICON} strokeWidth="1.9" />
        <circle cx="12" cy="12" r="4" stroke={ICON} strokeWidth="1.9" />
        <circle cx="12" cy="12" r="1" fill={ICON} />
      </svg>
    ),
  },
  {
    title: "Invite friends",
    desc: "Share one link, anyone can join",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9.5 14.5l5-5M8 11l-2 2a3.5 3.5 0 005 5l2-2M16 13l2-2a3.5 3.5 0 00-5-5l-2 2" stroke={ICON} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Save together",
    desc: "Chip in from anywhere, watch it fill up",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="13" r="6.5" stroke={ICON} strokeWidth="1.9" />
        <path d="M12 4v3" stroke={ICON} strokeWidth="1.9" strokeLinecap="round" />
        <path d="M12 11c-1.2-1.6-3.6-.4-3.6 1.4 0 1.6 2 2.8 3.6 4 1.6-1.2 3.6-2.4 3.6-4 0-1.8-2.4-3-3.6-1.4z" fill={ICON} />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <WordMark />
      </header>

      {/* Hero jar */}
      <div className="rise-in mt-6 flex flex-col items-center text-center">
        <Badge>
          <span aria-hidden>✨</span> no wallet, just email
        </Badge>
        <div className="float-slow mt-4">
          <CoinJar pct={68} size={220} face="happy" />
        </div>
        <h1 className="mt-2 font-display text-[2.6rem] font-bold leading-[1.04] tracking-tight text-ink">
          Save together,
          <br />
          <span className="text-gold-deep">reach the goal.</span>
        </h1>
        <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink-soft">
          Pool money toward one shared goal. Group gifts, trip funds, community
          pots. Chip in from any asset, all merged into one jar.
        </p>
      </div>

      {/* How it works */}
      <div className="stagger mt-8 grid grid-cols-3 gap-3">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            style={{ "--i": i } as React.CSSProperties}
            className="rounded-card border border-line bg-surface px-2 py-4 text-center shadow-card"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-gold-soft">
              {s.icon}
            </div>
            <span className="mt-2.5 block font-display text-sm font-semibold text-ink">{s.title}</span>
            <span className="mt-1 block text-[11px] leading-snug text-ink-soft">{s.desc}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-auto flex flex-col items-center gap-3 pt-8">
        <Link href="/create" className="w-full">
          <PillButton className="w-full py-4 text-base">
            Start a goal <span aria-hidden>→</span>
          </PillButton>
        </Link>
        <Link href="/goals" className="w-full">
          <PillButton variant="light" className="w-full py-3.5">
            View my goals
          </PillButton>
        </Link>
        <p className="text-xs text-ink-soft/80">No seed phrase. Nothing to install.</p>
      </div>

      <footer className="mt-10 flex flex-col items-center gap-1 border-t border-line pt-6 text-center">
        <p className="text-xs font-semibold text-ink-soft/70">Built for UXmaxx Hackathon · 2026</p>
        <p className="text-[11px] font-medium text-ink-soft/60">Powered by Particle Network · Magic · ZeroDev · Arbitrum</p>
      </footer>

      <BottomNav />
    </main>
  );
}
