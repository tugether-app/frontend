"use client";

import { useState } from "react";
import Link from "next/link";
import { PillButton, Card } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { CoinJar } from "@/components/CoinJar";
import { ShareButton } from "@/components/ShareButton";
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
          <CoinJar pct={0} size={180} />
          <h1 className="mt-4 text-2xl font-extrabold text-ink">Tujuan dibuat!</h1>
          <p className="mt-2 max-w-xs text-ink-soft">
            Bagikan link ini ke teman-temanmu biar mereka bisa ikut nabung.
          </p>
          <Card className="mt-6 w-full p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{name}</p>
            <p className="mt-1 text-lg font-extrabold text-ink">
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

      <div className="mt-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Mulai tujuan baru</h1>
        <p className="mt-1 text-ink-soft">Kasih nama dan target. Sisanya gampang.</p>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Nama tujuan</span>
          <div className="card rounded-btn">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Trip Bali bareng geng"
              maxLength={60}
              className="w-full rounded-btn bg-transparent px-4 py-3.5 text-ink outline-none placeholder:text-ink-soft/50"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Target nominal</span>
          <div className="card rounded-btn">
            <input
              value={target === "" ? "" : target}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                setTarget(v === "" ? "" : Number(v));
              }}
              inputMode="numeric"
              placeholder="5000000"
              className="w-full rounded-btn bg-transparent px-4 py-3.5 text-ink outline-none placeholder:text-ink-soft/50"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setTarget(p)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  target === p ? "bg-gold text-ink" : "bg-gold-soft text-gold-deep hover:bg-gold/30"
                }`}
              >
                {rupiah(p)}
              </button>
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
