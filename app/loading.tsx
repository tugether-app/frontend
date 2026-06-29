import { Mascot } from "@/components/Mascot";

export default function Loading() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <Mascot pose="loading" size={140} float />
      <p className="text-sm font-semibold text-ink-soft">One sec...</p>
    </main>
  );
}
