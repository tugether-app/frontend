"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Floating mobile bottom nav. Per UI reference (home / buat / aktivitas / profil).

type Item = { href: string; label: string; icon: (active: boolean) => React.ReactNode };

const ITEMS: Item[] = [
  {
    href: "/",
    label: "Home",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 11l8-6 8 6v8a1 1 0 01-1 1h-4v-5h-6v5H5a1 1 0 01-1-1z"
          fill={a ? "#FDF3DC" : "none"}
          stroke={a ? "#E09A1E" : "#8A8178"}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/create",
    label: "Create",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke={a ? "#E09A1E" : "#8A8178"} strokeWidth="1.8" />
        <path d="M12 8.5v7M8.5 12h7" stroke={a ? "#E09A1E" : "#8A8178"} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/goals",
    label: "My Goals",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 12h4l2-5 4 10 2-5h4"
          stroke={a ? "#E09A1E" : "#8A8178"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="9" r="3.4" stroke={a ? "#E09A1E" : "#8A8178"} strokeWidth="1.8" />
        <path
          d="M5.5 19c.7-3.2 3.3-5 6.5-5s5.8 1.8 6.5 5"
          stroke={a ? "#E09A1E" : "#8A8178"}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
      <div className="mx-auto flex max-w-sm items-center justify-between rounded-[26px] border border-line bg-surface/95 px-4 py-2.5 shadow-[0_10px_26px_rgba(43,38,34,0.10)] backdrop-blur">
        {ITEMS.map((it) => {
          const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className="flex flex-1 flex-col items-center gap-1"
              aria-current={active ? "page" : undefined}
            >
              {it.icon(active)}
              <span className={`text-[11px] font-extrabold ${active ? "text-gold-deep" : "text-ink-soft"}`}>
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
