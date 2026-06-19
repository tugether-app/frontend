"use client";

import { useRouter } from "next/navigation";

// Back affordance for focused flow pages (create, goal detail). Falls back to
// home when there's no history to go back to.
export function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();

  function back() {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push(fallback);
  }

  return (
    <button
      onClick={back}
      aria-label="Go back"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-surface ring-1 ring-line transition active:scale-95 hover:ring-gold"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M15 5l-7 7 7 7" stroke="#2B2622" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
