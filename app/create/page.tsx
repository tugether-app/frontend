"use client";

import { useState } from "react";
import Link from "next/link";
import { PillButton, Card, Chip } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { CoinJar } from "@/components/CoinJar";
import { ShareButton } from "@/components/ShareButton";
import { StepDots } from "@/components/Stepper";
import { rupiah } from "@/lib/format";

// Base create flow. Name + target -> generates an invite slug and shows the
// share step. Wires to POST /api/goals (deploy GoalVault) in the BE pass.

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 40) || "tujuan"
  );
}

const PRESETS = [500_000, 1_000_000, 2_000_000, 5_000_000];

export default function CreatePage() {
  const [name, setName] = useState("");
  const [target, setTarget] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const valid = name.trim().length >= 3 && typeof target === "number" && target >= 50_000;

  async function submit() {
    if (!valid) return;
    setLoading(true);
    // TODO(BE): POST /api/goals -> deploy GoalVault, return real slug + vault addr.
    await new Promise((r) => setTimeout(r, 900));
    setCreatedSlug(slugify(name) + "-" + Math.random().toString(36).slice(2, 6));
    setLoading(false);
  }

  if (createdSlug) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-6">
        <Header />
        <div className="rise-in mt-10 flex flex-1 flex-col items-center text-center">
          <CoinJar pct={0} size={180} face="happy" />
          <h1 className="mt-4 font-display text-[26px] font-semibold text-ink">Tujuan dibuat!</h1>
          <p className="mt-2 max-w-xs font-medium text-ink-soft">
            Bagikan link ini ke teman-temanmu biar mereka bisa ikut nabung.
          </p>
          <Card className="mt-6 w-full p-5 text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{name}</p>
            <p className="mt-1 font-display text-2xl font-bold text-gold-deep">
              {typeof target === "number" ? rupiah(target) : ""}
            </p>
          </Card>
          <div className="mt-6 w-full">
            <ShareButton slug={createdSlug} />
          </div>
          <Link href={`/g/${createdSlug}`} className="mt-3 w-full">
            <PillButton className="w-full">Buka tujuan →</PillButton>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-6">
      <Header />

      <div className="mt-7">
        <StepDots total={2} current={typeof target === "number" && target > 0 ? 1 : 0} />
        <h1 className="mt-5 font-display text-[28px] font-semibold tracking-tight text-ink">Mulai tujuan baru</h1>
        <p className="mt-1 font-medium text-ink-soft">Kasih nama dan target. Sisanya gampang.</p>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-ink-soft">Nama tujuan</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Liburan Bali bareng"
            maxLength={60}
            className="w-full rounded-[14px] border-[1.5px] border-line bg-bg px-4 py-3.5 text-base font-semibold text-ink outline-none transition focus:border-gold focus:bg-[#FFFCF4] focus:shadow-[0_0_0_4px_rgba(244,183,64,0.12)] placeholder:font-medium placeholder:text-ink-soft/50"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-ink-soft">Target</span>
          <div className="flex items-baseline gap-2 rounded-[14px] border-[1.5px] border-line bg-[#FFFCF4] px-4 py-3.5 transition focus-within:border-gold focus-within:shadow-[0_0_0_4px_rgba(244,183,64,0.12)]">
            <span className="font-display text-xl font-semibold text-ink-soft">Rp</span>
            <input
              value={target === "" ? "" : target.toLocaleString("id-ID")}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                setTarget(v === "" ? "" : Number(v));
              }}
              inputMode="numeric"
              placeholder="5.000.000"
              className="w-full bg-transparent font-display text-[28px] font-bold text-gold-deep outline-none placeholder:text-ink-soft/40"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Chip key={p} active={target === p} onClick={() => setTarget(p)}>
                {rupiah(p)}
              </Chip>
            ))}
          </div>
        </label>
      </div>

      <div className="mt-auto pt-8">
        <PillButton onClick={submit} loading={loading} disabled={!valid} className="w-full py-4 text-base">
          Buat tujuan <span aria-hidden>→</span>
        </PillButton>
        <p className="mt-3 text-center text-xs text-ink-soft/70">
          Celengan dibuat otomatis. Tanpa wallet, tanpa biaya tersembunyi.
        </p>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <Link href="/">
        <WordMark />
      </Link>
      <Link href="/goals" className="text-sm font-semibold text-ink-soft hover:text-ink">
        Tujuanku
      </Link>
    </header>
  );
}
