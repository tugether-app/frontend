import Link from "next/link";
import { PillButton } from "@/components/ui";
import { CoinJar } from "@/components/CoinJar";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <CoinJar pct={0} size={150} />
      <h1 className="font-display text-xl font-semibold text-ink">Page not found</h1>
      <p className="max-w-xs text-sm font-medium text-ink-soft">The link may be wrong or the goal was closed.</p>
      <Link href="/">
        <PillButton>Back to home</PillButton>
      </Link>
    </main>
  );
}
