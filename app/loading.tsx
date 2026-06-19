import { CoinJar } from "@/components/CoinJar";

export default function Loading() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <div className="float-slow">
        <CoinJar pct={40} size={140} />
      </div>
      <p className="text-sm font-semibold text-ink-soft">Sebentar ya...</p>
    </main>
  );
}
