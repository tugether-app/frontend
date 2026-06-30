"use client";

import Link from "next/link";
import type { ActivityEvent, EventType } from "@/lib/types";
import { money, timeAgo } from "@/lib/format";
import { useI18n } from "@/lib/i18n/provider";

const GLYPH: Record<EventType, string> = {
  created: "🎯",
  joined: "👋",
  deposited: "🪙",
  reached: "🎉",
  withdrawn: "✅",
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  const { t } = useI18n();

  return (
    <ul className="stagger mt-4 flex flex-col gap-2">
      {events.map((e, i) => (
        <li key={e.id} style={{ "--i": Math.min(i, 8) } as React.CSSProperties}>
          <Link
            href={`/g/${e.goalSlug}`}
            className="flex items-center gap-3 rounded-card border border-line bg-surface p-3.5 shadow-card transition-transform hover:-translate-y-0.5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-lg">
              {GLYPH[e.type]}
            </span>
            <p className="min-w-0 flex-1 text-sm font-semibold text-ink">
              {t(`ev.${e.type}`, {
                actor: e.actor,
                goal: e.goalName,
                amount: e.amount != null ? money(e.amount) : "",
              })}
            </p>
            <span className="shrink-0 text-xs font-bold text-ink-soft/70">{timeAgo(e.at)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
