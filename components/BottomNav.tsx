"use client";

import Link from "@/components/Link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";

// Floating mobile bottom nav: Home / Create / Profile.

type Item = { href: string; labelKey: string; icon: (active: boolean) => React.ReactNode };

const ITEMS: Item[] = [
  {
    href: "/",
    labelKey: "nav.home",
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
    labelKey: "nav.create",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke={a ? "#E09A1E" : "#8A8178"} strokeWidth="1.8" />
        <path d="M12 8.5v7M8.5 12h7" stroke={a ? "#E09A1E" : "#8A8178"} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/profile",
    labelKey: "nav.profile",
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
  const { t } = useI18n();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
      <div className="mx-auto flex max-w-sm items-center justify-between rounded-[26px] border border-line bg-surface/95 px-4 py-2.5 shadow-[0_10px_26px_rgba(43,38,34,0.10)] backdrop-blur">
        {ITEMS.map((it) => {
          const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className="flex flex-1 flex-col items-center gap-1 py-1"
              aria-current={active ? "page" : undefined}
            >
              <span
                className={`transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${active ? "-translate-y-0.5 scale-110" : "scale-100"}`}
              >
                {it.icon(active)}
              </span>
              <span
                className={`text-[11px] font-extrabold transition-colors ${active ? "text-gold-deep" : "text-ink-soft"}`}
              >
                {t(it.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
