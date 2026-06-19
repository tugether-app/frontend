import Link from "next/link";
import { Badge, PillButton } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { CoinJar } from "@/components/CoinJar";

const STEPS = [
  { emoji: "🎯", title: "Buat tujuan", desc: "Kasih nama dan target nominal" },
  { emoji: "🔗", title: "Ajak teman", desc: "Bagikan satu link, siapa pun bisa gabung" },
  { emoji: "🐷", title: "Nabung bareng", desc: "Setor dari mana pun, celengan terisi sampai penuh" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-6">
      <header className="flex items-center justify-between">
        <WordMark />
        <Link href="/goals" className="text-sm font-semibold text-ink-soft hover:text-ink">
          Tujuanku
        </Link>
      </header>

      {/* Hero jar */}
      <div className="rise-in mt-6 flex flex-col items-center text-center">
        <Badge>
          <span aria-hidden>✨</span> tanpa wallet, cukup email
        </Badge>
        <div className="float-slow mt-4">
          <CoinJar pct={68} size={220} />
        </div>
        <h1 className="mt-2 text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-ink">
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
            className="card rounded-card px-2 py-4 text-center"
          >
            <div className="text-2xl">{s.emoji}</div>
            <span className="mt-2 block text-sm font-extrabold text-ink">{s.title}</span>
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
    </main>
  );
}
