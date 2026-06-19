import Link from "next/link";
import { Badge, PillButton } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { CoinJar } from "@/components/CoinJar";
import { BottomNav } from "@/components/BottomNav";

const ICON = "#E09A1E";

const STEPS = [
  {
    title: "Buat tujuan",
    desc: "Kasih nama dan target nominal",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.5" stroke={ICON} strokeWidth="1.9" />
        <circle cx="12" cy="12" r="4" stroke={ICON} strokeWidth="1.9" />
        <circle cx="12" cy="12" r="1" fill={ICON} />
      </svg>
    ),
  },
  {
    title: "Ajak teman",
    desc: "Bagikan satu link, siapa pun bisa gabung",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9.5 14.5l5-5M8 11l-2 2a3.5 3.5 0 005 5l2-2M16 13l2-2a3.5 3.5 0 00-5-5l-2 2" stroke={ICON} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Nabung bareng",
    desc: "Setor dari mana pun, terisi sampai penuh",
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
        <Link href="/goals" className="text-sm font-bold text-ink-soft hover:text-ink">
          Tujuanku
        </Link>
      </header>

      {/* Hero jar */}
      <div className="rise-in mt-6 flex flex-col items-center text-center">
        <Badge>
          <span aria-hidden>✨</span> tanpa wallet, cukup email
        </Badge>
        <div className="float-slow mt-4">
          <CoinJar pct={68} size={220} face="happy" />
        </div>
        <h1 className="mt-2 font-display text-[2.6rem] font-bold leading-[1.04] tracking-tight text-ink">
          Nabung bareng,
          <br />
          <span className="text-gold-deep">sampai tercapai.</span>
        </h1>
        <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink-soft">
          Kumpulin dana bareng menuju satu tujuan. Patungan kado, dana liburan, kas
          komunitas. Setor dari aset apa pun, tergabung jadi satu celengan.
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
            Mulai tujuan <span aria-hidden>→</span>
          </PillButton>
        </Link>
        <Link href="/goals" className="text-sm font-semibold text-ink-soft hover:text-ink">
          Lihat tujuanku
        </Link>
        <p className="text-xs text-ink-soft/70">Tanpa seed phrase. Tidak perlu install apa pun.</p>
      </div>

      <footer className="mt-10 flex flex-col items-center gap-1 border-t border-line pt-6 text-center">
        <p className="text-xs font-semibold text-ink-soft/60">Dibangun untuk UXmaxx Hackathon · 2026</p>
        <p className="text-[11px] text-ink-soft/40">Powered by Particle Network · Magic · ZeroDev · Arbitrum</p>
      </footer>

      <BottomNav />
    </main>
  );
}
