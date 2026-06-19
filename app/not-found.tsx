import Link from "next/link";
import { PillButton } from "@/components/ui";
import { CoinJar } from "@/components/CoinJar";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <CoinJar pct={0} size={150} />
      <h1 className="text-xl font-extrabold text-ink">Halaman tidak ketemu</h1>
      <p className="max-w-xs text-sm text-ink-soft">Mungkin link-nya salah atau tujuannya sudah ditutup.</p>
      <Link href="/">
        <PillButton>Kembali ke beranda</PillButton>
      </Link>
    </main>
  );
}
