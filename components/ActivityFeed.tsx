"use client";

import Link from "@/components/Link";
import type { ActivityEvent } from "@/lib/types";
import { money, timeAgo } from "@/lib/format";
import { EVENT_GLYPH } from "@/lib/activity";
import { useI18n } from "@/lib/i18n/provider";

// One bordered card holding thin-divided rows, not a stack of separate cards
// per event: keeps a long feed compact instead of ballooning the page.
export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  const { t } = useI18n();

  return (
    <div className="stagger divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card">
      {events.map((e, i) => (
        <div key={e.id} style={{ "--i": Math.min(i, 10) } as React.CSSProperties}>
          <Link
            href={`/g/${e.goalSlug}`}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gold-soft/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft">
              {EVENT_GLYPH[e.type]}
            </span>
            <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-ink">
              {t(`ev.${e.type}`, {
                actor: e.actor,
                goal: e.goalName,
                amount: e.amount != null ? money(e.amount) : "",
              })}
            </p>
            <span className="shrink-0 text-[11px] font-bold text-ink-soft/70">{timeAgo(e.at)}</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
